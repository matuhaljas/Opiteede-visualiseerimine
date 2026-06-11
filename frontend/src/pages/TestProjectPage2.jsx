// MUUDATUSED (11.06.26):
// - Komponent võtab nüüd vastu "data" propi ({ subjects: [{ name, color, topics }] })
// - Kui data prop on antud (pärisandmed backendist), kasutatakse seda — muidu näidatakse DEMO_DATA
// - Lisatud korralik Three.js cleanup: cancelAnimationFrame + AbortController listeneritele + renderer.dispose()
//   (varem jäi vana renderer aktiivseks kui NewCurriculum ümber renderdas)
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

function TestProjectPage2({ data }) {

    const canvasRef = useRef(null);
    const contRef = useRef(null);

    useEffect(() => {

        // Kasuta pärisandmeid kui need on antud, muidu demo
        const DATA = (data && data.subjects && data.subjects.length) ? data : DEMO_DATA;

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

            const CONE_HEIGHT = 20;
            const CONE_BASE_R = 7;
            const CONE_TIP_Y = CONE_HEIGHT / 2;
            const CONE_BASE_Y = -CONE_HEIGHT / 2;
            const NUM_SUBJECTS = DATA.subjects.length;
            const nodes = [];

            function coneRadius(y) {
                const t = (y - CONE_BASE_Y) / CONE_HEIGHT;
                return CONE_BASE_R * (1 - t);
            }

            //Tuub
            const tubePts = [];
            const tubeWraps = 1.5; // how many times it spirals around
            const tubeSteps = 200; // smoothness

            for (let i = 0; i <= tubeSteps; i++) {
                const progress = i / tubeSteps;
                const angle = progress * Math.PI * 2 * tubeWraps;
                const y = CONE_TIP_Y - progress * CONE_HEIGHT * 0.96;
                const r = coneRadius(y);
                tubePts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
            }

            const coneCurve = new THREE.CatmullRomCurve3(tubePts);
            const tubeGeo = new THREE.TubeGeometry(coneCurve, 200, 0.5, 8, false);
            const tubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0, transparent: true });
            pivot.add(new THREE.Mesh(tubeGeo, tubeMat));

            // after building the curve, place nodes ON it using getPoint()
            DATA.subjects.forEach((subj, si) => {
                const armPts = [];
                const angleOffset = (si / NUM_SUBJECTS) * Math.PI * 2;
                const interpolationSteps = 20; // points between each topic

                const totalTopics = subj.topics.length;

                // generate dense points along the full tube length for this subject
                for (let i = 0; i <= (totalTopics - 1) * interpolationSteps; i++) {
                    const progress = i / ((totalTopics - 1) * interpolationSteps);

                    const pointOnTube = coneCurve.getPoint(progress);
                    const tangent = coneCurve.getTangent(progress).normalize();

                    const up = new THREE.Vector3(0, 1, 0);
                    const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
                    const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

                    const orbitRadius = 0.8;
                    const offset = new THREE.Vector3()
                        .addScaledVector(normal, Math.cos(angleOffset) * orbitRadius)
                        .addScaledVector(binormal, Math.sin(angleOffset) * orbitRadius);

                    armPts.push(pointOnTube.clone().add(offset));
                }

                // place nodes at topic positions only
                subj.topics.forEach((topicName, ti) => {
                    const progress = ti / Math.max(totalTopics - 1, 1);

                    const pointOnTube = coneCurve.getPoint(progress);
                    const tangent = coneCurve.getTangent(progress).normalize();

                    const up = new THREE.Vector3(0, 1, 0);
                    const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
                    const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

                    const orbitRadius = 0.8;
                    const offset = new THREE.Vector3()
                        .addScaledVector(normal, Math.cos(angleOffset) * orbitRadius)
                        .addScaledVector(binormal, Math.sin(angleOffset) * orbitRadius);

                    const finalPos = pointOnTube.clone().add(offset);

                    const nodeSize = 0.15 + (1 - progress) * 0.12;
                    const geo = new THREE.SphereGeometry(nodeSize, 16, 16);
                    const mat = new THREE.MeshPhongMaterial({ color: subj.color, shininess: 90, emissive: subj.color, emissiveIntensity: 0.08 });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.copy(finalPos);
                    mesh.userData = { subject: subj.name, name: topicName, outcomes: Math.floor(Math.random() * 10 + 1), color: subj.color };
                    pivot.add(mesh);
                    nodes.push(mesh);
                });

                // line uses dense armPts so it follows the tube curve
                if (armPts.length > 1) {
                    const curve = new THREE.CatmullRomCurve3(armPts);
                    const armTubeGeo = new THREE.TubeGeometry(curve, 80, 0.04, 8, false);
                    const armTubeMat = new THREE.MeshBasicMaterial({ color: subj.color, opacity: 0.6, transparent: true });
                    pivot.add(new THREE.Mesh(armTubeGeo, armTubeMat));
                }
            });

            const coneWire = new THREE.ConeGeometry(CONE_BASE_R, CONE_HEIGHT, 18, 1, true);
            const wireMat = new THREE.MeshBasicMaterial({ color: 0x3a3a5a, wireframe: true, transparent: true, opacity: 0.12 });
            pivot.add(new THREE.Mesh(coneWire, wireMat));

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
                const hits = raycaster.intersectObjects(nodes);
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
        };
    }, [data]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <div ref={contRef} style={{ position: "relative", width: "100%", height: "100%" }}>
                <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
                <div id="tooltip" style={{ position: "absolute", top: "0", left: "0", pointerEvents: "none", opacity: "0", transition: "opacity 0.15s", background: "rgba(10,10,20,0.88)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 14px", maxWidth: "220px" }}>
                    <div id="tt-subject" style={{ fontSize: "11px", color: "#7c8aff", fontFamily: "sans-serif", marginBottom: "2px" }}></div>
                    <div id="tt-name" style={{ fontSize: "13px", color: "#e8e8f0", fontFamily: "sans-serif", fontWeight: "500", lineHeight: "1.4" }}></div>
                    <div id="tt-outcomes" style={{ fontSize: "11px", color: "#888", fontFamily: "sans-serif", marginTop: "4px" }}></div>
                </div>

                <div id="legend" style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}></div>

                <div style={{ position: "absolute", bottom: "12px", right: "12px", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif" }}>vasak klikk: pööra · parem klikk: liiguta · rull: suumi</div>
            </div>
        </div>
    )
}

export default TestProjectPage2
