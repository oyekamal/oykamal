/**
 * ErrorHandler Module
 * 
 * Centralized error handling and fallback system for the portfolio website.
 * Provides graceful degradation, user-friendly error messages, and fallback content.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.fallbackContent = new Map();
        this.errorStrategies = new Map();
        this.maxErrorLogSize = 50;
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        
        // Initialize error strategies and fallback content
        this.initializeErrorStrategies();
        this.initializeFallbackContent();
        this.setupGlobalErrorHandling();
    }
    
    /**
     * Initialize error handling strategies
     * @private
     */
    initializeErrorStrategies() {
        // Network/Loading errors
        this.errorStrategies.set('network', {
            severity: 'high',
            userMessage: 'Unable to load content. Please check your internet connection and try again.',
            fallbackAction: 'showFallbackContent',
            retryable: true,
            logDetails: true
        });
        
        // Validation errors
        this.errorStrategies.set('validation', {
            severity: 'medium',
            userMessage: 'Some content may not display correctly due to data formatting issues.',
            fallbackAction: 'showPartialContent',
            retryable: false,
            logDetails: true
        });
        
        // Rendering errors
        this.errorStrategies.set('rendering', {
            severity: 'medium',
            userMessage: 'There was an issue displaying this section. Please refresh the page.',
            fallbackAction: 'showFallbackContent',
            retryable: true,
            logDetails: true
        });
        
        // JavaScript errors
        this.errorStrategies.set('javascript', {
            severity: 'low',
            userMessage: 'Some interactive features may not be available.',
            fallbackAction: 'continueWithoutFeature',
            retryable: false,
            logDetails: true
        });
        
        // Critical system errors
        this.errorStrategies.set('critical', {
            severity: 'critical',
            userMessage: 'A critical error occurred. Please refresh the page or contact support.',
            fallbackAction: 'showCriticalErrorPage',
            retryable: false,
            logDetails: true
        });
    }
    
    /**
     * Initialize fallback content for different sections
     * @private
     */
    initializeFallbackContent() {
        // Profile fallback
        this.fallbackContent.set('profile', {
            name: 'Muhammad Kamal',
            title: 'Python Backend Developer',
            specialization: 'Django | REST APIs | System Design',
            tagline: 'Passionate backend developer focused on building scalable and efficient systems.',
            yearsOfExperience: 5,
            location: 'Available Globally',
            availability: 'Available for opportunities',
            professionalPhoto: {
                url: 'assets/images/face.jpeg',
                altText: 'Muhammad Kamal - Python Backend Developer'
            }
        });
        
        // Skills fallback
        this.fallbackContent.set('skills', [
            {
                categoryName: 'Backend Development',
                description: 'Core backend technologies and frameworks',
                iconClass: 'las la-server',
                displayOrder: 1,
                skills: [
                    {
                        name: 'Python',
                        proficiencyLevel: 'Expert',
                        yearsExperience: 5,
                        iconUrl: 'assets/images/python_logo.png',
                        description: 'Advanced Python development'
                    },
                    {
                        name: 'Django',
                        proficiencyLevel: 'Expert',
                        yearsExperience: 4,
                        iconUrl: 'assets/images/django.png',
                        description: 'Full-stack Django development'
                    }
                ]
            }
        ]);
        
        // Projects fallback
        this.fallbackContent.set('projects', [
            {
                id: 'fallback-project',
                title: 'Portfolio Website',
                shortDescription: 'Personal portfolio showcasing backend development skills.',
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'],
                images: [
                    {
                        url: 'assets/images/project-1.jpg',
                        altText: 'Portfolio Website Screenshot'
                    }
                ],
                displayOrder: 1
            }
        ]);
        
        // Contact fallback
        this.fallbackContent.set('contact', {
            email: 'contact@example.com',
            socialMedia: {
                github: '#',
                linkedin: '#'
            }
        });
    }
    
    /**
     * Setup global error handling
     * @private
     */
    setupGlobalErrorHandling() {
        // Handle unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                error: event.error,
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno
            }, {
                context: 'global',
                showToUser: false
            });
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'javascript',
                error: event.reason,
                message: 'Unhandled promise rejection'
            }, {
                context: 'promise',
                showToUser: false
            });
        });
    }
    
    /**
     * Main error handling method
     * @param {Object} errorInfo - Error information object
     * @param {Object} options - Error handling options
     * @returns {Promise<Object>} Error handling result
     */
    async handleError(errorInfo, options = {}) {
        const {
            context = 'unknown',
            showToUser = true,
            allowRetry = true,
            fallbackType = null
        } = options;
        
        const errorType = errorInfo.type || this.categorizeError(errorInfo.error);
        const strategy = this.errorStrategies.get(errorType) || this.errorStrategies.get('javascript');
        
        // Log error
        const logEntry = this.logError(errorInfo, context, strategy);
        
        // Check if we should retry
        if (allowRetry && strategy.retryable && this.shouldRetry(context)) {
            console.log(`ErrorHandler: Attempting retry for ${context} (attempt ${this.getRetryCount(context) + 1})`);
            return {
                action: 'retry',
                retryCount: this.getRetryCount(context) + 1,
                logEntry
            };
        }
        
        // Execute fallback strategy
        const fallbackResult = await this.executeFallbackAction(
            strategy.fallbackAction,
            fallbackType || context,
            errorInfo
        );
        
        // Show user message if appropriate
        if (showToUser && strategy.userMessage) {
            this.showUserMessage(strategy.userMessage, strategy.severity);
        }
        
        return {
            action: strategy.fallbackAction,
            severity: strategy.severity,
            userMessageShown: showToUser,
            fallbackResult,
            logEntry
        };
    }
    
    /**
     * Categorize error based on error object
     * @private
     * @param {Error} error - Error object
     * @returns {string} Error category
     */
    categorizeError(error) {
        if (!error) return 'javascript';
        
        const message = error.message ? error.message.toLowerCase() : '';
        
        if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
            return 'network';
        }
        
        if (message.includes('validation') || message.includes('invalid')) {
            return 'validation';
        }
        
        if (message.includes('render') || message.includes('dom') || message.includes('element')) {
            return 'rendering';
        }
        
        return 'javascript';
    }
    
    /**
     * Log error with details
     * @private
     * @param {Object} errorInfo - Error information
     * @param {string} context - Error context
     * @param {Object} strategy - Error strategy
     * @returns {Object} Log entry
     */
    logError(errorInfo, context, strategy) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: errorInfo.type,
            context,
            message: errorInfo.message,
            severity: strategy.severity,
            error: strategy.logDetails ? errorInfo.error : null,
            userAgent: navigator.userAgent,
            url: window.location.href,
            stack: errorInfo.error && errorInfo.error.stack ? errorInfo.error.stack : null
        };
        
        // Add to error log
        this.errorLog.unshift(logEntry);
        
        // Maintain max log size
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxErrorLogSize);
        }
        
        // Console logging based on severity
        if (strategy.severity === 'critical') {
            console.error('CRITICAL ERROR:', logEntry);
        } else if (strategy.severity === 'high') {
            console.error('ERROR:', logEntry);
        } else if (strategy.severity === 'medium') {
            console.warn('WARNING:', logEntry);
        } else {
            console.log('INFO:', logEntry);
        }
        
        return logEntry;
    }
    
    /**
     * Execute fallback action
     * @private
     * @param {string} action - Fallback action to execute
     * @param {string} type - Content type or context
     * @param {Object} errorInfo - Original error information
     * @returns {Promise<Object>} Fallback result
     */
    async executeFallbackAction(action, type, errorInfo) {
        try {
            switch (action) {
                case 'showFallbackContent':
                    return await this.showFallbackContent(type);
                
                case 'showPartialContent':
                    return await this.showPartialContent(type, errorInfo);
                
                case 'continueWithoutFeature':
                    return { status: 'continued', message: 'Feature disabled due to error' };
                
                case 'showCriticalErrorPage':
                    return await this.showCriticalErrorPage();
                
                default:
                    console.warn(`ErrorHandler: Unknown fallback action: ${action}`);
                    return { status: 'no-action', message: 'No fallback action taken' };
            }
        } catch (fallbackError) {
            console.error('ErrorHandler: Fallback action failed:', fallbackError);
            return { status: 'fallback-failed', error: fallbackError.message };
        }
    }
    
    /**
     * Show fallback content
     * @private
     * @param {string} type - Content type
     * @returns {Promise<Object>} Fallback result
     */
    async showFallbackContent(type) {
        const fallbackData = this.fallbackContent.get(type);
        
        if (!fallbackData) {
            return { status: 'no-fallback', message: `No fallback available for ${type}` };
        }
        
        try {
            // If ContentRenderer is available, use it to render fallback
            if (typeof window.ContentRenderer !== 'undefined') {
                const renderer = new window.ContentRenderer();
                
                // Map content types to templates
                const templateMap = {
                    'profile': ['profile-hero', 'profile-about'],
                    'skills': ['skills-categories'],
                    'projects': ['projects-grid'],
                    'contact': ['contact-info']
                };
                
                const templates = templateMap[type];
                if (templates) {
                    for (const template of templates) {
                        try {
                            await renderer.renderContent(template, fallbackData, {
                                animate: false,
                                errorFallback: `<div class="alert alert-warning">Content temporarily unavailable</div>`
                            });
                        } catch (renderError) {
                            console.warn(`Failed to render fallback template ${template}:`, renderError);
                        }
                    }
                }
            }
            
            return { status: 'fallback-shown', type, data: fallbackData };
        } catch (error) {
            return { status: 'fallback-error', error: error.message };
        }
    }
    
    /**
     * Show partial content with error indicators
     * @private
     * @param {string} type - Content type
     * @param {Object} errorInfo - Error information
     * @returns {Promise<Object>} Partial content result
     */
    async showPartialContent(type, errorInfo) {
        // Show warning message in the content area
        const warningHtml = `
            <div class="alert alert-warning" role="alert">
                <i class="las la-exclamation-triangle me-2"></i>
                Some ${type} information may be incomplete due to data loading issues.
                <button class="btn btn-link btn-sm ms-2" onclick="window.location.reload()">
                    Refresh Page
                </button>
            </div>
        `;
        
        // Find content container and add warning
        const containers = {
            'profile': '.hero-content, .about-content',
            'skills': '.skills-container',
            'projects': '.projects-container',
            'contact': '.contact-content'
        };
        
        const selector = containers[type];
        if (selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.insertAdjacentHTML('afterbegin', warningHtml);
            });
        }
        
        return { status: 'partial-content-shown', type };
    }
    
    /**
     * Show critical error page
     * @private
     * @returns {Promise<Object>} Critical error result
     */
    async showCriticalErrorPage() {
        const errorPageHtml = `
            <div class="critical-error-page">
                <div class="container text-center">
                    <div class="row justify-content-center">
                        <div class="col-lg-6">
                            <div class="error-content">
                                <i class="las la-exclamation-triangle error-icon"></i>
                                <h2>Something went wrong</h2>
                                <p class="lead">We're experiencing technical difficulties. Please try refreshing the page.</p>
                                <div class="error-actions">
                                    <button class="btn btn-primary me-3" onclick="window.location.reload()">
                                        <i class="las la-redo-alt"></i>
                                        Refresh Page
                                    </button>
                                    <button class="btn btn-outline-secondary" onclick="window.history.back()">
                                        <i class="las la-arrow-left"></i>
                                        Go Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorPageHtml;
        
        // Add critical error styling
        const errorStyle = document.createElement('style');
        errorStyle.textContent = `
            .critical-error-page {
                min-height: 100vh;
                display: flex;
                align-items: center;
                background: #f8f9fa;
            }
            .error-icon {
                font-size: 4rem;
                color: #dc3545;
                margin-bottom: 1rem;
            }
            .error-content h2 {
                margin-bottom: 1rem;
                color: #333;
            }
        `;
        document.head.appendChild(errorStyle);
        
        return { status: 'critical-error-shown' };
    }
    
    /**
     * Show user-friendly error message
     * @private
     * @param {string} message - Message to show
     * @param {string} severity - Error severity
     */
    showUserMessage(message, severity) {
        // Create toast notification
        const toastId = `error-toast-${Date.now()}`;
        const alertClass = severity === 'critical' ? 'danger' : severity === 'high' ? 'warning' : 'info';
        
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${alertClass} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="las la-info-circle me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                            data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        // Find or create toast container
        let toastContainer = document.getElementById('error-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'error-toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        // Initialize and show toast
        const toastElement = document.getElementById(toastId);
        if (typeof bootstrap !== 'undefined') {
            const toast = new bootstrap.Toast(toastElement, {
                autohide: severity !== 'critical',
                delay: severity === 'high' ? 8000 : 5000
            });
            toast.show();
            
            // Clean up after toast is hidden
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        }
    }
    
    /**
     * Check if we should retry operation
     * @private
     * @param {string} context - Operation context
     * @returns {boolean} Whether to retry
     */
    shouldRetry(context) {
        const currentRetries = this.retryAttempts.get(context) || 0;
        return currentRetries < this.maxRetries;
    }
    
    /**
     * Get current retry count
     * @private
     * @param {string} context - Operation context
     * @returns {number} Current retry count
     */
    getRetryCount(context) {
        return this.retryAttempts.get(context) || 0;
    }
    
    /**
     * Increment retry count
     * @param {string} context - Operation context
     */
    incrementRetryCount(context) {
        const current = this.retryAttempts.get(context) || 0;
        this.retryAttempts.set(context, current + 1);
    }
    
    /**
     * Reset retry count
     * @param {string} context - Operation context
     */
    resetRetryCount(context) {
        this.retryAttempts.delete(context);
    }
    
    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const stats = {
            totalErrors: this.errorLog.length,
            errorsBySeverity: {},
            errorsByType: {},
            recentErrors: this.errorLog.slice(0, 5)
        };
        
        this.errorLog.forEach(entry => {
            stats.errorsBySeverity[entry.severity] = (stats.errorsBySeverity[entry.severity] || 0) + 1;
            stats.errorsByType[entry.type] = (stats.errorsByType[entry.type] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        this.retryAttempts.clear();
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
} else if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}