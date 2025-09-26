/**
 * Contact Info Validator
 * Validates ContactInfo data structure according to data model specification
 * 
 * @file assets/js/validators/contact-validator.js
 * @requires None (vanilla JavaScript)
 */

class ContactValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Validate complete contact data structure
     * @param {Object} contactData - Contact data to validate
     * @returns {Object} Validation result with isValid, errors, warnings
     */
    validate(contactData) {
        this.errors = [];
        this.warnings = [];

        // Check if contactData exists and is an object
        if (!contactData || typeof contactData !== 'object') {
            this.errors.push('Contact data is required and must be an object');
            return this.getResult();
        }

        // Validate required fields
        this.validateEmail(contactData.email);
        this.validateLinkedInUrl(contactData.linkedInUrl);
        this.validateGithubUrl(contactData.githubUrl);
        this.validatePortfolioUrl(contactData.portfolioUrl);
        this.validatePreferredContactMethod(contactData.preferredContactMethod);

        // Validate optional fields
        this.validateOptionalUrls(contactData);
        this.validateSocialMedia(contactData.socialMedia);
        this.validateAvailability(contactData.availability);
        this.validateContactForm(contactData.contactForm);

        return this.getResult();
    }

    /**
     * Validate email address
     * @param {string} email - Email address
     */
    validateEmail(email) {
        if (!email) {
            this.errors.push('Email is required');
            return;
        }
        if (typeof email !== 'string') {
            this.errors.push('Email must be a string');
            return;
        }

        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.errors.push('Email must be a valid email address format');
        }

        if (email.length > 254) {
            this.errors.push('Email must be less than 254 characters');
        }
    }

    /**
     * Validate LinkedIn URL
     * @param {string} linkedInUrl - LinkedIn profile URL
     */
    validateLinkedInUrl(linkedInUrl) {
        if (!linkedInUrl) {
            this.warnings.push('LinkedIn URL is recommended for professional profiles');
            return;
        }
        if (typeof linkedInUrl !== 'string') {
            this.errors.push('LinkedIn URL must be a string');
            return;
        }

        // Basic LinkedIn URL validation
        const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
        if (!linkedInRegex.test(linkedInUrl)) {
            this.errors.push('LinkedIn URL must be a valid LinkedIn profile URL');
        }
    }

    /**
     * Validate GitHub URL
     * @param {string} githubUrl - GitHub profile URL
     */
    validateGithubUrl(githubUrl) {
        if (!githubUrl) {
            this.warnings.push('GitHub URL is recommended for developer profiles');
            return;
        }
        if (typeof githubUrl !== 'string') {
            this.errors.push('GitHub URL must be a string');
            return;
        }

        // Basic GitHub URL validation
        const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/;
        if (!githubRegex.test(githubUrl)) {
            this.errors.push('GitHub URL must be a valid GitHub profile URL');
        }
    }

    /**
     * Validate portfolio URL
     * @param {string} portfolioUrl - Portfolio website URL
     */
    validatePortfolioUrl(portfolioUrl) {
        if (!portfolioUrl) {
            this.warnings.push('Portfolio URL is recommended');
            return;
        }
        if (typeof portfolioUrl !== 'string') {
            this.errors.push('Portfolio URL must be a string');
            return;
        }

        // Basic URL validation
        if (!this.isValidUrl(portfolioUrl)) {
            this.errors.push('Portfolio URL must be a valid URL');
        }
    }

    /**
     * Validate preferred contact method
     * @param {string} method - Preferred contact method
     */
    validatePreferredContactMethod(method) {
        const validMethods = ['Email', 'LinkedIn', 'GitHub', 'Phone', 'Contact Form'];
        
        if (!method) {
            this.warnings.push('Preferred contact method is recommended');
            return;
        }
        if (typeof method !== 'string') {
            this.errors.push('Preferred contact method must be a string');
            return;
        }
        if (!validMethods.includes(method)) {
            this.errors.push(`Preferred contact method must be one of: ${validMethods.join(', ')}`);
        }
    }

    /**
     * Validate optional URL fields
     * @param {Object} contactData - Contact data object
     */
    validateOptionalUrls(contactData) {
        const urlFields = ['resumeUrl', 'calendlyUrl'];
        
        urlFields.forEach(field => {
            if (contactData[field] !== undefined) {
                if (typeof contactData[field] !== 'string') {
                    this.errors.push(`${field} must be a string`);
                } else if (contactData[field] && !this.isValidUrl(contactData[field])) {
                    this.errors.push(`${field} must be a valid URL or empty string`);
                }
            }
        });

        // Resume URL specific validation
        if (contactData.resumeUrl && contactData.resumeUrl.length > 0) {
            const resumeExtensions = ['.pdf', '.doc', '.docx'];
            const hasValidExtension = resumeExtensions.some(ext => 
                contactData.resumeUrl.toLowerCase().includes(ext)
            );
            if (!hasValidExtension) {
                this.warnings.push('Resume URL should point to a PDF or DOC file');
            }
        }
    }

    /**
     * Validate social media object
     * @param {Object} socialMedia - Social media links object
     */
    validateSocialMedia(socialMedia) {
        if (!socialMedia) {
            return; // Optional field
        }
        if (typeof socialMedia !== 'object') {
            this.errors.push('socialMedia must be an object');
            return;
        }

        const socialPlatforms = ['twitter', 'stackoverflow', 'medium', 'dev', 'hashnode'];
        
        Object.keys(socialMedia).forEach(platform => {
            if (!socialPlatforms.includes(platform)) {
                this.warnings.push(`Unknown social platform: ${platform}`);
            }
            
            const url = socialMedia[platform];
            if (url !== undefined) {
                if (typeof url !== 'string') {
                    this.errors.push(`${platform} URL must be a string`);
                } else if (url && !this.isValidUrl(url)) {
                    this.errors.push(`${platform} URL must be a valid URL or empty string`);
                }
            }
        });
    }

    /**
     * Validate availability object
     * @param {Object} availability - Availability information object
     */
    validateAvailability(availability) {
        if (!availability) {
            return; // Optional field
        }
        if (typeof availability !== 'object') {
            this.errors.push('availability must be an object');
            return;
        }

        // Validate status
        if (availability.status !== undefined) {
            if (typeof availability.status !== 'string') {
                this.errors.push('availability.status must be a string');
            } else if (availability.status.length < 5 || availability.status.length > 100) {
                this.errors.push('availability.status must be between 5 and 100 characters');
            }
        }

        // Validate timezone
        if (availability.timezone !== undefined) {
            if (typeof availability.timezone !== 'string') {
                this.errors.push('availability.timezone must be a string');
            } else if (availability.timezone.length < 3 || availability.timezone.length > 20) {
                this.errors.push('availability.timezone must be between 3 and 20 characters');
            }
        }

        // Validate response time
        if (availability.responseTime !== undefined) {
            if (typeof availability.responseTime !== 'string') {
                this.errors.push('availability.responseTime must be a string');
            } else if (availability.responseTime.length < 5 || availability.responseTime.length > 50) {
                this.errors.push('availability.responseTime must be between 5 and 50 characters');
            }
        }
    }

    /**
     * Validate contact form configuration
     * @param {Object} contactForm - Contact form configuration object
     */
    validateContactForm(contactForm) {
        if (!contactForm) {
            return; // Optional field
        }
        if (typeof contactForm !== 'object') {
            this.errors.push('contactForm must be an object');
            return;
        }

        // Validate enabled flag
        if (contactForm.enabled !== undefined && typeof contactForm.enabled !== 'boolean') {
            this.errors.push('contactForm.enabled must be a boolean');
        }

        // Validate fields array
        if (contactForm.fields !== undefined) {
            if (!Array.isArray(contactForm.fields)) {
                this.errors.push('contactForm.fields must be an array');
            } else {
                const validFields = ['name', 'email', 'subject', 'message', 'phone', 'company'];
                contactForm.fields.forEach((field, index) => {
                    if (typeof field !== 'string') {
                        this.errors.push(`contactForm.fields[${index}] must be a string`);
                    } else if (!validFields.includes(field)) {
                        this.errors.push(`contactForm.fields[${index}] must be one of: ${validFields.join(', ')}`);
                    }
                });

                // Check for required fields
                if (!contactForm.fields.includes('name')) {
                    this.warnings.push('contactForm should include "name" field');
                }
                if (!contactForm.fields.includes('email')) {
                    this.warnings.push('contactForm should include "email" field');
                }
                if (!contactForm.fields.includes('message')) {
                    this.warnings.push('contactForm should include "message" field');
                }
            }
        }

        // Validate submit endpoint
        if (contactForm.submitEndpoint !== undefined) {
            if (typeof contactForm.submitEndpoint !== 'string') {
                this.errors.push('contactForm.submitEndpoint must be a string');
            } else if (contactForm.submitEndpoint.length < 2) {
                this.errors.push('contactForm.submitEndpoint must be a valid endpoint path');
            }
        }
    }

    /**
     * Basic URL validation helper
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid URL format
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            // Check for relative URLs (starting with ./ or /)
            return url.startsWith('./') || url.startsWith('/');
        }
    }

    /**
     * Get validation result
     * @returns {Object} Validation result
     */
    getResult() {
        return {
            isValid: this.errors.length === 0,
            errors: [...this.errors],
            warnings: [...this.warnings],
            errorCount: this.errors.length,
            warningCount: this.warnings.length
        };
    }

    /**
     * Quick validation method for testing
     * @param {Object} contactData - Contact data
     * @returns {boolean} True if valid, false otherwise
     */
    static isValid(contactData) {
        const validator = new ContactValidator();
        return validator.validate(contactData).isValid;
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactValidator;
} else if (typeof window !== 'undefined') {
    window.ContactValidator = ContactValidator;
}