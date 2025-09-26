/**
 * Navigation Module
 * 
 * Handles smooth scroll navigation, active link highlighting,
 * and responsive navigation behaviors.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class Navigation {
    constructor(options = {}) {
        this.config = {
            smoothScrollDuration: 800,
            offset: 80, // Account for fixed header
            easing: 'easeInOutCubic',
            updateActiveOnScroll: true,
            enableKeyboardNavigation: true,
            enableMobileMenu: true,
            hideNavbarOnScroll: false,
            ...options
        };
        
        this.elements = {
            navbar: null,
            navLinks: [],
            mobileToggle: null,
            sections: [],
            backToTop: null
        };
        
        this.state = {
            isScrolling: false,
            currentSection: null,
            lastScrollY: 0,
            navbarVisible: true,
            mobileMenuOpen: false
        };
        
        this.init();
    }
    
    /**
     * Initialize navigation functionality
     */
    init() {
        try {
            this.cacheElements();
            this.bindEvents();
            this.setupIntersectionObserver();
            this.createBackToTopButton();
            this.initializeActiveSection();
            
            console.log('Navigation module initialized successfully');
        } catch (error) {
            console.error('Navigation initialization failed:', error);
        }
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements.navbar = document.querySelector('.navbar, nav, [data-nav]');
        this.elements.navLinks = Array.from(
            document.querySelectorAll('a[href^="#"], .nav-link[href^="#"]')
        ).filter(link => {
            const href = link.getAttribute('href');
            return href && href.length > 1 && document.querySelector(href);
        });
        
        this.elements.mobileToggle = document.querySelector(
            '.navbar-toggler, .mobile-toggle, [data-toggle="navbar"]'
        );
        
        // Get all sections that have corresponding navigation links
        this.elements.sections = this.elements.navLinks.map(link => {
            const href = link.getAttribute('href');
            return document.querySelector(href);
        }).filter(Boolean);
        
        console.log(`Found ${this.elements.navLinks.length} navigation links and ${this.elements.sections.length} sections`);
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Smooth scroll click handlers
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Mobile menu toggle
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Scroll events
        if (this.config.updateActiveOnScroll) {
            window.addEventListener('scroll', 
                this.throttle(() => this.handleScroll(), 100)
            );
        }
        
        // Keyboard navigation
        if (this.config.enableKeyboardNavigation) {
            document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        }
        
        // Resize handler
        window.addEventListener('resize', 
            this.debounce(() => this.handleResize(), 250)
        );
        
        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (this.state.mobileMenuOpen && 
                !e.target.closest('.navbar') && 
                !e.target.closest('.mobile-toggle')) {
                this.closeMobileMenu();
            }
        });
    }
    
    /**
     * Handle navigation link clicks
     */
    handleNavClick(event) {
        event.preventDefault();
        
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        const targetSection = document.querySelector(href);
        
        if (!targetSection) {
            console.warn(`Target section not found: ${href}`);
            return;
        }
        
        // Close mobile menu if open
        if (this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Perform smooth scroll
        this.smoothScrollTo(targetSection);
        
        // Update active link immediately
        this.updateActiveLink(link);
        
        // Track navigation event
        this.trackNavigation(href);
    }
    
    /**
     * Smooth scroll to target element
     */
    smoothScrollTo(target) {
        if (!target) return;
        
        this.state.isScrolling = true;
        
        const targetPosition = this.getTargetPosition(target);
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = this.config.smoothScrollDuration;
        let start = null;
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easing(timeElapsed, startPosition, distance, duration);
            
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                this.state.isScrolling = false;
                // Ensure we're at the exact target position
                window.scrollTo(0, targetPosition);
                // Focus the target for accessibility
                this.focusTarget(target);
            }
        };
        
        requestAnimationFrame(animation);
    }
    
    /**
     * Get target scroll position with offset
     */
    getTargetPosition(target) {
        const rect = target.getBoundingClientRect();
        const absoluteElementTop = rect.top + window.pageYOffset;
        return Math.max(0, absoluteElementTop - this.config.offset);
    }
    
    /**
     * Focus target element for accessibility
     */
    focusTarget(target) {
        if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
        }
        target.focus();
        
        // Remove tabindex after focus for screen readers
        setTimeout(() => {
            if (target.getAttribute('tabindex') === '-1') {
                target.removeAttribute('tabindex');
            }
        }, 1000);
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        if (this.state.isScrolling) return;
        
        const currentScrollY = window.pageYOffset;
        
        // Update active section
        this.updateActiveSection();
        
        // Handle navbar hide/show on scroll
        if (this.config.hideNavbarOnScroll) {
            this.handleNavbarVisibility(currentScrollY);
        }
        
        // Update back to top button
        this.updateBackToTopButton(currentScrollY);
        
        this.state.lastScrollY = currentScrollY;
    }
    
    /**
     * Update active navigation link based on current scroll position
     */
    updateActiveSection() {
        const scrollPosition = window.pageYOffset + this.config.offset + 50;
        let activeSection = null;
        
        // Find the current section
        for (let i = this.elements.sections.length - 1; i >= 0; i--) {
            const section = this.elements.sections[i];
            if (section.offsetTop <= scrollPosition) {
                activeSection = section;
                break;
            }
        }
        
        if (activeSection && activeSection !== this.state.currentSection) {
            this.state.currentSection = activeSection;
            const targetId = activeSection.id;
            const activeLink = this.elements.navLinks.find(link => 
                link.getAttribute('href') === `#${targetId}`
            );
            
            if (activeLink) {
                this.updateActiveLink(activeLink);
            }
        }
    }
    
    /**
     * Update active link styling
     */
    updateActiveLink(activeLink) {
        // Remove active class from all links
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active', 'current');
            link.removeAttribute('aria-current');
        });
        
        // Add active class to current link
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }
    }
    
    /**
     * Setup Intersection Observer for better performance
     */
    setupIntersectionObserver() {
        if (!window.IntersectionObserver) return;
        
        const options = {
            root: null,
            rootMargin: `-${this.config.offset}px 0px -50% 0px`,
            threshold: 0
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetId = entry.target.id;
                    const activeLink = this.elements.navLinks.find(link => 
                        link.getAttribute('href') === `#${targetId}`
                    );
                    
                    if (activeLink) {
                        this.updateActiveLink(activeLink);
                    }
                }
            });
        }, options);
        
        // Observe all sections
        this.elements.sections.forEach(section => {
            if (section.id) {
                this.observer.observe(section);
            }
        });
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyNavigation(event) {
        // Handle Tab navigation within nav
        if (event.key === 'Tab' && event.target.closest('.navbar')) {
            // Allow default tab behavior
            return;
        }
        
        // Handle Enter/Space on nav links
        if ((event.key === 'Enter' || event.key === ' ') && 
            event.target.classList.contains('nav-link')) {
            event.preventDefault();
            event.target.click();
        }
        
        // Handle Escape to close mobile menu
        if (event.key === 'Escape' && this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Skip link functionality (usually handled by browser)
        if (event.key === 'Enter' && event.target.classList.contains('skip-link')) {
            event.preventDefault();
            const target = document.querySelector(event.target.getAttribute('href'));
            if (target) {
                this.smoothScrollTo(target);
            }
        }
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.state.mobileMenuOpen = true;
        
        if (this.elements.navbar) {
            this.elements.navbar.classList.add('nav-open');
        }
        
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.classList.add('active');
            this.elements.mobileToggle.setAttribute('aria-expanded', 'true');
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first nav link for accessibility
        const firstNavLink = this.elements.navLinks[0];
        if (firstNavLink) {
            setTimeout(() => firstNavLink.focus(), 100);
        }
    }
    
    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.state.mobileMenuOpen = false;
        
        if (this.elements.navbar) {
            this.elements.navbar.classList.remove('nav-open');
        }
        
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.classList.remove('active');
            this.elements.mobileToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    /**
     * Handle navbar visibility on scroll
     */
    handleNavbarVisibility(currentScrollY) {
        if (!this.elements.navbar) return;
        
        const scrollDifference = currentScrollY - this.state.lastScrollY;
        
        if (scrollDifference > 5 && currentScrollY > 100) {
            // Scrolling down - hide navbar
            if (this.state.navbarVisible) {
                this.state.navbarVisible = false;
                this.elements.navbar.classList.add('navbar-hidden');
            }
        } else if (scrollDifference < -5 || currentScrollY < 100) {
            // Scrolling up or at top - show navbar
            if (!this.state.navbarVisible) {
                this.state.navbarVisible = true;
                this.elements.navbar.classList.remove('navbar-hidden');
            }
        }
    }
    
    /**
     * Create back to top button
     */
    createBackToTopButton() {
        if (this.elements.backToTop) return;
        
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '<i class="las la-arrow-up"></i>';
        button.setAttribute('aria-label', 'Back to top');
        button.setAttribute('title', 'Back to top');
        
        button.addEventListener('click', () => {
            this.smoothScrollTo(document.body);
        });
        
        document.body.appendChild(button);
        this.elements.backToTop = button;
    }
    
    /**
     * Update back to top button visibility
     */
    updateBackToTopButton(scrollY) {
        if (!this.elements.backToTop) return;
        
        if (scrollY > 300) {
            this.elements.backToTop.classList.add('visible');
        } else {
            this.elements.backToTop.classList.remove('visible');
        }
    }
    
    /**
     * Initialize active section on load
     */
    initializeActiveSection() {
        // Check for hash in URL
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                // Scroll to target after a short delay to ensure page is loaded
                setTimeout(() => {
                    this.smoothScrollTo(target);
                }, 500);
                return;
            }
        }
        
        // Otherwise, update based on current scroll position
        this.updateActiveSection();
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile menu if screen becomes large
        if (window.innerWidth > 768 && this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Recalculate positions if needed
        this.updateActiveSection();
    }
    
    /**
     * Track navigation events
     */
    trackNavigation(targetId) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'navigation', {
                event_category: 'engagement',
                event_label: targetId,
                value: 1
            });
        }
        
        // Custom event
        const event = new CustomEvent('navigation:scroll', {
            detail: { target: targetId, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Easing function for smooth scroll
     */
    easing(t, b, c, d) {
        switch (this.config.easing) {
            case 'easeInOutCubic':
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            case 'easeOutQuart':
                t /= d;
                t--;
                return -c * (t * t * t * t - 1) + b;
            case 'easeInOutQuint':
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t * t * t + 2) + b;
            default:
                return c * t / d + b; // linear
        }
    }
    
    /**
     * Throttle function
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
     * Debounce function
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
     * Scroll to a specific section
     */
    scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            this.smoothScrollTo(target);
        }
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * Enable/disable features
     */
    toggleFeature(feature, enabled) {
        if (feature in this.config) {
            this.config[feature] = enabled;
        }
    }
    
    /**
     * Get current active section
     */
    getCurrentSection() {
        return this.state.currentSection;
    }
    
    /**
     * Destroy navigation instance
     */
    destroy() {
        // Remove event listeners
        this.elements.navLinks.forEach(link => {
            link.removeEventListener('click', this.handleNavClick);
        });
        
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyNavigation);
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove back to top button
        if (this.elements.backToTop) {
            this.elements.backToTop.remove();
        }
        
        // Close mobile menu
        if (this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        console.log('Navigation module destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}

// Global namespace
window.Navigation = Navigation;