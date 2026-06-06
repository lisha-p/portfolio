/* ==========================================================================
   PORTFOLIO INTERACTIVE ENGINE
   Lisha P — Professional 3D Portfolio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------------------------------
       0. 3D BACKGROUND CANVAS — Floating geometric shapes
    ----------------------------------------------------------------------- */
    const bgCanvas = document.getElementById('bg-3d-canvas');

    if (bgCanvas) {
        const bgCtx = bgCanvas.getContext('2d');
        let bgAnimId;
        let shapes = [];
        let mouseX = 0;
        let mouseY = 0;

        const resizeBg = () => {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        };

        resizeBg();
        window.addEventListener('resize', resizeBg);

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        const shapeTypes = ['cube', 'ring', 'triangle'];
        const palette = [
            { r: 124, g: 92, b: 252 },
            { r: 79, g: 124, b: 255 },
            { r: 56, g: 189, b: 248 },
        ];

        for (let i = 0; i < 18; i++) {
            shapes.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                z: Math.random() * 400 + 100,
                size: Math.random() * 40 + 20,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.008,
                driftX: (Math.random() - 0.5) * 0.3,
                driftY: (Math.random() - 0.5) * 0.2,
                type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
                color: palette[Math.floor(Math.random() * palette.length)],
            });
        }

        function drawShape(s, px, py) {
            const scale = 300 / (s.z + 300);
            const sx = s.x + px * s.z * 0.15;
            const sy = s.y + py * s.z * 0.15;
            const sz = s.size * scale;

            bgCtx.save();
            bgCtx.translate(sx, sy);
            bgCtx.rotate(s.rot);
            bgCtx.strokeStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${0.12 + scale * 0.15})`;
            bgCtx.lineWidth = 1.2 * scale;

            if (s.type === 'cube') {
                bgCtx.strokeRect(-sz / 2, -sz / 2, sz, sz);
                bgCtx.beginPath();
                bgCtx.moveTo(-sz / 2, -sz / 2);
                bgCtx.lineTo(-sz / 4, -sz / 2 - sz / 3);
                bgCtx.lineTo(sz / 4, -sz / 2 - sz / 3);
                bgCtx.lineTo(sz / 2, -sz / 2);
                bgCtx.stroke();
                bgCtx.beginPath();
                bgCtx.moveTo(sz / 2, -sz / 2);
                bgCtx.lineTo(sz / 4, -sz / 2 - sz / 3);
                bgCtx.lineTo(sz / 4, sz / 2 - sz / 3);
                bgCtx.lineTo(sz / 2, sz / 2);
                bgCtx.stroke();
            } else if (s.type === 'ring') {
                bgCtx.beginPath();
                bgCtx.arc(0, 0, sz / 2, 0, Math.PI * 2);
                bgCtx.stroke();
            } else {
                bgCtx.beginPath();
                bgCtx.moveTo(0, -sz / 2);
                bgCtx.lineTo(sz / 2, sz / 2);
                bgCtx.lineTo(-sz / 2, sz / 2);
                bgCtx.closePath();
                bgCtx.stroke();
            }

            bgCtx.restore();
        }

        function animateBg() {
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

            shapes.sort((a, b) => b.z - a.z);
            shapes.forEach((s) => {
                s.x += s.driftX;
                s.y += s.driftY;
                s.rot += s.rotSpeed;

                if (s.x < -80) s.x = bgCanvas.width + 80;
                if (s.x > bgCanvas.width + 80) s.x = -80;
                if (s.y < -80) s.y = bgCanvas.height + 80;
                if (s.y > bgCanvas.height + 80) s.y = -80;

                drawShape(s, mouseX, mouseY);
            });

            bgAnimId = requestAnimationFrame(animateBg);
        }

        animateBg();
    }


    /* -----------------------------------------------------------------------
       0b. 3D TILT ON CARDS & HERO MEDIA
    ----------------------------------------------------------------------- */
    document.querySelectorAll('.tilt-3d').forEach((el) => {
        const intensity = parseFloat(el.dataset.tiltIntensity) || 8;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(900px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(10px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });


    /* -----------------------------------------------------------------------
       0c. SCROLL PARALLAX FOR SECTION HEADERS
    ----------------------------------------------------------------------- */
    const parallaxEls = document.querySelectorAll('.section-header, .hero-content');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        parallaxEls.forEach((el, i) => {
            const offset = (scrollY - el.offsetTop) * 0.04;
            el.style.transform = `translate3d(0, ${offset * (i % 2 === 0 ? 1 : -0.5)}px, 0)`;
        });
    }, { passive: true });


    /* -----------------------------------------------------------------------
       1. SCROLL REVEAL (Intersection Observer)
       Fade-in + translateY on scroll for all .reveal elements
    ----------------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation delay based on element's position within its parent
                const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                let siblingIndex = 0;
                siblings.forEach((sib, i) => {
                    if (sib === entry.target) siblingIndex = i;
                });
                entry.target.style.transitionDelay = `${siblingIndex * 0.12}s`;
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    /* -----------------------------------------------------------------------
       2. NAVBAR SCROLL BEHAVIOR
       Add .scrolled class on scroll for visual depth
    ----------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Fade out scroll indicator
        if (scrollIndicator) {
            const opacity = Math.max(0, 1 - window.scrollY / 400);
            scrollIndicator.style.opacity = opacity;
        }
    });


    /* -----------------------------------------------------------------------
       3. MOBILE NAV TOGGLE (Hamburger Menu)
    ----------------------------------------------------------------------- */
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu on nav link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }


    /* -----------------------------------------------------------------------
       4. SMOOTH SCROLL for anchor links
    ----------------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
                const offsetTop = targetEl.offsetTop - navHeight;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });


    /* -----------------------------------------------------------------------
       5. EXPERTISE CARD MOUSE GLOW TRACKING
       Adds a radial gradient glow that follows the cursor on hover
    ----------------------------------------------------------------------- */
    const expertiseCards = document.querySelectorAll('.expertise-card');

    expertiseCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });


    /* -----------------------------------------------------------------------
       6. GENERATIVE CANVAS VISUALIZER (Hero Video Fallback)
       Renders a premium particle network animation
    ----------------------------------------------------------------------- */
    const canvas = document.getElementById('generative-canvas');
    const videoEl = document.getElementById('demo-video');
    
    const overlay = document.getElementById('video-overlay');
    const videoContainer = document.getElementById('video-container');

    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        const PARTICLE_COUNT = 80;
        const CONNECTION_DISTANCE = 150;

        function resizeCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.radius = Math.random() * 2 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;

                // Assign color from palette
                const colors = [
                    { r: 124, g: 92, b: 252 },
                    { r: 79, g: 124, b: 255 },
                    { r: 56, g: 189, b: 248 },
                    { r: 160, g: 174, b: 220 },
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Keep in bounds
                this.x = Math.max(0, Math.min(canvas.width, this.x));
                this.y = Math.max(0, Math.min(canvas.height, this.y));
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
                ctx.fill();

                // Outer glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.08})`;
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);

                        const grad = ctx.createLinearGradient(
                            particles[i].x, particles[i].y,
                            particles[j].x, particles[j].y
                        );
                        grad.addColorStop(0, `rgba(${particles[i].color.r}, ${particles[i].color.g}, ${particles[i].color.b}, ${opacity})`);
                        grad.addColorStop(1, `rgba(${particles[j].color.r}, ${particles[j].color.g}, ${particles[j].color.b}, ${opacity})`);

                        ctx.strokeStyle = grad;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Central radial glow
            const centerGlow = ctx.createRadialGradient(
                canvas.width * 0.5, canvas.height * 0.5, 0,
                canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.4
            );
            centerGlow.addColorStop(0, 'rgba(124, 92, 252, 0.08)');
            centerGlow.addColorStop(0.5, 'rgba(79, 124, 255, 0.04)');
            centerGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = centerGlow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawConnections();
            animationId = requestAnimationFrame(animateParticles);
        }

        animateParticles();

        // Video playback — keep canvas visible until the video is actually playing
        if (videoContainer && videoEl) {
            const hideCanvasAndStopAnimation = () => {
                if (canvas) canvas.style.display = 'none';
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            };

            const showCanvasFallback = () => {
                if (canvas) canvas.style.display = 'block';
                if (!animationId) animateParticles();
            };

            const enableAudio = () => {
                videoEl.muted = false;
                videoEl.volume = 1;
                if (overlay) {
                    overlay.style.opacity = '0';
                    overlay.style.pointerEvents = 'none';
                }
            };

            const tryPlay = () => {
                videoEl.muted = true;
                return videoEl.play().catch((err) => {
                    console.warn('Video autoplay failed:', err);
                    showCanvasFallback();
                });
            };

            videoEl.addEventListener('playing', hideCanvasAndStopAnimation);
            videoEl.addEventListener('error', showCanvasFallback);

            if (videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                tryPlay();
            } else {
                videoEl.addEventListener('canplay', () => tryPlay(), { once: true });
            }

            // Tap/click the video frame to play or unmute
            videoContainer.addEventListener('click', () => {
                enableAudio();
                if (videoEl.paused) {
                    videoEl.play().catch((err) => {
                        console.warn('Play on click failed:', err);
                    });
                }
            });

            // Unmute on first page interaction (scroll, key, etc.)
            const handleFirstInteraction = () => {
                enableAudio();
                if (videoEl.paused) tryPlay();
            };

            ['touchstart', 'scroll', 'keydown'].forEach((event) => {
                document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
            });

            if (overlay) {
                const prompt = document.createElement('div');
                prompt.className = 'overlay-text';
                prompt.textContent = 'Tap video to enable audio';
                overlay.appendChild(prompt);
            }
        }
    }


    /* -----------------------------------------------------------------------
       7. HOTELHUB INTERACTIVE MOCK UI
       Generates a clickable room availability grid
    ----------------------------------------------------------------------- */
    const hotelGrid = document.getElementById('hotelhub-grid');

    if (hotelGrid) {
        const ROOM_COUNT = 18;
        const statuses = ['available', 'booked', 'cleaning'];
        const statusLabels = { available: 'Avail', booked: 'Booked', cleaning: 'Clean' };
        const rooms = [];

        for (let i = 0; i < ROOM_COUNT; i++) {
            const roomNumber = 101 + i;
            const initialStatus = statuses[Math.floor(Math.random() * 3)];

            const cell = document.createElement('div');
            cell.classList.add('room-cell', initialStatus);
            cell.dataset.status = initialStatus;
            cell.innerHTML = `<span class="room-number">${roomNumber}</span>`;
            cell.title = `Room ${roomNumber} — Click to cycle status`;

            cell.addEventListener('click', () => {
                const currentIndex = statuses.indexOf(cell.dataset.status);
                const nextIndex = (currentIndex + 1) % statuses.length;
                const nextStatus = statuses[nextIndex];

                cell.classList.remove(...statuses);
                cell.classList.add(nextStatus);
                cell.dataset.status = nextStatus;
            });

            hotelGrid.appendChild(cell);
            rooms.push(cell);
        }

        // Auto-demo: randomly change a room status every few seconds
        setInterval(() => {
            const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
            const currentIndex = statuses.indexOf(randomRoom.dataset.status);
            const nextIndex = (currentIndex + 1) % statuses.length;
            const nextStatus = statuses[nextIndex];

            randomRoom.classList.remove(...statuses);
            randomRoom.classList.add(nextStatus);
            randomRoom.dataset.status = nextStatus;

            // Flash animation
            randomRoom.style.transform = 'scale(1.15)';
            setTimeout(() => {
                randomRoom.style.transform = '';
            }, 300);
        }, 3000);
    }


    /* -----------------------------------------------------------------------
       8. UPI FRAUD DETECTION LIVE TERMINAL
       Simulates real-time AI transaction scanning with scrolling logs
    ----------------------------------------------------------------------- */
    const terminalLogs = document.getElementById('fraud-terminal-logs');
    const countScanned = document.getElementById('count-scanned');
    const countFlagged = document.getElementById('count-flagged');

    if (terminalLogs) {
        let scanned = 0;
        let flagged = 0;

        const senderNames = [
            'Aarav M.', 'Priya S.', 'Rohan K.', 'Sneha D.', 'Vikram P.',
            'Anjali R.', 'Karthik N.', 'Meera V.', 'Deepak J.', 'Pooja L.',
            'Nikhil T.', 'Swati G.', 'Arjun B.', 'Divya H.', 'Rahul C.'
        ];

        const receiverNames = [
            'Amazon Pay', 'Flipkart', 'Swiggy', 'Zomato', 'PhonePe Merchant',
            'Google Pay Store', 'Paytm Mall', 'BigBasket', 'MakeMyTrip',
            'Unknown_ID_8x92k', 'Unverified_Acc_3dxl', 'BLOCKED_ENTITY_19',
            'Netflix India', 'Uber', 'Ola Cabs'
        ];

        const remarks = [
            'Monthly subscription', 'Food order', 'Electronics purchase',
            'Bill payment', 'Money transfer', 'Recharge',
            'URGENT: Verify OTP now!!!', 'Claim FREE cashback: bit.ly/x9kz',
            'REFUND: Click link asap', 'Lottery winnings - ACT NOW',
            'Grocery order', 'Flight booking', 'Cab ride', 'Gift card'
        ];

        function generateTransaction() {
            const isFraud = Math.random() < 0.18; // ~18% fraud rate for visual drama
            const sender = senderNames[Math.floor(Math.random() * senderNames.length)];
            const amount = isFraud
                ? (Math.random() * 48000 + 2000).toFixed(0)
                : (Math.random() * 2000 + 50).toFixed(0);

            let receiver, remark;
            if (isFraud) {
                receiver = receiverNames.slice(9, 12)[Math.floor(Math.random() * 3)];
                remark = remarks.slice(6, 10)[Math.floor(Math.random() * 4)];
            } else {
                receiver = receiverNames.slice(0, 9)[Math.floor(Math.random() * 9)];
                remark = remarks.slice(0, 6).concat(remarks.slice(10))[Math.floor(Math.random() * 10)];
            }

            const timestamp = new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });

            const txId = 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();

            scanned++;
            if (countScanned) countScanned.textContent = scanned;

            const row = document.createElement('div');
            row.classList.add('terminal-row');

            if (isFraud) {
                flagged++;
                if (countFlagged) countFlagged.textContent = flagged;
                row.classList.add('fraud-flag');
                row.textContent = `[${timestamp}] FLAGGED | ${txId} | INR ${amount} | ${sender} -> ${receiver} | "${remark}" | Confidence: ${(Math.random() * 8 + 92).toFixed(1)}%`;
            } else {
                row.classList.add('safe-flag');
                row.textContent = `[${timestamp}] SAFE   | ${txId} | INR ${amount} | ${sender} -> ${receiver} | "${remark}"`;
            }

            terminalLogs.appendChild(row);

            // Keep max 25 visible log rows
            while (terminalLogs.children.length > 25) {
                terminalLogs.removeChild(terminalLogs.firstChild);
            }

            // Auto-scroll
            terminalLogs.scrollTop = terminalLogs.scrollHeight;
        }

        // Generate initial batch
        for (let i = 0; i < 6; i++) {
            setTimeout(() => generateTransaction(), i * 200);
        }

        // Continue generating on interval
        setInterval(generateTransaction, 2200);
    }


    /* -----------------------------------------------------------------------
       9. ACTIVE NAV LINK HIGHLIGHTING ON SCROLL
       Highlights the nav link matching the current visible section
    ----------------------------------------------------------------------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinksAll.forEach(link => {
                    link.style.color = '';
                    if (link.getAttribute('href') === `#${id}`) {
                        link.style.color = '#7c5cfc';
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-72px 0px -40% 0px'
    });

    sections.forEach(sec => sectionObserver.observe(sec));

});
