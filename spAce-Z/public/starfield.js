// Wait for Three.js to be loaded
window.addEventListener('load', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded!');
        return;
    }

    class Starfield {
        constructor() {
            try {
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.renderer = new THREE.WebGLRenderer({ 
                    alpha: true,
                    antialias: true 
                });
                this.stars = [];
                this.mouseX = 0;
                this.mouseY = 0;
                this.targetX = 0;
                this.targetY = 0;
                this.scrollY = 0;
                this.targetScrollY = 0;
                this.windowHalfX = window.innerWidth / 2;
                this.windowHalfY = window.innerHeight / 2;

                this.init();
            } catch (error) {
                console.error('Error in Starfield constructor:', error);
            }
        }

        init() {
            try {
                // Setup renderer
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                document.body.appendChild(this.renderer.domElement);
                this.renderer.domElement.style.position = 'fixed';
                this.renderer.domElement.style.top = '0';
                this.renderer.domElement.style.left = '0';
                this.renderer.domElement.style.zIndex = '-1';
                this.renderer.domElement.style.background = 'black';

                // Create stars
                const starGeometry = new THREE.BufferGeometry();
                
                // Create a custom shader material for round stars
                const starMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 }
                    },
                    vertexShader: `
                        varying vec3 vColor;
                        void main() {
                            vColor = vec3(1.0, 1.0, 1.0);
                            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                            gl_PointSize = 2.0 * (300.0 / -mvPosition.z);
                            gl_Position = projectionMatrix * mvPosition;
                        }
                    `,
                    fragmentShader: `
                        varying vec3 vColor;
                        void main() {
                            float dist = length(gl_PointCoord - vec2(0.5));
                            if (dist > 0.5) discard;
                            float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
                            gl_FragColor = vec4(vColor, alpha * 0.8);
                        }
                    `,
                    transparent: true,
                    depthWrite: false
                });

                const starVertices = [];
                const starColors = [];
                const starSizes = [];

                for (let i = 0; i < 10000; i++) {
                    const x = (Math.random() - 0.5) * 2000;
                    const y = (Math.random() - 0.5) * 2000;
                    const z = (Math.random() - 0.5) * 2000;
                    starVertices.push(x, y, z);

                    // Add some color variation
                    const color = new THREE.Color();
                    color.setHSL(Math.random() * 0.1 + 0.5, 0.8, Math.random() * 0.2 + 0.8);
                    starColors.push(color.r, color.g, color.b);

                    // Add size variation
                    starSizes.push(Math.random() * 1.5 + 0.5);
                }

                starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
                starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
                starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

                this.stars = new THREE.Points(starGeometry, starMaterial);
                this.scene.add(this.stars);

                // Position camera
                this.camera.position.z = 1000;

                // Add event listeners
                document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));
                window.addEventListener('resize', this.onWindowResize.bind(this));
                window.addEventListener('scroll', this.onDocumentScroll.bind(this));

                // Start animation
                this.animate();
                console.log('Starfield initialized successfully');
            } catch (error) {
                console.error('Error in init:', error);
            }
        }

        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX);
            this.mouseY = (event.clientY - this.windowHalfY);
        }

        onDocumentScroll() {
            this.targetScrollY = window.scrollY * 0.0005;
        }

        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2;
            this.windowHalfY = window.innerHeight / 2;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        animate() {
            try {
                requestAnimationFrame(this.animate.bind(this));

                // Mouse movement effect
                this.targetX = this.mouseX * 0.001;
                this.targetY = this.mouseY * 0.001;

                // Scroll effect
                this.scrollY += (this.targetScrollY - this.scrollY) * 0.1;

                // Apply rotations
                this.stars.rotation.y += 0.0005;
                this.stars.rotation.x += 0.0005;

                // Combine mouse and scroll effects
                this.stars.rotation.x += (this.targetY - this.stars.rotation.x) * 0.05;
                this.stars.rotation.y += (this.targetX - this.stars.rotation.y) * 0.05;
                
                // Add scroll-based rotation
                this.stars.rotation.x += this.scrollY;
                this.stars.rotation.y += this.scrollY * 0.5;

                // Update shader time uniform for twinkling effect
                if (this.stars.material.uniforms) {
                    this.stars.material.uniforms.time.value += 0.01;
                }

                this.renderer.render(this.scene, this.camera);
            } catch (error) {
                console.error('Error in animate:', error);
            }
        }
    }

    // Initialize starfield
    try {
        new Starfield();
    } catch (error) {
        console.error('Error creating Starfield:', error);
    }
}); 