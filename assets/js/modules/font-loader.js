/**
 * Font Loading Optimization Module
 * 
 * Implements advanced font loading strategies:
 * - Web Font Loader with fallback
 * - Font loading performance monitoring
 * - Progressive enhancement for font rendering
 * - Cross-browser font display optimization
 * 
 * @version 1.0.0
 * @author Portfolio Enhancement Team
 */

class FontLoader {
    constructor(options = {}) {
        this.options = {
            timeout: 3000,
            fallbackDelay: 100,
            preloadFonts: true,
            enableMetrics: true,
            fontFamilies: ['Bai Jamjuree'],
            weights: [400, 500, 600, 700],
            ...options
        };
        
        this.loadStartTime = performance.now();
        this.fontLoadPromises = new Map();
        this.metricsData = {
            loadTime: null,
            successCount: 0,
            failureCount: 0,
            fallbackUsed: false,
            method: null
        };
        
        this.init();
    }
    
    /**
     * Initialize font loading system
     */
    async init() {
        try {
            // Set initial loading state
            this.setLoadingState('loading');
            
            // Detect font loading capabilities
            const capabilities = this.detectCapabilities();
            
            // Choose optimal loading strategy
            if (capabilities.fontFace && capabilities.fontDisplay) {
                await this.loadWithFontFace();
            } else if (capabilities.webFontLoader) {
                await this.loadWithWebFontLoader();
            } else {
                await this.loadWithFallback();
            }
            
            // Set loaded state
            this.setLoadingState('loaded');
            this.recordMetrics();
            
        } catch (error) {
            console.warn('Font loading failed:', error);
            this.handleFontLoadError();
        }
    }
    
    /**
     * Detect browser capabilities for font loading
     */
    detectCapabilities() {
        return {
            fontFace: 'fonts' in document && 'FontFace' in window,
            fontDisplay: CSS.supports('font-display', 'swap'),
            webFontLoader: typeof WebFont !== 'undefined',
            intersectionObserver: 'IntersectionObserver' in window,
            performanceObserver: 'PerformanceObserver' in window
        };
    }
    
    /**
     * Load fonts using Font Face API (modern approach)
     */
    async loadWithFontFace() {
        this.metricsData.method = 'FontFace';
        
        const fontPromises = [];
        
        // Load each font weight
        for (const family of this.options.fontFamilies) {
            for (const weight of this.options.weights) {
                const promise = this.loadFontFace(family, weight);
                fontPromises.push(promise);
                this.fontLoadPromises.set(`${family}-${weight}`, promise);
            }
        }
        
        // Wait for critical fonts (400, 600)
        const criticalPromises = fontPromises.filter((_, index) => 
            this.options.weights[index % this.options.weights.length] <= 600
        );
        
        try {
            await Promise.race([
                Promise.all(criticalPromises),
                this.createTimeout(this.options.timeout)
            ]);
            
            // Load remaining fonts in background
            Promise.allSettled(fontPromises).then(results => {
                this.processFontResults(results);
            });
            
        } catch (error) {
            console.warn('Critical font loading timeout:', error);
            this.metricsData.fallbackUsed = true;
        }
    }
    
    /**
     * Load individual font face
     */
    async loadFontFace(family, weight) {
        try {
            const fontUrl = this.getFontUrl(family, weight);
            const fontFace = new FontFace(family, `url(${fontUrl})`, {
                weight: weight.toString(),
                style: 'normal',
                display: 'swap'
            });
            
            const loadedFont = await fontFace.load();
            document.fonts.add(loadedFont);
            
            this.metricsData.successCount++;
            return loadedFont;
            
        } catch (error) {
            console.warn(`Failed to load font ${family} ${weight}:`, error);
            this.metricsData.failureCount++;
            throw error;
        }
    }
    
    /**
     * Load fonts using Web Font Loader (fallback)
     */
    async loadWithWebFontLoader() {
        this.metricsData.method = 'WebFontLoader';
        
        return new Promise((resolve, reject) => {
            const config = {
                google: {
                    families: this.options.fontFamilies.map(family => 
                        `${family}:${this.options.weights.join(',')}`
                    )
                },
                timeout: this.options.timeout,
                active: () => {
                    this.metricsData.successCount++;
                    resolve();
                },
                inactive: () => {
                    this.metricsData.fallbackUsed = true;
                    console.warn('Web fonts inactive - using fallback');
                    resolve(); // Still resolve to continue
                },
                fontactive: (familyName, fvd) => {
                    this.onFontActive(familyName, fvd);
                },
                fontinactive: (familyName, fvd) => {
                    this.onFontInactive(familyName, fvd);
                }
            };
            
            // Load WebFont if not already available
            if (typeof WebFont === 'undefined') {
                this.loadWebFontScript().then(() => {
                    WebFont.load(config);
                });
            } else {
                WebFont.load(config);
            }
        });
    }
    
    /**
     * Basic fallback font loading
     */
    async loadWithFallback() {
        this.metricsData.method = 'Fallback';
        this.metricsData.fallbackUsed = true;
        
        // Simply wait a bit then proceed with system fonts
        await this.delay(this.options.fallbackDelay);
        
        console.info('Using system font fallback');
    }
    
    /**
     * Set font loading state in DOM
     */
    setLoadingState(state) {
        const states = ['loading', 'loaded', 'error'];
        
        // Remove old states
        states.forEach(s => document.documentElement.classList.remove(`fonts-${s}`));
        
        // Add current state
        document.documentElement.classList.add(`fonts-${state}`);
        
        // Update data attribute for debugging
        document.documentElement.setAttribute('data-font-status', state);
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('fontloadstate', {
            detail: { state, timestamp: performance.now() }
        }));
    }
    
    /**
     * Handle font loading errors
     */
    handleFontLoadError() {
        this.setLoadingState('error');
        this.metricsData.fallbackUsed = true;
        
        // Ensure fallback fonts are applied
        document.documentElement.style.setProperty(
            '--font-primary', 
            'system-ui, -apple-system, sans-serif'
        );
        
        console.warn('Font loading failed - falling back to system fonts');
    }
    
    /**
     * Get font URL for given family and weight
     */
    getFontUrl(family, weight) {
        // Google Fonts URL pattern
        const familyParam = family.replace(/\s+/g, '+');
        return `https://fonts.gstatic.com/s/${familyParam.toLowerCase()}/v7/${familyParam}-${weight}.woff2`;
    }
    
    /**
     * Process font loading results
     */
    processFontResults(results) {
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                this.metricsData.successCount++;
            } else {
                this.metricsData.failureCount++;
                console.warn('Font loading failed:', result.reason);
            }
        });
        
        this.recordMetrics();
    }
    
    /**
     * Handle individual font activation
     */
    onFontActive(familyName, fvd) {
        console.log(`Font active: ${familyName} ${fvd}`);
        
        // Add font-specific class
        const className = `font-${familyName.toLowerCase().replace(/\s+/g, '-')}-loaded`;
        document.documentElement.classList.add(className);
    }
    
    /**
     * Handle individual font failure
     */
    onFontInactive(familyName, fvd) {
        console.warn(`Font inactive: ${familyName} ${fvd}`);
        this.metricsData.failureCount++;
    }
    
    /**
     * Load Web Font Loader script dynamically
     */
    async loadWebFontScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Create timeout promise
     */
    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Font loading timeout')), ms);
        });
    }
    
    /**
     * Simple delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Record performance metrics
     */
    recordMetrics() {
        this.metricsData.loadTime = performance.now() - this.loadStartTime;
        
        if (this.options.enableMetrics) {
            // Store metrics for analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'font_load_performance', {
                    event_category: 'Performance',
                    event_label: this.metricsData.method,
                    value: Math.round(this.metricsData.loadTime)
                });
            }
            
            // Console log for development
            console.info('Font Loading Metrics:', this.metricsData);
            
            // Store in session storage for debugging
            try {
                sessionStorage.setItem('fontLoadMetrics', JSON.stringify(this.metricsData));
            } catch (e) {
                // Ignore storage errors
            }
        }
    }
    
    /**
     * Get current metrics
     */
    getMetrics() {
        return { ...this.metricsData };
    }
    
    /**
     * Preload critical fonts
     */
    preloadFonts() {
        if (!this.options.preloadFonts) return;
        
        const criticalWeights = [400, 600]; // Most important weights
        
        criticalWeights.forEach(weight => {
            this.options.fontFamilies.forEach(family => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'font';
                link.type = 'font/woff2';
                link.crossOrigin = 'anonymous';
                link.href = this.getFontUrl(family, weight);
                
                document.head.appendChild(link);
            });
        });
    }
    
    /**
     * Check if fonts are loaded
     */
    async checkFontLoad(family, weight = 400, text = 'BESbswy') {
        if (!('fonts' in document)) {
            return false;
        }
        
        try {
            const font = `${weight} 12px ${family}`;
            return await document.fonts.check(font, text);
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Force font loading state for testing
     */
    setDebugState(state) {
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
            this.setLoadingState(state);
        }
    }
}

/**
 * Font Loading Performance Observer
 */
class FontPerformanceObserver {
    constructor(fontLoader) {
        this.fontLoader = fontLoader;
        this.observer = null;
        this.init();
    }
    
    init() {
        if ('PerformanceObserver' in window) {
            this.observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'measure' && entry.name.includes('font')) {
                        console.log('Font performance:', entry);
                    }
                });
            });
            
            this.observer.observe({ entryTypes: ['measure', 'navigation'] });
        }
    }
    
    measureFontSwap(fontFamily) {
        if (performance.mark) {
            performance.mark(`font-swap-start-${fontFamily}`);
            
            // Measure when font actually swaps
            setTimeout(() => {
                performance.mark(`font-swap-end-${fontFamily}`);
                performance.measure(
                    `font-swap-${fontFamily}`,
                    `font-swap-start-${fontFamily}`,
                    `font-swap-end-${fontFamily}`
                );
            }, 100);
        }
    }
    
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

/**
 * Initialize font loading when DOM is ready
 */
const initializeFontLoading = (options = {}) => {
    const fontLoader = new FontLoader(options);
    const perfObserver = new FontPerformanceObserver(fontLoader);
    
    // Preload critical fonts
    fontLoader.preloadFonts();
    
    // Return instances for external access
    return { fontLoader, perfObserver };
};

// Auto-initialize if not in module environment
if (typeof module === 'undefined') {
    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initializeFontLoading());
    } else {
        initializeFontLoading();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FontLoader, FontPerformanceObserver, initializeFontLoading };
}

// Export for ES6 modules
export { FontLoader, FontPerformanceObserver, initializeFontLoading };