/**
 * Performance-Optimized Main Entry Point
 * 
 * Implements async loading, critical resource prioritization,
 * and performance monitoring for optimal user experience.
 * 
 * @author Muhammad Kamal
 * @version 2.0.0
 */

// Performance monitoring
const perfMarks = {
    start: performance.now(),
    domReady: null,
    loaded: null,
    interactive: null
};

// Critical path execution
(function() {
    'use strict';
    
    // Feature detection
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        webP: false,
        serviceWorker: 'serviceWorker' in navigator,
        asyncAwait: (function() {
            try {
                eval('async () => {}');
                return true;
            } catch (e) {
                return false;
            }
        })()
    };

    // WebP detection
    const webPTest = new Image();
    webPTest.onload = webPTest.onerror = function() {
        features.webP = (webPTest.height === 2);
        document.documentElement.classList.toggle('webp', features.webP);
        document.documentElement.classList.toggle('no-webp', !features.webP);
    };
    webPTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

    // Add feature classes to document
    Object.entries(features).forEach(([feature, supported]) => {
        document.documentElement.classList.add(supported ? feature : `no-${feature}`);
    });

    // Critical CSS loading optimization
    function loadCriticalCSS() {
        const criticalCSS = document.createElement('style');
        criticalCSS.textContent = `
            /* Inline critical CSS for immediate render */
            body { opacity: 0; transition: opacity 0.3s ease; }
            .loading { opacity: 0.6; pointer-events: none; }
            .loaded { opacity: 1; }
        `;
        document.head.appendChild(criticalCSS);
        
        // Load non-critical CSS asynchronously
        const nonCriticalCSS = [
            './assets/css/sections/hero.css',
            './assets/css/sections/about.css',
            './assets/css/sections/skills.css',
            './assets/css/sections/projects.css',
            './assets/css/sections/contact.css'
        ];
        
        nonCriticalCSS.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = 'print';
            link.onload = function() { this.media = 'all'; };
            document.head.appendChild(link);
        });
    }

    // Initialize application
    async function initApp() {
        try {
            perfMarks.domReady = performance.now();
            console.log(`DOM ready in ${(perfMarks.domReady - perfMarks.start).toFixed(2)}ms`);

            // Load critical CSS first
            loadCriticalCSS();

            // Always remove loading state after a short delay to ensure content is visible
            setTimeout(() => {
                document.body.classList.add('loaded');
                document.body.classList.remove('loading');
                console.log('Loading state removed - content should now be visible');
            }, 500);

            // Initialize async module loader if modern browser
            if (features.asyncAwait) {
                try {
                    const { default: AsyncModuleLoader } = await import('./async-loader.js');
                    window.asyncModuleLoader = new AsyncModuleLoader();
                    await window.asyncModuleLoader.init();
                } catch (asyncError) {
                    console.warn('AsyncModuleLoader failed, continuing with basic functionality:', asyncError);
                }
            } else {
                // Fallback for older browsers
                await initFallback();
            }

            // Initialize AOS (Animate On Scroll) if available
            setTimeout(() => {
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        offset: 120,
                        delay: 0,
                        duration: 700,
                        easing: 'ease-out-cubic',
                        once: true,
                        mirror: false,
                        anchorPlacement: 'top-bottom'
                    });
                    console.log('AOS initialized');
                } else {
                    console.log('AOS not available, content will still be visible');
                }
            }, 1000);

            perfMarks.loaded = performance.now();
            console.log(`App loaded in ${(perfMarks.loaded - perfMarks.start).toFixed(2)}ms`);

            // Report performance metrics
            reportPerformanceMetrics();

        } catch (error) {
            console.error('Failed to initialize application:', error);
            // Ensure loading state is removed even if there's an error
            document.body.classList.add('loaded');
            document.body.classList.remove('loading');
            console.log('Error occurred, but loading state removed to show content');
        }
    }

    // Fallback initialization for older browsers
    async function initFallback() {
        console.log('Loading fallback mode...');
        
        // Ensure loading state is removed in fallback mode
        setTimeout(() => {
            document.body.classList.add('loaded');
            document.body.classList.remove('loading');
            console.log('Fallback mode: Loading state removed');
        }, 500);
        
        // Load essential modules synchronously
        const scripts = [
            './modules/error-handler.js',
            './modules/content-loader.js',
            './modules/content-renderer.js'
        ];

        for (const script of scripts) {
            try {
                await loadScript(script);
            } catch (error) {
                console.warn(`Failed to load ${script}:`, error);
            }
        }

        // Initialize basic functionality
        if (window.ContentLoader && window.ContentRenderer) {
            const contentLoader = new window.ContentLoader();
            const contentRenderer = new window.ContentRenderer();
            
            try {
                const content = await contentLoader.loadAll();
                contentRenderer.renderAll(content);
            } catch (error) {
                console.error('Fallback content loading failed:', error);
            }
        }
    }

    // Load script dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Performance reporting
    function reportPerformanceMetrics() {
        if (!window.performance) return;

        const metrics = {
            // Navigation timing
            domContentLoaded: perfMarks.domReady - perfMarks.start,
            appLoaded: perfMarks.loaded - perfMarks.start,
            
            // Paint timing
            firstPaint: getPerformanceEntry('first-paint'),
            firstContentfulPaint: getPerformanceEntry('first-contentful-paint'),
            
            // Layout metrics
            layoutShifts: getLayoutShiftScore(),
            
            // Memory (if available)
            memoryUsage: getMemoryUsage()
        };

        console.group('Performance Metrics');
        Object.entries(metrics).forEach(([key, value]) => {
            if (value !== null) {
                console.log(`${key}: ${typeof value === 'number' ? value.toFixed(2) + 'ms' : value}`);
            }
        });
        console.groupEnd();

        // Send to analytics (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metrics', {
                custom_map: {
                    metric1: 'dom_ready_time',
                    metric2: 'app_load_time'
                },
                metric1: Math.round(metrics.domContentLoaded),
                metric2: Math.round(metrics.appLoaded)
            });
        }
    }

    // Helper functions for performance measurement
    function getPerformanceEntry(name) {
        const entries = performance.getEntriesByName(name);
        return entries.length > 0 ? entries[0].startTime : null;
    }

    function getLayoutShiftScore() {
        if (!window.PerformanceObserver) return null;
        
        let clsValue = 0;
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
            });
            observer.observe({entryTypes: ['layout-shift']});
            return clsValue;
        } catch (e) {
            return null;
        }
    }

    function getMemoryUsage() {
        return performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null;
    }

    // Enhanced smooth scrolling for navigation
    function initSmoothScrolling() {
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a[href^="#"]');
            if (!target) return;

            e.preventDefault();
            const targetId = target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Update active nav state
                updateActiveNavigation(targetId);
            }
        });
    }

    // Update active navigation state
    function updateActiveNavigation(activeId) {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    // Intersection observer for navigation updates
    function initNavigationObserver() {
        if (!features.intersectionObserver) return;

        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    updateActiveNavigation(entry.target.id);
                }
            });
        }, {
            threshold: [0.5],
            rootMargin: '-100px 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    // DOM Ready initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // Additional initialization after full page load
    window.addEventListener('load', function() {
        perfMarks.interactive = performance.now();
        
        // Initialize navigation enhancements
        initSmoothScrolling();
        initNavigationObserver();

        console.log(`Page fully interactive in ${(perfMarks.interactive - perfMarks.start).toFixed(2)}ms`);
    });

    // Error handling for uncaught errors
    window.addEventListener('error', function(e) {
        console.error('Uncaught error:', e.error);
    });

    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });

})();