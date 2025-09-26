/**
 * Enhanced Animation Module
 * 
 * Manages and coordinates AOS (Animate On Scroll) animations with custom
 * performance optimizations, staggered animations, and advanced controls.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class EnhancedAnimations {
    constructor(options = {}) {
        this.config = {
            enableAOS: true,
            enableCustomAnimations: true,
            enableScrollAnimations: true,
            enableStaggeredAnimations: true,
            enablePerformanceMode: true,
            staggerDelay: 100,
            animationDuration: 1000,
            animationEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            intersectionThreshold: 0.1,
            rootMargin: '50px',
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            ...options
        };
        
        this.elements = {
            animatedElements: [],
            sections: [],
            triggers: []
        };
        
        this.state = {
            isInitialized: false,
            animatedElements: new Set(),
            observers: [],
            rafId: null,
            lastScrollY: 0,
            ticking: false
        };
        
        this.animations = {
            fadeIn: this.createFadeInAnimation.bind(this),
            slideUp: this.createSlideUpAnimation.bind(this),
            slideDown: this.createSlideDownAnimation.bind(this),
            slideLeft: this.createSlideLeftAnimation.bind(this),
            slideRight: this.createSlideRightAnimation.bind(this),
            scaleIn: this.createScaleInAnimation.bind(this),
            rotateIn: this.createRotateInAnimation.bind(this),
            flipIn: this.createFlipInAnimation.bind(this),
            bounceIn: this.createBounceInAnimation.bind(this),
            elastic: this.createElasticAnimation.bind(this)
        };
        
        this.init();
    }
    
    /**
     * Initialize enhanced animations
     */
    init() {
        try {
            if (this.config.reducedMotion) {
                this.config.animationDuration = 0;
                this.config.staggerDelay = 0;
            }
            
            this.detectElements();
            this.setupAOS();
            this.setupCustomAnimations();
            this.setupIntersectionObservers();
            this.bindEvents();
            this.setupScrollAnimations();
            
            this.state.isInitialized = true;
            console.log('Enhanced animations initialized successfully');
        } catch (error) {
            console.error('Enhanced animations initialization failed:', error);
        }
    }
    
    /**
     * Detect and cache animated elements
     */
    detectElements() {
        // AOS elements
        this.elements.animatedElements = Array.from(
            document.querySelectorAll('[data-aos], [data-animate], .animate-on-scroll')
        );
        
        // Section elements for scroll animations
        this.elements.sections = Array.from(
            document.querySelectorAll('section, .section, .scroll-section')
        );
        
        // Animation triggers
        this.elements.triggers = Array.from(
            document.querySelectorAll('[data-animation-trigger]')
        );
        
        console.log(`Found ${this.elements.animatedElements.length} animated elements`);
    }
    
    /**
     * Setup AOS with custom configuration
     */
    setupAOS() {
        if (!this.config.enableAOS || typeof AOS === 'undefined') return;
        
        const aosConfig = {
            duration: this.config.animationDuration,
            easing: this.config.animationEasing,
            offset: 100,
            delay: 0,
            once: true,
            mirror: false,
            anchorPlacement: 'top-bottom',
            disable: this.config.reducedMotion ? true : false
        };
        
        AOS.init(aosConfig);
        
        // Refresh AOS when content changes
        document.addEventListener('content:updated', () => {
            AOS.refresh();
        });
    }
    
    /**
     * Setup custom animations for elements
     */
    setupCustomAnimations() {
        if (!this.config.enableCustomAnimations) return;
        
        this.elements.animatedElements.forEach((element, index) => {
            this.prepareElementForAnimation(element, index);
        });
    }
    
    /**
     * Prepare element for animation
     */
    prepareElementForAnimation(element, index = 0) {
        const animationType = element.dataset.animate || element.dataset.aos || 'fadeIn';
        const delay = parseInt(element.dataset.delay) || 
                     (this.config.enableStaggeredAnimations ? index * this.config.staggerDelay : 0);
        const duration = parseInt(element.dataset.duration) || this.config.animationDuration;
        const easing = element.dataset.easing || this.config.animationEasing;
        
        // Set initial state
        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(animationType);
        element.style.transition = this.config.reducedMotion ? 'none' : 
            `all ${duration}ms ${easing} ${delay}ms`;
        
        // Store animation config
        element._animationConfig = {
            type: animationType,
            delay,
            duration,
            easing,
            triggered: false
        };
        
        // Add animation class
        element.classList.add('animate-element', `animate-${animationType}`);
    }
    
    /**
     * Get initial transform for animation type
     */
    getInitialTransform(type) {
        const transforms = {
            fadeIn: 'none',
            slideUp: 'translateY(30px)',
            slideDown: 'translateY(-30px)',
            slideLeft: 'translateX(30px)',
            slideRight: 'translateX(-30px)',
            scaleIn: 'scale(0.9)',
            rotateIn: 'rotate(-10deg) scale(0.9)',
            flipIn: 'rotateY(-90deg)',
            bounceIn: 'scale(0.3)',
            elastic: 'scale(0.8) rotate(5deg)'
        };
        
        return transforms[type] || 'none';
    }
    
    /**
     * Setup intersection observers
     */
    setupIntersectionObservers() {
        if (!window.IntersectionObserver) return;
        
        const options = {
            root: null,
            rootMargin: this.config.rootMargin,
            threshold: this.config.intersectionThreshold
        };
        
        // Main animation observer
        this.mainObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerElementAnimation(entry.target);
                }
            });
        }, options);
        
        this.elements.animatedElements.forEach(element => {
            this.mainObserver.observe(element);
        });
        
        // Section observer for scroll effects
        if (this.config.enableScrollAnimations) {
            this.sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.handleSectionAnimation(entry.target, entry.intersectionRatio);
                    }
                });
            }, { threshold: [0, 0.25, 0.5, 0.75, 1.0] });
            
            this.elements.sections.forEach(section => {
                this.sectionObserver.observe(section);
            });
        }
        
        this.state.observers.push(this.mainObserver);
        if (this.sectionObserver) {
            this.state.observers.push(this.sectionObserver);
        }
    }
    
    /**
     * Trigger element animation
     */
    triggerElementAnimation(element) {
        if (!element._animationConfig || element._animationConfig.triggered) return;
        
        const config = element._animationConfig;
        config.triggered = true;
        
        // Add to animated set
        this.state.animatedElements.add(element);
        
        // Apply animation
        if (this.config.reducedMotion) {
            this.applyImmediateAnimation(element, config);
        } else {
            setTimeout(() => {
                this.applyAnimation(element, config);
            }, config.delay);
        }
        
        // Track animation
        this.trackAnimation(element, config.type);
    }
    
    /**
     * Apply animation to element
     */
    applyAnimation(element, config) {
        // Get final transform
        const finalTransform = this.getFinalTransform(config.type);
        
        // Apply animation
        element.style.opacity = '1';
        element.style.transform = finalTransform;
        element.classList.add('animate-active');
        
        // Custom animation logic
        if (this.animations[config.type]) {
            this.animations[config.type](element, config);
        }
        
        // Animation complete callback
        setTimeout(() => {
            element.classList.add('animate-complete');
            this.onAnimationComplete(element, config);
        }, config.duration);
    }
    
    /**
     * Apply immediate animation for reduced motion
     */
    applyImmediateAnimation(element, config) {
        element.style.opacity = '1';
        element.style.transform = 'none';
        element.classList.add('animate-active', 'animate-complete');
        this.onAnimationComplete(element, config);
    }
    
    /**
     * Get final transform for animation type
     */
    getFinalTransform(type) {
        return 'none'; // Most animations end at their natural state
    }
    
    /**
     * Handle section animations
     */
    handleSectionAnimation(section, intersectionRatio) {
        if (!this.config.enableScrollAnimations) return;
        
        const progress = Math.min(Math.max(intersectionRatio, 0), 1);
        
        // Apply scroll-based effects
        this.applyScrollEffects(section, progress);
        
        // Trigger staggered animations for child elements
        if (intersectionRatio > 0.3 && !section._childrenAnimated) {
            section._childrenAnimated = true;
            this.animateChildrenElements(section);
        }
    }
    
    /**
     * Apply scroll effects to section
     */
    applyScrollEffects(section, progress) {
        // Parallax effect
        const parallaxElements = section.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(progress * 100 * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        
        // Fade effect
        const fadeElements = section.querySelectorAll('[data-fade-scroll]');
        fadeElements.forEach(element => {
            element.style.opacity = progress;
        });
        
        // Scale effect
        const scaleElements = section.querySelectorAll('[data-scale-scroll]');
        scaleElements.forEach(element => {
            const scale = 0.8 + (progress * 0.2);
            element.style.transform = `scale(${scale})`;
        });
    }
    
    /**
     * Animate children elements with stagger
     */
    animateChildrenElements(container) {
        if (!this.config.enableStaggeredAnimations) return;
        
        const children = Array.from(container.children).filter(child => 
            !child.classList.contains('animate-element') || 
            !child._animationConfig?.triggered
        );
        
        children.forEach((child, index) => {
            if (!child._animationConfig) {
                this.prepareElementForAnimation(child, index);
            }
            
            setTimeout(() => {
                if (!child._animationConfig.triggered) {
                    this.triggerElementAnimation(child);
                }
            }, index * this.config.staggerDelay);
        });
    }
    
    /**
     * Setup scroll animations
     */
    setupScrollAnimations() {
        if (!this.config.enableScrollAnimations) return;
        
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScrollAnimations();
        }, 16)); // ~60fps
    }
    
    /**
     * Handle scroll animations
     */
    handleScrollAnimations() {
        if (!this.config.enablePerformanceMode) return;
        
        const scrollY = window.pageYOffset;
        const scrollDirection = scrollY > this.state.lastScrollY ? 'down' : 'up';
        this.state.lastScrollY = scrollY;
        
        // Update scroll-based animations
        this.updateScrollBasedAnimations(scrollY, scrollDirection);
    }
    
    /**
     * Update scroll-based animations
     */
    updateScrollBasedAnimations(scrollY, direction) {
        // Scroll-triggered elements
        const scrollTriggers = document.querySelectorAll('[data-scroll-trigger]');
        scrollTriggers.forEach(element => {
            const triggerPoint = parseInt(element.dataset.scrollTrigger) || 
                               element.getBoundingClientRect().top + scrollY;
            
            if (scrollY >= triggerPoint && !element._scrollTriggered) {
                element._scrollTriggered = true;
                this.triggerScrollAnimation(element);
            }
        });
        
        // Scroll progress indicators
        this.updateScrollProgress();
    }
    
    /**
     * Trigger scroll animation
     */
    triggerScrollAnimation(element) {
        const animationType = element.dataset.scrollAnimation || 'fadeIn';
        
        element.classList.add('scroll-triggered', `scroll-${animationType}`);
        
        // Custom scroll animation logic
        if (this.animations[animationType]) {
            const config = {
                type: animationType,
                duration: parseInt(element.dataset.duration) || this.config.animationDuration,
                easing: element.dataset.easing || this.config.animationEasing
            };
            
            this.animations[animationType](element, config);
        }
    }
    
    /**
     * Update scroll progress
     */
    updateScrollProgress() {
        const progressElements = document.querySelectorAll('[data-scroll-progress]');
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = window.pageYOffset / scrollHeight;
        
        progressElements.forEach(element => {
            const progressType = element.dataset.scrollProgress;
            
            switch (progressType) {
                case 'bar':
                    element.style.transform = `scaleX(${scrollProgress})`;
                    break;
                case 'circle':
                    const circumference = 2 * Math.PI * 50; // Assuming 50px radius
                    const offset = circumference - (scrollProgress * circumference);
                    element.style.strokeDasharray = circumference;
                    element.style.strokeDashoffset = offset;
                    break;
                case 'number':
                    element.textContent = Math.round(scrollProgress * 100) + '%';
                    break;
            }
        });
    }
    
    /**
     * Bind events
     */
    bindEvents() {
        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Reduced motion preference change
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addListener((e) => {
            this.config.reducedMotion = e.matches;
            this.handleReducedMotionChange();
        });
        
        // Custom events
        document.addEventListener('animation:trigger', (e) => {
            this.triggerCustomAnimation(e.detail);
        });
        
        document.addEventListener('animation:reset', (e) => {
            this.resetAnimations(e.detail);
        });
    }
    
    /**
     * Handle resize
     */
    handleResize() {
        // Recalculate positions for scroll-based animations
        if (this.config.enableScrollAnimations) {
            this.updateScrollBasedAnimations(window.pageYOffset, 'none');
        }
        
        // Refresh AOS
        if (typeof AOS !== 'undefined') {
            AOS.refreshHard();
        }
    }
    
    /**
     * Handle reduced motion change
     */
    handleReducedMotionChange() {
        if (this.config.reducedMotion) {
            // Disable animations
            this.elements.animatedElements.forEach(element => {
                element.style.transition = 'none';
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
        } else {
            // Re-enable animations
            this.setupCustomAnimations();
        }
    }
    
    /**
     * Pause animations
     */
    pauseAnimations() {
        this.elements.animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }
    
    /**
     * Resume animations
     */
    resumeAnimations() {
        this.elements.animatedElements.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
    
    /**
     * Animation complete callback
     */
    onAnimationComplete(element, config) {
        // Dispatch custom event
        const event = new CustomEvent('animation:complete', {
            detail: { element, config, timestamp: Date.now() }
        });
        element.dispatchEvent(event);
        
        // Cleanup if needed
        if (config.cleanup !== false) {
            element.style.transition = '';
        }
    }
    
    /**
     * Track animation
     */
    trackAnimation(element, type) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'animation_trigger', {
                event_category: 'engagement',
                event_label: type,
                custom_parameter_1: element.id || element.className
            });
        }
        
        // Custom event
        const event = new CustomEvent('animation:tracked', {
            detail: { element, type, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    // Animation creators
    
    /**
     * Create fade in animation
     */
    createFadeInAnimation(element, config) {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 50);
    }
    
    /**
     * Create slide up animation
     */
    createSlideUpAnimation(element, config) {
        element.style.transform = 'translateY(30px)';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }, 50);
    }
    
    /**
     * Create slide down animation
     */
    createSlideDownAnimation(element, config) {
        element.style.transform = 'translateY(-30px)';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }, 50);
    }
    
    /**
     * Create slide left animation
     */
    createSlideLeftAnimation(element, config) {
        element.style.transform = 'translateX(30px)';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
            element.style.opacity = '1';
        }, 50);
    }
    
    /**
     * Create slide right animation
     */
    createSlideRightAnimation(element, config) {
        element.style.transform = 'translateX(-30px)';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
            element.style.opacity = '1';
        }, 50);
    }
    
    /**
     * Create scale in animation
     */
    createScaleInAnimation(element, config) {
        element.style.transform = 'scale(0.9)';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 50);
    }
    
    /**
     * Create rotate in animation
     */
    createRotateInAnimation(element, config) {
        element.style.transform = 'rotate(-10deg) scale(0.9)';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transform = 'rotate(0deg) scale(1)';
            element.style.opacity = '1';
        }, 50);
    }
    
    /**
     * Create flip in animation
     */
    createFlipInAnimation(element, config) {
        element.style.transform = 'rotateY(-90deg)';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transform = 'rotateY(0deg)';
            element.style.opacity = '1';
        }, 50);
    }
    
    /**
     * Create bounce in animation
     */
    createBounceInAnimation(element, config) {
        element.style.transform = 'scale(0.3)';
        element.style.opacity = '0';
        
        const keyframes = [
            { transform: 'scale(0.3)', opacity: '0' },
            { transform: 'scale(1.05)', opacity: '1' },
            { transform: 'scale(0.95)', opacity: '1' },
            { transform: 'scale(1)', opacity: '1' }
        ];
        
        const animation = element.animate(keyframes, {
            duration: config.duration,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            fill: 'both'
        });
        
        animation.onfinish = () => {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        };
    }
    
    /**
     * Create elastic animation
     */
    createElasticAnimation(element, config) {
        element.style.transform = 'scale(0.8) rotate(5deg)';
        element.style.opacity = '0';
        
        const keyframes = [
            { transform: 'scale(0.8) rotate(5deg)', opacity: '0' },
            { transform: 'scale(1.1) rotate(-2deg)', opacity: '0.8' },
            { transform: 'scale(0.95) rotate(1deg)', opacity: '0.9' },
            { transform: 'scale(1) rotate(0deg)', opacity: '1' }
        ];
        
        const animation = element.animate(keyframes, {
            duration: config.duration,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            fill: 'both'
        });
        
        animation.onfinish = () => {
            element.style.transform = 'scale(1) rotate(0deg)';
            element.style.opacity = '1';
        };
    }
    
    /**
     * Utility: Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    /**
     * Public API methods
     */
    
    /**
     * Trigger custom animation
     */
    triggerCustomAnimation(options) {
        const { element, type = 'fadeIn', delay = 0 } = options;
        
        if (!element) return;
        
        setTimeout(() => {
            if (this.animations[type]) {
                const config = {
                    type,
                    duration: this.config.animationDuration,
                    easing: this.config.animationEasing
                };
                
                this.animations[type](element, config);
            }
        }, delay);
    }
    
    /**
     * Reset animations
     */
    resetAnimations(selector = null) {
        const elements = selector ? 
            document.querySelectorAll(selector) : 
            this.elements.animatedElements;
        
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = this.getInitialTransform(
                element._animationConfig?.type || 'fadeIn'
            );
            element.classList.remove('animate-active', 'animate-complete');
            
            if (element._animationConfig) {
                element._animationConfig.triggered = false;
            }
        });
    }
    
    /**
     * Refresh animations
     */
    refreshAnimations() {
        this.detectElements();
        this.setupCustomAnimations();
        
        // Restart intersection observers
        this.state.observers.forEach(observer => {
            observer.disconnect();
        });
        this.setupIntersectionObservers();
        
        // Refresh AOS
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (newConfig.reducedMotion !== undefined) {
            this.handleReducedMotionChange();
        }
    }
    
    /**
     * Destroy instance
     */
    destroy() {
        // Disconnect observers
        this.state.observers.forEach(observer => {
            observer.disconnect();
        });
        
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScrollAnimations);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.pauseAnimations);
        
        // Clean up elements
        this.elements.animatedElements.forEach(element => {
            element.style.opacity = '';
            element.style.transform = '';
            element.style.transition = '';
            element.classList.remove('animate-element', 'animate-active', 'animate-complete');
            delete element._animationConfig;
        });
        
        console.log('Enhanced animations destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAnimations;
}

// Global namespace
window.EnhancedAnimations = EnhancedAnimations;