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
