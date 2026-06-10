import {React, useEffect} from 'react'
import * as THREE from 'three'
import { AsciiEffect } from 'three/examples/jsm/Addons.js'
import { TrackballControls } from 'three/examples/jsm/Addons.js'

function ProjectPage() {

    useEffect(() => {
        
    let camera, controls, scene, renderer, effect;
    let sphere, plane;
    const start = Date.now();
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

    init();

    function init() {

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.y = 150;
        camera.position.z = 500;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0, 0, 0);


        const pointLight1 = new THREE.PointLight(0xffffff, 3, 0, 0);
        pointLight1.position.set(500, 500, 500);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 1, 0, 0);
        pointLight2.position.set(- 500, - 500, - 500);
        scene.add(pointLight2);

        scene.add(new THREE.AmbientLight(0xffffff))


        sphere = new THREE.Mesh(new THREE.SphereGeometry(200, 20, 10), new THREE.MeshPhongMaterial({ flatShading: true }));
        scene.add(sphere);

        // Plane

        plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0xe0e0e0 }));
        plane.position.y = - 200;
        plane.rotation.x = - Math.PI / 2;
        scene.add(plane);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setAnimationLoop(animate);

        effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
        effect.setSize(window.innerWidth, window.innerHeight);
        effect.domElement.style.color = 'black';
        effect.domElement.style.backgroundColor = 'lightgrey';

        // Special case: append effect.domElement, instead of renderer.domElement.
        // AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.

        document.body.appendChild(effect.domElement);

        controls = new TrackballControls(camera, effect.domElement);

        //

        window.addEventListener('resize', onWindowResize);

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        effect.setSize(window.innerWidth, window.innerHeight);

    }

    function animate() {

        const timer = Date.now() - start;

        sphere.position.y = Math.abs(Math.sin(timer * 0.002)) * 150;
        sphere.rotation.x = timer * 0.0003;
        sphere.rotation.z = timer * 0.0002;

        controls.update();

        effect.render(scene, camera);

    }

    }, []);

    return (
        <>

        </>
    )
}

export default ProjectPage