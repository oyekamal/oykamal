/**
 * Main Application Controller
 * 
 * Coordinates content loading, rendering, error handling, and animations
 * for the portfolio website.
 * 
 * @author Muhammad Kamal
 * @version 2.0.0
 */

class PortfolioApp {
    constructor() {
        this.contentLoader = null;
        this.contentRenderer = null;
        this.errorHandler = null;
        this.isInitialized = false;
        this.loadedContent = {};
        
        // Configuration
        this.config = {
            aos: {
                offset: 100,
                delay: 50,
                duration: 600,
                easing: 'ease-out-cubic',
                once: true,
                mirror: false,
                anchorPlacement: 'top-bottom',
                disable: 'mobile' // Disable on mobile for better performance
            },
            content: {
                preloadAll: true,
                validateContent: true,
                useCache: true,
                fallbackMode: true,
                loadTimeout: 8000
            },
            features: {
                enableAnimations: true,
                enableLazyLoading: true,
                enableErrorReporting: true,
                enablePerformanceTracking: true
            }
        };
        
        // Performance tracking
        this.performanceMetrics = {
            startTime: performance.now(),
            initTime: null,
            contentLoadTime: null,
            renderTime: null
        };
    }
    
    /**
     * Initialize the application
     * @returns {Promise<boolean>} Success status
     */
    async init() {
        try {
            console.log('PortfolioApp: Starting initialization...');
            
            // Initialize core modules
            await this.initializeModules();
            
            // Load and render content
            await this.loadContent();
            
            // Initialize animations and interactions
            this.initializeAnimations();
            this.initializeInteractions();
            
            // Mark as initialized
            this.isInitialized = true;
            this.performanceMetrics.initTime = performance.now() - this.performanceMetrics.startTime;
            
            console.log(`PortfolioApp: Initialization complete in ${this.performanceMetrics.initTime.toFixed(2)}ms`);
            
            // Track performance if enabled
            if (this.config.features.enablePerformanceTracking) {
                this.trackPerformance();
            }
            
            return true;
            
        } catch (error) {
            console.error('PortfolioApp: Initialization failed:', error);
            
            if (this.errorHandler) {
                await this.errorHandler.handleError({
                    type: 'critical',
                    error,
                    message: 'Application initialization failed'
                }, {
                    context: 'app-init',
                    showToUser: true
                });
            }
            
            return false;
        }
    }
    
    /**
     * Initialize core modules
     * @private
     * @returns {Promise<void>}
     */
    async initializeModules() {
        // Initialize error handler first
        if (typeof ErrorHandler !== 'undefined') {
            this.errorHandler = new ErrorHandler();
            console.log('PortfolioApp: Error handler initialized');
        }
        
        // Initialize content loader
        if (typeof ContentLoader !== 'undefined') {
            this.contentLoader = new ContentLoader();
            console.log('PortfolioApp: Content loader initialized');
        }
        
        // Initialize content renderer
        if (typeof ContentRenderer !== 'undefined') {
            this.contentRenderer = new ContentRenderer();
            console.log('PortfolioApp: Content renderer initialized');
        }
        
        // Check if critical modules are available
        if (!this.contentLoader || !this.contentRenderer) {
            throw new Error('Critical modules not available');
        }
    }
    
    /**
     * Load content from JSON files
     * @private
     * @returns {Promise<void>}
     */
    async loadContent() {
        const contentStartTime = performance.now();
        
        try {
            console.log('PortfolioApp: Loading content...');
            
            if (this.config.content.preloadAll) {
                // Load all content types
                const result = await this.contentLoader.preloadAll({
                    useCache: this.config.content.useCache,
                    validate: this.config.content.validateContent,
                    timeout: this.config.content.loadTimeout,
                    returnPartial: this.config.content.fallbackMode
                });
                
                this.loadedContent = result.results;
                
                // Handle any loading errors
                if (result.errors && this.errorHandler) {
                    for (const [contentType, error] of Object.entries(result.errors)) {
                        await this.errorHandler.handleError({
                            type: 'network',
                            error,
                            message: `Failed to load ${contentType} content`
                        }, {
                            context: `content-${contentType}`,
                            showToUser: false
                        });
                    }
                }
                
                console.log(`PortfolioApp: Loaded ${result.loadedCount}/${result.loadedCount + result.errorCount} content types`);
                
            } else {
                // Load content types individually
                const contentTypes = ['profile', 'skills', 'projects', 'contact'];
                
                for (const contentType of contentTypes) {
                    try {
                        const content = await this.contentLoader.loadContent(contentType, {
                            useCache: this.config.content.useCache,
                            validate: this.config.content.validateContent,
                            timeout: this.config.content.loadTimeout
                        });
                        
                        this.loadedContent[contentType] = content;
                        
                    } catch (error) {
                        console.warn(`Failed to load ${contentType}:`, error);
                        
                        if (this.errorHandler) {
                            await this.errorHandler.handleError({
                                type: 'network',
                                error,
                                message: `Failed to load ${contentType} content`
                            }, {
                                context: `content-${contentType}`,
                                showToUser: false,
                                allowRetry: true
                            });
                        }
                    }
                }
            }
            
            // Render loaded content
            await this.renderContent();
            
            this.performanceMetrics.contentLoadTime = performance.now() - contentStartTime;
            console.log(`PortfolioApp: Content loading completed in ${this.performanceMetrics.contentLoadTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error('PortfolioApp: Content loading failed:', error);
            throw error;
        }
    }
    
    /**
     * Render loaded content to DOM
     * @private
     * @returns {Promise<void>}
     */
    async renderContent() {
        const renderStartTime = performance.now();
        
        try {
            console.log('PortfolioApp: Rendering content...');
            
            const result = await this.contentRenderer.renderAll(this.loadedContent, {
                animate: this.config.features.enableAnimations,
                clearFirst: true,
                delayBetweenRenders: 100
            });
            
            console.log(`PortfolioApp: Rendered ${result.successes.length} sections successfully`);
            
            // Handle rendering failures
            if (result.failures.length > 0 && this.errorHandler) {
                for (const failure of result.failures) {
                    await this.errorHandler.handleError({
                        type: 'rendering',
                        error: new Error(failure.error),
                        message: `Failed to render ${failure.templateName}`
                    }, {
                        context: `render-${failure.templateName}`,
                        showToUser: false
                    });
                }
            }
            
            this.performanceMetrics.renderTime = performance.now() - renderStartTime;
            
        } catch (error) {
            console.error('PortfolioApp: Content rendering failed:', error);
            throw error;
        }
    }
    
    /**
     * Initialize animations
     * @private
     */
    initializeAnimations() {
        if (!this.config.features.enableAnimations) return;
        
        try {
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion) {
                console.log('PortfolioApp: Reduced motion preference detected - skipping animations');
                return;
            }
            
            // Initialize AOS with configuration
            if (typeof AOS !== 'undefined') {
                AOS.init(this.config.aos);
                console.log('PortfolioApp: AOS animations initialized');
            }
            
            // Add custom scroll animations
            this.initializeScrollAnimations();
            
        } catch (error) {
            console.warn('PortfolioApp: Animation initialization failed:', error);
            
            if (this.errorHandler) {
                this.errorHandler.handleError({
                    type: 'javascript',
                    error,
                    message: 'Animation initialization failed'
                }, {
                    context: 'animations',
                    showToUser: false
                });
            }
        }
    }
    
    /**
     * Initialize scroll-based animations
     * @private
     */
    initializeScrollAnimations() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Smooth scroll for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Parallax effect for hero section (skip if reduced motion preferred)
        if (!prefersReducedMotion) {
            const heroSection = document.querySelector('.hero-section');
            let ticking = false;
            
            if (heroSection) {
                const updateParallax = () => {
                    const scrolled = window.pageYOffset;
                    const parallax = scrolled * 0.3; // Reduced from 0.5 for better performance
                    heroSection.style.transform = `translateY(${parallax}px)`;
                    ticking = false;
                };
                
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(updateParallax);
                        ticking = true;
                    }
                });
            }
        }
    }
    
    /**
     * Initialize interactive features
     * @private
     */
    initializeInteractions() {
        try {
            // Initialize project card interactions
            this.initializeProjectCards();
            
            // Initialize skill hover effects
            this.initializeSkillHovers();
            
            // Initialize contact form interactions
            this.initializeContactForm();
            
            console.log('PortfolioApp: Interactive features initialized');
            
        } catch (error) {
            console.warn('PortfolioApp: Interaction initialization failed:', error);
            
            if (this.errorHandler) {
                this.errorHandler.handleError({
                    type: 'javascript',
                    error,
                    message: 'Interactive features initialization failed'
                }, {
                    context: 'interactions',
                    showToUser: false
                });
            }
        }
    }
    
    /**
     * Initialize project card interactions
     * @private
     */
    initializeProjectCards() {
        const expandButtons = document.querySelectorAll('.expand-project');
        expandButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const projectId = button.getAttribute('data-project-id');
                const projectCard = button.closest('.project-card');
                
                if (projectCard.classList.contains('expanded')) {
                    // Collapse project
                    projectCard.classList.remove('expanded');
                    button.innerHTML = 'Read More <i class="las la-arrow-right"></i>';
                } else {
                    // Expand project
                    projectCard.classList.add('expanded');
                    button.innerHTML = 'Read Less <i class="las la-arrow-up"></i>';
                    
                    // Load additional project details if needed
                    await this.loadProjectDetails(projectId, projectCard);
                }
            });
        });
    }
    
    /**
     * Load additional project details
     * @private
     * @param {string} projectId - Project identifier
     * @param {Element} projectCard - Project card element
     */
    async loadProjectDetails(projectId, projectCard) {
        // Find project data
        const projectData = this.loadedContent.projects?.data?.find(p => p.id === projectId);
        
        if (projectData && !projectCard.querySelector('.project-details')) {
            const detailsHtml = `
                <div class="project-details">
                    <p class="project-description">${this.escapeHtml(projectData.longDescription)}</p>
                    ${projectData.challenges ? `
                        <div class="project-challenges">
                            <h6>Key Challenges:</h6>
                            <ul>
                                ${projectData.challenges.map(challenge => 
                                    `<li>${this.escapeHtml(challenge)}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${projectData.accomplishments ? `
                        <div class="project-accomplishments">
                            <h6>Accomplishments:</h6>
                            <ul>
                                ${projectData.accomplishments.map(accomplishment => 
                                    `<li>${this.escapeHtml(accomplishment)}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
            
            const projectContent = projectCard.querySelector('.project-content');
            projectContent.insertAdjacentHTML('beforeend', detailsHtml);
        }
    }
    
    /**
     * Initialize skill hover effects
     * @private
     */
    initializeSkillHovers() {
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.classList.add('skill-hover');
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('skill-hover');
            });
        });
    }
    
    /**
     * Initialize contact form interactions
     * @private
     */
    initializeContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Handle form submission
                this.handleContactFormSubmission(contactForm);
            });
        }
    }
    
    /**
     * Handle contact form submission
     * @private
     * @param {Element} form - Contact form element
     */
    handleContactFormSubmission(form) {
        // Since this is a static site, redirect to email
        const formData = new FormData(form);
        const email = this.loadedContent.contact?.data?.email || 'contact@example.com';
        const subject = `Contact from ${formData.get('name')} via Portfolio`;
        const body = `Message: ${formData.get('message')}%0D%0A%0D%0AFrom: ${formData.get('email')}`;
        
        window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`);
    }
    
    /**
     * Track performance metrics
     * @private
     */
    trackPerformance() {
        // Basic performance tracking
        const totalTime = this.performanceMetrics.initTime;
        
        console.group('PortfolioApp Performance Metrics');
        console.log(`Total Initialization: ${totalTime.toFixed(2)}ms`);
        console.log(`Content Loading: ${this.performanceMetrics.contentLoadTime.toFixed(2)}ms`);
        console.log(`Rendering: ${this.performanceMetrics.renderTime.toFixed(2)}ms`);
        
        // Check Web Vitals if available
        if (typeof web-vitals !== 'undefined') {
            // Web Vitals tracking would go here
        }
        
        console.groupEnd();
    }
    
    /**
     * Escape HTML to prevent XSS
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Get application status
     * @returns {Object} Application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            modulesLoaded: {
                contentLoader: !!this.contentLoader,
                contentRenderer: !!this.contentRenderer,
                errorHandler: !!this.errorHandler
            },
            loadedContent: Object.keys(this.loadedContent),
            performanceMetrics: this.performanceMetrics,
            config: this.config
        };
    }
    
    /**
     * Reload content and re-render
     * @returns {Promise<boolean>} Success status
     */
    async reload() {
        try {
            console.log('PortfolioApp: Reloading content...');
            
            // Clear caches
            if (this.contentLoader) {
                this.contentLoader.clearCache();
            }
            
            // Reload content
            await this.loadContent();
            
            // Refresh animations
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
            
            console.log('PortfolioApp: Reload completed');
            return true;
            
        } catch (error) {
            console.error('PortfolioApp: Reload failed:', error);
            return false;
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('PortfolioApp: DOM ready, starting application...');
    
    const app = new PortfolioApp();
    const success = await app.init();
    
    if (success) {
        // Make app instance globally available for debugging
        window.portfolioApp = app;
        
        // Add reload function to window for easy access
        window.reloadPortfolio = () => app.reload();
        
        console.log('PortfolioApp: Application ready');
    } else {
        console.error('PortfolioApp: Application failed to start');
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.portfolioApp && typeof AOS !== 'undefined') {
        // Refresh animations when page becomes visible
        AOS.refresh();
    }
});