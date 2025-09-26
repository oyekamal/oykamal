/**
 * Profile Entity Validator
 * Validates Profile data structure according to data model specification
 * 
 * @file assets/js/validators/profile-validator.js
 * @requires None (vanilla JavaScript)
 */

class ProfileValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Validate complete profile data structure
     * @param {Object} profile - Profile data to validate
     * @returns {Object} Validation result with isValid, errors, warnings
     */
    validate(profile) {
        this.errors = [];
        this.warnings = [];

        // Check if profile exists and is an object
        if (!profile || typeof profile !== 'object') {
            this.errors.push('Profile data is required and must be an object');
            return this.getResult();
        }

        // Validate required fields
        this.validateName(profile.name);
        this.validateTitle(profile.title);
        this.validateSpecialization(profile.specialization);
        this.validateTagline(profile.tagline);
        this.validateProfessionalPhoto(profile.professionalPhoto);
        this.validateYearsOfExperience(profile.yearsOfExperience);
        this.validateLocation(profile.location);
        this.validateAvailability(profile.availability);

        // Validate optional fields
        if (profile.summary) {
            this.validateSummary(profile.summary);
        }
        if (profile.professionalStatement) {
            this.validateProfessionalStatement(profile.professionalStatement);
        }

        return this.getResult();
    }

    /**
     * Validate name field
     * @param {string} name - Profile name
     */
    validateName(name) {
        if (!name) {
            this.errors.push('Name is required');
            return;
        }
        if (typeof name !== 'string') {
            this.errors.push('Name must be a string');
            return;
        }
        if (name.length < 2 || name.length > 50) {
            this.errors.push('Name must be between 2 and 50 characters');
        }
    }

    /**
     * Validate title field
     * @param {string} title - Professional title
     */
    validateTitle(title) {
        if (!title) {
            this.errors.push('Title is required');
            return;
        }
        if (typeof title !== 'string') {
            this.errors.push('Title must be a string');
            return;
        }
        if (title.length < 5 || title.length > 100) {
            this.errors.push('Title must be between 5 and 100 characters');
        }
    }

    /**
     * Validate specialization field
     * @param {string} specialization - Technical specialization
     */
    validateSpecialization(specialization) {
        if (!specialization) {
            this.errors.push('Specialization is required');
            return;
        }
        if (typeof specialization !== 'string') {
            this.errors.push('Specialization must be a string');
            return;
        }
        if (specialization.length < 10 || specialization.length > 200) {
            this.errors.push('Specialization must be between 10 and 200 characters');
        }
    }

    /**
     * Validate tagline field
     * @param {string} tagline - Value proposition tagline
     */
    validateTagline(tagline) {
        if (!tagline) {
            this.errors.push('Tagline is required');
            return;
        }
        if (typeof tagline !== 'string') {
            this.errors.push('Tagline must be a string');
            return;
        }
        if (tagline.length < 10 || tagline.length > 120) {
            this.errors.push('Tagline must be between 10 and 120 characters');
        }
    }

    /**
     * Validate professional photo ImageAsset
     * @param {Object} photo - ImageAsset object
     */
    validateProfessionalPhoto(photo) {
        if (!photo) {
            this.errors.push('Professional photo is required');
            return;
        }
        if (typeof photo !== 'object') {
            this.errors.push('Professional photo must be an ImageAsset object');
            return;
        }

        // Validate required ImageAsset fields
        if (!photo.src || typeof photo.src !== 'string') {
            this.errors.push('Photo src is required and must be a valid path');
        }
        if (!photo.alt || typeof photo.alt !== 'string') {
            this.errors.push('Photo alt text is required for accessibility');
        }
        if (photo.alt && photo.alt.length < 10) {
            this.warnings.push('Photo alt text should be more descriptive (>10 characters)');
        }

        // Validate optional ImageAsset fields
        if (photo.width && (typeof photo.width !== 'number' || photo.width <= 0)) {
            this.errors.push('Photo width must be a positive number');
        }
        if (photo.height && (typeof photo.height !== 'number' || photo.height <= 0)) {
            this.errors.push('Photo height must be a positive number');
        }
    }

    /**
     * Validate years of experience
     * @param {number} years - Years of professional experience
     */
    validateYearsOfExperience(years) {
        if (years === undefined || years === null) {
            this.errors.push('Years of experience is required');
            return;
        }
        if (typeof years !== 'number' || !Number.isInteger(years)) {
            this.errors.push('Years of experience must be an integer');
            return;
        }
        if (years < 0 || years > 50) {
            this.errors.push('Years of experience must be between 0 and 50');
        }
    }

    /**
     * Validate location field
     * @param {string} location - Current location
     */
    validateLocation(location) {
        if (!location) {
            this.warnings.push('Location is recommended for professional profiles');
            return;
        }
        if (typeof location !== 'string') {
            this.errors.push('Location must be a string');
            return;
        }
        if (location.length < 2 || location.length > 50) {
            this.errors.push('Location must be between 2 and 50 characters');
        }
    }

    /**
     * Validate availability field
     * @param {string} availability - Availability status
     */
    validateAvailability(availability) {
        if (!availability) {
            this.warnings.push('Availability status is recommended');
            return;
        }
        if (typeof availability !== 'string') {
            this.errors.push('Availability must be a string');
            return;
        }
        if (availability.length < 5 || availability.length > 100) {
            this.errors.push('Availability must be between 5 and 100 characters');
        }
    }

    /**
     * Validate optional summary field
     * @param {string} summary - Profile summary
     */
    validateSummary(summary) {
        if (typeof summary !== 'string') {
            this.errors.push('Summary must be a string');
            return;
        }
        if (summary.length > 500) {
            this.warnings.push('Summary is quite long (>500 characters), consider shortening');
        }
    }

    /**
     * Validate optional professional statement field
     * @param {string} statement - Professional statement
     */
    validateProfessionalStatement(statement) {
        if (typeof statement !== 'string') {
            this.errors.push('Professional statement must be a string');
            return;
        }
        if (statement.length > 300) {
            this.warnings.push('Professional statement is long (>300 characters), consider shortening');
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
     * @param {Object} profile - Profile data
     * @returns {boolean} True if valid, false otherwise
     */
    static isValid(profile) {
        const validator = new ProfileValidator();
        return validator.validate(profile).isValid;
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileValidator;
} else if (typeof window !== 'undefined') {
    window.ProfileValidator = ProfileValidator;
}