/**
 * Kundan Kumar — Portfolio Web Application Script
 * Features: Background Frame Sequence Controller, Smooth Lerp Motion, Stat Counter Animations, Section Observers & Scroll Reveal
 */

document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const TOTAL_FRAMES = 240;
    const FRAME_PREFIX = 'frame_';
    const FRAME_EXTENSION = '.jpg';
    const LERP_FACTOR = 0.12;

    // Canvas & UI Elements
    const canvas = document.getElementById('animation-canvas');
    const ctx = canvas.getContext('2d');
    const loader = document.getElementById('loader');
    const loaderPercentage = document.getElementById('loader-percentage');
    const progressBar = document.getElementById('progress-bar');
    const frameCounter = document.getElementById('frame-counter');
    const scrollProgressIndicator = document.getElementById('scroll-progress-indicator');
    const scrollHint = document.getElementById('scroll-hint');
    const navLinks = document.querySelectorAll('.nav-link');
    const statNumbers = document.querySelectorAll('.stat-number');
    const siteHeader = document.getElementById('site-header');

    // State Variables
    const images = [];
    let loadedCount = 0;
    let currentFrame = 0;
    let targetFrame = 0;
    let animFrameId = null;
    let statsAnimated = false;

    // Get Frame Path
    const getFramePath = (index) => {
        const paddedIndex = String(index).padStart(6, '0');
        return `./${FRAME_PREFIX}${paddedIndex}${FRAME_EXTENSION}`;
    };

    // Preload Frame Sequence & Paced Kinetic Matrix HUD Reveal
    const preloadImages = () => {
        return new Promise((resolve) => {
            const loaderStatus = document.getElementById('loader-status');
            const nameChars = document.querySelectorAll('.kinetic-name .char');
            let displayedProgress = 0;
            let targetProgress = 0;
            let preloadingComplete = false;

            const updateHUD = (progress) => {
                const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));
                if (loaderPercentage) loaderPercentage.textContent = `${roundedProgress}%`;
                if (progressBar) progressBar.style.width = `${roundedProgress}%`;

                // Staggered Kinetic Character Lighting for "KUNDAN KUMAR"
                if (nameChars.length > 0) {
                    const litCount = Math.min(nameChars.length, Math.ceil((roundedProgress / 100) * nameChars.length));
                    nameChars.forEach((char, idx) => {
                        if (idx < litCount) {
                            char.classList.add('lit');
                        } else {
                            char.classList.remove('lit');
                        }
                    });
                }

                // Dynamic Status Ticker
                if (loaderStatus) {
                    if (roundedProgress < 30) {
                        loaderStatus.textContent = 'INITIALIZING DIGITAL CANVAS...';
                    } else if (roundedProgress < 65) {
                        loaderStatus.textContent = 'LOADING 240-FRAME SEQUENCE...';
                    } else if (roundedProgress < 90) {
                        loaderStatus.textContent = 'SYNCHRONIZING AI ASSETS...';
                    } else {
                        loaderStatus.textContent = 'PORTFOLIO READY // UNLOCKING';
                    }
                }
            };

            // Start preloading images in background with automatic folder fallback
            for (let i = 0; i < TOTAL_FRAMES; i++) {
                const img = new Image();
                const paddedIndex = String(i).padStart(6, '0');
                const primarySrc = `./${FRAME_PREFIX}${paddedIndex}${FRAME_EXTENSION}`;
                const secondarySrc = `./images/${FRAME_PREFIX}${paddedIndex}${FRAME_EXTENSION}`;

                img.src = primarySrc;

                img.onload = () => {
                    loadedCount++;
                    targetProgress = Math.round((loadedCount / TOTAL_FRAMES) * 100);
                    if (i === 0) renderFrame(0);
                    if (loadedCount === TOTAL_FRAMES) preloadingComplete = true;
                };

                img.onerror = () => {
                    // Try fallback path if root image failed
                    if (!img.dataset.fallbackAttempted) {
                        img.dataset.fallbackAttempted = 'true';
                        img.src = secondarySrc;
                    } else {
                        loadedCount++;
                        targetProgress = Math.round((loadedCount / TOTAL_FRAMES) * 100);
                        if (loadedCount === TOTAL_FRAMES) preloadingComplete = true;
                    }
                };

                images[i] = img;
            }

            // Smoothly pace progress over ~3.2 seconds so animation is clearly visible
            const startTime = performance.now();
            const DURATION_MS = 3200;

            const stepProgress = (currentTime) => {
                const elapsed = currentTime - startTime;
                const timeProgress = Math.min(100, (elapsed / DURATION_MS) * 100);

                // Progress advances smoothly with time, bounded by actual loading progress
                displayedProgress = Math.min(timeProgress, Math.max(timeProgress * 0.7, targetProgress || 10));

                updateHUD(displayedProgress);

                if (elapsed < DURATION_MS || (displayedProgress < 100 && !preloadingComplete)) {
                    requestAnimationFrame(stepProgress);
                } else {
                    updateHUD(100);
                    setTimeout(resolve, 300);
                }
            };

            requestAnimationFrame(stepProgress);
        });
    };

    // Responsive Canvas Resizing with Retina DPI support
    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);
        renderFrame(Math.round(currentFrame));
    };

    // Render Canvas Frame
    const renderFrame = (frameIndex) => {
        const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(frameIndex)));
        const img = images[index];

        if (!img || !img.complete || img.naturalWidth === 0) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = width / height;

        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawWidth = width;
            drawHeight = width / imgRatio;
            drawX = 0;
            drawY = (height - drawHeight) / 2;
        } else {
            drawWidth = height * imgRatio;
            drawHeight = height;
            drawX = (width - drawWidth) / 2;
            drawY = 0;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        if (frameCounter) {
            const formattedIndex = String(index).padStart(3, '0');
            frameCounter.textContent = `FRAME ${formattedIndex} / ${TOTAL_FRAMES - 1}`;
        }
    };

    // Calculate target frame on scroll
    const updateTargetFrame = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;

        if (maxScroll <= 0) return;

        const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
        targetFrame = scrollFraction * (TOTAL_FRAMES - 1);

        if (scrollProgressIndicator) {
            scrollProgressIndicator.style.width = `${scrollFraction * 100}%`;
        }

        if (scrollHint) {
            if (scrollTop > 50) {
                scrollHint.classList.add('fade-out');
            } else {
                scrollHint.classList.remove('fade-out');
            }
        }

        // Header scrolled state
        if (siteHeader) {
            if (scrollTop > 80) {
                siteHeader.classList.add('header-scrolled');
            } else {
                siteHeader.classList.remove('header-scrolled');
            }
        }

        // Trigger stats animation when hero is in view
        if (!statsAnimated && scrollTop < window.innerHeight * 0.8) {
            animateStats();
        }
    };

    // Smooth Lerp Animation Loop
    const startAnimationLoop = () => {
        const animate = () => {
            const delta = targetFrame - currentFrame;

            if (Math.abs(delta) > 0.001) {
                currentFrame += delta * LERP_FACTOR;
                renderFrame(currentFrame);
            } else if (currentFrame !== targetFrame) {
                currentFrame = targetFrame;
                renderFrame(currentFrame);
            }

            animFrameId = requestAnimationFrame(animate);
        };

        animate();
    };

    // Animate Counter Statistics
    const animateStats = () => {
        statsAnimated = true;

        statNumbers.forEach((el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            let current = 0;
            const duration = 1500;
            const stepTime = Math.abs(Math.floor(duration / target));

            const timer = setInterval(() => {
                current += 1;
                el.textContent = current;
                if (current >= target) {
                    el.textContent = target;
                    clearInterval(timer);
                }
            }, stepTime);
        });
    };

    // Scroll Reveal Observer
    const setupScrollReveal = () => {
        const revealSections = document.querySelectorAll('.reveal-section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.12
        });

        revealSections.forEach((sec) => observer.observe(sec));
    };

    // Mobile Navigation Drawer Toggle
    const setupMobileNav = () => {
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!toggleBtn || !navMenu) return;

        toggleBtn.addEventListener('click', () => {
            toggleBtn.classList.toggle('is-active');
            navMenu.classList.toggle('mobile-open');
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                toggleBtn.classList.remove('is-active');
                navMenu.classList.remove('mobile-open');
            });
        });
    };

    // Navigation Active Link Observer
    const setupNavObserver = () => {
        const sections = document.querySelectorAll('section');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop - sectionHeight / 3) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    };

    // Direct Contact & Feedback Form Handler
    const setupContactFeedbackForm = () => {
        const contactForm = document.getElementById('contact-feedback-form');
        const successToast = document.getElementById('contact-success-msg');

        if (!contactForm) return;

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const subject = document.getElementById('contact-subject').value.trim() || 'General Inquiry';
            const message = document.getElementById('contact-message').value.trim();

            if (!name || !email || !message) return;

            const feedbackData = {
                name,
                email,
                subject,
                message,
                timestamp: new Date().toISOString()
            };

            // Save to localStorage messages
            const savedMessages = JSON.parse(localStorage.getItem('kundankumar_messages') || '[]');
            savedMessages.push(feedbackData);
            localStorage.setItem('kundankumar_messages', JSON.stringify(savedMessages));

            // Show success toast
            if (successToast) {
                successToast.classList.remove('hidden');
                setTimeout(() => {
                    successToast.classList.add('hidden');
                }, 5000);
            }

            contactForm.reset();
        });
    };

    // Testimonials Continuous 3D Roll Loop & Interactive Controller
    const setupTestimonialsInteractiveScrollAndDrag = () => {
        const testimonialsSec = document.getElementById('testimonials');
        const marqueeWrapper = document.querySelector('.marquee-wrapper');
        const track1 = document.querySelector('.track-left-to-right .marquee-content');
        const track2 = document.querySelector('.track-right-to-left .marquee-content');

        if (!testimonialsSec || !marqueeWrapper || !track1 || !track2) return;

        let autoRoll1 = 0;
        let autoRoll2 = 0;
        let dragOffset1 = 0;
        let dragOffset2 = 0;
        let isDragging = false;
        let currentDragX = 0;
        let scrollShift = 0;
        let isHovered = false;

        const updatePositions = () => {
            const halfWidth = track1.scrollWidth / 2 || 1500;

            // Row 1 rolls left-to-right with scroll parallax and drag offset
            const pos1 = -(((autoRoll1 + scrollShift - dragOffset1) % halfWidth + halfWidth) % halfWidth);
            // Row 2 rolls right-to-left with scroll parallax and drag offset
            const pos2 = -(((halfWidth - autoRoll2 + scrollShift - dragOffset2) % halfWidth + halfWidth) % halfWidth);

            track1.style.transform = `translate3d(${pos1}px, 0, 0)`;
            track2.style.transform = `translate3d(${pos2}px, 0, 0)`;
        };

        // Continuous Roll Loop
        const rollLoop = () => {
            if (!isDragging && !isHovered) {
                autoRoll1 += 0.8;
                autoRoll2 += 0.8;
                updatePositions();
            }
            requestAnimationFrame(rollLoop);
        };
        requestAnimationFrame(rollLoop);

        // Pause auto-roll on hover so user can easily read
        marqueeWrapper.addEventListener('mouseenter', () => { isHovered = true; });
        marqueeWrapper.addEventListener('mouseleave', () => { isHovered = false; });

        // Scroll Parallax Animation
        const handleScroll = () => {
            const rect = testimonialsSec.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
            scrollShift = progress * 260;
            updatePositions();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        // Cursor Drag Control (Mouse & Touch)
        const startDrag = (clientX) => {
            isDragging = true;
            currentDragX = clientX;
            marqueeWrapper.classList.add('is-dragging');
        };

        const moveDrag = (clientX) => {
            if (!isDragging) return;
            const deltaX = clientX - currentDragX;
            currentDragX = clientX;

            dragOffset1 += deltaX * 1.2;
            dragOffset2 -= deltaX * 1.2;
            updatePositions();
        };

        const stopDrag = () => {
            isDragging = false;
            marqueeWrapper.classList.remove('is-dragging');
        };

        // Mouse Events
        marqueeWrapper.addEventListener('mousedown', (e) => startDrag(e.clientX));
        window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
        window.addEventListener('mouseup', stopDrag);

        // Touch Events
        marqueeWrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) startDrag(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) moveDrag(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchend', stopDrag);
    };

    // Custom Premium Lerp & Magnetic Cursor Controller
    const setupCustomCursor = () => {
        const dot = document.getElementById('custom-cursor-dot');
        const ring = document.getElementById('custom-cursor-ring');
        const cursorText = document.getElementById('cursor-text');

        if (!dot || !ring) return;

        // Check if device supports fine hover cursor
        const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!isFinePointer) return;

        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;

        // Smooth Lerp factor for outer ring (Fast response, zero lag, silky smooth delay)
        const lerpFactor = 0.2;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        });

        // Animation Loop for Ring Lerp
        const renderCursor = () => {
            ringX += (mouseX - ringX) * lerpFactor;
            ringY += (mouseY - ringY) * lerpFactor;

            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;

            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        // Click Ripple Pulse
        window.addEventListener('mousedown', () => {
            dot.classList.add('is-clicked');
            ring.classList.add('is-clicked');
        });

        window.addEventListener('mouseup', () => {
            dot.classList.remove('is-clicked');
            ring.classList.remove('is-clicked');
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            dot.classList.add('cursor-hidden');
            ring.classList.add('cursor-hidden');
        });

        document.addEventListener('mouseenter', () => {
            dot.classList.remove('cursor-hidden');
            ring.classList.remove('cursor-hidden');
        });

        // Hover Effect Handlers
        const links = document.querySelectorAll('a:not(.primary-btn):not(.secondary-btn):not(.cta-btn):not(.footer-cta-link), .nav-link, .footer-link, .footer-social-link');
        const buttons = document.querySelectorAll('.primary-btn, .secondary-btn, .cta-btn, .footer-cta-link, .pill-btn-contact, button, [role="button"]');
        const cards = document.querySelectorAll('.project-card');
        const images = document.querySelectorAll('img, .author-avatar, .hero-image, canvas');

        // Links -> pointer style expansion
        links.forEach((link) => {
            link.addEventListener('mouseenter', () => {
                ring.classList.add('cursor-hover-link');
            });
            link.addEventListener('mouseleave', () => {
                ring.classList.remove('cursor-hover-link');
            });
        });

        // Buttons -> ring expands slightly + magnetic pull
        buttons.forEach((btn) => {
            btn.addEventListener('mouseenter', () => {
                ring.classList.add('cursor-hover-btn');
            });
            btn.addEventListener('mouseleave', () => {
                ring.classList.remove('cursor-hover-btn');
                btn.style.transform = '';
            });

            // Magnetic Pull Effect on Buttons
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const btnCenterX = rect.left + rect.width / 2;
                const btnCenterY = rect.top + rect.height / 2;
                const distanceX = e.clientX - btnCenterX;
                const distanceY = e.clientY - btnCenterY;

                btn.style.transform = `translate(${distanceX * 0.1}px, ${distanceY * 0.1}px)`;
            });
        });

        // Project Cards -> Ring expands and displays "VIEW"
        cards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                if (cursorText) cursorText.textContent = 'VIEW';
                ring.classList.add('cursor-hover-card');
            });
            card.addEventListener('mouseleave', () => {
                if (cursorText) cursorText.textContent = '';
                ring.classList.remove('cursor-hover-card');
            });
        });

        // Images -> Smooth scale up
        images.forEach((img) => {
            img.addEventListener('mouseenter', () => {
                ring.classList.add('cursor-hover-image');
            });
            img.addEventListener('mouseleave', () => {
                ring.classList.remove('cursor-hover-image');
            });
        });
    };

    // Initialize Application
    const init = async () => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('scroll', updateTargetFrame, { passive: true });

        setupMobileNav();
        setupNavObserver();
        setupScrollReveal();
        setupContactFeedbackForm();
        setupTestimonialsInteractiveScrollAndDrag();
        setupCustomCursor();

        await preloadImages();

        setTimeout(() => {
            if (loader) {
                loader.classList.add('hidden');
            }
            animateStats();
        }, 300);

        updateTargetFrame();
        startAnimationLoop();
    };

    init();
});
