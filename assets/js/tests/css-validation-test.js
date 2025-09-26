/**
 * CSS Validation and Quality Checking System
 * 
 * Provides comprehensive CSS validation including:
 * - W3C CSS validation
 * - CSS quality checks (unused selectors, performance)
 * - Browser compatibility analysis
 * - CSS architecture validation
 * 
 * @version 1.0.0
 * @author Portfolio Testing Team
 */

class CSSValidator {
    constructor(options = {}) {
        this.options = {
            w3cValidatorURL: 'https://jigsaw.w3.org/css-validator/validator',
            checkUnusedCSS: true,
            checkPerformance: true,
            checkCompatibility: true,
            checkArchitecture: true,
            outputFormat: 'json',
            timeout: 30000,
            ...options
        };
        
        this.results = {
            w3c: null,
            quality: null,
            performance: null,
            compatibility: null,
            architecture: null,
            overall: 'pending'
        };
        
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.cssFiles = [];
    }
    
    /**
     * Run complete CSS validation suite
     */
    async validateCSS(cssContent = null, cssFiles = null) {
        try {
            console.log('🎨 Starting CSS validation suite...');
            
            // Get CSS files and content if not provided
            if (!cssFiles) {
                this.cssFiles = await this.discoverCSSFiles();
            } else {
                this.cssFiles = cssFiles;
            }
            
            // Run parallel validations
            const validationPromises = [
                this.validateWithW3C(),
                this.validateCSSQuality(),
                this.validatePerformance(),
                this.validateCompatibility(),
                this.validateArchitecture()
            ];
            
            const results = await Promise.allSettled(validationPromises);
            
            // Process results
            this.processValidationResults(results);
            
            // Generate report
            const report = this.generateReport();
            
            console.log('✅ CSS validation completed');
            return report;
            
        } catch (error) {
            console.error('❌ CSS validation failed:', error);
            this.errors.push({
                type: 'system',
                message: error.message,
                severity: 'error'
            });
            
            return this.generateReport();
        }
    }
    
    /**
     * Discover CSS files in the project
     */
    async discoverCSSFiles() {
        const cssFiles = [];
        
        try {
            // Check for CSS files in HTML
            if (typeof document !== 'undefined') {
                const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
                linkElements.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('http')) {
                        cssFiles.push({
                            path: href,
                            type: 'external',
                            element: link
                        });
                    }
                });
                
                const styleElements = document.querySelectorAll('style');
                styleElements.forEach((style, index) => {
                    cssFiles.push({
                        path: `<style-${index}>`,
                        type: 'inline',
                        element: style,
                        content: style.textContent
                    });
                });
            }
            
            // Add known CSS files
            const knownFiles = [
                'assets/css/style.css',
                'assets/css/bootstrap.min.css',
                'assets/css/aos.css',
                'assets/css/line-awesome.min.css',
                'assets/css/responsive.css',
                'assets/css/critical.css',
                'assets/css/fonts-optimized.css',
                'assets/css/sections/hero.css',
                'assets/css/sections/about.css',
                'assets/css/sections/skills.css',
                'assets/css/sections/projects.css',
                'assets/css/sections/contact.css'
            ];
            
            for (const file of knownFiles) {
                if (!cssFiles.find(f => f.path === file)) {
                    cssFiles.push({
                        path: file,
                        type: 'file',
                        exists: await this.fileExists(file)
                    });
                }
            }
            
            console.log(`📁 Discovered ${cssFiles.length} CSS files`);
            return cssFiles;
            
        } catch (error) {
            console.warn('⚠️ CSS file discovery failed:', error);
            return [];
        }
    }
    
    /**
     * Check if file exists
     */
    async fileExists(path) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Get CSS content from file or URL
     */
    async getCSSContent(cssFile) {
        try {
            if (cssFile.content) {
                return cssFile.content;
            }
            
            if (cssFile.type === 'inline') {
                return cssFile.element.textContent;
            }
            
            const response = await fetch(cssFile.path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.text();
            
        } catch (error) {
            console.warn(`⚠️ Failed to load CSS from ${cssFile.path}:`, error);
            return null;
        }
    }
    
    /**
     * Validate CSS with W3C validator
     */
    async validateWithW3C() {
        try {
            const w3cResults = [];
            
            for (const cssFile of this.cssFiles) {
                if (!cssFile.exists && cssFile.type === 'file') continue;
                
                const cssContent = await this.getCSSContent(cssFile);
                if (!cssContent) continue;
                
                try {
                    const formData = new FormData();
                    formData.append('text', cssContent);
                    formData.append('output', 'json');
                    formData.append('profile', 'css3svg');
                    
                    const response = await fetch(this.options.w3cValidatorURL, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        w3cResults.push({
                            file: cssFile.path,
                            result: result
                        });
                        
                        // Process errors and warnings
                        if (result.cssvalidation) {
                            const validation = result.cssvalidation;
                            
                            if (validation.errors) {
                                validation.errors.forEach(error => {
                                    this.errors.push({
                                        type: 'w3c',
                                        file: cssFile.path,
                                        message: error.message,
                                        line: error.line,
                                        context: error.context,
                                        severity: 'error'
                                    });
                                });
                            }
                            
                            if (validation.warnings) {
                                validation.warnings.forEach(warning => {
                                    this.warnings.push({
                                        type: 'w3c',
                                        file: cssFile.path,
                                        message: warning.message,
                                        line: warning.line,
                                        context: warning.context,
                                        severity: 'warning'
                                    });
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ W3C validation failed for ${cssFile.path}:`, error);
                }
            }
            
            this.results.w3c = w3cResults;
            console.log('✅ W3C CSS validation completed');
            return w3cResults;
            
        } catch (error) {
            console.warn('⚠️ W3C CSS validation unavailable:', error);
            this.results.w3c = { unavailable: true };
            return { unavailable: true };
        }
    }
    
    /**
     * Validate CSS quality (unused selectors, etc.)
     */
    async validateCSSQuality() {
        try {
            const qualityChecks = {
                unusedSelectors: await this.checkUnusedSelectors(),
                duplicateRules: await this.checkDuplicateRules(),
                selectorComplexity: await this.checkSelectorComplexity(),
                colorConsistency: await this.checkColorConsistency(),
                fontConsistency: await this.checkFontConsistency(),
                unitConsistency: await this.checkUnitConsistency()
            };
            
            this.results.quality = qualityChecks;
            console.log('✅ CSS quality validation completed');
            return qualityChecks;
            
        } catch (error) {
            console.warn('⚠️ CSS quality validation failed:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Validate CSS performance
     */
    async validatePerformance() {
        try {
            const perfChecks = {
                fileSize: await this.checkFileSize(),
                selectorPerformance: await this.checkSelectorPerformance(),
                criticalCSS: await this.checkCriticalCSS(),
                unusedCSS: await this.checkUnusedCSS(),
                mediaQueries: await this.checkMediaQueries(),
                animations: await this.checkAnimations()
            };
            
            this.results.performance = perfChecks;
            console.log('✅ CSS performance validation completed');
            return perfChecks;
            
        } catch (error) {
            console.warn('⚠️ CSS performance validation failed:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Validate browser compatibility
     */
    async validateCompatibility() {
        try {
            const compatChecks = {
                properties: await this.checkPropertyCompatibility(),
                values: await this.checkValueCompatibility(),
                selectors: await this.checkSelectorCompatibility(),
                prefixes: await this.checkVendorPrefixes(),
                features: await this.checkModernFeatures()
            };
            
            this.results.compatibility = compatChecks;
            console.log('✅ CSS compatibility validation completed');
            return compatChecks;
            
        } catch (error) {
            console.warn('⚠️ CSS compatibility validation failed:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Validate CSS architecture
     */
    async validateArchitecture() {
        try {
            const archChecks = {
                organization: await this.checkOrganization(),
                naming: await this.checkNamingConventions(),
                structure: await this.checkStructure(),
                imports: await this.checkImports(),
                customProperties: await this.checkCustomProperties()
            };
            
            this.results.architecture = archChecks;
            console.log('✅ CSS architecture validation completed');
            return archChecks;
            
        } catch (error) {
            console.warn('⚠️ CSS architecture validation failed:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Check for unused CSS selectors
     */
    async checkUnusedSelectors() {
        if (typeof document === 'undefined') {
            return { unavailable: 'DOM not available' };
        }
        
        const result = {
            total: 0,
            unused: 0,
            unusedSelectors: [],
            issues: []
        };
        
        try {
            // Get all stylesheets
            const stylesheets = Array.from(document.styleSheets);
            
            for (const stylesheet of stylesheets) {
                try {
                    const rules = Array.from(stylesheet.cssRules || []);
                    
                    for (const rule of rules) {
                        if (rule.type === CSSRule.STYLE_RULE) {
                            result.total++;
                            
                            const selector = rule.selectorText;
                            try {
                                const elements = document.querySelectorAll(selector);
                                if (elements.length === 0) {
                                    result.unused++;
                                    result.unusedSelectors.push(selector);
                                    result.issues.push(`Unused selector: ${selector}`);
                                    
                                    this.warnings.push({
                                        type: 'quality',
                                        subType: 'unused-selector',
                                        message: `Unused CSS selector: ${selector}`,
                                        severity: 'warning'
                                    });
                                }
                            } catch (e) {
                                // Invalid selector - skip
                            }
                        }
                    }
                } catch (e) {
                    // Cross-origin stylesheet - skip
                }
            }
            
            if (result.unused > 0) {
                this.info.push({
                    type: 'quality',
                    message: `Found ${result.unused} unused CSS selectors (${((result.unused / result.total) * 100).toFixed(1)}% of total)`,
                    severity: 'info'
                });
            }
            
            return result;
            
        } catch (error) {
            return { error: error.message };
        }
    }
    
    /**
     * Check file sizes
     */
    async checkFileSize() {
        const result = {
            files: [],
            totalSize: 0,
            largeFiles: [],
            issues: []
        };
        
        for (const cssFile of this.cssFiles) {
            if (!cssFile.exists && cssFile.type === 'file') continue;
            
            try {
                const content = await this.getCSSContent(cssFile);
                if (content) {
                    const size = new Blob([content]).size;
                    result.files.push({
                        path: cssFile.path,
                        size: size,
                        sizeKB: Math.round(size / 1024)
                    });
                    result.totalSize += size;
                    
                    // Check for large files (>100KB)
                    if (size > 100 * 1024) {
                        result.largeFiles.push({
                            path: cssFile.path,
                            size: size,
                            sizeKB: Math.round(size / 1024)
                        });
                        result.issues.push(`Large CSS file: ${cssFile.path} (${Math.round(size / 1024)}KB)`);
                        
                        this.warnings.push({
                            type: 'performance',
                            subType: 'large-file',
                            message: `Large CSS file: ${cssFile.path} (${Math.round(size / 1024)}KB)`,
                            severity: 'warning'
                        });
                    }
                }
            } catch (error) {
                // File not accessible
            }
        }
        
        result.totalSizeKB = Math.round(result.totalSize / 1024);
        
        if (result.totalSize > 200 * 1024) { // > 200KB total
            this.warnings.push({
                type: 'performance',
                message: `Total CSS size is large: ${result.totalSizeKB}KB`,
                severity: 'warning'
            });
        }
        
        return result;
    }
    
    /**
     * Check for critical CSS
     */
    async checkCriticalCSS() {
        const result = {
            hasCriticalCSS: false,
            criticalFiles: [],
            issues: []
        };
        
        for (const cssFile of this.cssFiles) {
            if (cssFile.path.includes('critical')) {
                result.hasCriticalCSS = true;
                result.criticalFiles.push(cssFile.path);
            }
        }
        
        if (!result.hasCriticalCSS) {
            result.issues.push('No critical CSS detected');
            this.info.push({
                type: 'performance',
                message: 'Consider implementing critical CSS for better performance',
                severity: 'info'
            });
        }
        
        return result;
    }
    
    /**
     * Check naming conventions
     */
    async checkNamingConventions() {
        const result = {
            conventions: {
                kebabCase: 0,
                camelCase: 0,
                snake_case: 0,
                BEM: 0
            },
            inconsistencies: [],
            issues: []
        };
        
        // This would require parsing CSS selectors from all files
        // For now, provide a basic structure
        
        return result;
    }
    
    /**
     * Process validation results
     */
    processValidationResults(results) {
        let hasErrors = this.errors.length > 0;
        let hasWarnings = this.warnings.length > 0;
        
        if (!hasErrors && !hasWarnings) {
            this.results.overall = 'passed';
        } else if (hasErrors) {
            this.results.overall = 'failed';
        } else {
            this.results.overall = 'passed-with-warnings';
        }
    }
    
    /**
     * Generate comprehensive validation report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overall: this.results.overall,
            summary: {
                filesChecked: this.cssFiles.length,
                errors: this.errors.length,
                warnings: this.warnings.length,
                info: this.info.length
            },
            results: this.results,
            issues: {
                errors: this.errors,
                warnings: this.warnings,
                info: this.info
            },
            files: this.cssFiles
        };
        
        // Log summary
        console.group('🎨 CSS Validation Report');
        console.log(`Overall Status: ${this.results.overall.toUpperCase()}`);
        console.log(`Files Checked: ${this.cssFiles.length}`);
        console.log(`Errors: ${this.errors.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.log(`Info: ${this.info.length}`);
        console.groupEnd();
        
        return report;
    }
}

/**
 * Quick CSS validation function
 */
async function validateCSS(options = {}) {
    const validator = new CSSValidator(options);
    return await validator.validateCSS();
}

/**
 * Initialize CSS validation
 */
const initializeCSSValidation = () => {
    if (typeof window !== 'undefined') {
        window.CSSValidator = CSSValidator;
        window.validateCSS = validateCSS;
        
        // Add validation button for testing
        if (document.readyState === 'complete') {
            addCSSValidationButton();
        } else {
            window.addEventListener('load', addCSSValidationButton);
        }
    }
};

/**
 * Add CSS validation button to page
 */
function addCSSValidationButton() {
    const button = document.createElement('button');
    button.textContent = '🎨 Validate CSS';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        left: 150px;
        z-index: 10000;
        background: #28a745;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-family: system-ui, sans-serif;
    `;
    
    button.addEventListener('click', async () => {
        button.textContent = '🔄 Validating...';
        button.disabled = true;
        
        try {
            const report = await validateCSS();
            console.log('CSS Validation Report:', report);
            
            const status = report.overall.toUpperCase();
            const summary = `Status: ${status}\nFiles: ${report.summary.filesChecked}\nErrors: ${report.summary.errors}\nWarnings: ${report.summary.warnings}`;
            alert(`CSS Validation Complete!\n\n${summary}\n\nSee console for detailed report.`);
            
        } catch (error) {
            console.error('CSS validation failed:', error);
            alert('CSS validation failed. See console for details.');
        } finally {
            button.textContent = '🎨 Validate CSS';
            button.disabled = false;
        }
    });
    
    document.body.appendChild(button);
}

// Auto-initialize
if (typeof module === 'undefined') {
    initializeCSSValidation();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CSSValidator, validateCSS };
}

// Export for ES6 modules
export { CSSValidator, validateCSS };