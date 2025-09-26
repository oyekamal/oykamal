/**
 * Loading Speed Testing System
 * 
 * Tests loading performance under various conditions:
 * - Network condition simulation (3G, 4G, slow connections)
 * - Resource loading speed analysis
 * - Progressive loading validation
 * - Critical resource prioritization
 * - Loading optimization recommendations
 * 
 * @version 1.0.0
 * @author Portfolio Testing Team
 */

class LoadingSpeedTester {
    constructor(options = {}) {
        this.options = {
            // Network condition presets
            networkConditions: {
                'slow-3g': {
                    name: 'Slow 3G',
                    downloadThroughput: 500 * 1024 / 8, // 500 Kbps
                    uploadThroughput: 500 * 1024 / 8,
                    latency: 400
                },
                'fast-3g': {
                    name: 'Fast 3G', 
                    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
                    uploadThroughput: 750 * 1024 / 8,
                    latency: 150
                },
                '4g': {
                    name: '4G',
                    downloadThroughput: 9 * 1024 * 1024 / 8, // 9 Mbps
                    uploadThroughput: 9 * 1024 * 1024 / 8,
                    latency: 170
                }
            },
            // Performance thresholds
            thresholds: {
                firstPaint: 1000,
                firstContentfulPaint: 1500,
                largestContentfulPaint: 2500,
                domContentLoaded: 2000,
                loadComplete: 3000
            },
            testCriticalPath: true,
            testResourcePriority: true,
            testProgressiveLoading: true,
            ...options
        };
        
        this.results = {
            baseline: null,
            networkTests: {},
            criticalPath: null,
            resourcePriority: null,
            progressiveLoading: null,
            overall: 'pending'
        };
        
        this.issues = [];
        this.warnings = [];
        this.passes = [];
        this.metrics = {};
        this.startTime = performance.now();
    }
    
    /**
     * Run complete loading speed tests
     */
    async runLoadingSpeedTests() {
        try {
            console.log('🚀 Starting loading speed testing...');
            
            // Capture baseline performance
            await this.captureBaselineMetrics();
            
            // Test critical resource path
            await this.testCriticalResourcePath();
            
            // Test resource loading priorities
            await this.testResourcePriorities();
            
            // Test progressive loading
            await this.testProgressiveLoading();
            
            // Simulate network conditions (analysis only, can't actually throttle)
            await this.analyzeNetworkPerformance();
            
            // Process results
            this.processTestResults();
            
            // Generate report
            const report = this.generateReport();
            
            console.log('✅ Loading speed testing completed');
            return report;
            
        } catch (error) {
            console.error('❌ Loading speed testing failed:', error);
            this.issues.push({
                type: 'system',
                message: error.message,
                severity: 'error'
            });
            
            return this.generateReport();
        }
    }
    
    /**
     * Capture baseline performance metrics
     */
    async captureBaselineMetrics() {
        console.log('📊 Capturing baseline metrics...');
        
        const baseline = {
            timing: null,
            paintMetrics: {},
            navigationMetrics: {},
            resourceMetrics: {},
            connectionInfo: {}
        };
        
        try {
            // Get navigation timing
            baseline.timing = this.getNavigationTiming();
            
            // Get paint metrics
            baseline.paintMetrics = await this.getPaintMetrics();
            
            // Get navigation metrics
            baseline.navigationMetrics = this.getNavigationMetrics();
            
            // Get resource metrics
            baseline.resourceMetrics = this.getResourceMetrics();
            
            // Get connection info
            baseline.connectionInfo = this.getConnectionInfo();
            
            // Validate against thresholds
            this.validateBaselineMetrics(baseline);
            
        } catch (error) {
            console.warn('Baseline metrics capture failed:', error);
        }
        
        this.results.baseline = baseline;
    }
    
    /**
     * Get navigation timing data
     */
    getNavigationTiming() {
        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
            return {
                // Navigation Timing Level 2
                fetchStart: navigation.fetchStart,
                domainLookupStart: navigation.domainLookupStart,
                domainLookupEnd: navigation.domainLookupEnd,
                connectStart: navigation.connectStart,
                connectEnd: navigation.connectEnd,
                secureConnectionStart: navigation.secureConnectionStart,
                requestStart: navigation.requestStart,
                responseStart: navigation.responseStart,
                responseEnd: navigation.responseEnd,
                domInteractive: navigation.domInteractive,
                domContentLoadedEventStart: navigation.domContentLoadedEventStart,
                domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
                domComplete: navigation.domComplete,
                loadEventStart: navigation.loadEventStart,
                loadEventEnd: navigation.loadEventEnd,
                // Calculated metrics
                dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcpTime: navigation.connectEnd - navigation.connectStart,
                requestTime: navigation.responseEnd - navigation.requestStart,
                domProcessingTime: navigation.domInteractive - navigation.responseEnd,
                domContentLoadedTime: navigation.domContentLoadedEventStart - navigation.fetchStart,
                loadCompleteTime: navigation.loadEventEnd - navigation.fetchStart
            };
        } else if (timing) {
            // Fallback to Navigation Timing Level 1
            return {
                fetchStart: timing.fetchStart - timing.navigationStart,
                domainLookupStart: timing.domainLookupStart - timing.navigationStart,
                domainLookupEnd: timing.domainLookupEnd - timing.navigationStart,
                connectStart: timing.connectStart - timing.navigationStart,
                connectEnd: timing.connectEnd - timing.navigationStart,
                requestStart: timing.requestStart - timing.navigationStart,
                responseStart: timing.responseStart - timing.navigationStart,
                responseEnd: timing.responseEnd - timing.navigationStart,
                domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadCompleteTime: timing.loadEventEnd - timing.navigationStart,
                // Calculated metrics
                dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
                tcpTime: timing.connectEnd - timing.connectStart,
                requestTime: timing.responseEnd - timing.requestStart
            };
        }
        
        return null;
    }
    
    /**
     * Get paint timing metrics
     */
    async getPaintMetrics() {
        return new Promise((resolve) => {
            const paintMetrics = {};
            
            try {
                // Get paint entries
                const paintEntries = performance.getEntriesByType('paint');
                paintEntries.forEach(entry => {
                    paintMetrics[entry.name.replace('-', '_')] = entry.startTime;
                });
                
                // Get LCP if available
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    paintMetrics.largest_contentful_paint = lastEntry.startTime;
                    observer.disconnect();
                    resolve(paintMetrics);
                });
                
                observer.observe({ type: 'largest-contentful-paint', buffered: true });
                
                // Timeout for LCP measurement
                setTimeout(() => {
                    observer.disconnect();
                    resolve(paintMetrics);
                }, 3000);
                
            } catch (error) {
                console.warn('Paint metrics collection failed:', error);
                resolve(paintMetrics);
            }
        });
    }
    
    /**
     * Get navigation metrics
     */
    getNavigationMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            return {
                type: navigation.type,
                redirectCount: navigation.redirectCount,
                transferSize: navigation.transferSize,
                encodedBodySize: navigation.encodedBodySize,
                decodedBodySize: navigation.decodedBodySize,
                compressionRatio: navigation.encodedBodySize / navigation.decodedBodySize
            };
        }
        return {};
    }
    
    /**
     * Get resource loading metrics
     */
    getResourceMetrics() {
        const resources = performance.getEntriesByType('resource');
        const metrics = {
            totalResources: resources.length,
            totalTransferSize: 0,
            totalDuration: 0,
            resourceTypes: {},
            slowestResources: [],
            largestResources: [],
            criticalResources: []
        };
        
        resources.forEach(resource => {
            metrics.totalTransferSize += resource.transferSize || 0;
            metrics.totalDuration += resource.duration || 0;
            
            // Categorize by type
            const type = this.getResourceType(resource);
            if (!metrics.resourceTypes[type]) {
                metrics.resourceTypes[type] = {
                    count: 0,
                    size: 0,
                    duration: 0
                };
            }
            metrics.resourceTypes[type].count++;
            metrics.resourceTypes[type].size += resource.transferSize || 0;
            metrics.resourceTypes[type].duration += resource.duration || 0;
            
            // Track slow resources
            if (resource.duration > 1000) {
                metrics.slowestResources.push({
                    name: resource.name,
                    duration: resource.duration,
                    type: type
                });
            }
            
            // Track large resources
            if (resource.transferSize > 100000) { // > 100KB
                metrics.largestResources.push({
                    name: resource.name,
                    size: resource.transferSize,
                    type: type
                });
            }
            
            // Identify critical resources
            if (this.isCriticalResource(resource)) {
                metrics.criticalResources.push({
                    name: resource.name,
                    duration: resource.duration,
                    size: resource.transferSize,
                    type: type
                });
            }
        });
        
        // Sort arrays by severity
        metrics.slowestResources.sort((a, b) => b.duration - a.duration);
        metrics.largestResources.sort((a, b) => b.size - a.size);
        
        return metrics;
    }
    
    /**
     * Get resource type
     */
    getResourceType(resource) {
        const name = resource.name.toLowerCase();
        const initiator = resource.initiatorType;
        
        if (name.includes('.css') || initiator === 'link') return 'stylesheet';
        if (name.includes('.js') || initiator === 'script') return 'script';
        if (name.match(/\.(jpg|jpeg|png|gif|svg|webp)/) || initiator === 'img') return 'image';
        if (name.match(/\.(woff|woff2|ttf|otf)/)) return 'font';
        if (initiator === 'fetch' || initiator === 'xmlhttprequest') return 'ajax';
        return 'other';
    }
    
    /**
     * Check if resource is critical
     */
    isCriticalResource(resource) {
        const name = resource.name.toLowerCase();
        const type = this.getResourceType(resource);
        
        // Critical CSS and JS
        if (type === 'stylesheet' || type === 'script') {
            // Consider resources loaded early as critical
            return resource.fetchStart < 1000; // Within first second
        }
        
        // Critical fonts
        if (type === 'font' && resource.fetchStart < 2000) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get connection information
     */
    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
        return {};
    }
    
    /**
     * Validate baseline metrics against thresholds
     */
    validateBaselineMetrics(baseline) {
        // Check First Paint
        if (baseline.paintMetrics.first_paint > this.options.thresholds.firstPaint) {
            this.issues.push({
                type: 'loading-speed',
                metric: 'First Paint',
                value: baseline.paintMetrics.first_paint,
                threshold: this.options.thresholds.firstPaint,
                message: `First Paint (${baseline.paintMetrics.first_paint.toFixed(0)}ms) exceeds threshold`,
                severity: 'error'
            });
        }
        
        // Check First Contentful Paint
        if (baseline.paintMetrics.first_contentful_paint > this.options.thresholds.firstContentfulPaint) {
            this.issues.push({
                type: 'loading-speed',
                metric: 'First Contentful Paint',
                value: baseline.paintMetrics.first_contentful_paint,
                threshold: this.options.thresholds.firstContentfulPaint,
                message: `First Contentful Paint (${baseline.paintMetrics.first_contentful_paint.toFixed(0)}ms) exceeds threshold`,
                severity: 'error'
            });
        }
        
        // Check Largest Contentful Paint
        if (baseline.paintMetrics.largest_contentful_paint > this.options.thresholds.largestContentfulPaint) {
            this.issues.push({
                type: 'loading-speed',
                metric: 'Largest Contentful Paint',
                value: baseline.paintMetrics.largest_contentful_paint,
                threshold: this.options.thresholds.largestContentfulPaint,
                message: `Largest Contentful Paint (${baseline.paintMetrics.largest_contentful_paint.toFixed(0)}ms) exceeds threshold`,
                severity: 'error'
            });
        }
        
        // Check DOM Content Loaded
        if (baseline.timing?.domContentLoadedTime > this.options.thresholds.domContentLoaded) {
            this.issues.push({
                type: 'loading-speed',
                metric: 'DOM Content Loaded',
                value: baseline.timing.domContentLoadedTime,
                threshold: this.options.thresholds.domContentLoaded,
                message: `DOM Content Loaded (${baseline.timing.domContentLoadedTime.toFixed(0)}ms) exceeds threshold`,
                severity: 'warning'
            });
        }
        
        // Check Load Complete
        if (baseline.timing?.loadCompleteTime > this.options.thresholds.loadComplete) {
            this.warnings.push({
                type: 'loading-speed',
                metric: 'Load Complete',
                value: baseline.timing.loadCompleteTime,
                threshold: this.options.thresholds.loadComplete,
                message: `Load Complete (${baseline.timing.loadCompleteTime.toFixed(0)}ms) exceeds threshold`,
                severity: 'warning'
            });
        }
    }
    
    /**
     * Test critical resource loading path
     */
    async testCriticalResourcePath() {
        console.log('🎯 Testing critical resource path...');
        
        const criticalPath = {
            identifiedResources: [],
            loadingOrder: [],
            blockingResources: [],
            recommendations: []
        };
        
        try {
            const resources = performance.getEntriesByType('resource');
            
            // Identify critical resources
            resources.forEach(resource => {
                if (this.isCriticalResource(resource)) {
                    criticalPath.identifiedResources.push({
                        name: resource.name,
                        type: this.getResourceType(resource),
                        startTime: resource.fetchStart,
                        duration: resource.duration,
                        size: resource.transferSize,
                        blocking: this.isBlockingResource(resource)
                    });
                }
            });
            
            // Sort by loading order
            criticalPath.loadingOrder = [...criticalPath.identifiedResources]
                .sort((a, b) => a.startTime - b.startTime);
            
            // Find blocking resources
            criticalPath.blockingResources = criticalPath.identifiedResources
                .filter(resource => resource.blocking);
            
            // Generate recommendations
            this.generateCriticalPathRecommendations(criticalPath);
            
        } catch (error) {
            console.warn('Critical path analysis failed:', error);
        }
        
        this.results.criticalPath = criticalPath;
    }
    
    /**
     * Check if resource is render-blocking
     */
    isBlockingResource(resource) {
        const type = this.getResourceType(resource);
        const name = resource.name.toLowerCase();
        
        // CSS is render-blocking by default
        if (type === 'stylesheet') {
            return true;
        }
        
        // Synchronous JavaScript is parser-blocking
        if (type === 'script' && !name.includes('async') && !name.includes('defer')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Generate critical path recommendations
     */
    generateCriticalPathRecommendations(criticalPath) {
        // Check for too many critical resources
        if (criticalPath.identifiedResources.length > 10) {
            criticalPath.recommendations.push('Reduce number of critical resources');
        }
        
        // Check for large critical resources
        const largeCritical = criticalPath.identifiedResources.filter(r => r.size > 100000);
        if (largeCritical.length > 0) {
            criticalPath.recommendations.push(`Optimize ${largeCritical.length} large critical resources`);
        }
        
        // Check for slow critical resources
        const slowCritical = criticalPath.identifiedResources.filter(r => r.duration > 1000);
        if (slowCritical.length > 0) {
            criticalPath.recommendations.push(`Optimize ${slowCritical.length} slow-loading critical resources`);
        }
        
        // Check for blocking resources
        if (criticalPath.blockingResources.length > 3) {
            criticalPath.recommendations.push('Consider async loading for non-critical JavaScript');
        }
    }
    
    /**
     * Test resource loading priorities
     */
    async testResourcePriorities() {
        console.log('📋 Testing resource priorities...');
        
        const priorities = {
            highPriority: [],
            mediumPriority: [],
            lowPriority: [],
            misorderedResources: [],
            recommendations: []
        };
        
        try {
            const resources = performance.getEntriesByType('resource');
            
            resources.forEach(resource => {
                const priority = this.determineResourcePriority(resource);
                const type = this.getResourceType(resource);
                
                const resourceInfo = {
                    name: resource.name,
                    type: type,
                    startTime: resource.fetchStart,
                    duration: resource.duration,
                    size: resource.transferSize
                };
                
                if (priority === 'high') {
                    priorities.highPriority.push(resourceInfo);
                } else if (priority === 'medium') {
                    priorities.mediumPriority.push(resourceInfo);
                } else {
                    priorities.lowPriority.push(resourceInfo);
                }
            });
            
            // Check for misordered resources
            this.findMisorderedResources(priorities);
            
            // Generate priority recommendations
            this.generatePriorityRecommendations(priorities);
            
        } catch (error) {
            console.warn('Resource priority analysis failed:', error);
        }
        
        this.results.resourcePriority = priorities;
    }
    
    /**
     * Determine resource loading priority
     */
    determineResourcePriority(resource) {
        const type = this.getResourceType(resource);
        const name = resource.name.toLowerCase();
        
        // High priority: Critical CSS, critical JS, fonts
        if (type === 'stylesheet' || (type === 'script' && this.isCriticalResource(resource))) {
            return 'high';
        }
        
        if (type === 'font') {
            return 'high';
        }
        
        // Medium priority: Images above the fold, important scripts
        if (type === 'image' && resource.fetchStart < 2000) {
            return 'medium';
        }
        
        if (type === 'script') {
            return 'medium';
        }
        
        // Low priority: Everything else
        return 'low';
    }
    
    /**
     * Find resources loaded in wrong priority order
     */
    findMisorderedResources(priorities) {
        // Check if low-priority resources load before high-priority ones
        const lowPriorityStart = Math.min(...priorities.lowPriority.map(r => r.startTime || Infinity));
        const highPriorityEnd = Math.max(...priorities.highPriority.map(r => (r.startTime || 0) + (r.duration || 0)));
        
        if (lowPriorityStart < highPriorityEnd) {
            priorities.misorderedResources = priorities.lowPriority.filter(
                r => r.startTime < highPriorityEnd
            );
        }
    }
    
    /**
     * Generate priority recommendations
     */
    generatePriorityRecommendations(priorities) {
        if (priorities.misorderedResources.length > 0) {
            priorities.recommendations.push('Use resource hints (preload, prefetch) to prioritize critical resources');
        }
        
        if (priorities.lowPriority.some(r => r.type === 'image' && r.size > 500000)) {
            priorities.recommendations.push('Implement lazy loading for large, non-critical images');
        }
        
        if (priorities.highPriority.length > 10) {
            priorities.recommendations.push('Consider inlining critical CSS and JavaScript');
        }
    }
    
    /**
     * Test progressive loading implementation
     */
    async testProgressiveLoading() {
        console.log('🔄 Testing progressive loading...');
        
        const progressive = {
            lazyLoading: this.testLazyLoading(),
            resourceHints: this.testResourceHints(),
            serviceworker: this.testServiceWorker(),
            caching: this.testCachingStrategy(),
            recommendations: []
        };
        
        // Generate progressive loading recommendations
        this.generateProgressiveRecommendations(progressive);
        
        this.results.progressiveLoading = progressive;
    }
    
    /**
     * Test lazy loading implementation
     */
    testLazyLoading() {
        const images = document.querySelectorAll('img');
        const videos = document.querySelectorAll('video');
        const iframes = document.querySelectorAll('iframe');
        
        let lazyImages = 0;
        let lazyVideos = 0;
        let lazyIframes = 0;
        
        images.forEach(img => {
            if (img.loading === 'lazy' || img.hasAttribute('data-src')) {
                lazyImages++;
            }
        });
        
        videos.forEach(video => {
            if (video.hasAttribute('data-src') || video.preload === 'none') {
                lazyVideos++;
            }
        });
        
        iframes.forEach(iframe => {
            if (iframe.loading === 'lazy' || iframe.hasAttribute('data-src')) {
                lazyIframes++;
            }
        });
        
        return {
            images: {
                total: images.length,
                lazy: lazyImages,
                percentage: images.length ? (lazyImages / images.length) * 100 : 0
            },
            videos: {
                total: videos.length,
                lazy: lazyVideos,
                percentage: videos.length ? (lazyVideos / videos.length) * 100 : 0
            },
            iframes: {
                total: iframes.length,
                lazy: lazyIframes,
                percentage: iframes.length ? (lazyIframes / iframes.length) * 100 : 0
            }
        };
    }
    
    /**
     * Test resource hints implementation
     */
    testResourceHints() {
        const hints = {
            preload: document.querySelectorAll('link[rel="preload"]').length,
            prefetch: document.querySelectorAll('link[rel="prefetch"]').length,
            preconnect: document.querySelectorAll('link[rel="preconnect"]').length,
            dnsPrefetch: document.querySelectorAll('link[rel="dns-prefetch"]').length,
            modulePreload: document.querySelectorAll('link[rel="modulepreload"]').length
        };
        
        return {
            ...hints,
            total: Object.values(hints).reduce((sum, count) => sum + count, 0)
        };
    }
    
    /**
     * Test service worker implementation
     */
    testServiceWorker() {
        return {
            supported: 'serviceWorker' in navigator,
            registered: false, // Would need async check
            cacheApi: 'caches' in window,
            offline: !navigator.onLine
        };
    }
    
    /**
     * Test caching strategy
     */
    testCachingStrategy() {
        const caching = {
            staticCaching: false,
            dynamicCaching: false,
            strategies: []
        };
        
        // Check for cache headers (simplified)
        const resources = performance.getEntriesByType('resource');
        let cachedResources = 0;
        
        resources.forEach(resource => {
            // Check if resource was served from cache (duration near zero)
            if (resource.duration < 10 && resource.transferSize === 0) {
                cachedResources++;
            }
        });
        
        caching.staticCaching = cachedResources > resources.length * 0.3; // 30% cached
        
        return caching;
    }
    
    /**
     * Generate progressive loading recommendations
     */
    generateProgressiveRecommendations(progressive) {
        if (progressive.lazyLoading.images.percentage < 50) {
            progressive.recommendations.push('Implement lazy loading for images below the fold');
        }
        
        if (progressive.resourceHints.total < 3) {
            progressive.recommendations.push('Add resource hints (preload, preconnect) for better loading performance');
        }
        
        if (!progressive.serviceworker.supported) {
            progressive.recommendations.push('Consider implementing service worker for caching and offline support');
        }
        
        if (!progressive.caching.staticCaching) {
            progressive.recommendations.push('Implement proper caching strategy for static resources');
        }
    }
    
    /**
     * Analyze network performance (theoretical analysis)
     */
    async analyzeNetworkPerformance() {
        console.log('🌐 Analyzing network performance...');
        
        const networkAnalysis = {
            currentConnection: this.getConnectionInfo(),
            estimatedPerformance: {},
            recommendations: []
        };
        
        // Estimate performance under different conditions
        Object.entries(this.options.networkConditions).forEach(([key, condition]) => {
            networkAnalysis.estimatedPerformance[key] = this.estimatePerformanceForCondition(condition);
        });
        
        // Generate network recommendations
        this.generateNetworkRecommendations(networkAnalysis);
        
        this.results.networkTests = networkAnalysis;
    }
    
    /**
     * Estimate performance for network condition
     */
    estimatePerformanceForCondition(condition) {
        const baseline = this.results.baseline;
        if (!baseline?.resourceMetrics) return {};
        
        const totalSize = baseline.resourceMetrics.totalTransferSize;
        const estimatedDownloadTime = (totalSize / condition.downloadThroughput) * 1000; // ms
        const estimatedTotalTime = estimatedDownloadTime + (condition.latency * 5); // Multiple round trips
        
        return {
            estimatedDownloadTime,
            estimatedTotalTime,
            condition: condition.name,
            wouldExceedThreshold: estimatedTotalTime > this.options.thresholds.loadComplete
        };
    }
    
    /**
     * Generate network performance recommendations
     */
    generateNetworkRecommendations(networkAnalysis) {
        const slowConnections = Object.values(networkAnalysis.estimatedPerformance)
            .filter(perf => perf.wouldExceedThreshold);
        
        if (slowConnections.length > 0) {
            networkAnalysis.recommendations.push('Optimize for slow connections - reduce resource sizes and implement progressive loading');
        }
        
        if (this.results.baseline?.resourceMetrics?.totalTransferSize > 2000000) { // 2MB
            networkAnalysis.recommendations.push('Large total resource size may cause issues on slower connections');
        }
        
        const criticalSize = this.results.criticalPath?.identifiedResources
            ?.reduce((sum, resource) => sum + (resource.size || 0), 0) || 0;
        
        if (criticalSize > 500000) { // 500KB
            networkAnalysis.recommendations.push('Critical resource size should be under 500KB for fast loading');
        }
    }
    
    /**
     * Process test results
     */
    processTestResults() {
        const hasErrors = this.issues.length > 0;
        const hasWarnings = this.warnings.length > 0;
        
        // Determine overall loading speed rating
        if (!hasErrors && !hasWarnings) {
            this.results.overall = 'fast';
        } else if (hasErrors) {
            this.results.overall = 'slow';
        } else {
            this.results.overall = 'moderate';
        }
        
        // Add performance summary
        const baseline = this.results.baseline;
        if (baseline) {
            const summary = {
                firstPaint: baseline.paintMetrics?.first_paint || null,
                firstContentfulPaint: baseline.paintMetrics?.first_contentful_paint || null,
                largestContentfulPaint: baseline.paintMetrics?.largest_contentful_paint || null,
                domContentLoaded: baseline.timing?.domContentLoadedTime || null,
                loadComplete: baseline.timing?.loadCompleteTime || null
            };
            
            this.metrics = summary;
        }
    }
    
    /**
     * Generate loading speed report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overall: this.results.overall,
            metrics: this.metrics,
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
        console.group('🚀 Loading Speed Report');
        console.log(`Loading Speed: ${this.results.overall.toUpperCase()}`);
        if (this.metrics.firstContentfulPaint) {
            console.log(`First Contentful Paint: ${this.metrics.firstContentfulPaint.toFixed(0)}ms`);
        }
        if (this.metrics.largestContentfulPaint) {
            console.log(`Largest Contentful Paint: ${this.metrics.largestContentfulPaint.toFixed(0)}ms`);
        }
        if (this.metrics.loadComplete) {
            console.log(`Load Complete: ${this.metrics.loadComplete.toFixed(0)}ms`);
        }
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
        
        // Critical path recommendations
        if (this.results.criticalPath?.recommendations) {
            recommendations.push(...this.results.criticalPath.recommendations);
        }
        
        // Resource priority recommendations
        if (this.results.resourcePriority?.recommendations) {
            recommendations.push(...this.results.resourcePriority.recommendations);
        }
        
        // Progressive loading recommendations
        if (this.results.progressiveLoading?.recommendations) {
            recommendations.push(...this.results.progressiveLoading.recommendations);
        }
        
        // Network recommendations
        if (this.results.networkTests?.recommendations) {
            recommendations.push(...this.results.networkTests.recommendations);
        }
        
        // General loading speed recommendations
        if (this.metrics.firstContentfulPaint > 1500) {
            recommendations.push('Optimize critical rendering path to improve First Contentful Paint');
        }
        
        if (this.metrics.loadComplete > 3000) {
            recommendations.push('Reduce total page load time by optimizing resource sizes and counts');
        }
        
        return [...new Set(recommendations)]; // Remove duplicates
    }
}

/**
 * Quick loading speed testing function
 */
async function testLoadingSpeed(options = {}) {
    const tester = new LoadingSpeedTester(options);
    return await tester.runLoadingSpeedTests();
}

/**
 * Initialize loading speed testing
 */
const initializeLoadingSpeedTesting = () => {
    if (typeof window !== 'undefined') {
        window.LoadingSpeedTester = LoadingSpeedTester;
        window.testLoadingSpeed = testLoadingSpeed;
        
        // Add testing button
        if (document.readyState === 'complete') {
            addLoadingSpeedTestButton();
        } else {
            window.addEventListener('load', addLoadingSpeedTestButton);
        }
    }
};

/**
 * Add loading speed test button
 */
function addLoadingSpeedTestButton() {
    const button = document.createElement('button');
    button.textContent = '🚀 Test Loading Speed';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        left: 890px;
        z-index: 10000;
        background: #17a2b8;
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
            const report = await testLoadingSpeed();
            console.log('Loading Speed Report:', report);
            
            const speed = report.overall.toUpperCase();
            const fcp = report.metrics?.firstContentfulPaint?.toFixed(0) || 'N/A';
            const lcp = report.metrics?.largestContentfulPaint?.toFixed(0) || 'N/A';
            const load = report.metrics?.loadComplete?.toFixed(0) || 'N/A';
            const summary = `Loading Speed: ${speed}\nFCP: ${fcp}ms\nLCP: ${lcp}ms\nLoad: ${load}ms\nIssues: ${report.summary.issues}\nWarnings: ${report.summary.warnings}`;
            alert(`Loading Speed Test Complete!\n\n${summary}\n\nSee console for detailed report.`);
            
        } catch (error) {
            console.error('Loading speed testing failed:', error);
            alert('Loading speed testing failed. See console for details.');
        } finally {
            button.textContent = '🚀 Test Loading Speed';
            button.disabled = false;
        }
    });
    
    document.body.appendChild(button);
}

// Auto-initialize
if (typeof module === 'undefined') {
    initializeLoadingSpeedTesting();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoadingSpeedTester, testLoadingSpeed };
}

// Export for ES6 modules
export { LoadingSpeedTester, testLoadingSpeed };