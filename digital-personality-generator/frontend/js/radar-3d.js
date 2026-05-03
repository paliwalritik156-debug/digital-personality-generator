class PremiumRadar3D {
    constructor(containerId, scores) {
        this.container = document.getElementById(containerId);
        this.scores = scores;
        this.init();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);
        
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.camera.position.set(0, 4, 8);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(500, 500);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        this.setupLighting();
        this.createPremiumRadar();
        this.createAtmosphere();
        this.animate();
    }
    
    setupLighting() {
        const ambient = new THREE.AmbientLight(0x1a1a3e, 0.5);
        this.scene.add(ambient);
        
        const keyLight = new THREE.DirectionalLight(0x6366f1, 2);
        keyLight.position.set(5, 10, 7);
        this.scene.add(keyLight);
        
        const rimLight1 = new THREE.PointLight(0xec4899, 3, 20);
        rimLight1.position.set(-5, 5, -5);
        this.scene.add(rimLight1);
        
        const rimLight2 = new THREE.PointLight(0xf59e0b, 2, 20);
        rimLight2.position.set(5, -3, 5);
        this.scene.add(rimLight2);
    }
    
    createPremiumRadar() {
        const traits = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];
        const traitColors = [0x6366f1, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xef4444];
        const values = [this.scores.O, this.scores.C, this.scores.E, this.scores.A, this.scores.N];
        
        const radius = 3;
        const segments = 5;
        
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const indices = [];
        
        vertices.push(0, 0.5, 0);
        colors.push(0.5, 0.5, 0.5);
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
            const score = values[i] / 100;
            const x = Math.cos(angle) * radius * score;
            const z = Math.sin(angle) * radius * score;
            const y = score * 2.5;
            
            vertices.push(x, y, z);
            
            const color = new THREE.Color(traitColors[i]);
            colors.push(color.r, color.g, color.b);
        }
        
        for (let i = 0; i < segments; i++) {
            indices.push(0, i + 1, ((i + 1) % segments) + 1);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshPhysicalMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            emissive: 0x222244,
            emissiveIntensity: 0.2
        });
        
        this.radarMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.radarMesh);
        
        const wireGeo = new THREE.BufferGeometry();
        const wireVertices = [];
        
        for (let i = 0; i < segments; i++) {
            const v1 = i * 3 + 3;
            const v2 = ((i + 1) % segments) * 3 + 3;
            wireVertices.push(
                vertices[v1], vertices[v1 + 1], vertices[v1 + 2],
                vertices[v2], vertices[v2 + 1], vertices[v2 + 2]
            );
        }
        
        wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(wireVertices, 3));
        
        const wireMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        
        this.wireframe = new THREE.LineSegments(wireGeo, wireMat);
        this.radarMesh.add(this.wireframe);
        
        this.createFloatingLabels(traits, values, radius, traitColors);
        
        const groundGeo = new THREE.CircleGeometry(6, 64);
        const groundMat = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        this.scene.add(ground);
    }
    
    createFloatingLabels(traits, values, radius, colors) {
        traits.forEach((trait, i) => {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * (radius + 1.2);
            const z = Math.sin(angle) * (radius + 1.2);
            
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            const color = new THREE.Color(colors[i]);
            const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 128);
            gradient.addColorStop(0, `rgba(${color.r*255}, ${color.g*255}, ${color.b*255}, 0.3)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 256);
            
            ctx.font = 'bold 48px Inter, sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.shadowColor = `rgba(${color.r*255}, ${color.g*255}, ${color.b*255}, 0.8)`;
            ctx.shadowBlur = 20;
            ctx.fillText(trait, 256, 100);
            
            ctx.font = 'bold 64px Inter, sans-serif';
            ctx.fillText(`${values[i]}%`, 256, 180);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.set(x, 1, z);
            sprite.scale.set(2.5, 1.25, 1);
            this.scene.add(sprite);
        });
    }
    
    createAtmosphere() {
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
            
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.6, 0.8, 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        const time = Date.now() * 0.001;
        
        if (this.radarMesh) {
            this.radarMesh.position.y = Math.sin(time * 0.5) * 0.2;
            this.radarMesh.rotation.y = Math.sin(time * 0.2) * 0.1;
        }
        
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;
        }
        
        if (this.wireframe) {
            this.wireframe.material.opacity = 0.2 + Math.sin(time * 2) * 0.1;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
