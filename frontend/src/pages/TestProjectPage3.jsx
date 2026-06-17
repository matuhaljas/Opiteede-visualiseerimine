import { useEffect, useRef, React } from 'react'
import * as THREE from 'three'

const DEMO_DATA = {
    subjects: [
        { name: "Üldõpetus", color: 0x7c8aff, topics: ["Kokkuvõttev ülesanne", "Loodusõpetus", "Matemaatika", "Eesti keel"] },
        { name: "Õpipädevus", color: 0x4ecfb3, topics: ["Tulemuse põhjendamine", "Õpistrateegiad", "Enesehindamine", "Tagasiside kasutamine", "Koostöö", "Planeerimisoskus"] },
        { name: "Matemaatika", color: 0xff8a65, topics: ["Arvud ja tehted", "Algebra", "Geomeetria", "Statistika", "Tõenäosus", "Mõõtmine", "Funktsioonid", "Võrrandid"] },
        { name: "Eesti keel", color: 0xf06292, topics: ["Lugemine", "Kirjutamine", "Kuulamine", "Kõnelemine", "Grammatika", "Sõnavara", "Tekstiloome"] },
        { name: "Loodusõpetus", color: 0xa5d06a, topics: ["Eluslooduse mitmekesisus", "Aine ja energia", "Keskkond", "Keha ja tervis", "Looduse uurimine", "Planeet Maa"] },
        { name: "Ajalugu", color: 0xffd54f, topics: ["Muinasaeg", "Keskaeg", "Uusaeg", "Lähiajalugu", "Eesti ajalugu", "Maailma ajalugu", "Allikad ja meetodid"] },
    ]
};

function TestProjectPage2({ data, details, selectedSubject, otsing }) {

    const canvasRef = useRef(null);
    const contRef = useRef(null);
    const sceneRef = useRef({ nodes: [] });
    const resetViewRef = useRef(null);
    const selectedSubjectRef = useRef(selectedSubject);
    const otsingRef = useRef(otsing);

    function applyFilters() {
        const sel = selectedSubjectRef.current;
        const search = (otsingRef.current || '').toLowerCase();
        sceneRef.current.nodes.forEach(({ mesh, subjectName }) => {
            const subjectPass = !sel || subjectName === sel;
            const name = mesh.userData.name;
            const searchPass = !search || (name && name.toLowerCase().includes(search));
            mesh.visible = subjectPass && searchPass;
        });
    }


    useEffect(() => {

        // Kasuta pärisandmeid kui need on antud, muidu demo
        const DATA = (data && data.subjects && data.subjects.length) ? data : DEMO_DATA;
        const DETAILS = details || {};


        let rafId = 0;
        const controller = new AbortController();
        const signal = controller.signal;
        let renderer = null;

        const timeout = setTimeout(() => {

            const canvas = canvasRef.current;
            const cont = contRef.current;
            if (!canvas || !cont) return;
            const W = cont.clientWidth, H = cont.clientHeight;

            renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(W, H);
            renderer.setClearColor("#F4F5F7", 1);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
            camera.position.set(0, 4, 24);
            camera.lookAt(0, 0, 0);



            scene.add(new THREE.AmbientLight(0xffffff, 0.5));
            const pivot = new THREE.Group();
            scene.add(pivot);

            //Koonus

            const CONE_HEIGHT = 60;
            const CONE_BASE_R = 24;

            const CONE_TIP_Y = CONE_HEIGHT / 2;
            const CONE_BASE_Y = -CONE_HEIGHT / 2;

            const NUM_SUBJECTS = DATA.subjects.length;

            // Leia maksimaalne klasside arv üle kõigi ainete
            const maxKlassid = DATA.subjects.reduce((max, subj) => {
                const k = subj.klassiPiirid ? subj.klassiPiirid.length : 1;
                return Math.max(max, k);
            }, 1);

            const tubeWraps = Math.max(2, maxKlassid); // 1 klass = 1 täisring
            const LOAD_CONE_HEIGHT = Math.max(40, maxKlassid * 8); // kõrgus skaleerub ka

            const nodeMeshes = [];

            function coneRadius(y) {
                const t = (y - CONE_BASE_Y) / CONE_HEIGHT;
                return CONE_BASE_R * (1 - t);
            }

            //Tuub
            const tubePts = [];
            const tubeSteps = 200; // smoothness
            const startOffset = 0.7;

            for (let i = 0; i <= tubeSteps; i++) {
                const progress = i / tubeSteps;
                const angle = progress * Math.PI * 2 * tubeWraps;
                const y = CONE_TIP_Y - startOffset * LOAD_CONE_HEIGHT - progress * LOAD_CONE_HEIGHT * 0.96;
                const r = coneRadius(y);
                tubePts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
            }

            const coneCurve = new THREE.CatmullRomCurve3(tubePts);
            const tubeGeo = new THREE.TubeGeometry(coneCurve, 200, 0, 5, 8, false);
            const tubeMat = new THREE.MeshBasicMaterial({ color: 0x40ff44, opacity: 0, transparent: false });
            pivot.add(new THREE.Mesh(tubeGeo, tubeMat));

            // after building the curve, place nodes ON it using getPoint()
            DATA.subjects.forEach((subj, si) => {
                const armPts = [];
                const angleOffset = (si / NUM_SUBJECTS) * Math.PI * 2;
                const interpolationSteps = 20; // points between each topic

                const totalTopics = subj.topics.length;

                const orbitRadius = 2;

                // generate dense points along the full tube length for this subject
                for (let ti = 0; ti < totalTopics - 1; ti++) {
                    const p0 = ti / Math.max(totalTopics - 1, 1);
                    const p1 = (ti + 1) / Math.max(totalTopics - 1, 1);

                    for (let s = 0; s <= interpolationSteps; s++) {
                        const progress = p0 + (p1 - p0) * (s / interpolationSteps);

                        const pointOnTube = coneCurve.getPoint(progress);
                        const tangent = coneCurve.getTangent(progress).normalize();
                        const up = new THREE.Vector3(0, 1, 0);
                        const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
                        const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

                        const offset = new THREE.Vector3()
                            .addScaledVector(normal, Math.cos(angleOffset) * orbitRadius)
                            .addScaledVector(binormal, Math.sin(angleOffset) * orbitRadius);

                        armPts.push(pointOnTube.clone().add(offset));
                    }
                }

                // place nodes at topic positions only
                subj.topics.forEach((topicName, ti) => {
                    const progress = ti / Math.max(totalTopics - 1, 1);

                    const pointOnTube = coneCurve.getPoint(progress);
                    const tangent = coneCurve.getTangent(progress).normalize();

                    const up = new THREE.Vector3(0, 1, 0);
                    const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
                    const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

                    const offset = new THREE.Vector3()
                        .addScaledVector(normal, Math.cos(angleOffset) * orbitRadius)
                        .addScaledVector(binormal, Math.sin(angleOffset) * orbitRadius);

                    const finalPos = pointOnTube.clone().add(offset);

                    const nodeSize = 0.15 + (1 - progress) * 0.12;
                    const geo = new THREE.SphereGeometry(nodeSize, 16, 16);
                    const mat = new THREE.MeshPhongMaterial({ color: subj.color, shininess: 90, emissive: subj.color, emissiveIntensity: 0.28 });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.copy(finalPos);

                    mesh.userData = {
                        subject: subj.name,
                        name: topicName,
                        outcomes: DETAILS[topicName]?.outcomeCount ?? 0,
                        description: DETAILS[topicName]?.description || '',
                        gradeLevel: DETAILS[topicName]?.gradeLevel || '',
                        color: subj.color
                    }

                    pivot.add(mesh);
                    nodeMeshes.push({ mesh, subjectName: subj.name });
                });

                // line uses dense armPts so it follows the tube curve
                if (armPts.length > 1) {
                    const curve = new THREE.CatmullRomCurve3(armPts);
                    const armTubeGeo = new THREE.TubeGeometry(curve, 80, 0.04, 8, false);
                    const armTubeMat = new THREE.MeshBasicMaterial({ color: subj.color, opacity: 0.6, transparent: true });
                    const armTubeMesh = new THREE.Mesh(armTubeGeo, armTubeMat);
                    pivot.add(armTubeMesh);
                    nodeMeshes.push({ mesh: armTubeMesh, subjectName: subj.name });
                }

                // Klassipiiride markerid — väike rõngas iga klassi alguses
                if (subj.klassiPiirid) {
                    subj.klassiPiirid.forEach(({ klass, start }) => {
                        const progress = start / Math.max(totalTopics - 1, 1)
                        const pointOnTube = coneCurve.getPoint(progress)
                        const tangent = coneCurve.getTangent(progress).normalize()
                        const up = new THREE.Vector3(0, 1, 0)
                        const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize()
                        const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize()
                        const offset = new THREE.Vector3()
                            .addScaledVector(normal, Math.cos(angleOffset) * orbitRadius)
                            .addScaledVector(binormal, Math.sin(angleOffset) * orbitRadius)
                        const markerPos = pointOnTube.clone().add(offset)

                        const ringGeo = new THREE.RingGeometry(0.18, 0.26, 16)
                        const ringMat = new THREE.MeshBasicMaterial({
                            color: subj.color, side: THREE.DoubleSide, transparent: true, opacity: 0.7
                        })
                        const ring = new THREE.Mesh(ringGeo, ringMat)
                        ring.position.copy(markerPos)
                        ring.lookAt(camera.position)
                        ring.userData = { label: klass }
                        pivot.add(ring)
                        nodeMeshes.push({ mesh: ring, subjectName: subj.name });
                    })
                }
            });

            const coneWire = new THREE.ConeGeometry(CONE_BASE_R, CONE_HEIGHT, 18, 1, true);
            const wireMat = new THREE.MeshBasicMaterial({ color: 0x3a3a5a, wireframe: true, transparent: true, opacity: 0.12 });
            pivot.add(new THREE.Mesh(coneWire, wireMat));

            sceneRef.current = { nodes: nodeMeshes };
            applyFilters();

            resetViewRef.current = () => {
                zoom = 24;
                targetRotX = 3.14; targetRotY = 0; targetPanY = 0;
            };

            let isDragging = false, prevX = 0, prevY = 0;
            let isPanning = false;
            let panY = 0, targetPanY = 0;
            let targetRotX = 3.14, targetRotY = 0;
            let rotX = 3.14, rotY = 0;
            let zoom = 24;
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const tt = document.getElementById('tooltip');
            let hoveredNode = null;

            function getXY(e) {
                const r = canvas.getBoundingClientRect();
                const src = e.touches ? e.touches[0] : e;
                return [src.clientX - r.left, src.clientY - r.top];
            }

            canvas.addEventListener('mousemove', e => {
                const [cx, cy] = getXY(e);
                mouse.x = (cx / W) * 2 - 1;
                mouse.y = -(cy / H) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const visible = nodeMeshes.filter(o => o.mesh.visible).map(o => o.mesh);
                const hits = raycaster.intersectObjects(visible);
                if (hits.length) {
                    const n = hits[0].object;
                    if (hoveredNode !== n) {
                        hoveredNode = n;
                        document.getElementById('tt-subject').textContent = n.userData.subject;
                        document.getElementById('tt-name').textContent = n.userData.name;
                        document.getElementById('tt-outcomes').textContent = n.userData.outcomes + ' õpitulemust';
                    }
                    tt.style.opacity = '1';
                    tt.style.left = (cx + 14) + 'px';
                    tt.style.top = Math.min(cy - 10, H - 90) + 'px';
                    canvas.style.cursor = 'pointer';
                } else {
                    hoveredNode = null;
                    tt.style.opacity = '0';
                    canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
                }
                if (isDragging) {
                    targetRotY += (cx - prevX) * 0.007;
                    targetRotX += (cy - prevY) * 0.007;
                    prevX = cx; prevY = cy;
                }
                if (isPanning) {
                    targetPanY += (cy - prevY) * 0.03;
                    prevX = cx; prevY = cy;
                }
            }, { signal });

            //Liigutamine ja hõljumine

            canvas.addEventListener('mousedown', e => {
                if (e.button === 2) {
                    isPanning = true;
                } else {
                    isDragging = true;
                }
                [prevX, prevY] = getXY(e);
                canvas.style.cursor = 'grabbing';
            }, { signal });
            canvas.addEventListener('contextmenu', e => e.preventDefault(), { signal });
            canvas.addEventListener('mouseup', () => { isDragging = false; isPanning = false; canvas.style.cursor = 'grab'; }, { signal });
            canvas.addEventListener('mouseleave', () => { isDragging = false; isPanning = false; if (tt) tt.style.opacity = '0'; }, { signal });
            canvas.addEventListener('click', () => {
                if (hoveredNode) {
                    const n = hoveredNode;
                    const panel = document.getElementById('info-panel');
                    if (!panel) return;
                    document.getElementById('panel-subject').textContent = n.userData.subject;
                    document.getElementById('panel-name').textContent = n.userData.name;
                    document.getElementById('panel-outcomes').textContent = n.userData.outcomes + ' õpitulemust seotud selle teemaga.';
                    document.getElementById('panel-grade').textContent = n.userData.gradeLevel;
                    document.getElementById('panel-desc').textContent = n.userData.description;
                    panel.style.transform = 'translateX(0)';
                }
            }, { signal });

            //Zoom

            canvas.addEventListener('wheel', e => {
                zoom = Math.max(8, Math.min(45, zoom + e.deltaY * 0.04));
                e.preventDefault();
            }, { passive: false, signal });

            window.closePanel = () => { const p = document.getElementById('info-panel'); if (p) p.style.transform = 'translateX(100%)'; };

            function animate() {
                rafId = requestAnimationFrame(animate);
                rotX += (targetRotX - rotX) * 0.07;
                rotY += (targetRotY - rotY) * 0.07;
                pivot.rotation.x = rotX;
                pivot.rotation.y = rotY;

                panY += (targetPanY - panY) * 0.07;
                camera.position.z = zoom;
                camera.position.y = 4 + panY;
                camera.lookAt(0, panY, 0);
                renderer.render(scene, camera);
            }
            animate();

        }, 0);

        return () => {
            clearTimeout(timeout);
            controller.abort();
            if (rafId) cancelAnimationFrame(rafId);
            if (renderer) renderer.dispose();
            sceneRef.current = { nodes: [] };
            resetViewRef.current = null;
        };
    }, [data, details]);

    useEffect(() => {
        selectedSubjectRef.current = selectedSubject;
        applyFilters();
    }, [selectedSubject]);

    useEffect(() => {
        otsingRef.current = otsing;
        applyFilters();
    }, [otsing]);

    return (
        <div style={{ width: "100%", height: "100%", position: "relative", display: "flex" }}>
            <div ref={contRef} style={{ position: "relative", flex: 1, height: "100%" }}>
                <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

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

                <div id="tooltip" style={{ position: "absolute", top: "0", left: "0", pointerEvents: "none", opacity: "0", transition: "opacity 0.15s", background: "rgba(10,10,20,0.88)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 14px", maxWidth: "220px" }}>
                    <div id="tt-subject" style={{ fontSize: "11px", color: "#7c8aff", fontFamily: "sans-serif", marginBottom: "2px" }}></div>
                    <div id="tt-name" style={{ fontSize: "13px", color: "#e8e8f0", fontFamily: "sans-serif", fontWeight: "500", lineHeight: "1.4" }}></div>
                    <div id="tt-outcomes" style={{ fontSize: "11px", color: "#888", fontFamily: "sans-serif", marginTop: "4px" }}></div>
                </div>
                <div id="legend" style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}></div>
                <div style={{ position: "absolute", bottom: "12px", right: "12px", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif" }}>vasak klikk: pööra · parem klikk: liiguta · rull: suumi</div>
            </div>
            <div id="info-panel" style={{ width: "300px", height: "100%", background: "#fff", borderLeft: "1px solid #e5e7eb", padding: "24px 20px", overflowY: "auto", transform: "translateX(100%)", transition: "transform 0.3s ease", position: "absolute", right: 0, top: 0, zIndex: 10, boxSizing: "border-box" }}>
                <button onClick={() => window.closePanel()} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#6b7280" }}>✕</button>
                <div id="panel-subject" style={{ fontSize: "12px", color: "#7c8aff", fontFamily: "sans-serif", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}></div>
                <div id="panel-name" style={{ fontSize: "18px", color: "#111827", fontFamily: "sans-serif", fontWeight: "700", marginBottom: "12px", lineHeight: "1.4" }}></div>
                <div id="panel-grade" style={{ fontSize: "12px", color: "#9ca3af", fontFamily: "sans-serif", marginBottom: "12px" }}></div>
                <div id="panel-outcomes" style={{ fontSize: "13px", color: "#6b7280", fontFamily: "sans-serif", marginBottom: "12px" }}></div>
                <div id="panel-desc" style={{ fontSize: "13px", color: "#374151", fontFamily: "sans-serif", lineHeight: "1.6" }}></div>
            </div>
        </div>
    )
}

export default TestProjectPage2