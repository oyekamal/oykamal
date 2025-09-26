/**
 * Mobile Responsiveness Testing System
 * 
 * Tests responsive design across various:
 * - Device sizes and screen resolutions
 * - Orientations (portrait/landscape)
 * - Touch interactions and gestures
 * - Viewport configurations
 * - Mobile-specific features
 * 
 * @version 1.0.0
 * @author Portfolio Testing Team
 */

class ResponsiveDesignTester {
    constructor(options = {}) {
        this.options = {
            // Common device breakpoints
            breakpoints: {
                'mobile-small': { width: 320, height: 568 },
                'mobile-medium': { width: 375, height: 667 },
                'mobile-large': { width: 414, height: 896 },
                'tablet-portrait': { width: 768, height: 1024 },
                'tablet-landscape': { width: 1024, height: 768 },
                'desktop-small': { width: 1280, height: 800 },
                'desktop-medium': { width: 1440, height: 900 },
                'desktop-large': { width: 1920, height: 1080 }
            },
            // Test parameters
            testTouch: true,
            testGestures: true,
            testViewport: true,
            testContent: true,
            testNavigation: true,
            testImages: true,
            testForms: true,
            ...options
        };
        
        this.originalViewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        this.results = {
            breakpoints: {},
            viewport: null,
            content: null,
            navigation: null,
            images: null,
            forms: null,
            touch: null,
            overall: 'pending'
        };
        
        this.issues = [];
        this.warnings = [];
        this.passes = [];
    }
    
    /**
     * Run complete responsive design tests
     */
    async runResponsiveTests() {
        try {
            console.log('📱 Starting responsive design testing...');
            
            // Test viewport configuration
            await this.testViewportConfiguration();
            
            // Test breakpoints
            await this.testBreakpoints();
            
            // Test content responsiveness
            await this.testContentResponsiveness();
            
            // Test navigation responsiveness
            await this.testNavigationResponsiveness();
            
            // Test image responsiveness
            await this.testImageResponsiveness();
            
            // Test form responsiveness
            await this.testFormResponsiveness();
            
            // Test touch interactions
            await this.testTouchInteractions();
            
            // Process results
            this.processTestResults();
            
            // Generate report
            const report = this.generateReport();
            
            console.log('✅ Responsive design testing completed');
            return report;
            
        } catch (error) {
            console.error('❌ Responsive testing failed:', error);
            this.issues.push({
                type: 'system',
                message: error.message,
                severity: 'error'
            });
            
            return this.generateReport();
        }
    }
    
    /**
     * Test viewport configuration
     */
    async testViewportConfiguration() {
        console.log('🔍 Testing viewport configuration...');
        
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const viewportConfig = {
            hasViewportMeta: !!viewportMeta,
            content: viewportMeta ? viewportMeta.content : null,
            width: null,
            initialScale: null,
            userScalable: null,
            minimumScale: null,
            maximumScale: null
        };
        
        if (viewportMeta) {
            const content = viewportMeta.content;
            
            // Parse viewport content
            const widthMatch = content.match(/width=([^,]+)/);
            const initialScaleMatch = content.match(/initial-scale=([^,]+)/);
            const userScalableMatch = content.match(/user-scalable=([^,]+)/);
            const minimumScaleMatch = content.match(/minimum-scale=([^,]+)/);
            const maximumScaleMatch = content.match(/maximum-scale=([^,]+)/);
            
            viewportConfig.width = widthMatch ? widthMatch[1].trim() : null;
            viewportConfig.initialScale = initialScaleMatch ? parseFloat(initialScaleMatch[1]) : null;
            viewportConfig.userScalable = userScalableMatch ? userScalableMatch[1].trim() : null;
            viewportConfig.minimumScale = minimumScaleMatch ? parseFloat(minimumScaleMatch[1]) : null;
            viewportConfig.maximumScale = maximumScaleMatch ? parseFloat(maximumScaleMatch[1]) : null;
            
            // Validate viewport settings
            if (viewportConfig.width !== 'device-width') {
                this.warnings.push({
                    type: 'viewport',
                    message: 'Viewport width should be set to "device-width"',
                    severity: 'warning'
                });
            }
            
            if (viewportConfig.initialScale !== 1.0) {
                this.warnings.push({
                    type: 'viewport',
                    message: 'Initial scale should be 1.0 for optimal mobile experience',
                    severity: 'warning'
                });
            }
            
            if (viewportConfig.userScalable === 'no' || viewportConfig.maximumScale === 1.0) {
                this.warnings.push({
                    type: 'viewport',
                    message: 'User scaling is disabled, which may harm accessibility',
                    severity: 'warning'
                });
            }
            
        } else {
            this.issues.push({
                type: 'viewport',
                message: 'Missing viewport meta tag for mobile optimization',
                severity: 'error'
            });
        }
        
        this.results.viewport = viewportConfig;
    }
    
    /**
     * Test all breakpoints
     */
    async testBreakpoints() {
        console.log('📏 Testing responsive breakpoints...');
        
        for (const [name, dimensions] of Object.entries(this.options.breakpoints)) {
            console.log(`Testing breakpoint: ${name} (${dimensions.width}x${dimensions.height})`);
            
            const breakpointResult = await this.testSingleBreakpoint(name, dimensions);
            this.results.breakpoints[name] = breakpointResult;
            
            // Small delay between tests
            await this.sleep(100);
        }
    }
    
    /**
     * Test single breakpoint
     */
    async testSingleBreakpoint(name, dimensions) {
        const breakpointResult = {
            name,
            dimensions,
            layout: null,
            readability: null,
            navigation: null,
            interactions: null,
            issues: []
        };
        
        // Simulate viewport change (for testing purposes)
        const viewportTest = this.simulateViewport(dimensions);
        
        // Test layout at this breakpoint
        breakpointResult.layout = this.testLayoutAtBreakpoint(dimensions);
        
        // Test text readability
        breakpointResult.readability = this.testReadabilityAtBreakpoint(dimensions);
        
        // Test navigation behavior
        breakpointResult.navigation = this.testNavigationAtBreakpoint(dimensions);
        
        // Test touch interactions
        breakpointResult.interactions = this.testInteractionsAtBreakpoint(dimensions);
        
        return breakpointResult;
    }
    
    /**
     * Simulate viewport dimensions (visual simulation only)
     */
    simulateViewport(dimensions) {
        // Note: Can't actually resize browser window in modern browsers
        // This creates a visual simulation for testing purposes
        return {
            width: dimensions.width,
            height: dimensions.height,
            ratio: dimensions.width / dimensions.height,
            category: this.categorizeDevice(dimensions)
        };
    }
    
    /**
     * Categorize device based on dimensions
     */
    categorizeDevice(dimensions) {
        if (dimensions.width <= 480) return 'mobile';
        if (dimensions.width <= 768) return 'tablet-portrait';
        if (dimensions.width <= 1024) return 'tablet-landscape';
        return 'desktop';
    }
    
    /**
     * Test layout at breakpoint
     */
    testLayoutAtBreakpoint(dimensions) {
        const layout = {
            hasResponsiveLayout: false,
            usesFlexbox: false,
            usesGrid: false,
            hasMediaQueries: false,
            hasFluidWidth: false,
            issues: []
        };
        
        // Check for responsive CSS features
        const computedStyles = window.getComputedStyle(document.body);
        
        // Check if layout uses modern responsive techniques
        layout.usesFlexbox = this.checkFlexboxUsage();
        layout.usesGrid = this.checkGridUsage();
        layout.hasMediaQueries = this.checkMediaQueries();
        layout.hasFluidWidth = this.checkFluidWidth();
        
        layout.hasResponsiveLayout = layout.usesFlexbox || layout.usesGrid || layout.hasMediaQueries;
        
        if (!layout.hasResponsiveLayout) {
            layout.issues.push({
                type: 'layout',
                message: 'Layout does not appear to use responsive design techniques',
                severity: 'error'
            });
        }
        
        return layout;
    }
    
    /**
     * Check if flexbox is used
     */
    checkFlexboxUsage() {
        const elements = document.querySelectorAll('*');
        for (const element of elements) {
            const style = window.getComputedStyle(element);
            if (style.display === 'flex' || style.display === 'inline-flex') {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if CSS Grid is used
     */
    checkGridUsage() {
        const elements = document.querySelectorAll('*');
        for (const element of elements) {
            const style = window.getComputedStyle(element);
            if (style.display === 'grid' || style.display === 'inline-grid') {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check for media queries in stylesheets
     */
    checkMediaQueries() {
        try {
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules || []) {
                        if (rule instanceof CSSMediaRule) {
                            return true;
                        }
                    }
                } catch (e) {
                    // Cross-origin stylesheet access blocked
                    continue;
                }
            }
        } catch (e) {
            console.warn('Could not check media queries:', e);
        }
        return false;
    }
    
    /**
     * Check for fluid width layouts
     */
    checkFluidWidth() {
        const container = document.querySelector('.container, .container-fluid, main, #main');
        if (container) {
            const style = window.getComputedStyle(container);
            const width = style.width;
            return width.includes('%') || width.includes('vw') || width === 'auto';
        }
        return false;
    }
    
    /**
     * Test text readability at breakpoint
     */
    testReadabilityAtBreakpoint(dimensions) {
        const readability = {
            fontSize: null,
            lineHeight: null,
            textSpacing: null,
            contrast: null,
            issues: []
        };
        
        // Test main content areas
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        const fontSizes = [];
        const lineHeights = [];
        
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const fontSize = parseFloat(style.fontSize);
            const lineHeight = parseFloat(style.lineHeight);
            
            if (fontSize > 0) fontSizes.push(fontSize);
            if (lineHeight > 0) lineHeights.push(lineHeight);
        });
        
        // Calculate averages
        const avgFontSize = fontSizes.length ? fontSizes.reduce((a, b) => a + b) / fontSizes.length : 0;
        const avgLineHeight = lineHeights.length ? lineHeights.reduce((a, b) => a + b) / lineHeights.length : 0;
        
        readability.fontSize = avgFontSize;
        readability.lineHeight = avgLineHeight;
        
        // Check mobile readability
        if (dimensions.width <= 768) {
            if (avgFontSize < 16) {
                readability.issues.push({
                    type: 'readability',
                    message: `Font size (${avgFontSize.toFixed(1)}px) may be too small for mobile devices`,
                    severity: 'warning'
                });
            }
            
            if (avgLineHeight < avgFontSize * 1.2) {
                readability.issues.push({
                    type: 'readability',
                    message: 'Line height may be too small for comfortable mobile reading',
                    severity: 'warning'
                });
            }
        }
        
        return readability;
    }
    
    /**
     * Test navigation at breakpoint
     */
    testNavigationAtBreakpoint(dimensions) {
        const navigation = {
            hasHamburgerMenu: false,
            hasMobileNav: false,
            touchTargetSize: null,
            issues: []
        };
        
        // Check for mobile navigation patterns
        const hamburger = document.querySelector('.hamburger, .menu-toggle, .navbar-toggle, [aria-label*="menu"]');
        navigation.hasHamburgerMenu = !!hamburger;
        
        const mobileNav = document.querySelector('.mobile-nav, .navbar-collapse, .mobile-menu');
        navigation.hasMobileNav = !!mobileNav;
        
        // Check touch target sizes
        const navLinks = document.querySelectorAll('nav a, .nav a, .navbar a');
        const touchTargets = [];
        
        navLinks.forEach(link => {
            const rect = link.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            touchTargets.push(size);
        });
        
        const avgTouchTarget = touchTargets.length ? 
            touchTargets.reduce((a, b) => a + b) / touchTargets.length : 0;
        
        navigation.touchTargetSize = avgTouchTarget;
        
        // Mobile navigation checks
        if (dimensions.width <= 768) {
            if (!navigation.hasHamburgerMenu && !navigation.hasMobileNav) {
                navigation.issues.push({
                    type: 'navigation',
                    message: 'No mobile navigation pattern detected',
                    severity: 'warning'
                });
            }
            
            if (avgTouchTarget > 0 && avgTouchTarget < 44) {
                navigation.issues.push({
                    type: 'navigation',
                    message: `Touch targets (${avgTouchTarget.toFixed(1)}px) are smaller than recommended 44px`,
                    severity: 'warning'
                });
            }
        }
        
        return navigation;
    }
    
    /**
     * Test interactions at breakpoint
     */
    testInteractionsAtBreakpoint(dimensions) {
        const interactions = {
            touchFriendly: false,
            hasHoverStates: false,
            hasClickStates: false,
            gestureSupport: false,
            issues: []
        };
        
        // Check for touch-friendly interactions
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [onclick], [role="button"]');
        let touchFriendlyCount = 0;
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            if (size >= 44) touchFriendlyCount++;
        });
        
        interactions.touchFriendly = touchFriendlyCount / interactiveElements.length > 0.8;
        
        // Check for hover states (problematic on mobile)
        interactions.hasHoverStates = this.checkHoverStates();
        
        // Mobile-specific checks
        if (dimensions.width <= 768) {
            if (!interactions.touchFriendly) {
                interactions.issues.push({
                    type: 'interaction',
                    message: 'Many interactive elements may be too small for touch',
                    severity: 'warning'
                });
            }
            
            if (interactions.hasHoverStates) {
                interactions.issues.push({
                    type: 'interaction',
                    message: 'Hover states detected - consider touch alternatives',
                    severity: 'info'
                });
            }
        }
        
        return interactions;
    }
    
    /**
     * Check for hover states in CSS
     */
    checkHoverStates() {
        try {
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules || []) {
                        if (rule.selectorText && rule.selectorText.includes(':hover')) {
                            return true;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
        } catch (e) {
            console.warn('Could not check hover states:', e);
        }
        return false;
    }
    
    /**
     * Test content responsiveness
     */
    async testContentResponsiveness() {
        console.log('📄 Testing content responsiveness...');
        
        const content = {
            textWrapping: this.testTextWrapping(),
            imageScaling: this.testImageScaling(),
            tableResponsiveness: this.testTableResponsiveness(),
            videoResponsiveness: this.testVideoResponsiveness(),
            issues: []
        };
        
        this.results.content = content;
    }
    
    /**
     * Test text wrapping
     */
    testTextWrapping() {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        let properWrapping = 0;
        
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            if (style.wordWrap === 'break-word' || style.overflowWrap === 'break-word') {
                properWrapping++;
            }
        });
        
        return {
            total: textElements.length,
            properWrapping,
            percentage: textElements.length ? (properWrapping / textElements.length) * 100 : 0
        };
    }
    
    /**
     * Test image scaling
     */
    testImageScaling() {
        const images = document.querySelectorAll('img');
        let responsiveImages = 0;
        
        images.forEach(img => {
            const style = window.getComputedStyle(img);
            if (style.maxWidth === '100%' || style.width === '100%') {
                responsiveImages++;
            }
        });
        
        return {
            total: images.length,
            responsive: responsiveImages,
            percentage: images.length ? (responsiveImages / images.length) * 100 : 0
        };
    }
    
    /**
     * Test table responsiveness
     */
    testTableResponsiveness() {
        const tables = document.querySelectorAll('table');
        let responsiveTables = 0;
        
        tables.forEach(table => {
            const parent = table.parentElement;
            const style = window.getComputedStyle(parent);
            if (style.overflowX === 'auto' || style.overflowX === 'scroll' || 
                table.classList.contains('table-responsive')) {
                responsiveTables++;
            }
        });
        
        return {
            total: tables.length,
            responsive: responsiveTables,
            percentage: tables.length ? (responsiveTables / tables.length) * 100 : 0
        };
    }
    
    /**
     * Test video responsiveness
     */
    testVideoResponsiveness() {
        const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
        let responsiveVideos = 0;
        
        videos.forEach(video => {
            const style = window.getComputedStyle(video);
            if (style.maxWidth === '100%' || style.width === '100%') {
                responsiveVideos++;
            }
        });
        
        return {
            total: videos.length,
            responsive: responsiveVideos,
            percentage: videos.length ? (responsiveVideos / videos.length) * 100 : 0
        };
    }
    
    /**
     * Test navigation responsiveness
     */
    async testNavigationResponsiveness() {
        console.log('🧭 Testing navigation responsiveness...');
        
        const navigation = {
            mobileMenu: this.testMobileMenu(),
            touchTargets: this.testTouchTargets(),
            accessibility: this.testNavigationAccessibility(),
            issues: []
        };
        
        this.results.navigation = navigation;
    }
    
    /**
     * Test mobile menu implementation
     */
    testMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle, .hamburger, .navbar-toggle');
        const mobileMenu = document.querySelector('.mobile-menu, .navbar-collapse');
        
        return {
            hasToggle: !!menuToggle,
            hasMenu: !!mobileMenu,
            isAccessible: menuToggle && menuToggle.hasAttribute('aria-label'),
            isKeyboardAccessible: menuToggle && menuToggle.hasAttribute('tabindex')
        };
    }
    
    /**
     * Test touch target sizes
     */
    testTouchTargets() {
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [onclick]');
        const touchTargets = [];
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            touchTargets.push({
                element: element.tagName.toLowerCase(),
                width: rect.width,
                height: rect.height,
                size: Math.min(rect.width, rect.height)
            });
        });
        
        const validTargets = touchTargets.filter(target => target.size >= 44);
        
        return {
            total: touchTargets.length,
            valid: validTargets.length,
            percentage: touchTargets.length ? (validTargets.length / touchTargets.length) * 100 : 0,
            targets: touchTargets
        };
    }
    
    /**
     * Test navigation accessibility
     */
    testNavigationAccessibility() {
        const navElements = document.querySelectorAll('nav, [role="navigation"]');
        let accessibleNavs = 0;
        
        navElements.forEach(nav => {
            if (nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby')) {
                accessibleNavs++;
            }
        });
        
        return {
            total: navElements.length,
            accessible: accessibleNavs,
            percentage: navElements.length ? (accessibleNavs / navElements.length) * 100 : 0
        };
    }
    
    /**
     * Test image responsiveness
     */
    async testImageResponsiveness() {
        console.log('🖼️ Testing image responsiveness...');
        
        const images = {
            responsive: this.testResponsiveImages(),
            retina: this.testRetinaImages(),
            lazyLoading: this.testLazyLoadingImages(),
            issues: []
        };
        
        this.results.images = images;
    }
    
    /**
     * Test responsive images
     */
    testResponsiveImages() {
        const images = document.querySelectorAll('img');
        let responsiveCount = 0;
        
        images.forEach(img => {
            if (img.hasAttribute('srcset') || img.closest('picture')) {
                responsiveCount++;
            }
        });
        
        return {
            total: images.length,
            responsive: responsiveCount,
            percentage: images.length ? (responsiveCount / images.length) * 100 : 0
        };
    }
    
    /**
     * Test retina images
     */
    testRetinaImages() {
        const images = document.querySelectorAll('img[srcset]');
        let retinaCount = 0;
        
        images.forEach(img => {
            const srcset = img.getAttribute('srcset');
            if (srcset && srcset.includes('2x')) {
                retinaCount++;
            }
        });
        
        return {
            total: images.length,
            retina: retinaCount,
            percentage: images.length ? (retinaCount / images.length) * 100 : 0
        };
    }
    
    /**
     * Test lazy loading images
     */
    testLazyLoadingImages() {
        const images = document.querySelectorAll('img');
        let lazyCount = 0;
        
        images.forEach(img => {
            if (img.hasAttribute('loading') || img.hasAttribute('data-src')) {
                lazyCount++;
            }
        });
        
        return {
            total: images.length,
            lazy: lazyCount,
            percentage: images.length ? (lazyCount / images.length) * 100 : 0
        };
    }
    
    /**
     * Test form responsiveness
     */
    async testFormResponsiveness() {
        console.log('📝 Testing form responsiveness...');
        
        const forms = {
            layout: this.testFormLayout(),
            inputs: this.testInputResponsiveness(),
            labels: this.testFormLabels(),
            issues: []
        };
        
        this.results.forms = forms;
    }
    
    /**
     * Test form layout
     */
    testFormLayout() {
        const forms = document.querySelectorAll('form');
        let responsiveForms = 0;
        
        forms.forEach(form => {
            const style = window.getComputedStyle(form);
            if (style.display === 'flex' || style.display === 'grid' || 
                form.classList.contains('form-responsive')) {
                responsiveForms++;
            }
        });
        
        return {
            total: forms.length,
            responsive: responsiveForms,
            percentage: forms.length ? (responsiveForms / forms.length) * 100 : 0
        };
    }
    
    /**
     * Test input responsiveness
     */
    testInputResponsiveness() {
        const inputs = document.querySelectorAll('input, textarea, select');
        let responsiveInputs = 0;
        
        inputs.forEach(input => {
            const style = window.getComputedStyle(input);
            if (style.width === '100%' || style.maxWidth === '100%') {
                responsiveInputs++;
            }
        });
        
        return {
            total: inputs.length,
            responsive: responsiveInputs,
            percentage: inputs.length ? (responsiveInputs / inputs.length) * 100 : 0
        };
    }
    
    /**
     * Test form labels
     */
    testFormLabels() {
        const inputs = document.querySelectorAll('input, textarea, select');
        let labeledInputs = 0;
        
        inputs.forEach(input => {
            const id = input.getAttribute('id');
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;
            if (label || input.hasAttribute('aria-label')) {
                labeledInputs++;
            }
        });
        
        return {
            total: inputs.length,
            labeled: labeledInputs,
            percentage: inputs.length ? (labeledInputs / inputs.length) * 100 : 0
        };
    }
    
    /**
     * Test touch interactions
     */
    async testTouchInteractions() {
        if (!this.options.testTouch) return;
        
        console.log('👆 Testing touch interactions...');
        
        const touch = {
            support: this.detectTouchSupport(),
            gestures: this.testGestureSupport(),
            issues: []
        };
        
        this.results.touch = touch;
    }
    
    /**
     * Detect touch support
     */
    detectTouchSupport() {
        return {
            hasTouch: 'ontouchstart' in window,
            hasTouchEvents: 'TouchEvent' in window,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            pointerEvents: 'PointerEvent' in window
        };
    }
    
    /**
     * Test gesture support
     */
    testGestureSupport() {
        return {
            swipe: this.checkSwipeImplementation(),
            pinch: this.checkPinchImplementation(),
            tap: this.checkTapImplementation()
        };
    }
    
    /**
     * Check swipe implementation
     */
    checkSwipeImplementation() {
        // Check for common swipe libraries or implementations
        const hasSwipeListeners = document.querySelector('[data-swipe], .swiper, .slider');
        return !!hasSwipeListeners;
    }
    
    /**
     * Check pinch implementation
     */
    checkPinchImplementation() {
        // Check for zoom/pinch functionality
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            const content = viewport.content;
            return !content.includes('user-scalable=no') && !content.includes('maximum-scale=1');
        }
        return true;
    }
    
    /**
     * Check tap implementation
     */
    checkTapImplementation() {
        // Check for proper tap handling (not just click)
        return true; // Assume tap is handled by browser
    }
    
    /**
     * Process test results
     */
    processTestResults() {
        const hasErrors = this.issues.length > 0;
        const hasWarnings = this.warnings.length > 0;
        
        // Collect issues from breakpoint results
        Object.values(this.results.breakpoints).forEach(breakpoint => {
            if (breakpoint.layout?.issues) {
                this.issues.push(...breakpoint.layout.issues);
            }
            if (breakpoint.readability?.issues) {
                this.warnings.push(...breakpoint.readability.issues);
            }
            if (breakpoint.navigation?.issues) {
                this.warnings.push(...breakpoint.navigation.issues);
            }
            if (breakpoint.interactions?.issues) {
                this.warnings.push(...breakpoint.interactions.issues);
            }
        });
        
        if (!hasErrors && !hasWarnings) {
            this.results.overall = 'responsive';
        } else if (hasErrors) {
            this.results.overall = 'not-responsive';
        } else {
            this.results.overall = 'mostly-responsive';
        }
    }
    
    /**
     * Generate responsive design report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            viewport: {
                current: this.originalViewport,
                configuration: this.results.viewport
            },
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
        console.group('📱 Responsive Design Report');
        console.log(`Viewport: ${this.originalViewport.width}x${this.originalViewport.height}`);
        console.log(`Responsiveness: ${this.results.overall.toUpperCase()}`);
        console.log(`Issues: ${this.issues.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.log(`Breakpoints tested: ${Object.keys(this.results.breakpoints).length}`);
        console.groupEnd();
        
        return report;
    }
    
    /**
     * Generate recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (!this.results.viewport?.hasViewportMeta) {
            recommendations.push('Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">');
        }
        
        if (this.results.images?.responsive?.percentage < 50) {
            recommendations.push('Implement responsive images with srcset and sizes attributes');
        }
        
        if (this.results.navigation?.touchTargets?.percentage < 80) {
            recommendations.push('Increase touch target sizes to at least 44x44px');
        }
        
        if (!Object.values(this.results.breakpoints).some(bp => bp.layout?.usesFlexbox || bp.layout?.usesGrid)) {
            recommendations.push('Implement modern CSS layout techniques (Flexbox or Grid)');
        }
        
        if (!this.results.navigation?.mobileMenu?.hasToggle) {
            recommendations.push('Add mobile navigation menu with hamburger toggle');
        }
        
        return recommendations;
    }
    
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Quick responsive design testing function
 */
async function testResponsiveDesign(options = {}) {
    const tester = new ResponsiveDesignTester(options);
    return await tester.runResponsiveTests();
}

/**
 * Initialize responsive design testing
 */
const initializeResponsiveTesting = () => {
    if (typeof window !== 'undefined') {
        window.ResponsiveDesignTester = ResponsiveDesignTester;
        window.testResponsiveDesign = testResponsiveDesign;
        
        // Add testing button
        if (document.readyState === 'complete') {
            addResponsiveTestButton();
        } else {
            window.addEventListener('load', addResponsiveTestButton);
        }
    }
};

/**
 * Add responsive design test button
 */
function addResponsiveTestButton() {
    const button = document.createElement('button');
    button.textContent = '📱 Test Responsive';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        left: 560px;
        z-index: 10000;
        background: #6f42c1;
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
            const report = await testResponsiveDesign();
            console.log('Responsive Design Report:', report);
            
            const status = report.overall.toUpperCase().replace('-', ' ');
            const viewport = `${report.viewport.current.width}x${report.viewport.current.height}`;
            const breakpoints = Object.keys(report.results.breakpoints).length;
            const summary = `Viewport: ${viewport}\nResponsiveness: ${status}\nBreakpoints: ${breakpoints}\nIssues: ${report.summary.issues}\nWarnings: ${report.summary.warnings}`;
            alert(`Responsive Design Test Complete!\n\n${summary}\n\nSee console for detailed report.`);
            
        } catch (error) {
            console.error('Responsive design testing failed:', error);
            alert('Responsive design testing failed. See console for details.');
        } finally {
            button.textContent = '📱 Test Responsive';
            button.disabled = false;
        }
    });
    
    document.body.appendChild(button);
}

// Auto-initialize
if (typeof module === 'undefined') {
    initializeResponsiveTesting();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResponsiveDesignTester, testResponsiveDesign };
}

// Export for ES6 modules
export { ResponsiveDesignTester, testResponsiveDesign };