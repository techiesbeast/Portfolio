document.addEventListener("DOMContentLoaded", () => {
    // Feather Icons
    if (typeof feather !== 'undefined') feather.replace();

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Scroll Reveal Animation 
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                    
                    // Trigger skill bar animations if within element
                    const progressBars = entry.target.querySelectorAll('.progress-bar-fill');
                    progressBars.forEach(bar => {
                        const targetWidth = bar.getAttribute('data-width');
                        if (targetWidth) {
                            bar.style.width = targetWidth + '%';
                        }
                    });
                }
            });
        }, revealOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback
        revealElements.forEach(el => el.classList.add('active'));
    }

    // Custom Cursor tracking
    const cursor = document.getElementById('custom-cursor');
    const cursorTrail = document.getElementById('cursor-trail');
    
    if (cursor && cursorTrail && window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let trailX = 0, trailY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        // Smooth trailing animation
        const animateTrail = () => {
            let dx = mouseX - trailX;
            let dy = mouseY - trailY;
            
            trailX += dx * 0.15;
            trailY += dy * 0.15;
            
            cursorTrail.style.left = trailX + 'px';
            cursorTrail.style.top = trailY + 'px';
            
            requestAnimationFrame(animateTrail);
        };
        animateTrail();

        // Cursor Hover Effects
        const hoverables = document.querySelectorAll('a, button, .glass-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // Initialize Three.js instance if canvas exists
    const canvas = document.getElementById('cosmos-bg');
    if (canvas && typeof THREE !== 'undefined') {
        initCosmos(canvas);
    }
});

// Three.js Logic for Hero Background
function initCosmos(canvas) {
    // Get container dimensions (we wrap hero in a relative container)
    const container = canvas.parentElement;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    // Use slightly less dense fog for smaller container
    scene.fog = new THREE.FogExp2(0x030014, 0.002);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    const colors = [
        new THREE.Color('#00f3ff'), // neon cyan
        new THREE.Color('#0077ff'), // electric blue
        new THREE.Color('#b537f2'), // purple
        new THREE.Color('#ffffff')  // white
    ];

    for(let i = 0; i < particlesCount * 3; i+=3) {
        posArray[i] = (Math.random() - 0.5) * 1500;
        posArray[i+1] = (Math.random() - 0.5) * 1500;
        posArray[i+2] = (Math.random() - 0.5) * 1500;

        const randColor = colors[Math.floor(Math.random() * colors.length)];
        colorArray[i] = randColor.r;
        colorArray[i+1] = randColor.g;
        colorArray[i+2] = randColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const generateCircleTexture = () => {
        const canvasRender = document.createElement('canvas');
        canvasRender.width = 32;
        canvasRender.height = 32;
        const context = canvasRender.getContext('2d');
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        return new THREE.CanvasTexture(canvasRender);
    };

    const particlesMaterial = new THREE.PointsMaterial({
        size: 4,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        map: generateCircleTexture()
    });

    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Only track mouse over the container
    document.addEventListener('mousemove', (event) => {
        // Find relative mouse position to window center
        mouseX = (event.clientX - window.innerWidth / 2);
        mouseY = (event.clientY - window.innerHeight / 2);
    });

    window.addEventListener('resize', () => {
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        particleMesh.rotation.y += 0.0005;
        particleMesh.rotation.x += 0.0002;

        particleMesh.rotation.y += 0.05 * (targetX - particleMesh.rotation.y);
        particleMesh.rotation.x += 0.05 * (targetY - particleMesh.rotation.x);

        particleMesh.position.y = Math.sin(elapsedTime * 0.5) * 10;

        renderer.render(scene, camera);
    };

    animate();
}
