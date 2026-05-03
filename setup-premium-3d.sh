#!/bin/bash

echo "🚀 Setting up Premium 3D Effects for PersonaIQ..."

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

cd digital-personality-generator/frontend

echo -e "${BLUE}📁 Creating CSS file...${NC}"

cat > css/premium-3d.css << 'EOF'
/* ===== PREMIUM 3D STYLES FOR PERSONAIQ ===== */
.hero-3d {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0f0f2e 100%);
    perspective: 1000px;
}

.hero-content {
    position: relative;
    z-index: 10;
    text-align: center;
    transform-style: preserve-3d;
}

.hero-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    transform-style: preserve-3d;
}

.title-layer {
    display: block;
    color: #ffffff;
    text-shadow: 0 4px 30px rgba(99, 102, 241, 0.3);
    transition: transform 0.1s ease-out;
}

.title-highlight {
    background: linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 40px rgba(99, 102, 241, 0.5));
}

.hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.7);
    max-width: 600px;
    margin: 0 auto;
    transition: transform 0.1s ease-out;
}

.floating-3d-elements {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transform-style: preserve-3d;
}

.float-card {
    position: absolute;
    animation: float-y 6s ease-in-out infinite;
    animation-delay: var(--delay);
    pointer-events: auto;
}

.float-card:nth-child(1) { top: 20%; left: 10%; }
.float-card:nth-child(2) { top: 60%; right: 15%; }
.float-card:nth-child(3) { bottom: 20%; left: 20%; }

.card-glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-style: preserve-3d;
}

.card-glass:hover {
    transform: translateZ(50px) scale(1.05);
    box-shadow: 0 20px 60px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-color: rgba(99, 102, 241, 0.3);
}

.card-icon { font-size: 2.5rem; margin-bottom: 0.5rem; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3)); }
.card-label { font-size: 0.875rem; color: rgba(255, 255, 255, 0.8); font-weight: 600; }

.ambient-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.4;
    animation: pulse-glow 8s ease-in-out infinite;
}

.glow-1 { width: 600px; height: 600px; background: radial-gradient(circle, #6366f1 0%, transparent 70%); top: -10%; left: -10%; animation-delay: 0s; }
.glow-2 { width: 500px; height: 500px; background: radial-gradient(circle, #ec4899 0%, transparent 70%); bottom: -10%; right: -10%; animation-delay: 2s; }
.glow-3 { width: 400px; height: 400px; background: radial-gradient(circle, #f59e0b 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 4s; }

@keyframes float-y {
    0%, 100% { transform: translateY(0px) rotateX(5deg); }
    50% { transform: translateY(-20px) rotateX(-5deg); }
}

@keyframes pulse-glow {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.2); opacity: 0.6; }
}

.traits-showcase {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    padding: 4rem 2rem;
    perspective: 2000px;
}

.trait-card-3d {
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 2rem;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    cursor: pointer;
    overflow: hidden;
}

.card-border {
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1.5px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(236, 72, 153, 0.5), rgba(245, 158, 11, 0.5));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.trait-card-3d:hover .card-border { opacity: 1; }

.card-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 60%);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
    pointer-events: none;
}

.trait-card-3d:hover .card-shine { transform: translateX(100%); }

.card-content { position: relative; z-index: 2; transform: translateZ(30px); }

.trait-icon { font-size: 3rem; margin-bottom: 1rem; filter: drop-shadow(0 4px 15px rgba(99, 102, 241, 0.4)); }

.trait-score {
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 1rem 0;
}

.trait-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin: 1rem 0;
}

.bar-fill {
    height: 100%;
    width: var(--score);
    background: linear-gradient(90deg, #6366f1, #ec4899);
    border-radius: 3px;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    animation: bar-grow 1.5s ease-out forwards;
}

@keyframes bar-grow {
    from { width: 0%; }
    to { width: var(--score); }
}

.btn-premium-3d {
    position: relative;
    padding: 1.25rem 3rem;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
    border: none;
    border-radius: 16px;
    color: white;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.btn-premium-3d:hover {
    transform: translateY(-3px) translateZ(20px);
    box-shadow: 0 20px 60px rgba(99, 102, 241, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

.btn-premium-3d:active {
    transform: translateY(0) translateZ(0);
    box-shadow: 0 5px 20px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.btn-content { position: relative; z-index: 2; display: flex; align-items: center; gap: 0.75rem; }

.btn-glow {
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    background: linear-gradient(135deg, #6366f1, #ec4899, #f59e0b);
    opacity: 0;
    filter: blur(20px);
    transition: opacity 0.3s ease;
    z-index: -1;
}

.btn-premium-3d:hover .btn-glow { opacity: 0.6; }

.reveal-3d {
    opacity: 0;
    transform: translateY(60px) rotateX(15deg);
    transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
    transform-style: preserve-3d;
}

.reveal-3d.visible {
    opacity: 1;
    transform: translateY(0) rotateX(0);
}

.reveal-3d > * {
    opacity: 0;
    transform: translateZ(-50px);
    transition: all 0.8s ease;
}

.reveal-3d.visible > *:nth-child(1) { transition-delay: 0.1s; opacity: 1; transform: translateZ(0); }
.reveal-3d.visible > *:nth-child(2) { transition-delay: 0.2s; opacity: 1; transform: translateZ(0); }
.reveal-3d.visible > *:nth-child(3) { transition-delay: 0.3s; opacity: 1; transform: translateZ(0); }
.reveal-3d.visible > *:nth-child(4) { transition-delay: 0.4s; opacity: 1; transform: translateZ(0); }
.reveal-3d.visible > *:nth-child(5) { transition-delay: 0.5s; opacity: 1; transform: translateZ(0); }
EOF

echo -e "${GREEN}✅ CSS created${NC}"

echo -e "${BLUE}📁 Creating JS files...${NC}"

cat > js/premium-3d.js << 'EOF'
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-3d');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const xPos = (clientX / innerWidth - 0.5);
            const yPos = (clientY / innerHeight - 0.5);
            
            document.querySelectorAll('[data-depth]').forEach(el => {
                const depth = parseFloat(el.dataset.depth);
                const moveX = xPos * depth * 50;
                const moveY = yPos * depth * 30;
                el.style.transform = `translate3d(${moveX}px, ${moveY}px, ${depth * 100}px)`;
            });
        });
    }

    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(20px)
                scale3d(1.02, 1.02, 1.02)
            `;
            
            const shine = card.querySelector('.card-shine');
            if (shine) {
                const shineX = (x / rect.width) * 100;
                const shineY = (y / rect.height) * 100;
                shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.2) 0%, transparent 50%)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale3d(1, 1, 1)';
            const shine = card.querySelector('.card-shine');
            if (shine) shine.style.background = 'transparent';
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-3d').forEach(el => observer.observe(el));
});
EOF

cat > js/radar-3d.js << 'EOF'
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
EOF

echo -e "${GREEN}✅ JS files created${NC}"

echo ""
echo -e "${BLUE}⚠️  MANUAL STEP REQUIRED:${NC}"
echo "Update frontend/index.html:"
echo ""
echo "1. Add to <head>:"
echo "   <link rel='stylesheet' href='css/premium-3d.css'>"
echo "   <script src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'></script>"
echo "   <script src='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'></script>"
echo ""
echo "2. Replace hero section with class='hero-3d'"
echo ""
echo "3. Add before </body>:"
echo "   <script src='js/premium-3d.js'></script>"
echo "   <script src='js/radar-3d.js'></script>"
echo ""
echo -e "${GREEN}🎉 Done! Now git push:${NC}"
echo "   cd .."
echo "   git add ."
echo "   git commit -m 'Add premium 3D effects'"
echo "   git push origin main"
