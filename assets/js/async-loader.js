/**
 * Async Module Loader - Performance Optimized
 * 
 * Implements dynamic imports and lazy loading for better performance
 * Reduces initial bundle size and improves Time to Interactive (TTI)
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class AsyncModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingModules = new Map();
        this.moduleRegistry = new Map();
        this.observers = new Map();
        
        this.registerModules();
        this.setupIntersectionObserver();
    }

    /**
     * Register available modules for lazy loading
     */
    registerModules() {
        this.moduleRegistry.set('contentLoader', {
            path: './modules/content-loader.js',
            priority: 'high',
            dependencies: ['errorHandler']
        });
        
        this.moduleRegistry.set('contentRenderer', {
            path: './modules/content-renderer.js',
            priority: 'high',
            dependencies: ['contentLoader']
        });
        
        this.moduleRegistry.set('errorHandler', {
            path: './modules/error-handler.js',
            priority: 'critical',
            dependencies: []
        });
        
        this.moduleRegistry.set('animations', {
            path: './modules/animations.js',
            priority: 'medium',
            dependencies: [],
            trigger: 'interaction'
        });
        
        this.moduleRegistry.set('navigation', {
            path: './modules/navigation.js',
            priority: 'low',
            dependencies: [],
            trigger: 'interaction'
        });
        
        this.moduleRegistry.set('projectInteractions', {
            path: './modules/project-interactions.js',
            priority: 'low',
            dependencies: [],
            trigger: 'viewport'
        });
        
        this.moduleRegistry.set('skillInteractions', {
            path: './modules/skill-interactions.js',
            priority: 'low',
            dependencies: [],
            trigger: 'viewport'
        });
        
        this.moduleRegistry.set('lazyLoading', {
            path: './modules/lazy-loading.js',
            priority: 'medium',
            dependencies: [],
            trigger: 'viewport'
        });
        
        this.moduleRegistry.set('accessibility', {
            path: './modules/accessibility.js',
            priority: 'high',
            dependencies: [],
            trigger: 'immediate'
        });
    }

    /**
     * Setup Intersection Observer for viewport-based loading
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.viewportObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const moduleNames = entry.target.dataset.modules?.split(',') || [];
                        moduleNames.forEach(moduleName => {
                            this.loadModule(moduleName.trim());
                        });
                        this.viewportObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
        }
    }

    /**
     * Load module asynchronously with dependency resolution
     * @param {string} moduleName - Name of the module to load
     * @returns {Promise<any>} - Promise resolving to the loaded module
     */
    async loadModule(moduleName) {
        // Return cached module if already loaded
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }
        
        // Return loading promise if already loading
        if (this.loadingModules.has(moduleName)) {
            return this.loadingModules.get(moduleName);
        }
        
        const moduleConfig = this.moduleRegistry.get(moduleName);
        if (!moduleConfig) {
            throw new Error(`Module '${moduleName}' not found in registry`);
        }
        
        // Load dependencies first
        if (moduleConfig.dependencies && moduleConfig.dependencies.length > 0) {
            await Promise.all(
                moduleConfig.dependencies.map(dep => this.loadModule(dep))
            );
        }
        
        // Start loading the module
        const loadingPromise = this.importModule(moduleConfig.path, moduleName);
        this.loadingModules.set(moduleName, loadingPromise);
        
        try {
            const module = await loadingPromise;
            this.loadedModules.set(moduleName, module);
            this.loadingModules.delete(moduleName);
            
            // Initialize module if it has an init method
            if (module && typeof module.init === 'function') {
                await module.init();
            }
            
            return module;
        } catch (error) {
            this.loadingModules.delete(moduleName);
            console.error(`Failed to load module '${moduleName}':`, error);
            throw error;
        }
    }

    /**
     * Import module with error handling and retries
     * @param {string} path - Path to the module
     * @param {string} moduleName - Name of the module (for logging)
     * @returns {Promise<any>} - Promise resolving to the imported module
     */
    async importModule(path, moduleName) {
        const maxRetries = 3;
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Loading module '${moduleName}' (attempt ${attempt}/${maxRetries})`);
                
                // Add cache busting for development
                const timestamp = process.env.NODE_ENV === 'development' ? `?v=${Date.now()}` : '';
                const module = await import(`${path}${timestamp}`);
                
                console.log(`Successfully loaded module '${moduleName}'`);
                return module.default || module;
            } catch (error) {
                lastError = error;
                console.warn(`Failed to load module '${moduleName}' on attempt ${attempt}:`, error);
                
                if (attempt < maxRetries) {
                    // Wait before retrying (exponential backoff)
                    await this.delay(Math.pow(2, attempt) * 500);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Load modules based on priority
     * @param {string} priority - Priority level ('critical', 'high', 'medium', 'low')
     */
    async loadModulesByPriority(priority) {
        const modulesToLoad = [];
        
        this.moduleRegistry.forEach((config, name) => {
            if (config.priority === priority && !this.loadedModules.has(name)) {
                modulesToLoad.push(name);
            }
        });
        
        if (modulesToLoad.length === 0) return;
        
        console.log(`Loading ${priority} priority modules:`, modulesToLoad);
        
        try {
            await Promise.allSettled(
                modulesToLoad.map(moduleName => this.loadModule(moduleName))
            );
        } catch (error) {
            console.error(`Error loading ${priority} priority modules:`, error);
        }
    }

    /**
     * Setup viewport-triggered module loading
     */
    setupViewportLoading() {
        if (!this.viewportObserver) return;
        
        // Find elements with data-modules attribute
        const elementsWithModules = document.querySelectorAll('[data-modules]');
        elementsWithModules.forEach(element => {
            this.viewportObserver.observe(element);
        });
    }

    /**
     * Setup interaction-triggered module loading
     */
    setupInteractionLoading() {
        // Load modules on first user interaction
        const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
        const loadInteractionModules = () => {
            this.loadModulesByPriority('medium');
            
            // Remove event listeners after first interaction
            interactionEvents.forEach(event => {
                document.removeEventListener(event, loadInteractionModules, { passive: true });
            });
        };
        
        interactionEvents.forEach(event => {
            document.addEventListener(event, loadInteractionModules, { passive: true });
        });
    }

    /**
     * Preload critical modules
     */
    async preloadCriticalModules() {
        console.log('Preloading critical modules...');
        
        try {
            // Load critical and high priority modules
            await this.loadModulesByPriority('critical');
            await this.loadModulesByPriority('high');
            
            console.log('Critical modules loaded successfully');
        } catch (error) {
            console.error('Failed to load critical modules:', error);
        }
    }

    /**
     * Initialize the module loader
     */
    async init() {
        console.log('Initializing Async Module Loader...');
        
        // Preload critical modules immediately
        await this.preloadCriticalModules();
        
        // Setup lazy loading triggers
        this.setupViewportLoading();
        this.setupInteractionLoading();
        
        // Load remaining low priority modules after page load
        if (document.readyState === 'loading') {
            window.addEventListener('load', () => {
                // Delay low priority modules to not interfere with page load
                setTimeout(() => this.loadModulesByPriority('low'), 2000);
            });
        } else {
            setTimeout(() => this.loadModulesByPriority('low'), 2000);
        }
        
        console.log('Async Module Loader initialized');
    }

    /**
     * Utility method for delays
     * @param {number} ms - Milliseconds to delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get loading statistics
     * @returns {Object} - Statistics about loaded modules
     */
    getStats() {
        return {
            totalModules: this.moduleRegistry.size,
            loadedModules: this.loadedModules.size,
            loadingModules: this.loadingModules.size,
            loadedModuleNames: Array.from(this.loadedModules.keys()),
            loadingModuleNames: Array.from(this.loadingModules.keys())
        };
    }
}

// Global instance
window.asyncModuleLoader = new AsyncModuleLoader();

// Export for module use
export default AsyncModuleLoader;