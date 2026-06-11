import { useEffect, useRef, React } from 'react'
import * as THREE from 'three'

function TestProjectPage() {

    const canvasRef = useRef(null);
    //const infoPanelRef = useRef(null);
    const contRef = useRef(null);

    /*
    const closePanel = () => {
        infoPanelRef.current.style.transform = "translateX(100%)";
    };
    */

    useEffect(() => {

        const timeout = setTimeout(() => {

            const DATA = {
                subjects: [
                    { name: "Üldõpetus", color: 0x7c8aff, topics: ["Kokkuvõttev ülesanne", "Loodusõpetus", "Matemaatika", "Eesti keel"] },
                    { name: "Õpipädevus", color: 0x4ecfb3, topics: ["Tulemuse põhjendamine", "Õpistrateegiad", "Enesehindamine", "Tagasiside kasutamine", "Koostöö", "Planeerimisoskus"] },
                    { name: "Matemaatika", color: 0xff8a65, topics: ["Arvud ja tehted", "Algebra", "Geomeetria", "Statistika", "Tõenäosus", "Mõõtmine", "Funktsioonid", "Võrrandid"] },
                    { name: "Eesti keel", color: 0xf06292, topics: ["Lugemine", "Kirjutamine", "Kuulamine", "Kõnelemine", "Grammatika", "Sõnavara", "Tekstiloome"] },
                    { name: "Loodusõpetus", color: 0xa5d06a, topics: ["Eluslooduse mitmekesisus", "Aine ja energia", "Keskkond", "Keha ja tervis", "Looduse uurimine", "Planeet Maa"] },
                    { name: "Ajalugu", color: 0xffd54f, topics: ["Muinasaeg", "Keskaeg", "Uusaeg", "Lähiajalugu", "Eesti ajalugu", "Maailma ajalugu", "Allikad ja meetodid"] },
                ]
            };

            const canvas = canvasRef.current;
            const cont = contRef.current;
            const W = cont.clientWidth, H = cont.clientHeight;

            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(W, H);
            renderer.setClearColor("#F4F5F7", 1);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
            camera.position.set(0, 4, 24);
            camera.lookAt(0, 0, 0);

            scene.add(new THREE.AmbientLight(0xffffff, 0.5));
            /*
            const dl = new THREE.DirectionalLight(0xffffff, 0.9);
            dl.position.set(8, 16, 10);
            scene.add(dl);
            const dl2 = new THREE.DirectionalLight(0x8899ff, 0.3);
            dl2.position.set(-8, -4, -10);
            scene.add(dl2);
            */
            const pivot = new THREE.Group();
            scene.add(pivot);

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

            //Jooned

            DATA.subjects.forEach((subj, si) => {
                const spread = 3;
                //const angleBase = (si / NUM_SUBJECTS) * spread;
                const armPts = [];


                subj.topics.forEach((topicName, ti) => {
                    const totalTopics = subj.topics.length;
                    const progress = ti / Math.max(totalTopics - 1, 1);
                    const startOffset = 0.2;
                    const y = CONE_TIP_Y - startOffset * CONE_HEIGHT - progress * (CONE_HEIGHT * (1 - startOffset)) * 0.96;
                    //const y = CONE_BASE_Y + (startOffset + progress * (1 - startOffset)) * CONE_HEIGHT * 0.96;
                    //const y = CONE_BASE_Y + progress * CONE_HEIGHT * 0.96;
                    const r = coneRadius(y);

                    const tipSpread = (si / NUM_SUBJECTS) * spread;
                    const wraps = 1.5;
                    const angle = tipSpread + progress * Math.PI * 2 * wraps;
                    const x = Math.cos(angle) * r;
                    const z = Math.sin(angle) * r;

                    const nodeSize = 0.15 + (1 - progress) * 0.12;
                    const geo = new THREE.SphereGeometry(nodeSize, 16, 16);
                    const mat = new THREE.MeshPhongMaterial({ color: subj.color, shininess: 90, emissive: subj.color, emissiveIntensity: 0.08 });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(x, y, z);
                    mesh.userData = { subject: subj.name, name: topicName, outcomes: Math.floor(Math.random() * 10 + 1), color: subj.color };
                    pivot.add(mesh);
                    nodes.push(mesh);
                    armPts.push(new THREE.Vector3(x, y, z));
                });

                //Jooned ühendamaks uhikuid

                if (armPts.length > 1) {
                    const curve = new THREE.CatmullRomCurve3(armPts);
                    const tubeGeo = new THREE.TubeGeometry(curve, 80, 0.05, 8, false);
                    const tubeMat = new THREE.MeshBasicMaterial({ color: subj.color, opacity: 0.8, transparent: true });
                    pivot.add(new THREE.Mesh(tubeGeo, tubeMat));
                }
                console.log(armPts)
            });
            /*
            const coneGeo = new THREE.ConeGeometry(CONE_BASE_R, CONE_HEIGHT, 64, 1, true);
            const coneMat = new THREE.MeshBasicMaterial({ color: 0x2a2a40, wireframe: false, transparent: true, opacity: 0.07, side: THREE.DoubleSide });
            pivot.add(new THREE.Mesh(coneGeo, coneMat));
            */
            const coneWire = new THREE.ConeGeometry(CONE_BASE_R, CONE_HEIGHT, 18, 1, true);
            const wireMat = new THREE.MeshBasicMaterial({ color: 0x3a3a5a, wireframe: true, transparent: true, opacity: 0.12 });
            pivot.add(new THREE.Mesh(coneWire, wireMat));

            /*
            const legend = document.getElementById('legend');
            DATA.subjects.forEach(s => {
                const hex = '#' + s.color.toString(16).padStart(6, '0');
                const el = document.createElement('div');
                el.style.cssText = 'display:flex;align-items:center;gap:5px;background:rgba(10,10,20,0.7);border:0.5px solid rgba(255,255,255,0.1);border-radius:20px;padding:3px 8px;';
                el.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${hex};flex-shrink:0;"></span><span style="font-size:11px;color:#ccc;font-family:sans-serif;white-space:nowrap;">${s.name}</span>`;
                legend.appendChild(el);
            });
            */
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
                    //targetRotX = Math.max(-1.4, Math.min(1.4, targetRotX));
                    prevX = cx; prevY = cy;
                }
                if (isPanning) {
                    targetPanY += (cy - prevY) * 0.03;
                    prevX = cx; prevY = cy;
                }
            });

            //Liigutamine ja hõljumine

            canvas.addEventListener('mousedown', e => {
                if (e.button === 2) {
                    isPanning = true;
                } else {
                    isDragging = true;
                }
                [prevX, prevY] = getXY(e);
                canvas.style.cursor = 'grabbing';
            });
            canvas.addEventListener('contextmenu', e => e.preventDefault());
            canvas.addEventListener('mouseup', () => { isDragging = false; isPanning = false; canvas.style.cursor = 'grab'; });
            canvas.addEventListener('mouseleave', () => { isDragging = false; isPanning = false; tt.style.opacity = '0'; });
            canvas.addEventListener('click', () => {
                if (hoveredNode) {
                    const n = hoveredNode;
                    const panel = document.getElementById('info-panel');
                    document.getElementById('panel-subject').textContent = n.userData.subject;
                    document.getElementById('panel-name').textContent = n.userData.name;
                    document.getElementById('panel-outcomes').textContent = n.userData.outcomes + ' õpitulemust seotud selle teemaga.';
                    panel.style.transform = 'translateX(0)';
                }
            });

            //Zoom

            canvas.addEventListener('wheel', e => {
                zoom = Math.max(8, Math.min(45, zoom + e.deltaY * 0.04));
                e.preventDefault();
            }, { passive: false });

            window.closePanel = () => { document.getElementById('info-panel').style.transform = 'translateX(100%)'; };

            function animate() {
                requestAnimationFrame(animate);
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

        return () => clearTimeout(timeout);
    }, []);

    return (
        // For example, style={{marginRight: spacing + 'em'}}
        <div>
            <div ref={contRef} style={{ position: "relative", width: "100%", height: "100%" }}>
                <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
                <div id="tooltip" style={{ position: "absolute", top: "0", left: "0", pointerEvents: "none", opacity: "0", transition: "opacity 0.15s", background: "rgba(10,10,20,0.88)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 14px", maxWidth: "220px" }}>
                    <div id="tt-subject" style={{ fontSize: "11px", color: "#7c8aff", fontFamily: "sans-serif", marginBottom: "2px" }}></div>
                    <div id="tt-name" style={{ fontSize: "13px", color: "#e8e8f0", fontFamily: "sans-serif", fontWeight: "500", lineHeight: "1.4" }}></div>
                    <div id="tt-outcomes" style={{ fontSize: "11px", color: "#888", fontFamily: "sans-serif", marginTop: "4px" }}></div>
                </div>

                <div id="legend" style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}></div>

                <div style={{ position: "absolute", bottom: "12px", right: "12px", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif" }}>vasak klikk: pööra · parem klikk: liiguta · rull: suumi</div>
                {/*
                <div id="info-panel" ref={infoPanelRef} style={{ position: "absolute", top: "0", right: "0", width: "220px", height: "100%", background: "rgba(10,10,20,0.92)", borderLeft: "0.5px solid rgba(255,255,255,0.1)", padding: "16px", transform: "translateX(100%)", transition: "transform 0.25s", overflowY: "auto" }}>
                    <button onClick={closePanel} style={{ background: "none", border: "none", color: "#888", fontSize: "18px", cursor: "pointer", float: "right", padding: "0", lineHeight: "1" }}>×</button>
                    <div id="panel-subject" style={{ fontSize: "11px", color: "#7c8aff", fontFamily: "sans-serif", marginBottom: "4px", marginTop: "4px" }}></div>
                    <div id="panel-name" style={{ fontSize: "14px", color: "#e8e8f0", fontFamily: "sans-serif", fontWeight: "500", lineHeight: "1.4", marginBottom: "10px" }}></div>
                    <div id="panel-outcomes" style={{ fontSize: "12px", color: "#aaa", fontFamily: "sans-serif" }}></div>
                </div>
                */}
            </div>
        </div>
    )
}

export default TestProjectPage