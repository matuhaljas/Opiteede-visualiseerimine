import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

const GRADE_PALETTE = [0x66bb6a, 0x29b6f6, 0xffa726, 0xab47bc, 0xe91e63, 0x00bcd4, 0xff5722, 0x9c27b0, 0x8bc34a, 0x03a9f4]

// topic items may be strings (legacy) or { title, gradeLevel }
function topicTitle(t) { return typeof t === 'string' ? t : (t.title ?? '') }
function topicGrade(t) { return typeof t === 'string' ? 'Määramata' : (t.gradeLevel ?? 'Määramata') }

const DEMO_DATA = {
    subjects: [
        {
            name: 'Üldõpetus', color: 0x7c8aff, topics: [
                { title: 'Kokkuvõttev ülesanne', gradeLevel: '1. klass' },
                { title: 'Loodusõpetus', gradeLevel: '3. klass' },
                { title: 'Matemaatika', gradeLevel: '5. klass' },
                { title: 'Eesti keel', gradeLevel: '7. klass' },
            ]
        },
        {
            name: 'Õpipädevus', color: 0x4ecfb3, topics: [
                { title: 'Tulemuse põhjendamine', gradeLevel: '2. klass' },
                { title: 'Õpistrateegiad', gradeLevel: '4. klass' },
                { title: 'Enesehindamine', gradeLevel: '6. klass' },
                { title: 'Tagasiside kasutamine', gradeLevel: '8. klass' },
                { title: 'Koostöö', gradeLevel: '10. klass' },
                { title: 'Planeerimisoskus', gradeLevel: '12. klass' },
            ]
        },
        {
            name: 'Matemaatika', color: 0xff8a65, topics: [
                { title: 'Arvud ja tehted', gradeLevel: '1. klass' },
                { title: 'Algebra', gradeLevel: '4. klass' },
                { title: 'Geomeetria', gradeLevel: '5. klass' },
                { title: 'Statistika', gradeLevel: '7. klass' },
                { title: 'Tõenäosus', gradeLevel: '9. klass' },
                { title: 'Mõõtmine', gradeLevel: '10. klass' },
                { title: 'Funktsioonid', gradeLevel: '11. klass' },
                { title: 'Võrrandid', gradeLevel: '12. klass' },
            ]
        },
        {
            name: 'Eesti keel', color: 0xf06292, topics: [
                { title: 'Lugemine', gradeLevel: '1. klass' },
                { title: 'Kirjutamine', gradeLevel: '3. klass' },
                { title: 'Kuulamine', gradeLevel: '5. klass' },
                { title: 'Kõnelemine', gradeLevel: '7. klass' },
                { title: 'Grammatika', gradeLevel: '9. klass' },
                { title: 'Sõnavara', gradeLevel: '11. klass' },
                { title: 'Tekstiloome', gradeLevel: '12. klass' },
            ]
        },
    ],
}

function TestProjectPage2({ data, selectedSubject }) {
    const canvasRef = useRef(null)
    const contRef = useRef(null)
    const sceneRef = useRef({ nodes: [], arms: [] })
    const resetViewRef = useRef(null)

    // Build grade-level → color map from the actual data (preserves order of first appearance)
    const gradeColorMap = useMemo(() => {
        const src = (data && data.subjects && data.subjects.length) ? data : DEMO_DATA
        const map = new Map()
        src.subjects.forEach(subj => {
            subj.topics.forEach(topic => {
                const gl = topicGrade(topic)
                if (!map.has(gl)) map.set(gl, GRADE_PALETTE[map.size % GRADE_PALETTE.length])
            })
        })
        return map
    }, [data])

    // ── Full rebuild when data changes ──────────────────────────────────────
    useEffect(() => {
        const DATA = (data && data.subjects && data.subjects.length) ? data : DEMO_DATA

        const canvas = canvasRef.current
        const cont = contRef.current
        if (!canvas || !cont) return

        const W = cont.clientWidth
        const H = cont.clientHeight

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(W, H)
        renderer.setClearColor(0xf4f5f7, 1)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 500)

        scene.add(new THREE.AmbientLight(0xffffff, 0.5))
        const pivot = new THREE.Group()
        scene.add(pivot)

        // ── Adaptive dimensions ───────────────────────────────────────────────
        const NUM_SUBJECTS = DATA.subjects.length
        const maxTopicsPerSubject = Math.max(...DATA.subjects.map(s => s.topics.length))
        const tubeWraps = Math.min(12, Math.max(2, Math.ceil(NUM_SUBJECTS / 5)))
        const CONE_HEIGHT = Math.min(120, Math.max(20, maxTopicsPerSubject * 0.9))
        const CONE_BASE_R = Math.min(18, Math.max(8, 6 + Math.ceil(NUM_SUBJECTS / 8) * 2))
        const INITIAL_ZOOM = CONE_BASE_R * 2.8

        const CONE_TIP_Y = CONE_HEIGHT / 2
        const CONE_BASE_Y = -CONE_HEIGHT / 2

        function coneRadius(y) {
            const t = (y - CONE_BASE_Y) / CONE_HEIGHT
            return CONE_BASE_R * (1 - t)
        }

        // ── Spine tube ────────────────────────────────────────────────────────
        const tubeSteps = 200
        const tubePts = []
        for (let i = 0; i <= tubeSteps; i++) {
            const progress = i / tubeSteps
            const angle = progress * Math.PI * 2 * tubeWraps
            const y = CONE_TIP_Y - progress * CONE_HEIGHT * 0.96
            const r = coneRadius(y)
            tubePts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r))
        }

        const coneCurve = new THREE.CatmullRomCurve3(tubePts)
        const tubeGeo = new THREE.TubeGeometry(coneCurve, 200, 2, 8, false)
        const tubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0, transparent: true })
        pivot.add(new THREE.Mesh(tubeGeo, tubeMat))

        // ── Nodes + arm tube segments ─────────────────────────────────────────
        const nodeMeshes = []   // { mesh, subjectName }
        const armMeshes = []   // { mesh, subjectName }

        const INTERP = 20   // steps between topic-nodes for smooth tube segments

        DATA.subjects.forEach((subj, si) => {
            const angleOffset = (si / NUM_SUBJECTS) * Math.PI * 2
            const totalTopics = subj.topics.length

            // Keep away from the very tip (progress=0, r=0) where tangent ≈ up → zero cross product
            const P_MIN = 0.04
            const P_MAX = 0.98

            function toCurveProgress(ti) {
                return P_MIN + (ti / Math.max(totalTopics - 1, 1)) * (P_MAX - P_MIN)
            }

            function offsetAt(progress) {
                const pt = coneCurve.getPoint(progress)
                const tangent = coneCurve.getTangent(progress).normalize()
                const up = new THREE.Vector3(0, 1, 0)
                let binormal = new THREE.Vector3().crossVectors(tangent, up)
                // fallback when tangent is parallel to up (near the tip)
                if (binormal.lengthSq() < 1e-6) binormal.set(1, 0, 0)
                binormal.normalize()
                const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize()
                const offset = new THREE.Vector3()
                    .addScaledVector(normal, Math.cos(angleOffset) * 0.8)
                    .addScaledVector(binormal, Math.sin(angleOffset) * 0.8)
                return pt.clone().add(offset)
            }

            // Helper: dense points between two topic indices along the cone offset
            function segmentPts(fromTi, toTi) {
                const pts = []
                for (let step = 0; step <= INTERP; step++) {
                    const t = step / INTERP
                    const progress = toCurveProgress(fromTi + t)
                    pts.push(offsetAt(Math.min(progress, P_MAX)))
                }
                return pts
            }

            // Node size and tube radius computed once per subject from topic density
            const spacing = CONE_HEIGHT / Math.max(totalTopics - 1, 1)
            const nodeBase = Math.min(0.32, Math.max(0.15, spacing * 0.22))
            const tubeRadius = Math.min(0.09, nodeBase * 0.42)

            // Place topic nodes
            subj.topics.forEach((topic, ti) => {
                const pos = offsetAt(toCurveProgress(ti))
                const progress = ti / Math.max(totalTopics - 1, 1)
                const nodeSize = nodeBase + (1 - progress) * nodeBase * 0.4
                const col = new THREE.Color(subj.color)
                const geo = new THREE.SphereGeometry(nodeSize, 16, 16)
                const mat = new THREE.MeshPhongMaterial({
                    color: col, shininess: 120,
                    emissive: col, emissiveIntensity: 0.45,
                })
                const mesh = new THREE.Mesh(geo, mat)
                mesh.position.copy(pos)
                mesh.userData = { subject: subj.name, name: topicTitle(topic), gradeLevel: topicGrade(topic), color: subj.color }
                pivot.add(mesh)
                nodeMeshes.push({ mesh, subjectName: subj.name })
            })

            // Arm tube segments between consecutive topic-nodes, colored by gradeLevel
            for (let ti = 0; ti < totalTopics - 1; ti++) {
                const segColor = gradeColorMap.get(topicGrade(subj.topics[ti + 1])) ?? 0x888888
                const pts = segmentPts(ti, ti + 1)
                if (pts.length < 2) continue
                const curve = new THREE.CatmullRomCurve3(pts)
                const segGeo = new THREE.TubeGeometry(curve, INTERP, tubeRadius, 8, false)
                const segMat = new THREE.MeshBasicMaterial({ color: segColor, opacity: 1, transparent: false })
                const segMesh = new THREE.Mesh(segGeo, segMat)
                segMesh.userData.subjectName = subj.name
                pivot.add(segMesh)
                armMeshes.push({ mesh: segMesh, subjectName: subj.name })
            }
        })

        // cone wireframe hidden

        sceneRef.current = { nodes: nodeMeshes, arms: armMeshes }

        // ── Camera / controls ─────────────────────────────────────────────────
        let zoom = INITIAL_ZOOM
        let rotX = 3.14, targetRotX = 3.14
        let rotY = 0, targetRotY = 0
        let panY = 0, targetPanY = 0
        let isDragging = false, isPanning = false
        let prevX = 0, prevY = 0

        camera.position.set(0, 4, zoom)
        camera.lookAt(0, 0, 0)

        resetViewRef.current = () => {
            zoom = INITIAL_ZOOM
            targetRotX = 3.14; targetRotY = 0; targetPanY = 0
        }

        // ── Raycasting ────────────────────────────────────────────────────────
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        const tt = document.getElementById('tooltip')
        let hoveredNode = null

        function getXY(e) {
            const r = canvas.getBoundingClientRect()
            const src = e.touches ? e.touches[0] : e
            return [src.clientX - r.left, src.clientY - r.top]
        }

        function onMouseMove(e) {
            const [cx, cy] = getXY(e)
            mouse.x = (cx / W) * 2 - 1
            mouse.y = -(cy / H) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            const visible = nodeMeshes.filter(o => o.mesh.visible).map(o => o.mesh)
            const hits = raycaster.intersectObjects(visible)
            if (hits.length) {
                const n = hits[0].object
                if (hoveredNode !== n) {
                    hoveredNode = n
                    if (tt) {
                        document.getElementById('tt-subject').textContent = n.userData.subject
                        document.getElementById('tt-name').textContent = n.userData.name
                        tt.style.opacity = '1'
                        tt.style.left = (cx + 14) + 'px'
                        tt.style.top = Math.min(cy - 10, H - 90) + 'px'
                    }
                    canvas.style.cursor = 'pointer'
                }
            } else {
                hoveredNode = null
                if (tt) tt.style.opacity = '0'
                canvas.style.cursor = isDragging ? 'grabbing' : 'grab'
            }
            if (isDragging) {
                targetRotY += (cx - prevX) * 0.007
                targetRotX += (cy - prevY) * 0.007
                prevX = cx; prevY = cy
            }
            if (isPanning) {
                targetPanY += (cy - prevY) * 0.03
                prevX = cx; prevY = cy
            }
        }

        function onMouseDown(e) {
            if (e.button === 2) { isPanning = true } else { isDragging = true }
            ;[prevX, prevY] = getXY(e)
            canvas.style.cursor = 'grabbing'
        }

        function onMouseUp() { isDragging = false; isPanning = false; canvas.style.cursor = 'grab' }
        function onMouseLeave() { isDragging = false; isPanning = false; if (tt) tt.style.opacity = '0' }

        function onClick() {
            if (!hoveredNode) return
            const panel = document.getElementById('info-panel')
            if (!panel) return
            document.getElementById('panel-subject').textContent = hoveredNode.userData.subject
            document.getElementById('panel-name').textContent = hoveredNode.userData.name
            document.getElementById('panel-outcomes').textContent = hoveredNode.userData.gradeLevel || ''
            panel.style.transform = 'translateX(0)'
        }

        function onWheel(e) {
            zoom = Math.max(8, Math.min(200, zoom + e.deltaY * 0.04))
            e.preventDefault()
        }

        function onResize() {
            const w = cont.clientWidth, h = cont.clientHeight
            if (!w || !h) return
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        }

        canvas.addEventListener('mousemove', onMouseMove)
        canvas.addEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mouseup', onMouseUp)
        canvas.addEventListener('mouseleave', onMouseLeave)
        canvas.addEventListener('click', onClick)
        canvas.addEventListener('wheel', onWheel, { passive: false })
        canvas.addEventListener('contextmenu', e => e.preventDefault())
        window.addEventListener('resize', onResize)

        window.closePanel = () => { const p = document.getElementById('info-panel'); if (p) p.style.transform = 'translateX(100%)' }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        let rafId = 0
        function animate() {
            rafId = requestAnimationFrame(animate)
            rotX += (targetRotX - rotX) * 0.07
            rotY += (targetRotY - rotY) * 0.07
            panY += (targetPanY - panY) * 0.07
            pivot.rotation.x = rotX
            pivot.rotation.y = rotY
            camera.position.z = zoom
            camera.position.y = 4 + panY
            camera.lookAt(0, panY, 0)
            renderer.render(scene, camera)
        }
        animate()

        return () => {
            cancelAnimationFrame(rafId)
            canvas.removeEventListener('mousemove', onMouseMove)
            canvas.removeEventListener('mousedown', onMouseDown)
            canvas.removeEventListener('mouseup', onMouseUp)
            canvas.removeEventListener('mouseleave', onMouseLeave)
            canvas.removeEventListener('click', onClick)
            canvas.removeEventListener('wheel', onWheel)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
            sceneRef.current = { nodes: [], arms: [] }
            resetViewRef.current = null
        }
    }, [data, gradeColorMap])

    // ── Show/hide on subject selection — no rebuild ────────────────────────
    useEffect(() => {
        const { nodes, arms } = sceneRef.current
        nodes.forEach(({ mesh, subjectName }) => {
            mesh.visible = !selectedSubject || subjectName === selectedSubject
        })
        arms.forEach(({ mesh, subjectName }) => {
            mesh.visible = !selectedSubject || subjectName === selectedSubject
        })
    }, [selectedSubject])

    const GRADE_LEGEND = [...gradeColorMap.entries()].map(([label, hex]) => ({
        label,
        color: '#' + hex.toString(16).padStart(6, '0'),
    }))

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div ref={contRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

                {/* Reset view */}
                <button
                    onClick={() => resetViewRef.current?.()}
                    style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'rgba(255,255,255,0.92)',
                        border: '1px solid #dde2ea',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        color: '#003082',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                        zIndex: 10,
                    }}
                >
                    ⟳ Lähtesta vaade
                </button>

                {/* Grade level legend */}
                <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    display: 'flex', flexDirection: 'column', gap: '5px',
                    background: 'rgba(255,255,255,0.88)',
                    border: '1px solid #dde2ea',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: '#333',
                    fontFamily: 'sans-serif',
                    zIndex: 10,
                    pointerEvents: 'none',
                }}>
                    <div style={{ fontWeight: 700, marginBottom: '3px', color: '#003082', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kooliaste</div>
                    {GRADE_LEGEND.map(({ label, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 22, height: 4, borderRadius: 2, background: color, display: 'inline-block', flexShrink: 0 }} />
                            {label}
                        </div>
                    ))}
                </div>

                {/* Tooltip */}
                <div id="tooltip" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s', background: 'rgba(10,10,20,0.88)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', maxWidth: '220px' }}>
                    <div id="tt-subject" style={{ fontSize: '11px', color: '#7c8aff', fontFamily: 'sans-serif', marginBottom: '2px' }} />
                    <div id="tt-name" style={{ fontSize: '13px', color: '#e8e8f0', fontFamily: 'sans-serif', fontWeight: 500, lineHeight: 1.4 }} />
                    <div id="tt-outcomes" style={{ display: 'none' }} />
                </div>

                <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '11px', color: 'rgba(0,0,0,0.3)', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
                    vasak klikk: pööra · parem klikk: liiguta · rull: suumi
                </div>
            </div>
        </div>
    )
}

export default TestProjectPage2
