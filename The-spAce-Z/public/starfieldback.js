window.addEventListener('load', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded!');
        return;
    }

    class SimpleStarfield {
        constructor() {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.stars = null;

            this.init();
        }

        init() {
            // Setup renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            document.body.appendChild(this.renderer.domElement);
            this.renderer.domElement.style.position = 'fixed';
            this.renderer.domElement.style.top = '0';
            this.renderer.domElement.style.left = '0';
            this.renderer.domElement.style.zIndex = '-1';
            this.renderer.domElement.style.background = 'black';

            // Star geometry
            const starGeometry = new THREE.BufferGeometry();
            const starMaterial = new THREE.ShaderMaterial({
                uniforms: { time: { value: 0 } },
                vertexShader: `
                    void main() {
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = 2.0 * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    void main() {
                        float dist = length(gl_PointCoord - vec2(0.5));
                        if (dist > 0.5) discard;
                        float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
                        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.8);
                    }
                `,
                transparent: true,
                depthWrite: false
            });

            // Fewer stars
            const starVertices = [];
            for (let i = 0; i < 2000; i++) {
                const x = (Math.random() - 0.5) * 2000;
                const y = (Math.random() - 0.5) * 2000;
                const z = (Math.random() - 0.5) * 2000;
                starVertices.push(x, y, z);
            }

            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
            this.stars = new THREE.Points(starGeometry, starMaterial);
            this.scene.add(this.stars);

            this.camera.position.z = 1000;

            window.addEventListener('resize', this.onResize.bind(this));
            this.animate();
        }

        onResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        animate() {
            requestAnimationFrame(this.animate.bind(this));

            // Slow automatic rotation
            this.stars.rotation.y += 0.0003;
            this.stars.rotation.x += 0.0001;

            // Twinkle (optional)
            if (this.stars.material.uniforms) {
                this.stars.material.uniforms.time.value += 0.01;
            }

            this.renderer.render(this.scene, this.camera);
        }
    }

    new SimpleStarfield();
});
