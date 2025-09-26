/**
 * Performance Testing System with Lighthouse Integration
 * 
 * Tests website performance including:
 * - Lighthouse performance score (target >90)
 * - Core Web Vitals (LCP, FID, CLS)
 * - Resource optimization analysis
 * - JavaScript and CSS performance
 * - Image optimization checks
 * 
 * @version 1.0.0
 * @author Portfolio Testing Team
 */

class PerformanceTester {
    constructor(options = {}) {
        this.options = {
            targetPerformanceScore: 90,
            targetAccessibilityScore: 90,
            targetBestPracticesScore: 90,
            targetSEOScore: 90,
            // Core Web Vitals thresholds
            maxLCP: 2500, // ms
            maxFID: 100,  // ms
            maxCLS: 0.1,  // score
            testCoreWebVitals: true,
            testResourceLoading: true,
            testJavaScriptPerformance: true,
            testImageOptimization: true,
            ...options
        };
        
        this.results = {
            lighthouse: null,
            coreWebVitals: null,
            resources: null,
            javascript: null,
            images: null,
            overall: 'pending'
        };
        
        this.issues = [];
        this.warnings = [];
        this.passes = [];
        this.metrics = {};
    }
    
    /**
     * Run complete performance tests
     */
    async runPerformanceTests() {
        try {
            console.log('⚡ Starting performance testing...');
            
            // Test Core Web Vitals
            await this.testCoreWebVitals();
            
            // Test resource loading performance
            await this.testResourcePerformance();
            
            // Test JavaScript performance
            await this.testJavaScriptPerformance();
            
            // Test image optimization
            await this.testImageOptimization();
            
            // Attempt Lighthouse-style analysis
            await this.runLighthouseStyleAudit();
            
            // Process results
            this.processTestResults();
            
            // Generate report
            const report = this.generateReport();
            
            console.log('✅ Performance testing completed');
            return report;
            
        } catch (error) {
            console.error('❌ Performance testing failed:', error);
            this.issues.push({
                type: 'system',
                message: error.message,
                severity: 'error'
            });
            
            return this.generateReport();
        }
    }
    
    /**
     * Test Core Web Vitals
     */
    async testCoreWebVitals() {
        console.log('📊 Testing Core Web Vitals...');
        
        const coreWebVitals = {
            lcp: null,
            fid: null,
            cls: null,
            fcp: null,
            ttfb: null
        };
        
        // Test Largest Contentful Paint (LCP)
        await this.measureLCP(coreWebVitals);
        
        // Test First Input Delay (FID) - simulated
        await this.measureFID(coreWebVitals);
        
        // Test Cumulative Layout Shift (CLS)
        await this.measureCLS(coreWebVitals);
        
        // Test First Contentful Paint (FCP)
        await this.measureFCP(coreWebVitals);
        
        // Test Time to First Byte (TTFB)
        await this.measureTTFB(coreWebVitals);
        
        this.results.coreWebVitals = coreWebVitals;
        
        // Validate against thresholds
        this.validateCoreWebVitals(coreWebVitals);
    }
    
    /**
     * Measure Largest Contentful Paint
     */
    async measureLCP(metrics) {
        return new Promise((resolve) => {
            try {
                // Use Performance Observer for LCP
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    metrics.lcp = lastEntry.startTime;
                    observer.disconnect();
                    resolve();
                });
                
                observer.observe({ type: 'largest-contentful-paint', buffered: true });
                
                // Fallback timeout
                setTimeout(() => {
                    observer.disconnect();
                    // Estimate based on load time
                    metrics.lcp = performance.now();
                    resolve();
                }, 5000);
                
            } catch (error) {
                console.warn('LCP measurement failed:', error);
                metrics.lcp = null;
                resolve();
            }
        });
    }
    
    /**
     * Measure First Input Delay (simulated)
     */
    async measureFID(metrics) {
        return new Promise((resolve) => {
            try {
                // Use Performance Observer for FID
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    if (entries.length > 0) {
                        metrics.fid = entries[0].processingStart - entries[0].startTime;
                    }
                    observer.disconnect();
                    resolve();
                });
                
                observer.observe({ type: 'first-input', buffered: true });
                
                // Simulate input after a short delay
                setTimeout(() => {
                    // Trigger a synthetic event to measure FID
                    const syntheticEvent = new MouseEvent('click', { bubbles: true });
                    const measureStart = performance.now();
                    
                    // Process the event
                    setTimeout(() => {
                        const measureEnd = performance.now();
                        if (!metrics.fid) {
                            metrics.fid = measureEnd - measureStart;
                        }
                        observer.disconnect();
                        resolve();
                    }, 0);
                    
                    document.body.dispatchEvent(syntheticEvent);
                }, 1000);
                
            } catch (error) {
                console.warn('FID measurement failed:', error);
                metrics.fid = null;
                resolve();
            }
        });
    }
    
    /**
     * Measure Cumulative Layout Shift
     */
    async measureCLS(metrics) {
        return new Promise((resolve) => {
            try {
                let clsValue = 0;
                
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                });
                
                observer.observe({ type: 'layout-shift', buffered: true });
                
                // Measure for 5 seconds
                setTimeout(() => {
                    metrics.cls = clsValue;
                    observer.disconnect();
                    resolve();
                }, 5000);
                
            } catch (error) {
                console.warn('CLS measurement failed:', error);
                metrics.cls = null;
                resolve();
            }
        });
    }
    
    /**
     * Measure First Contentful Paint
     */
    async measureFCP(metrics) {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length > 0) {
                    metrics.fcp = entries[0].startTime;
                }
                observer.disconnect();
            });
            
            observer.observe({ type: 'paint', buffered: true });
            
        } catch (error) {
            console.warn('FCP measurement failed:', error);
            metrics.fcp = null;
        }
    }
    
    /**
     * Measure Time to First Byte
     */
    async measureTTFB(metrics) {
        try {
            const timing = performance.timing || performance.getEntriesByType('navigation')[0];
            if (timing) {
                if (timing.responseStart && timing.requestStart) {
                    metrics.ttfb = timing.responseStart - timing.requestStart;
                } else if (timing.responseStart && timing.fetchStart) {
                    metrics.ttfb = timing.responseStart - timing.fetchStart;
                }
            }
        } catch (error) {
            console.warn('TTFB measurement failed:', error);
            metrics.ttfb = null;
        }
    }
    
    /**
     * Validate Core Web Vitals against thresholds
     */
    validateCoreWebVitals(metrics) {
        // LCP validation
        if (metrics.lcp !== null) {
            if (metrics.lcp > this.options.maxLCP) {
                this.issues.push({
                    type: 'core-web-vitals',
                    metric: 'LCP',
                    value: metrics.lcp,
                    threshold: this.options.maxLCP,
                    message: `LCP (${metrics.lcp.toFixed(0)}ms) exceeds threshold (${this.options.maxLCP}ms)`,
                    severity: 'error'
                });
            } else {
                this.passes.push({
                    type: 'core-web-vitals',
                    metric: 'LCP',
                    message: `LCP (${metrics.lcp.toFixed(0)}ms) meets threshold`
                });
            }
        }
        
        // FID validation
        if (metrics.fid !== null) {
            if (metrics.fid > this.options.maxFID) {
                this.issues.push({
                    type: 'core-web-vitals',
                    metric: 'FID',
                    value: metrics.fid,
                    threshold: this.options.maxFID,
                    message: `FID (${metrics.fid.toFixed(0)}ms) exceeds threshold (${this.options.maxFID}ms)`,
                    severity: 'error'
                });
            } else {
                this.passes.push({
                    type: 'core-web-vitals',
                    metric: 'FID',
                    message: `FID (${metrics.fid.toFixed(0)}ms) meets threshold`
                });
            }
        }
        
        // CLS validation
        if (metrics.cls !== null) {
            if (metrics.cls > this.options.maxCLS) {
                this.issues.push({
                    type: 'core-web-vitals',
                    metric: 'CLS',
                    value: metrics.cls,
                    threshold: this.options.maxCLS,
                    message: `CLS (${metrics.cls.toFixed(3)}) exceeds threshold (${this.options.maxCLS})`,
                    severity: 'error'
                });
            } else {
                this.passes.push({
                    type: 'core-web-vitals',
                    metric: 'CLS',
                    message: `CLS (${metrics.cls.toFixed(3)}) meets threshold`
                });
            }
        }
    }
    
    /**
     * Test resource loading performance
     */
    async testResourcePerformance() {
        console.log('📦 Testing resource performance...');
        
        const resources = {
            totalRequests: 0,
            totalSize: 0,
            totalTime: 0,
            types: {
                scripts: { count: 0, size: 0, time: 0 },
                stylesheets: { count: 0, size: 0, time: 0 },
                images: { count: 0, size: 0, time: 0 },
                fonts: { count: 0, size: 0, time: 0 },
                other: { count: 0, size: 0, time: 0 }
            },
            largestResources: [],
            slowestResources: []
        };
        
        try {
            const entries = performance.getEntriesByType('resource');
            
            entries.forEach(entry => {
                resources.totalRequests++;
                resources.totalSize += entry.transferSize || 0;
                resources.totalTime += entry.duration || 0;
                
                // Categorize by type
                const type = this.categorizeResource(entry);
                if (resources.types[type]) {
                    resources.types[type].count++;
                    resources.types[type].size += entry.transferSize || 0;
                    resources.types[type].time += entry.duration || 0;
                }
                
                // Track largest resources
                if (entry.transferSize && entry.transferSize > 50000) { // > 50KB
                    resources.largestResources.push({
                        name: entry.name,
                        size: entry.transferSize,
                        type: type
                    });
                }
                
                // Track slowest resources
                if (entry.duration && entry.duration > 1000) { // > 1s
                    resources.slowestResources.push({
                        name: entry.name,
                        duration: entry.duration,
                        type: type
                    });
                }
            });
            
            // Sort by size and duration
            resources.largestResources.sort((a, b) => b.size - a.size);
            resources.slowestResources.sort((a, b) => b.duration - a.duration);
            
            // Validate performance
            this.validateResourcePerformance(resources);
            
        } catch (error) {
            console.warn('Resource performance measurement failed:', error);
        }
        
        this.results.resources = resources;
    }
    
    /**
     * Categorize resource by type
     */
    categorizeResource(entry) {
        const name = entry.name.toLowerCase();
        
        if (name.includes('.js') || entry.initiatorType === 'script') {
            return 'scripts';
        } else if (name.includes('.css') || entry.initiatorType === 'link') {
            return 'stylesheets';
        } else if (name.match(/\.(jpg|jpeg|png|gif|svg|webp)/) || entry.initiatorType === 'img') {
            return 'images';
        } else if (name.match(/\.(woff|woff2|ttf|otf|eot)/)) {
            return 'fonts';
        } else {
            return 'other';
        }
    }
    
    /**
     * Validate resource performance
     */
    validateResourcePerformance(resources) {
        // Check total requests
        if (resources.totalRequests > 100) {
            this.warnings.push({
                type: 'resource-performance',
                message: `High number of HTTP requests (${resources.totalRequests})`,
                severity: 'warning'
            });
        }
        
        // Check total size
        if (resources.totalSize > 3000000) { // 3MB
            this.warnings.push({
                type: 'resource-performance',
                message: `Large total resource size (${(resources.totalSize / 1024 / 1024).toFixed(2)}MB)`,
                severity: 'warning'
            });
        }
        
        // Check JavaScript size
        if (resources.types.scripts.size > 500000) { // 500KB
            this.warnings.push({
                type: 'resource-performance',
                message: `Large JavaScript bundle size (${(resources.types.scripts.size / 1024).toFixed(0)}KB)`,
                severity: 'warning'
            });
        }
        
        // Check CSS size
        if (resources.types.stylesheets.size > 200000) { // 200KB
            this.warnings.push({
                type: 'resource-performance',
                message: `Large CSS bundle size (${(resources.types.stylesheets.size / 1024).toFixed(0)}KB)`,
                severity: 'warning'
            });
        }
        
        // Report largest resources
        resources.largestResources.slice(0, 5).forEach(resource => {
            this.warnings.push({
                type: 'resource-performance',
                message: `Large resource: ${resource.name} (${(resource.size / 1024).toFixed(0)}KB)`,
                severity: 'info'
            });
        });
    }
    
    /**
     * Test JavaScript performance
     */
    async testJavaScriptPerformance() {
        console.log('⚡ Testing JavaScript performance...');
        
        const jsPerf = {
            mainThreadBlocking: 0,
            longTasks: [],
            memoryUsage: null,
            performanceMarks: [],
            issues: []
        };
        
        try {
            // Measure main thread blocking
            await this.measureMainThreadBlocking(jsPerf);
            
            // Check memory usage
            this.measureMemoryUsage(jsPerf);
            
            // Check performance marks
            this.checkPerformanceMarks(jsPerf);
            
            // Validate JS performance
            this.validateJavaScriptPerformance(jsPerf);
            
        } catch (error) {
            console.warn('JavaScript performance measurement failed:', error);
        }
        
        this.results.javascript = jsPerf;
    }
    
    /**
     * Measure main thread blocking time
     */
    async measureMainThreadBlocking(jsPerf) {
        return new Promise((resolve) => {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        jsPerf.mainThreadBlocking += entry.duration;
                        jsPerf.longTasks.push({
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
                
                observer.observe({ entryTypes: ['longtask'] });
                
                // Measure for 10 seconds
                setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, 10000);
                
            } catch (error) {
                console.warn('Long task measurement not supported:', error);
                resolve();
            }
        });
    }
    
    /**
     * Measure memory usage
     */
    measureMemoryUsage(jsPerf) {
        try {
            if (performance.memory) {
                jsPerf.memoryUsage = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                };
            }
        } catch (error) {
            console.warn('Memory usage measurement failed:', error);
        }
    }
    
    /**
     * Check performance marks
     */
    checkPerformanceMarks(jsPerf) {
        try {
            const marks = performance.getEntriesByType('mark');
            const measures = performance.getEntriesByType('measure');
            
            jsPerf.performanceMarks = [...marks, ...measures].map(entry => ({
                name: entry.name,
                startTime: entry.startTime,
                duration: entry.duration || 0
            }));
            
        } catch (error) {
            console.warn('Performance marks check failed:', error);
        }
    }
    
    /**
     * Validate JavaScript performance
     */
    validateJavaScriptPerformance(jsPerf) {
        // Check main thread blocking
        if (jsPerf.mainThreadBlocking > 200) {
            this.issues.push({
                type: 'javascript-performance',
                message: `High main thread blocking time (${jsPerf.mainThreadBlocking.toFixed(0)}ms)`,
                severity: 'error'
            });
        }
        
        // Check long tasks
        jsPerf.longTasks.forEach(task => {
            if (task.duration > 50) {
                this.warnings.push({
                    type: 'javascript-performance',
                    message: `Long task detected: ${task.name} (${task.duration.toFixed(0)}ms)`,
                    severity: 'warning'
                });
            }
        });
        
        // Check memory usage
        if (jsPerf.memoryUsage) {
            const memoryUsagePercent = (jsPerf.memoryUsage.used / jsPerf.memoryUsage.limit) * 100;
            if (memoryUsagePercent > 80) {
                this.warnings.push({
                    type: 'javascript-performance',
                    message: `High memory usage (${memoryUsagePercent.toFixed(1)}%)`,
                    severity: 'warning'
                });
            }
        }
    }
    
    /**
     * Test image optimization
     */
    async testImageOptimization() {
        console.log('🖼️ Testing image optimization...');
        
        const images = {
            total: 0,
            optimized: 0,
            totalSize: 0,
            formats: {
                jpeg: 0,
                png: 0,
                gif: 0,
                svg: 0,
                webp: 0,
                avif: 0
            },
            largeImages: [],
            recommendations: []
        };
        
        try {
            const imgElements = document.querySelectorAll('img');
            const resourceEntries = performance.getEntriesByType('resource');
            
            images.total = imgElements.length;
            
            // Analyze loaded images from resource timing
            resourceEntries.forEach(entry => {
                if (this.isImageResource(entry.name)) {
                    images.totalSize += entry.transferSize || 0;
                    
                    const format = this.getImageFormat(entry.name);
                    if (images.formats[format] !== undefined) {
                        images.formats[format]++;
                    }
                    
                    // Check for large images
                    if (entry.transferSize && entry.transferSize > 200000) { // > 200KB
                        images.largeImages.push({
                            url: entry.name,
                            size: entry.transferSize,
                            format: format
                        });
                    }
                }
            });
            
            // Check image elements for optimization
            imgElements.forEach(img => {
                // Check for responsive images
                if (img.srcset || img.closest('picture')) {
                    images.optimized++;
                }
                
                // Check for lazy loading
                if (img.loading === 'lazy' || img.hasAttribute('data-src')) {
                    images.optimized++;
                }
                
                // Check for modern formats
                if (img.src && (img.src.includes('.webp') || img.src.includes('.avif'))) {
                    images.optimized++;
                }
            });
            
            // Generate recommendations
            this.generateImageRecommendations(images);
            
        } catch (error) {
            console.warn('Image optimization test failed:', error);
        }
        
        this.results.images = images;
    }
    
    /**
     * Check if resource is an image
     */
    isImageResource(url) {
        return url.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)(\?|#|$)/i);
    }
    
    /**
     * Get image format from URL
     */
    getImageFormat(url) {
        const match = url.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)(\?|#|$)/i);
        if (match) {
            const format = match[1].toLowerCase();
            return format === 'jpg' ? 'jpeg' : format;
        }
        return 'unknown';
    }
    
    /**
     * Generate image optimization recommendations
     */
    generateImageRecommendations(images) {
        // Check for modern formats
        const totalTraditional = images.formats.jpeg + images.formats.png + images.formats.gif;
        const totalModern = images.formats.webp + images.formats.avif;
        
        if (totalTraditional > totalModern && totalTraditional > 0) {
            images.recommendations.push('Consider using modern image formats like WebP or AVIF');
        }
        
        // Check for large images
        if (images.largeImages.length > 0) {
            images.recommendations.push(`Optimize ${images.largeImages.length} large images`);
        }
        
        // Check optimization ratio
        const optimizationRatio = images.total > 0 ? (images.optimized / images.total) * 100 : 0;
        if (optimizationRatio < 50) {
            images.recommendations.push('Implement responsive images and lazy loading');
        }
    }
    
    /**
     * Run Lighthouse-style audit
     */
    async runLighthouseStyleAudit() {
        console.log('🏠 Running Lighthouse-style audit...');
        
        const audit = {
            performance: 0,
            accessibility: 0,
            bestPractices: 0,
            seo: 0,
            pwa: 0,
            metrics: {},
            opportunities: [],
            diagnostics: []
        };
        
        try {
            // Calculate performance score based on metrics
            audit.performance = this.calculatePerformanceScore();
            
            // Basic accessibility checks
            audit.accessibility = this.calculateAccessibilityScore();
            
            // Best practices checks
            audit.bestPractices = this.calculateBestPracticesScore();
            
            // SEO checks
            audit.seo = this.calculateSEOScore();
            
            // PWA checks
            audit.pwa = this.calculatePWAScore();
            
            // Generate opportunities and diagnostics
            this.generateOpportunities(audit);
            this.generateDiagnostics(audit);
            
        } catch (error) {
            console.warn('Lighthouse-style audit failed:', error);
        }
        
        this.results.lighthouse = audit;
    }
    
    /**
     * Calculate performance score
     */
    calculatePerformanceScore() {
        let score = 100;
        const cwv = this.results.coreWebVitals;
        
        // Deduct points based on Core Web Vitals
        if (cwv?.lcp && cwv.lcp > this.options.maxLCP) {
            score -= Math.min(30, (cwv.lcp - this.options.maxLCP) / 100);
        }
        
        if (cwv?.fid && cwv.fid > this.options.maxFID) {
            score -= Math.min(20, (cwv.fid - this.options.maxFID) / 10);
        }
        
        if (cwv?.cls && cwv.cls > this.options.maxCLS) {
            score -= Math.min(20, (cwv.cls - this.options.maxCLS) * 100);
        }
        
        // Deduct points for resource issues
        const resources = this.results.resources;
        if (resources?.totalSize > 3000000) { // 3MB
            score -= 10;
        }
        
        if (resources?.totalRequests > 100) {
            score -= 10;
        }
        
        return Math.max(0, Math.round(score));
    }
    
    /**
     * Calculate accessibility score (basic)
     */
    calculateAccessibilityScore() {
        let score = 100;
        
        // Basic accessibility checks
        if (!document.querySelector('html[lang]')) {
            score -= 10;
        }
        
        const images = document.querySelectorAll('img');
        let imagesWithAlt = 0;
        images.forEach(img => {
            if (img.hasAttribute('alt')) imagesWithAlt++;
        });
        
        if (images.length > 0 && (imagesWithAlt / images.length) < 0.9) {
            score -= 15;
        }
        
        return Math.max(0, Math.round(score));
    }
    
    /**
     * Calculate best practices score
     */
    calculateBestPracticesScore() {
        let score = 100;
        
        // Check HTTPS
        if (location.protocol !== 'https:') {
            score -= 20;
        }
        
        // Check for console errors
        // Note: This is a simplified check
        if (this.issues.some(issue => issue.type === 'javascript-error')) {
            score -= 10;
        }
        
        return Math.max(0, Math.round(score));
    }
    
    /**
     * Calculate SEO score
     */
    calculateSEOScore() {
        let score = 100;
        
        // Check title
        if (!document.title || document.title.length === 0) {
            score -= 20;
        }
        
        // Check meta description
        if (!document.querySelector('meta[name="description"]')) {
            score -= 15;
        }
        
        // Check viewport
        if (!document.querySelector('meta[name="viewport"]')) {
            score -= 15;
        }
        
        return Math.max(0, Math.round(score));
    }
    
    /**
     * Calculate PWA score
     */
    calculatePWAScore() {
        let score = 0;
        
        // Check for service worker
        if ('serviceWorker' in navigator) {
            score += 30;
        }
        
        // Check for web app manifest
        if (document.querySelector('link[rel="manifest"]')) {
            score += 30;
        }
        
        // Check for HTTPS
        if (location.protocol === 'https:') {
            score += 20;
        }
        
        // Check for offline functionality (basic)
        if ('caches' in window) {
            score += 20;
        }
        
        return Math.max(0, Math.round(score));
    }
    
    /**
     * Generate optimization opportunities
     */
    generateOpportunities(audit) {
        const opportunities = [];
        
        // Resource opportunities
        const resources = this.results.resources;
        if (resources?.largestResources?.length > 0) {
            opportunities.push({
                title: 'Reduce unused JavaScript',
                description: `${resources.largestResources.length} large resources detected`,
                savings: `~${Math.round(resources.largestResources.reduce((sum, r) => sum + r.size, 0) / 1024)}KB`
            });
        }
        
        // Image opportunities
        const images = this.results.images;
        if (images?.largeImages?.length > 0) {
            opportunities.push({
                title: 'Properly size images',
                description: `${images.largeImages.length} oversized images`,
                savings: `~${Math.round(images.largeImages.reduce((sum, img) => sum + img.size, 0) / 1024)}KB`
            });
        }
        
        audit.opportunities = opportunities;
    }
    
    /**
     * Generate diagnostics
     */
    generateDiagnostics(audit) {
        const diagnostics = [];
        
        // Core Web Vitals diagnostics
        const cwv = this.results.coreWebVitals;
        if (cwv?.lcp && cwv.lcp > 2500) {
            diagnostics.push({
                title: 'Largest Contentful Paint',
                description: `LCP occurs at ${cwv.lcp.toFixed(0)}ms`,
                severity: 'error'
            });
        }
        
        if (cwv?.cls && cwv.cls > 0.1) {
            diagnostics.push({
                title: 'Cumulative Layout Shift',
                description: `CLS score is ${cwv.cls.toFixed(3)}`,
                severity: 'error'
            });
        }
        
        // JavaScript diagnostics
        const js = this.results.javascript;
        if (js?.mainThreadBlocking > 200) {
            diagnostics.push({
                title: 'Main Thread Blocking',
                description: `${js.mainThreadBlocking.toFixed(0)}ms of main thread blocking`,
                severity: 'warning'
            });
        }
        
        audit.diagnostics = diagnostics;
    }
    
    /**
     * Process test results
     */
    processTestResults() {
        const performanceScore = this.results.lighthouse?.performance || 0;
        
        if (performanceScore >= this.options.targetPerformanceScore) {
            this.results.overall = 'excellent';
        } else if (performanceScore >= 70) {
            this.results.overall = 'good';
        } else if (performanceScore >= 50) {
            this.results.overall = 'needs-improvement';
        } else {
            this.results.overall = 'poor';
        }
        
        // Add performance score to passes/issues
        if (performanceScore >= this.options.targetPerformanceScore) {
            this.passes.push({
                type: 'performance-score',
                message: `Performance score (${performanceScore}) meets target (${this.options.targetPerformanceScore})`
            });
        } else {
            this.issues.push({
                type: 'performance-score',
                message: `Performance score (${performanceScore}) below target (${this.options.targetPerformanceScore})`,
                severity: 'error'
            });
        }
    }
    
    /**
     * Generate performance report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overall: this.results.overall,
            scores: this.results.lighthouse,
            coreWebVitals: this.results.coreWebVitals,
            summary: {
                issues: this.issues.length,
                warnings: this.warnings.length,
                passes: this.passes.length
            },
            results: this.results,
            recommendations: this.generateRecommendations(),
            details: {
                issues: this.issues,
                warnings: this.warnings,
                passes: this.passes
            }
        };
        
        // Log summary
        console.group('⚡ Performance Test Report');
        console.log(`Performance Score: ${this.results.lighthouse?.performance || 'N/A'}`);
        console.log(`Overall Rating: ${this.results.overall.toUpperCase()}`);
        console.log(`Core Web Vitals: LCP=${this.results.coreWebVitals?.lcp?.toFixed(0)||'N/A'}ms, FID=${this.results.coreWebVitals?.fid?.toFixed(0)||'N/A'}ms, CLS=${this.results.coreWebVitals?.cls?.toFixed(3)||'N/A'}`);
        console.log(`Issues: ${this.issues.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.groupEnd();
        
        return report;
    }
    
    /**
     * Generate recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Core Web Vitals recommendations
        const cwv = this.results.coreWebVitals;
        if (cwv?.lcp && cwv.lcp > 2500) {
            recommendations.push('Optimize Largest Contentful Paint by reducing server response time and optimizing critical resources');
        }
        
        if (cwv?.cls && cwv.cls > 0.1) {
            recommendations.push('Reduce Cumulative Layout Shift by setting explicit dimensions for images and ads');
        }
        
        if (cwv?.fid && cwv.fid > 100) {
            recommendations.push('Improve First Input Delay by reducing main thread blocking time');
        }
        
        // Resource recommendations
        const resources = this.results.resources;
        if (resources?.types?.scripts?.size > 500000) {
            recommendations.push('Reduce JavaScript bundle size by code splitting and tree shaking');
        }
        
        if (resources?.totalRequests > 100) {
            recommendations.push('Reduce HTTP requests by bundling resources and using HTTP/2');
        }
        
        // Image recommendations
        if (this.results.images?.recommendations) {
            recommendations.push(...this.results.images.recommendations);
        }
        
        return recommendations;
    }
}

/**
 * Quick performance testing function
 */
async function testPerformance(options = {}) {
    const tester = new PerformanceTester(options);
    return await tester.runPerformanceTests();
}

/**
 * Initialize performance testing
 */
const initializePerformanceTesting = () => {
    if (typeof window !== 'undefined') {
        window.PerformanceTester = PerformanceTester;
        window.testPerformance = testPerformance;
        
        // Add testing button
        if (document.readyState === 'complete') {
            addPerformanceTestButton();
        } else {
            window.addEventListener('load', addPerformanceTestButton);
        }
    }
};

/**
 * Add performance test button
 */
function addPerformanceTestButton() {
    const button = document.createElement('button');
    button.textContent = '⚡ Test Performance';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        left: 720px;
        z-index: 10000;
        background: #dc3545;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-family: system-ui, sans-serif;
    `;
    
    button.addEventListener('click', async () => {
        button.textContent = '🔄 Testing...';
        button.disabled = true;
        
        try {
            const report = await testPerformance();
            console.log('Performance Test Report:', report);
            
            const score = report.scores?.performance || 'N/A';
            const rating = report.overall.toUpperCase().replace('-', ' ');
            const lcp = report.coreWebVitals?.lcp?.toFixed(0) || 'N/A';
            const cls = report.coreWebVitals?.cls?.toFixed(3) || 'N/A';
            const summary = `Performance: ${score}/100\nRating: ${rating}\nLCP: ${lcp}ms\nCLS: ${cls}\nIssues: ${report.summary.issues}\nWarnings: ${report.summary.warnings}`;
            alert(`Performance Test Complete!\n\n${summary}\n\nSee console for detailed report.`);
            
        } catch (error) {
            console.error('Performance testing failed:', error);
            alert('Performance testing failed. See console for details.');
        } finally {
            button.textContent = '⚡ Test Performance';
            button.disabled = false;
        }
    });
    
    document.body.appendChild(button);
}

// Auto-initialize
if (typeof module === 'undefined') {
    initializePerformanceTesting();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceTester, testPerformance };
}

// Export for ES6 modules
export { PerformanceTester, testPerformance };