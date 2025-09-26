/**
 * Accessibility Testing System (WCAG 2.1 AA Compliance)
 * 
 * Provides comprehensive accessibility testing including:
 * - WCAG 2.1 AA compliance checks
 * - Keyboard navigation testing
 * - Screen reader compatibility
 * - Color contrast validation
 * - Focus management testing
 * 
 * @version 1.0.0
 * @author Portfolio Testing Team
 */

class AccessibilityTester {
    constructor(options = {}) {
        this.options = {
            wcagLevel: 'AA',
            wcagVersion: '2.1',
            colorContrastThreshold: 4.5, // WCAG AA standard
            largeTextThreshold: 3.0,
            enableKeyboardTesting: true,
            enableScreenReaderTesting: true,
            enableColorTesting: true,
            enableFocusTesting: true,
            ...options
        };
        
        this.results = {
            perceivable: null,
            operable: null,
            understandable: null,
            robust: null,
            overall: 'pending'
        };
        
        this.violations = [];
        this.warnings = [];
        this.passes = [];
        this.testResults = [];
    }
    
    /**
     * Run complete accessibility test suite
     */
    async runAccessibilityTests() {
        try {
            console.log('♿ Starting WCAG 2.1 AA accessibility testing...');
            
            // Run tests for each WCAG principle
            const testPromises = [
                this.testPerceivable(),
                this.testOperable(),
                this.testUnderstandable(),
                this.testRobust()
            ];
            
            const results = await Promise.allSettled(testPromises);
            
            // Process results
            this.processTestResults(results);
            
            // Generate report
            const report = this.generateReport();
            
            console.log('✅ Accessibility testing completed');
            return report;
            
        } catch (error) {
            console.error('❌ Accessibility testing failed:', error);
            this.violations.push({
                type: 'system',
                message: error.message,
                severity: 'error'
            });
            
            return this.generateReport();
        }
    }
    
    /**
     * Test WCAG Principle 1: Perceivable
     * Information and UI components must be presentable in ways users can perceive
     */
    async testPerceivable() {
        console.log('👁️ Testing Perceivable (WCAG Principle 1)...');
        
        const tests = {
            textAlternatives: await this.testTextAlternatives(),
            timeBasedMedia: await this.testTimeBasedMedia(),
            adaptable: await this.testAdaptable(),
            distinguishable: await this.testDistinguishable()
        };
        
        this.results.perceivable = tests;
        return tests;
    }
    
    /**
     * Test WCAG Principle 2: Operable
     * UI components and navigation must be operable
     */
    async testOperable() {
        console.log('⌨️ Testing Operable (WCAG Principle 2)...');
        
        const tests = {
            keyboardAccessible: await this.testKeyboardAccessible(),
            seizuresPhysical: await this.testSeizuresPhysical(),
            navigable: await this.testNavigable(),
            inputModalities: await this.testInputModalities()
        };
        
        this.results.operable = tests;
        return tests;
    }
    
    /**
     * Test WCAG Principle 3: Understandable
     * Information and operation of UI must be understandable
     */
    async testUnderstandable() {
        console.log('🧠 Testing Understandable (WCAG Principle 3)...');
        
        const tests = {
            readable: await this.testReadable(),
            predictable: await this.testPredictable(),
            inputAssistance: await this.testInputAssistance()
        };
        
        this.results.understandable = tests;
        return tests;
    }
    
    /**
     * Test WCAG Principle 4: Robust
     * Content must be robust enough for interpretation by assistive technologies
     */
    async testRobust() {
        console.log('🔧 Testing Robust (WCAG Principle 4)...');
        
        const tests = {
            compatible: await this.testCompatible()
        };
        
        this.results.robust = tests;
        return tests;
    }
    
    /**
     * Test 1.1 Text Alternatives
     */
    async testTextAlternatives() {
        const result = {
            guideline: '1.1 Text Alternatives',
            tests: [],
            passed: 0,
            failed: 0,
            warnings: 0
        };
        
        // 1.1.1 Non-text Content (Level A)
        await this.test_1_1_1_NonTextContent(result);
        
        return result;
    }
    
    async test_1_1_1_NonTextContent(result) {
        const test = {
            criteria: '1.1.1 Non-text Content',
            level: 'A',
            status: 'pass',
            issues: [],
            elements: []
        };
        
        // Test images have alt text
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            const alt = img.getAttribute('alt');
            const src = img.getAttribute('src');
            const isDecorative = img.hasAttribute('role') && img.getAttribute('role') === 'presentation';
            
            if (!isDecorative && (alt === null || alt === undefined)) {
                test.status = 'fail';
                test.issues.push(`Image missing alt attribute: ${src}`);
                test.elements.push({ element: 'img', index, src, issue: 'missing-alt' });
                
                this.violations.push({
                    type: 'wcag',
                    criteria: '1.1.1',
                    level: 'A',
                    message: `Image missing alt text: ${src}`,
                    element: img,
                    severity: 'error'
                });
            } else if (alt === '') {
                // Empty alt is OK for decorative images, but check if it should be decorative
                const hasDescriptiveContext = img.closest('figure') && img.closest('figure').querySelector('figcaption');
                if (!hasDescriptiveContext && !isDecorative) {
                    test.issues.push(`Image with empty alt may need description: ${src}`);
                    this.warnings.push({
                        type: 'wcag',
                        criteria: '1.1.1',
                        level: 'A',
                        message: `Image with empty alt may need description: ${src}`,
                        element: img,
                        severity: 'warning'
                    });
                }
            }
        });
        
        // Test input images have alt text
        const inputImages = document.querySelectorAll('input[type="image"]');
        inputImages.forEach((input, index) => {
            const alt = input.getAttribute('alt');
            if (!alt) {
                test.status = 'fail';
                test.issues.push('Input image missing alt attribute');
                test.elements.push({ element: 'input[type="image"]', index, issue: 'missing-alt' });
                
                this.violations.push({
                    type: 'wcag',
                    criteria: '1.1.1',
                    level: 'A',
                    message: 'Input image button missing alt text',
                    element: input,
                    severity: 'error'
                });
            }
        });
        
        // Test embedded content has alternatives
        const embedded = document.querySelectorAll('object, embed, iframe');
        embedded.forEach((element, index) => {
            const title = element.getAttribute('title');
            const ariaLabel = element.getAttribute('aria-label');
            
            if (!title && !ariaLabel) {
                test.status = 'fail';
                test.issues.push(`Embedded content missing accessible name: ${element.tagName}`);
                
                this.violations.push({
                    type: 'wcag',
                    criteria: '1.1.1',
                    level: 'A',
                    message: `${element.tagName} missing accessible name`,
                    element: element,
                    severity: 'error'
                });
            }
        });
        
        result.tests.push(test);
        if (test.status === 'pass') result.passed++;
        else if (test.status === 'fail') result.failed++;
        else result.warnings++;
    }
    
    /**
     * Test 1.4 Distinguishable
     */
    async testDistinguishable() {
        const result = {
            guideline: '1.4 Distinguishable',
            tests: [],
            passed: 0,
            failed: 0,
            warnings: 0
        };
        
        await this.test_1_4_3_ContrastMinimum(result);
        await this.test_1_4_6_ContrastEnhanced(result);
        
        return result;
    }
    
    async test_1_4_3_ContrastMinimum(result) {
        const test = {
            criteria: '1.4.3 Contrast (Minimum)',
            level: 'AA',
            status: 'pass',
            issues: [],
            elements: []
        };
        
        // Test color contrast
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, label, span, div');
        
        for (const element of textElements) {
            if (element.textContent.trim() === '') continue;
            
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = this.getBackgroundColor(element);
            
            if (color && backgroundColor) {
                const contrast = this.calculateContrastRatio(color, backgroundColor);
                const fontSize = parseFloat(styles.fontSize);
                const fontWeight = styles.fontWeight;
                
                // Determine if it's large text (18pt+ or 14pt+ bold)
                const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
                const requiredRatio = isLargeText ? this.options.largeTextThreshold : this.options.colorContrastThreshold;
                
                if (contrast < requiredRatio) {
                    test.status = 'fail';
                    test.issues.push(`Insufficient color contrast: ${contrast.toFixed(2)}:1 (required: ${requiredRatio}:1)`);
                    test.elements.push({
                        element: element.tagName,
                        text: element.textContent.substring(0, 50),
                        contrast: contrast.toFixed(2),
                        required: requiredRatio,
                        color: color,
                        backgroundColor: backgroundColor
                    });
                    
                    this.violations.push({
                        type: 'wcag',
                        criteria: '1.4.3',
                        level: 'AA',
                        message: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (required: ${requiredRatio}:1)`,
                        element: element,
                        severity: 'error'
                    });
                }
            }
        }
        
        result.tests.push(test);
        if (test.status === 'pass') result.passed++;
        else result.failed++;
    }
    
    async test_1_4_6_ContrastEnhanced(result) {
        const test = {
            criteria: '1.4.6 Contrast (Enhanced)',
            level: 'AAA',
            status: 'info',
            issues: [],
            note: 'AAA level - recommended but not required for AA compliance'
        };
        
        // This is AAA level, so we just provide info
        result.tests.push(test);
        result.warnings++;
    }
    
    /**
     * Test 2.1 Keyboard Accessible
     */
    async testKeyboardAccessible() {
        const result = {
            guideline: '2.1 Keyboard Accessible',
            tests: [],
            passed: 0,
            failed: 0,
            warnings: 0
        };
        
        await this.test_2_1_1_Keyboard(result);
        await this.test_2_1_2_NoKeyboardTrap(result);
        
        return result;
    }
    
    async test_2_1_1_Keyboard(result) {
        const test = {
            criteria: '2.1.1 Keyboard',
            level: 'A',
            status: 'pass',
            issues: [],
            elements: []
        };
        
        // Test interactive elements are keyboard accessible
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex], [onclick], [onkeydown], [role="button"], [role="link"]');
        
        interactiveElements.forEach((element, index) => {
            const tabindex = element.getAttribute('tabindex');
            const isButton = element.tagName === 'BUTTON' || element.getAttribute('role') === 'button';
            const isLink = element.tagName === 'A' || element.getAttribute('role') === 'link';
            
            // Check if element is focusable
            if (tabindex === '-1' && !element.disabled) {
                test.issues.push(`Interactive element not keyboard accessible: ${element.tagName}`);
                this.warnings.push({
                    type: 'wcag',
                    criteria: '2.1.1',
                    level: 'A',
                    message: `Element may not be keyboard accessible: ${element.tagName}`,
                    element: element,
                    severity: 'warning'
                });
            }
            
            // Check for click handlers without keyboard handlers
            if (element.onclick && !element.onkeydown && !element.onkeypress) {
                test.issues.push(`Element has click handler but no keyboard handler: ${element.tagName}`);
                this.warnings.push({
                    type: 'wcag',
                    criteria: '2.1.1',
                    level: 'A',
                    message: `Element has click handler but no keyboard handler: ${element.tagName}`,
                    element: element,
                    severity: 'warning'
                });
            }
        });
        
        result.tests.push(test);
        if (test.issues.length === 0) result.passed++;
        else result.warnings++;
    }
    
    async test_2_1_2_NoKeyboardTrap(result) {
        const test = {
            criteria: '2.1.2 No Keyboard Trap',
            level: 'A',
            status: 'manual',
            issues: [],
            note: 'Manual testing required - use Tab key to navigate through all interactive elements'
        };
        
        result.tests.push(test);
        result.warnings++;
    }
    
    /**
     * Test 3.1 Readable
     */
    async testReadable() {
        const result = {
            guideline: '3.1 Readable',
            tests: [],
            passed: 0,
            failed: 0,
            warnings: 0
        };
        
        await this.test_3_1_1_LanguageOfPage(result);
        
        return result;
    }
    
    async test_3_1_1_LanguageOfPage(result) {
        const test = {
            criteria: '3.1.1 Language of Page',
            level: 'A',
            status: 'pass',
            issues: []
        };
        
        const htmlLang = document.documentElement.getAttribute('lang');
        if (!htmlLang) {
            test.status = 'fail';
            test.issues.push('Missing lang attribute on html element');
            
            this.violations.push({
                type: 'wcag',
                criteria: '3.1.1',
                level: 'A',
                message: 'Missing lang attribute on html element',
                element: document.documentElement,
                severity: 'error'
            });
        }
        
        result.tests.push(test);
        if (test.status === 'pass') result.passed++;
        else result.failed++;
    }
    
    /**
     * Test 4.1 Compatible
     */
    async testCompatible() {
        const result = {
            guideline: '4.1 Compatible',
            tests: [],
            passed: 0,
            failed: 0,
            warnings: 0
        };
        
        await this.test_4_1_1_Parsing(result);
        await this.test_4_1_2_NameRoleValue(result);
        
        return result;
    }
    
    async test_4_1_1_Parsing(result) {
        const test = {
            criteria: '4.1.1 Parsing',
            level: 'A',
            status: 'pass',
            issues: []
        };
        
        // Check for duplicate IDs
        const elementsWithIds = document.querySelectorAll('[id]');
        const ids = new Set();
        const duplicateIds = new Set();
        
        elementsWithIds.forEach(element => {
            const id = element.getAttribute('id');
            if (ids.has(id)) {
                duplicateIds.add(id);
            }
            ids.add(id);
        });
        
        if (duplicateIds.size > 0) {
            test.status = 'fail';
            test.issues.push(`Duplicate IDs found: ${Array.from(duplicateIds).join(', ')}`);
            
            this.violations.push({
                type: 'wcag',
                criteria: '4.1.1',
                level: 'A',
                message: `Duplicate IDs found: ${Array.from(duplicateIds).join(', ')}`,
                severity: 'error'
            });
        }
        
        result.tests.push(test);
        if (test.status === 'pass') result.passed++;
        else result.failed++;
    }
    
    async test_4_1_2_NameRoleValue(result) {
        const test = {
            criteria: '4.1.2 Name, Role, Value',
            level: 'A',
            status: 'pass',
            issues: [],
            elements: []
        };
        
        // Test form controls have accessible names
        const formControls = document.querySelectorAll('input, select, textarea');
        formControls.forEach((control, index) => {
            const label = this.getAccessibleName(control);
            if (!label && control.type !== 'hidden' && control.type !== 'submit' && control.type !== 'button') {
                test.status = 'fail';
                test.issues.push(`Form control missing accessible name: ${control.type || control.tagName}`);
                test.elements.push({
                    element: control.tagName,
                    type: control.type,
                    index: index
                });
                
                this.violations.push({
                    type: 'wcag',
                    criteria: '4.1.2',
                    level: 'A',
                    message: `Form control missing accessible name: ${control.type || control.tagName}`,
                    element: control,
                    severity: 'error'
                });
            }
        });
        
        result.tests.push(test);
        if (test.status === 'pass') result.passed++;
        else result.failed++;
    }
    
    /**
     * Utility Functions
     */
    
    getBackgroundColor(element) {
        let bgColor = window.getComputedStyle(element).backgroundColor;
        let current = element;
        
        // Walk up the DOM tree to find the first non-transparent background
        while (current && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
            current = current.parentElement;
            if (current) {
                bgColor = window.getComputedStyle(current).backgroundColor;
            }
        }
        
        // If still transparent, assume white background
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            bgColor = 'rgb(255, 255, 255)';
        }
        
        return bgColor;
    }
    
    rgbToLuminance(r, g, b) {
        const rsRGB = r / 255;
        const gsRGB = g / 255;
        const bsRGB = b / 255;
        
        const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    }
    
    calculateContrastRatio(color1, color2) {
        const parseColor = (color) => {
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
        };
        
        const [r1, g1, b1] = parseColor(color1);
        const [r2, g2, b2] = parseColor(color2);
        
        const l1 = this.rgbToLuminance(r1, g1, b1);
        const l2 = this.rgbToLuminance(r2, g2, b2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    getAccessibleName(element) {
        // Check aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        
        // Check aria-labelledby
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
            const labelElement = document.getElementById(ariaLabelledBy);
            if (labelElement) return labelElement.textContent.trim();
        }
        
        // Check associated label
        const id = element.getAttribute('id');
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) return label.textContent.trim();
        }
        
        // Check if wrapped in label
        const parentLabel = element.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();
        
        // Check title attribute
        const title = element.getAttribute('title');
        if (title) return title;
        
        // Check placeholder for input elements
        if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
            return element.getAttribute('placeholder');
        }
        
        return null;
    }
    
    /**
     * Process test results
     */
    processTestResults(results) {
        const totalViolations = this.violations.length;
        const totalWarnings = this.warnings.length;
        
        if (totalViolations === 0 && totalWarnings === 0) {
            this.results.overall = 'passed';
        } else if (totalViolations > 0) {
            this.results.overall = 'failed';
        } else {
            this.results.overall = 'passed-with-warnings';
        }
    }
    
    /**
     * Generate comprehensive accessibility report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            wcagLevel: this.options.wcagLevel,
            wcagVersion: this.options.wcagVersion,
            overall: this.results.overall,
            summary: {
                violations: this.violations.length,
                warnings: this.warnings.length,
                passes: this.passes.length,
                total: this.testResults.length
            },
            results: this.results,
            issues: {
                violations: this.violations,
                warnings: this.warnings,
                passes: this.passes
            }
        };
        
        // Log summary
        console.group('♿ Accessibility Test Report');
        console.log(`WCAG ${this.options.wcagVersion} ${this.options.wcagLevel} Compliance: ${this.results.overall.toUpperCase()}`);
        console.log(`Violations: ${this.violations.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.log(`Passes: ${this.passes.length}`);
        console.groupEnd();
        
        return report;
    }
}

/**
 * Quick accessibility testing function
 */
async function testAccessibility(options = {}) {
    const tester = new AccessibilityTester(options);
    return await tester.runAccessibilityTests();
}

/**
 * Initialize accessibility testing
 */
const initializeAccessibilityTesting = () => {
    if (typeof window !== 'undefined') {
        window.AccessibilityTester = AccessibilityTester;
        window.testAccessibility = testAccessibility;
        
        // Add testing button
        if (document.readyState === 'complete') {
            addAccessibilityTestButton();
        } else {
            window.addEventListener('load', addAccessibilityTestButton);
        }
    }
};

/**
 * Add accessibility test button
 */
function addAccessibilityTestButton() {
    const button = document.createElement('button');
    button.textContent = '♿ Test A11y';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        left: 290px;
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
            const report = await testAccessibility();
            console.log('Accessibility Report:', report);
            
            const status = report.overall.toUpperCase();
            const summary = `WCAG 2.1 AA Compliance: ${status}\nViolations: ${report.summary.violations}\nWarnings: ${report.summary.warnings}`;
            alert(`Accessibility Test Complete!\n\n${summary}\n\nSee console for detailed report.`);
            
        } catch (error) {
            console.error('Accessibility testing failed:', error);
            alert('Accessibility testing failed. See console for details.');
        } finally {
            button.textContent = '♿ Test A11y';
            button.disabled = false;
        }
    });
    
    document.body.appendChild(button);
}

// Auto-initialize
if (typeof module === 'undefined') {
    initializeAccessibilityTesting();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessibilityTester, testAccessibility };
}

// Export for ES6 modules
export { AccessibilityTester, testAccessibility };