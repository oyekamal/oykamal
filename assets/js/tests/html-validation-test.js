/**
 * HTML Validation Testing System
 * 
 * Provides automated HTML validation using W3C validator
 * and custom checks for portfolio-specific requirements
 * 
 * @version 1.0.0
 * @author Portfolio Testing Team
 */

class HTMLValidator {
    constructor(options = {}) {
        this.options = {
            w3cValidatorURL: 'https://validator.w3.org/nu/',
            validateSEO: true,
            validateAccessibility: true,
            validatePerformance: true,
            outputFormat: 'json',
            timeout: 30000,
            ...options
        };
        
        this.results = {
            w3c: null,
            seo: null,
            accessibility: null,
            performance: null,
            custom: null,
            overall: 'pending'
        };
        
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }
    
    /**
     * Run complete HTML validation suite
     */
    async validateHTML(htmlContent = null) {
        try {
            console.log('🧪 Starting HTML validation suite...');
            
            // Get HTML content if not provided
            if (!htmlContent) {
                htmlContent = await this.getHTMLContent();
            }
            
            // Run parallel validations
            const validationPromises = [
                this.validateWithW3C(htmlContent),
                this.validateSEOTags(htmlContent),
                this.validateAccessibilityMarkup(htmlContent),
                this.validatePerformanceHints(htmlContent),
                this.validateCustomRequirements(htmlContent)
            ];
            
            const results = await Promise.allSettled(validationPromises);
            
            // Process results
            this.processValidationResults(results);
            
            // Generate report
            const report = this.generateReport();
            
            console.log('✅ HTML validation completed');
            return report;
            
        } catch (error) {
            console.error('❌ HTML validation failed:', error);
            this.errors.push({
                type: 'system',
                message: error.message,
                severity: 'error'
            });
            
            return this.generateReport();
        }
    }
    
    /**
     * Get HTML content from current page or file
     */
    async getHTMLContent() {
        try {
            // If running in browser, get current page HTML
            if (typeof document !== 'undefined') {
                return document.documentElement.outerHTML;
            }
            
            // If running in Node.js, read index.html
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                const path = require('path');
                return fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
            }
            
            // Fallback: fetch from current domain
            const response = await fetch('/index.html');
            return await response.text();
            
        } catch (error) {
            throw new Error(`Failed to get HTML content: ${error.message}`);
        }
    }
    
    /**
     * Validate HTML with W3C validator
     */
    async validateWithW3C(htmlContent) {
        try {
            const formData = new FormData();
            formData.append('content', htmlContent);
            formData.append('out', this.options.outputFormat);
            
            const response = await fetch(this.options.w3cValidatorURL, {
                method: 'POST',
                body: formData,
                headers: {
                    'User-Agent': 'Portfolio-HTML-Validator/1.0'
                },
                timeout: this.options.timeout
            });
            
            if (!response.ok) {
                throw new Error(`W3C validation failed: ${response.status}`);
            }
            
            const result = await response.json();
            this.results.w3c = result;
            
            // Process W3C messages
            if (result.messages) {
                result.messages.forEach(message => {
                    const entry = {
                        type: 'w3c',
                        subType: message.type,
                        message: message.message,
                        line: message.lastLine,
                        column: message.lastColumn,
                        extract: message.extract,
                        severity: message.type === 'error' ? 'error' : 'warning'
                    };
                    
                    if (message.type === 'error') {
                        this.errors.push(entry);
                    } else {
                        this.warnings.push(entry);
                    }
                });
            }
            
            console.log(`✅ W3C validation completed: ${this.errors.length} errors, ${this.warnings.length} warnings`);
            return result;
            
        } catch (error) {
            console.warn('⚠️ W3C validation unavailable:', error.message);
            this.warnings.push({
                type: 'w3c',
                message: `W3C validation unavailable: ${error.message}`,
                severity: 'warning'
            });
            return { messages: [], unavailable: true };
        }
    }
    
    /**
     * Validate SEO meta tags and markup
     */
    async validateSEOTags(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const seoChecks = {
            title: this.checkTitle(doc),
            metaDescription: this.checkMetaDescription(doc),
            metaKeywords: this.checkMetaKeywords(doc),
            openGraph: this.checkOpenGraph(doc),
            twitterCard: this.checkTwitterCard(doc),
            canonicalURL: this.checkCanonicalURL(doc),
            structuredData: this.checkStructuredData(doc),
            headings: this.checkHeadingStructure(doc),
            images: this.checkImageSEO(doc),
            links: this.checkLinkSEO(doc)
        };
        
        this.results.seo = seoChecks;
        console.log('✅ SEO validation completed');
        return seoChecks;
    }
    
    /**
     * Validate accessibility markup
     */
    async validateAccessibilityMarkup(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const a11yChecks = {
            altText: this.checkImageAltText(doc),
            headingStructure: this.checkA11yHeadings(doc),
            ariaLabels: this.checkAriaLabels(doc),
            focusManagement: this.checkFocusManagement(doc),
            colorContrast: this.checkColorContrast(doc),
            keyboardNavigation: this.checkKeyboardNavigation(doc),
            semanticHTML: this.checkSemanticHTML(doc),
            skipLinks: this.checkSkipLinks(doc)
        };
        
        this.results.accessibility = a11yChecks;
        console.log('✅ Accessibility validation completed');
        return a11yChecks;
    }
    
    /**
     * Validate performance-related HTML hints
     */
    async validatePerformanceHints(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const perfChecks = {
            preconnect: this.checkPreconnect(doc),
            preload: this.checkPreload(doc),
            criticalCSS: this.checkCriticalCSS(doc),
            asyncDefer: this.checkAsyncDefer(doc),
            imageOptimization: this.checkImageOptimization(doc),
            fontDisplay: this.checkFontDisplay(doc),
            resourceHints: this.checkResourceHints(doc)
        };
        
        this.results.performance = perfChecks;
        console.log('✅ Performance validation completed');
        return perfChecks;
    }
    
    /**
     * Validate custom portfolio requirements
     */
    async validateCustomRequirements(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const customChecks = {
            portfolioSections: this.checkPortfolioSections(doc),
            projectStructure: this.checkProjectStructure(doc),
            contactInfo: this.checkContactInfo(doc),
            skillsDisplay: this.checkSkillsDisplay(doc),
            responsiveImages: this.checkResponsiveImages(doc),
            socialLinks: this.checkSocialLinks(doc)
        };
        
        this.results.custom = customChecks;
        console.log('✅ Custom validation completed');
        return customChecks;
    }
    
    /**
     * SEO Check Methods
     */
    checkTitle(doc) {
        const title = doc.querySelector('title');
        const result = {
            exists: !!title,
            length: title ? title.textContent.length : 0,
            content: title ? title.textContent : null,
            issues: []
        };
        
        if (!title) {
            result.issues.push('Missing <title> tag');
            this.errors.push({
                type: 'seo',
                message: 'Missing <title> tag',
                severity: 'error'
            });
        } else if (result.length < 30 || result.length > 60) {
            result.issues.push('Title length should be 30-60 characters');
            this.warnings.push({
                type: 'seo',
                message: `Title length is ${result.length} characters (optimal: 30-60)`,
                severity: 'warning'
            });
        }
        
        return result;
    }
    
    checkMetaDescription(doc) {
        const metaDesc = doc.querySelector('meta[name="description"]');
        const result = {
            exists: !!metaDesc,
            length: metaDesc ? metaDesc.getAttribute('content').length : 0,
            content: metaDesc ? metaDesc.getAttribute('content') : null,
            issues: []
        };
        
        if (!metaDesc) {
            result.issues.push('Missing meta description');
            this.errors.push({
                type: 'seo',
                message: 'Missing meta description',
                severity: 'error'
            });
        } else if (result.length < 120 || result.length > 160) {
            result.issues.push('Meta description should be 120-160 characters');
            this.warnings.push({
                type: 'seo',
                message: `Meta description length is ${result.length} characters (optimal: 120-160)`,
                severity: 'warning'
            });
        }
        
        return result;
    }
    
    checkOpenGraph(doc) {
        const ogTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
        const result = {
            tags: {},
            complete: true,
            issues: []
        };
        
        ogTags.forEach(tag => {
            const element = doc.querySelector(`meta[property="${tag}"]`);
            result.tags[tag] = element ? element.getAttribute('content') : null;
            
            if (!element) {
                result.complete = false;
                result.issues.push(`Missing ${tag} tag`);
                this.warnings.push({
                    type: 'seo',
                    message: `Missing Open Graph ${tag} tag`,
                    severity: 'warning'
                });
            }
        });
        
        return result;
    }
    
    /**
     * Accessibility Check Methods
     */
    checkImageAltText(doc) {
        const images = doc.querySelectorAll('img');
        const result = {
            total: images.length,
            withAlt: 0,
            missingAlt: [],
            issues: []
        };
        
        images.forEach((img, index) => {
            const alt = img.getAttribute('alt');
            const src = img.getAttribute('src');
            
            if (alt !== null && alt.trim() !== '') {
                result.withAlt++;
            } else {
                result.missingAlt.push({ index, src });
                result.issues.push(`Image missing alt text: ${src}`);
                this.errors.push({
                    type: 'accessibility',
                    message: `Image missing alt text: ${src}`,
                    severity: 'error'
                });
            }
        });
        
        return result;
    }
    
    checkA11yHeadings(doc) {
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const result = {
            structure: [],
            issues: []
        };
        
        let previousLevel = 0;
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();
            
            result.structure.push({ level, text, index });
            
            // Check for proper heading hierarchy
            if (level > previousLevel + 1) {
                result.issues.push(`Heading level ${level} follows ${previousLevel} (skip detected)`);
                this.warnings.push({
                    type: 'accessibility',
                    message: `Heading hierarchy skip detected: h${previousLevel} to h${level}`,
                    severity: 'warning'
                });
            }
            
            previousLevel = level;
        });
        
        return result;
    }
    
    /**
     * Performance Check Methods
     */
    checkPreconnect(doc) {
        const preconnects = doc.querySelectorAll('link[rel="preconnect"]');
        const result = {
            count: preconnects.length,
            domains: [],
            issues: []
        };
        
        preconnects.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                result.domains.push(href);
            }
        });
        
        // Check for common domains that should have preconnect
        const requiredDomains = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
        requiredDomains.forEach(domain => {
            if (!result.domains.includes(domain)) {
                result.issues.push(`Missing preconnect for ${domain}`);
                this.warnings.push({
                    type: 'performance',
                    message: `Missing preconnect for ${domain}`,
                    severity: 'warning'
                });
            }
        });
        
        return result;
    }
    
    checkCriticalCSS(doc) {
        const criticalCSS = doc.querySelector('link[href*="critical"]');
        const result = {
            exists: !!criticalCSS,
            issues: []
        };
        
        if (!criticalCSS) {
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
                errors: this.errors.length,
                warnings: this.warnings.length,
                info: this.info.length
            },
            results: this.results,
            issues: {
                errors: this.errors,
                warnings: this.warnings,
                info: this.info
            }
        };
        
        // Log summary
        console.group('📋 HTML Validation Report');
        console.log(`Overall Status: ${this.results.overall.toUpperCase()}`);
        console.log(`Errors: ${this.errors.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.log(`Info: ${this.info.length}`);
        console.groupEnd();
        
        return report;
    }
    
    /**
     * Custom Portfolio Check Methods
     */
    checkPortfolioSections(doc) {
        const requiredSections = ['hero', 'about', 'skills', 'projects', 'contact'];
        const result = {
            sections: {},
            complete: true,
            issues: []
        };
        
        requiredSections.forEach(section => {
            const element = doc.querySelector(`#${section}, .${section}, [data-section="${section}"]`);
            result.sections[section] = !!element;
            
            if (!element) {
                result.complete = false;
                result.issues.push(`Missing ${section} section`);
                this.warnings.push({
                    type: 'custom',
                    message: `Missing portfolio ${section} section`,
                    severity: 'warning'
                });
            }
        });
        
        return result;
    }
    
    checkProjectStructure(doc) {
        const projectCards = doc.querySelectorAll('.project-card, [data-project]');
        const result = {
            count: projectCards.length,
            hasImages: 0,
            hasDescriptions: 0,
            hasLinks: 0,
            issues: []
        };
        
        projectCards.forEach((card, index) => {
            const img = card.querySelector('img');
            const desc = card.querySelector('.description, .project-description');
            const link = card.querySelector('a[href]');
            
            if (img) result.hasImages++;
            if (desc) result.hasDescriptions++;
            if (link) result.hasLinks++;
        });
        
        if (result.count === 0) {
            result.issues.push('No project cards found');
            this.warnings.push({
                type: 'custom',
                message: 'No project cards found in portfolio',
                severity: 'warning'
            });
        }
        
        return result;
    }
}

/**
 * Quick validation function for immediate use
 */
async function validateHTML(options = {}) {
    const validator = new HTMLValidator(options);
    return await validator.validateHTML();
}

/**
 * Initialize HTML validation when DOM is ready
 */
const initializeHTMLValidation = () => {
    if (typeof window !== 'undefined') {
        window.HTMLValidator = HTMLValidator;
        window.validateHTML = validateHTML;
        
        // Add validation button for testing
        if (document.readyState === 'complete') {
            addValidationButton();
        } else {
            window.addEventListener('load', addValidationButton);
        }
    }
};

/**
 * Add validation button to page for manual testing
 */
function addValidationButton() {
    const button = document.createElement('button');
    button.textContent = '🧪 Validate HTML';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 10000;
        background: #007bff;
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
            const report = await validateHTML();
            console.log('Validation Report:', report);
            
            // Show results in alert (for quick feedback)
            const status = report.overall.toUpperCase();
            const summary = `Status: ${status}\nErrors: ${report.summary.errors}\nWarnings: ${report.summary.warnings}`;
            alert(`HTML Validation Complete!\n\n${summary}\n\nSee console for detailed report.`);
            
        } catch (error) {
            console.error('Validation failed:', error);
            alert('Validation failed. See console for details.');
        } finally {
            button.textContent = '🧪 Validate HTML';
            button.disabled = false;
        }
    });
    
    document.body.appendChild(button);
}

// Auto-initialize
if (typeof module === 'undefined') {
    initializeHTMLValidation();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HTMLValidator, validateHTML };
}

// Export for ES6 modules
export { HTMLValidator, validateHTML };