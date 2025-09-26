/**
 * Cross-Browser Compatibility Testing System
 * 
 * Tests compatibility across major browsers:
 * - Chrome, Firefox, Safari, Edge
 * - Feature detection and fallbacks
 * - CSS compatibility checks
 * - JavaScript compatibility validation
 * 
 * @version 1.0.0
 * @author Portfolio Testing Team
 */

class CrossBrowserTester {
    constructor(options = {}) {
        this.options = {
            targetBrowsers: {
                chrome: { minVersion: 90, current: null },
                firefox: { minVersion: 88, current: null },
                safari: { minVersion: 14, current: null },
                edge: { minVersion: 90, current: null }
            },
            testModernFeatures: true,
            testCSS: true,
            testJavaScript: true,
            testAPIs: true,
            ...options
        };
        
        this.browserInfo = {};
        this.results = {
            browser: null,
            features: null,
            css: null,
            javascript: null,
            apis: null,
            overall: 'pending'
        };
        
        this.issues = [];
        this.warnings = [];
        this.passes = [];
    }
    
    /**
     * Run complete cross-browser compatibility tests
     */
    async runCompatibilityTests() {
        try {
            console.log('🌍 Starting cross-browser compatibility testing...');
            
            // Detect current browser
            this.detectBrowser();
            
            // Run compatibility tests
            const testPromises = [
                this.testBrowserFeatures(),
                this.testCSSCompatibility(),
                this.testJavaScriptCompatibility(),
                this.testAPICompatibility()
            ];
            
            const results = await Promise.allSettled(testPromises);
            
            // Process results
            this.processTestResults(results);
            
            // Generate report
            const report = this.generateReport();
            
            console.log('✅ Cross-browser compatibility testing completed');
            return report;
            
        } catch (error) {
            console.error('❌ Cross-browser testing failed:', error);
            this.issues.push({
                type: 'system',
                message: error.message,
                severity: 'error'
            });
            
            return this.generateReport();
        }
    }
    
    /**
     * Detect current browser and version
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const browserInfo = {
            name: 'unknown',
            version: 'unknown',
            engine: 'unknown',
            supported: false
        };
        
        // Chrome detection
        if (/Chrome\/(\d+)/.test(userAgent) && !/Edge|Edg/.test(userAgent)) {
            const version = parseInt(userAgent.match(/Chrome\/(\d+)/)[1]);
            browserInfo.name = 'chrome';
            browserInfo.version = version;
            browserInfo.engine = 'blink';
            browserInfo.supported = version >= this.options.targetBrowsers.chrome.minVersion;
        }
        // Firefox detection
        else if (/Firefox\/(\d+)/.test(userAgent)) {
            const version = parseInt(userAgent.match(/Firefox\/(\d+)/)[1]);
            browserInfo.name = 'firefox';
            browserInfo.version = version;
            browserInfo.engine = 'gecko';
            browserInfo.supported = version >= this.options.targetBrowsers.firefox.minVersion;
        }
        // Safari detection
        else if (/Safari\//.test(userAgent) && !/Chrome|Chromium/.test(userAgent)) {
            const versionMatch = userAgent.match(/Version\/(\d+)/);
            const version = versionMatch ? parseInt(versionMatch[1]) : 0;
            browserInfo.name = 'safari';
            browserInfo.version = version;
            browserInfo.engine = 'webkit';
            browserInfo.supported = version >= this.options.targetBrowsers.safari.minVersion;
        }
        // Edge detection (new Chromium-based Edge)
        else if (/Edg\/(\d+)/.test(userAgent)) {
            const version = parseInt(userAgent.match(/Edg\/(\d+)/)[1]);
            browserInfo.name = 'edge';
            browserInfo.version = version;
            browserInfo.engine = 'blink';
            browserInfo.supported = version >= this.options.targetBrowsers.edge.minVersion;
        }
        // Legacy Edge detection
        else if (/Edge\/(\d+)/.test(userAgent)) {
            const version = parseInt(userAgent.match(/Edge\/(\d+)/)[1]);
            browserInfo.name = 'edge-legacy';
            browserInfo.version = version;
            browserInfo.engine = 'edgehtml';
            browserInfo.supported = false; // Legacy Edge not supported
        }
        
        this.browserInfo = browserInfo;
        this.results.browser = browserInfo;
        
        if (!browserInfo.supported) {
            this.warnings.push({
                type: 'browser',
                message: `Browser ${browserInfo.name} ${browserInfo.version} may not be fully supported`,
                severity: 'warning'
            });
        }
        
        console.log(`🌐 Detected: ${browserInfo.name} ${browserInfo.version} (${browserInfo.engine})`);
    }
    
    /**
     * Test browser features compatibility
     */
    async testBrowserFeatures() {
        console.log('🔧 Testing browser features...');
        
        const features = {
            es6: this.testES6Features(),
            css: this.testCSSFeatures(),
            html5: this.testHTML5Features(),
            apis: this.testWebAPIs(),
            performance: this.testPerformanceFeatures()
        };
        
        this.results.features = features;
        return features;
    }
    
    /**
     * Test ES6 JavaScript features
     */
    testES6Features() {
        const features = {
            arrow_functions: false,
            const_let: false,
            template_literals: false,
            destructuring: false,
            modules: false,
            promises: false,
            async_await: false,
            classes: false,
            map_set: false,
            spread_operator: false
        };
        
        try {
            // Test arrow functions
            eval('(() => {})');
            features.arrow_functions = true;
        } catch (e) {}
        
        try {
            // Test const/let
            eval('const a = 1; let b = 2;');
            features.const_let = true;
        } catch (e) {}
        
        try {
            // Test template literals
            eval('`template ${1} literal`');
            features.template_literals = true;
        } catch (e) {}
        
        try {
            // Test destructuring
            eval('const {a} = {a: 1}; const [b] = [1];');
            features.destructuring = true;
        } catch (e) {}
        
        // Test promises
        features.promises = typeof Promise !== 'undefined';
        
        // Test async/await
        try {
            eval('(async () => await Promise.resolve())');
            features.async_await = true;
        } catch (e) {}
        
        try {
            // Test classes
            eval('class Test {}');
            features.classes = true;
        } catch (e) {}
        
        // Test Map/Set
        features.map_set = typeof Map !== 'undefined' && typeof Set !== 'undefined';
        
        try {
            // Test spread operator
            eval('[...[], ...]');
            features.spread_operator = true;
        } catch (e) {}
        
        // Check module support
        features.modules = 'noModule' in document.createElement('script');
        
        // Log missing features
        Object.entries(features).forEach(([feature, supported]) => {
            if (!supported) {
                this.warnings.push({
                    type: 'javascript',
                    message: `ES6 feature not supported: ${feature.replace('_', ' ')}`,
                    severity: 'warning'
                });
            }
        });
        
        return features;
    }
    
    /**
     * Test CSS features
     */
    testCSSFeatures() {
        const features = {
            flexbox: false,
            grid: false,
            custom_properties: false,
            transforms: false,
            transitions: false,
            animations: false,
            media_queries: false,
            calc: false,
            viewport_units: false,
            object_fit: false
        };
        
        // Test CSS features using CSS.supports
        if (typeof CSS !== 'undefined' && CSS.supports) {
            features.flexbox = CSS.supports('display', 'flex');
            features.grid = CSS.supports('display', 'grid');
            features.custom_properties = CSS.supports('--custom-property', 'value');
            features.transforms = CSS.supports('transform', 'rotate(1deg)');
            features.transitions = CSS.supports('transition', 'all 1s');
            features.animations = CSS.supports('animation', 'test 1s');
            features.calc = CSS.supports('width', 'calc(100% - 10px)');
            features.viewport_units = CSS.supports('height', '100vh');
            features.object_fit = CSS.supports('object-fit', 'cover');
        } else {
            // Fallback feature detection
            const testDiv = document.createElement('div');
            
            testDiv.style.display = 'flex';
            features.flexbox = testDiv.style.display === 'flex';
            
            testDiv.style.display = 'grid';
            features.grid = testDiv.style.display === 'grid';
            
            features.transforms = 'transform' in testDiv.style;
            features.transitions = 'transition' in testDiv.style;
            features.animations = 'animation' in testDiv.style;
        }
        
        // Test media queries
        features.media_queries = window.matchMedia && window.matchMedia('(min-width: 1px)').matches;
        
        // Log missing features
        Object.entries(features).forEach(([feature, supported]) => {
            if (!supported) {
                this.warnings.push({
                    type: 'css',
                    message: `CSS feature not supported: ${feature.replace('_', ' ')}`,
                    severity: 'warning'
                });
            }
        });
        
        return features;
    }
    
    /**
     * Test HTML5 features
     */
    testHTML5Features() {
        const features = {
            semantic_elements: false,
            canvas: false,
            video: false,
            audio: false,
            local_storage: false,
            session_storage: false,
            history_api: false,
            geolocation: false,
            file_api: false,
            drag_drop: false
        };
        
        // Test semantic elements
        features.semantic_elements = document.createElement('section').toString() !== '[object HTMLUnknownElement]';
        
        // Test canvas
        features.canvas = !!document.createElement('canvas').getContext;
        
        // Test video/audio
        features.video = !!document.createElement('video').canPlayType;
        features.audio = !!document.createElement('audio').canPlayType;
        
        // Test storage
        features.local_storage = typeof localStorage !== 'undefined';
        features.session_storage = typeof sessionStorage !== 'undefined';
        
        // Test History API
        features.history_api = !!(window.history && window.history.pushState);
        
        // Test Geolocation
        features.geolocation = !!navigator.geolocation;
        
        // Test File API
        features.file_api = typeof FileReader !== 'undefined';
        
        // Test Drag & Drop
        features.drag_drop = 'draggable' in document.createElement('span');
        
        return features;
    }
    
    /**
     * Test Web APIs
     */
    testWebAPIs() {
        const apis = {
            fetch: typeof fetch !== 'undefined',
            intersection_observer: typeof IntersectionObserver !== 'undefined',
            mutation_observer: typeof MutationObserver !== 'undefined',
            performance_observer: typeof PerformanceObserver !== 'undefined',
            service_worker: 'serviceWorker' in navigator,
            web_workers: typeof Worker !== 'undefined',
            websockets: typeof WebSocket !== 'undefined',
            webrtc: typeof RTCPeerConnection !== 'undefined',
            notifications: 'Notification' in window,
            vibration: 'vibrate' in navigator
        };
        
        // Log missing APIs
        Object.entries(apis).forEach(([api, supported]) => {
            if (!supported) {
                this.warnings.push({
                    type: 'api',
                    message: `Web API not supported: ${api.replace('_', ' ')}`,
                    severity: 'warning'
                });
            }
        });
        
        return apis;
    }
    
    /**
     * Test performance features
     */
    testPerformanceFeatures() {
        return {
            performance_now: typeof performance !== 'undefined' && 'now' in performance,
            performance_timing: typeof performance !== 'undefined' && 'timing' in performance,
            performance_navigation: typeof performance !== 'undefined' && 'navigation' in performance,
            user_timing: typeof performance !== 'undefined' && 'mark' in performance,
            resource_timing: typeof performance !== 'undefined' && 'getEntriesByType' in performance,
            request_idle_callback: typeof requestIdleCallback !== 'undefined'
        };
    }
    
    /**
     * Test CSS compatibility
     */
    async testCSSCompatibility() {
        console.log('🎨 Testing CSS compatibility...');
        
        const compatibilityIssues = [];
        
        // Check for vendor prefixes needed
        const prefixTests = [
            { property: 'transform', prefixes: ['-webkit-', '-moz-', '-ms-'] },
            { property: 'transition', prefixes: ['-webkit-', '-moz-', '-ms-'] },
            { property: 'animation', prefixes: ['-webkit-', '-moz-', '-ms-'] },
            { property: 'box-shadow', prefixes: ['-webkit-', '-moz-'] },
            { property: 'border-radius', prefixes: ['-webkit-', '-moz-'] },
            { property: 'user-select', prefixes: ['-webkit-', '-moz-', '-ms-'] }
        ];
        
        prefixTests.forEach(test => {
            const testDiv = document.createElement('div');
            const needsPrefix = !(test.property in testDiv.style);
            
            if (needsPrefix) {
                let hasPrefix = false;
                test.prefixes.forEach(prefix => {
                    if ((prefix + test.property) in testDiv.style) {
                        hasPrefix = true;
                    }
                });
                
                if (!hasPrefix) {
                    compatibilityIssues.push({
                        type: 'css-property',
                        property: test.property,
                        message: `CSS property '${test.property}' not supported`,
                        severity: 'error'
                    });
                }
            }
        });
        
        this.results.css = { issues: compatibilityIssues };
        
        compatibilityIssues.forEach(issue => {
            this.issues.push(issue);
        });
        
        return { issues: compatibilityIssues };
    }
    
    /**
     * Test JavaScript compatibility
     */
    async testJavaScriptCompatibility() {
        console.log('⚡ Testing JavaScript compatibility...');
        
        const compatibilityIssues = [];
        
        // Test for common polyfill needs
        const polyfillTests = [
            { name: 'Array.prototype.includes', test: () => [].includes },
            { name: 'Array.prototype.find', test: () => [].find },
            { name: 'Array.prototype.findIndex', test: () => [].findIndex },
            { name: 'Object.assign', test: () => Object.assign },
            { name: 'String.prototype.includes', test: () => ''.includes },
            { name: 'String.prototype.startsWith', test: () => ''.startsWith },
            { name: 'String.prototype.endsWith', test: () => ''.endsWith },
            { name: 'Number.isNaN', test: () => Number.isNaN }
        ];
        
        polyfillTests.forEach(test => {
            try {
                if (!test.test()) {
                    compatibilityIssues.push({
                        type: 'polyfill-needed',
                        method: test.name,
                        message: `Method '${test.name}' not available, polyfill needed`,
                        severity: 'warning'
                    });
                }
            } catch (e) {
                compatibilityIssues.push({
                    type: 'polyfill-needed',
                    method: test.name,
                    message: `Method '${test.name}' not available, polyfill needed`,
                    severity: 'warning'
                });
            }
        });
        
        this.results.javascript = { issues: compatibilityIssues };
        
        compatibilityIssues.forEach(issue => {
            this.warnings.push(issue);
        });
        
        return { issues: compatibilityIssues };
    }
    
    /**
     * Test API compatibility
     */
    async testAPICompatibility() {
        console.log('📡 Testing API compatibility...');
        
        const apiIssues = [];
        
        // Critical APIs for the portfolio
        const criticalAPIs = [
            { name: 'fetch', available: typeof fetch !== 'undefined', fallback: 'XMLHttpRequest' },
            { name: 'IntersectionObserver', available: typeof IntersectionObserver !== 'undefined', fallback: 'scroll events' },
            { name: 'requestAnimationFrame', available: typeof requestAnimationFrame !== 'undefined', fallback: 'setTimeout' },
            { name: 'localStorage', available: typeof localStorage !== 'undefined', fallback: 'cookies or memory storage' },
            { name: 'addEventListener', available: typeof document.addEventListener !== 'undefined', fallback: 'attachEvent' }
        ];
        
        criticalAPIs.forEach(api => {
            if (!api.available) {
                apiIssues.push({
                    type: 'api-unavailable',
                    api: api.name,
                    message: `API '${api.name}' not available, consider ${api.fallback} fallback`,
                    severity: api.fallback ? 'warning' : 'error'
                });
            }
        });
        
        this.results.apis = { issues: apiIssues };
        
        apiIssues.forEach(issue => {
            if (issue.severity === 'error') {
                this.issues.push(issue);
            } else {
                this.warnings.push(issue);
            }
        });
        
        return { issues: apiIssues };
    }
    
    /**
     * Process test results
     */
    processTestResults(results) {
        const hasErrors = this.issues.length > 0;
        const hasWarnings = this.warnings.length > 0;
        
        if (!hasErrors && !hasWarnings) {
            this.results.overall = 'compatible';
        } else if (hasErrors) {
            this.results.overall = 'incompatible';
        } else {
            this.results.overall = 'mostly-compatible';
        }
    }
    
    /**
     * Generate compatibility report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            browser: this.browserInfo,
            overall: this.results.overall,
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
        console.group('🌍 Cross-Browser Compatibility Report');
        console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`);
        console.log(`Compatibility: ${this.results.overall.toUpperCase()}`);
        console.log(`Issues: ${this.issues.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.groupEnd();
        
        return report;
    }
    
    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.browserInfo.name === 'edge-legacy') {
            recommendations.push('Consider dropping support for legacy Edge and encourage users to upgrade to modern Edge');
        }
        
        if (!this.results.features?.es6?.promises) {
            recommendations.push('Add Promise polyfill for better compatibility');
        }
        
        if (!this.results.features?.css?.flexbox) {
            recommendations.push('Add flexbox fallbacks or polyfill');
        }
        
        if (this.warnings.some(w => w.type === 'polyfill-needed')) {
            recommendations.push('Consider adding core-js or similar polyfill library');
        }
        
        if (this.warnings.some(w => w.type === 'api')) {
            recommendations.push('Implement progressive enhancement with fallbacks for unsupported APIs');
        }
        
        return recommendations;
    }
}

/**
 * Quick compatibility testing function
 */
async function testBrowserCompatibility(options = {}) {
    const tester = new CrossBrowserTester(options);
    return await tester.runCompatibilityTests();
}

/**
 * Initialize cross-browser testing
 */
const initializeCrossBrowserTesting = () => {
    if (typeof window !== 'undefined') {
        window.CrossBrowserTester = CrossBrowserTester;
        window.testBrowserCompatibility = testBrowserCompatibility;
        
        // Add testing button
        if (document.readyState === 'complete') {
            addCompatibilityTestButton();
        } else {
            window.addEventListener('load', addCompatibilityTestButton);
        }
    }
};

/**
 * Add cross-browser test button
 */
function addCompatibilityTestButton() {
    const button = document.createElement('button');
    button.textContent = '🌍 Test Browser';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        left: 420px;
        z-index: 10000;
        background: #fd7e14;
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
            const report = await testBrowserCompatibility();
            console.log('Browser Compatibility Report:', report);
            
            const status = report.overall.toUpperCase();
            const browser = `${report.browser.name} ${report.browser.version}`;
            const summary = `Browser: ${browser}\nCompatibility: ${status}\nIssues: ${report.summary.issues}\nWarnings: ${report.summary.warnings}`;
            alert(`Browser Compatibility Test Complete!\n\n${summary}\n\nSee console for detailed report.`);
            
        } catch (error) {
            console.error('Browser compatibility testing failed:', error);
            alert('Browser compatibility testing failed. See console for details.');
        } finally {
            button.textContent = '🌍 Test Browser';
            button.disabled = false;
        }
    });
    
    document.body.appendChild(button);
}

// Auto-initialize
if (typeof module === 'undefined') {
    initializeCrossBrowserTesting();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CrossBrowserTester, testBrowserCompatibility };
}

// Export for ES6 modules
export { CrossBrowserTester, testBrowserCompatibility };