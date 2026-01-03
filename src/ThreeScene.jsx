import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const animationIdRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        let scene, sceneLight, portalLight, cam, renderer, clock;
        let centerGlow;
        const portalParticles = [];
        const smokeParticles = [];
        const lightningBolts = [];

        function initScene() {
            scene = new THREE.Scene();

            // Lights
            sceneLight = new THREE.DirectionalLight(0xffffff, 0.4);
            sceneLight.position.set(0, 0, 1);
            scene.add(sceneLight);

            portalLight = new THREE.PointLight(0x1e5cff, 4, 900, 2);
            portalLight.position.set(0, 0, 200);
            scene.add(portalLight);

            // Camera
            cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
            cam.position.z = 1000;

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setClearColor(0x000000, 1);
            rendererRef.current = renderer;
            mountRef.current.appendChild(renderer.domElement);

            window.addEventListener('resize', onResize);

            particleSetup();
            createCenterGlow();
            createLightning();
        }

        function onResize() {
            cam.aspect = window.innerWidth / window.innerHeight;
            cam.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // 🔵 CENTER GLOW
        function createCenterGlow() {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
            gradient.addColorStop(0, 'rgba(0,180,255,1)');
            gradient.addColorStop(0.4, 'rgba(0,120,255,0.8)');
            gradient.addColorStop(1, 'rgba(0,50,255,0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);

            const texture = new THREE.CanvasTexture(canvas);

            const mat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            centerGlow = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), mat);
            centerGlow.position.z = 120;
            scene.add(centerGlow);
        }

        // ⚡ LIGHTNING EFFECT
        function createLightning() {
            const material = new THREE.LineBasicMaterial({
                color: 0x4fc3ff,
                transparent: true,
                opacity: 0.9
            });

            for (let i = 0; i < 8; i++) {
                const points = [];
                const radius = 260;

                for (let p = 0; p < 10; p++) {
                    points.push(new THREE.Vector3(
                        (Math.random() - 0.5) * 40,
                        (Math.random() - 0.5) * 40,
                        p * 15
                    ));
                }

                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const bolt = new THREE.Line(geometry, material);

                bolt.position.set(
                    Math.cos(i) * radius,
                    Math.sin(i) * radius,
                    80
                );

                bolt.rotation.z = Math.random() * Math.PI;
                lightningBolts.push(bolt);
                scene.add(bolt);
            }
        }

        function particleSetup() {
            const loader = new THREE.TextureLoader();

            loader.load("/anim_1.gif", texture => {
                const portalGeo = new THREE.PlaneGeometry(350, 350);
                const portalMat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true
                });

                for (let p = 880; p > 250; p--) {
                    const mesh = new THREE.Mesh(portalGeo, portalMat);
                    mesh.position.set(
                        0.5 * p * Math.cos((4 * p * Math.PI) / 180),
                        0.5 * p * Math.sin((4 * p * Math.PI) / 180),
                        0.1 * p
                    );
                    mesh.rotation.z = Math.random() * 360;
                    portalParticles.push(mesh);
                    scene.add(mesh);
                }

                const smokeGeo = new THREE.PlaneGeometry(1000, 1000);
                const smokeMat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.5
                });

                for (let i = 0; i < 40; i++) {
                    const smoke = new THREE.Mesh(smokeGeo, smokeMat);
                    smoke.position.set(
                        Math.random() * 1000 - 500,
                        Math.random() * 400 - 200,
                        20
                    );
                    smoke.rotation.z = Math.random() * 360;
                    smokeParticles.push(smoke);
                    scene.add(smoke);
                }

                clock = new THREE.Clock();
                animate();
            });
        }

        function animate() {
            const delta = clock.getDelta();

            portalParticles.forEach(p => p.rotation.z -= delta * 1.5);
            smokeParticles.forEach(p => p.rotation.z -= delta * 0.2);

            // 🔵 Glow pulse
            centerGlow.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.06);

            // ⚡ Lightning flicker
            lightningBolts.forEach(bolt => {
                bolt.visible = Math.random() > 0.92;
                bolt.rotation.z += delta * 2;
            });

            portalLight.power = 500 + Math.sin(clock.elapsedTime * 4) * 400;

            renderer.render(scene, cam);
            animationIdRef.current = requestAnimationFrame(animate);
        }

        initScene();

        return () => {
            cancelAnimationFrame(animationIdRef.current);
            window.removeEventListener('resize', onResize);
            if (rendererRef.current && mountRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeScene;