/**
 * Skills Validator
 * Validates SkillCategory and Skill data structures according to data model specification
 * 
 * @file assets/js/validators/skills-validator.js
 * @requires None (vanilla JavaScript)
 */

class SkillsValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Validate complete skills data structure
     * @param {Object} skillsData - Skills data with skillCategories array
     * @returns {Object} Validation result with isValid, errors, warnings
     */
    validate(skillsData) {
        this.errors = [];
        this.warnings = [];

        // Check if skillsData exists and is an object
        if (!skillsData || typeof skillsData !== 'object') {
            this.errors.push('Skills data is required and must be an object');
            return this.getResult();
        }

        // Check if skillCategories exists and is an array
        if (!skillsData.skillCategories) {
            this.errors.push('skillCategories array is required');
            return this.getResult();
        }

        if (!Array.isArray(skillsData.skillCategories)) {
            this.errors.push('skillCategories must be an array');
            return this.getResult();
        }

        if (skillsData.skillCategories.length === 0) {
            this.errors.push('At least one skill category is required');
            return this.getResult();
        }

        // Validate each skill category
        skillsData.skillCategories.forEach((category, index) => {
            this.validateSkillCategory(category, index);
        });

        // Check for duplicate category names
        this.checkDuplicateCategories(skillsData.skillCategories);

        // Check display order sequence
        this.validateDisplayOrder(skillsData.skillCategories);

        return this.getResult();
    }

    /**
     * Validate individual skill category
     * @param {Object} category - SkillCategory object
     * @param {number} index - Category index for error reporting
     */
    validateSkillCategory(category, index) {
        const prefix = `Category [${index}]:`;

        if (!category || typeof category !== 'object') {
            this.errors.push(`${prefix} Category must be an object`);
            return;
        }

        // Validate required fields
        this.validateCategoryName(category.categoryName, prefix);
        this.validateCategoryDescription(category.description, prefix);
        this.validateSkills(category.skills, prefix);
        this.validateDisplayOrder(category.displayOrder, prefix);
        this.validateIconClass(category.iconClass, prefix);
    }

    /**
     * Validate category name
     * @param {string} name - Category name
     * @param {string} prefix - Error message prefix
     */
    validateCategoryName(name, prefix) {
        if (!name) {
            this.errors.push(`${prefix} categoryName is required`);
            return;
        }
        if (typeof name !== 'string') {
            this.errors.push(`${prefix} categoryName must be a string`);
            return;
        }
        if (name.length < 3 || name.length > 50) {
            this.errors.push(`${prefix} categoryName must be between 3 and 50 characters`);
        }
    }

    /**
     * Validate category description
     * @param {string} description - Category description
     * @param {string} prefix - Error message prefix
     */
    validateCategoryDescription(description, prefix) {
        if (!description) {
            this.errors.push(`${prefix} description is required`);
            return;
        }
        if (typeof description !== 'string') {
            this.errors.push(`${prefix} description must be a string`);
            return;
        }
        if (description.length < 10 || description.length > 200) {
            this.errors.push(`${prefix} description must be between 10 and 200 characters`);
        }
    }

    /**
     * Validate skills array within category
     * @param {Array} skills - Array of Skill objects
     * @param {string} prefix - Error message prefix
     */
    validateSkills(skills, prefix) {
        if (!skills) {
            this.errors.push(`${prefix} skills array is required`);
            return;
        }
        if (!Array.isArray(skills)) {
            this.errors.push(`${prefix} skills must be an array`);
            return;
        }
        if (skills.length === 0) {
            this.errors.push(`${prefix} At least one skill is required per category`);
            return;
        }

        // Validate each skill
        skills.forEach((skill, skillIndex) => {
            this.validateSkill(skill, `${prefix} Skill [${skillIndex}]:`);
        });

        // Check for duplicate skill names within category
        this.checkDuplicateSkills(skills, prefix);
    }

    /**
     * Validate individual skill
     * @param {Object} skill - Skill object
     * @param {string} prefix - Error message prefix
     */
    validateSkill(skill, prefix) {
        if (!skill || typeof skill !== 'object') {
            this.errors.push(`${prefix} Skill must be an object`);
            return;
        }

        // Validate required skill fields
        this.validateSkillName(skill.name, prefix);
        this.validateProficiencyLevel(skill.proficiencyLevel, prefix);
        this.validateYearsExperience(skill.yearsExperience, prefix);
        this.validateIconUrl(skill.iconUrl, prefix);
        this.validateSkillDescription(skill.description, prefix);
    }

    /**
     * Validate skill name
     * @param {string} name - Skill name
     * @param {string} prefix - Error message prefix
     */
    validateSkillName(name, prefix) {
        if (!name) {
            this.errors.push(`${prefix} name is required`);
            return;
        }
        if (typeof name !== 'string') {
            this.errors.push(`${prefix} name must be a string`);
            return;
        }
        if (name.length < 2 || name.length > 50) {
            this.errors.push(`${prefix} name must be between 2 and 50 characters`);
        }
    }

    /**
     * Validate proficiency level
     * @param {string} level - Proficiency level
     * @param {string} prefix - Error message prefix
     */
    validateProficiencyLevel(level, prefix) {
        const validLevels = ['Expert', 'Advanced', 'Intermediate', 'Beginner'];
        
        if (!level) {
            this.errors.push(`${prefix} proficiencyLevel is required`);
            return;
        }
        if (typeof level !== 'string') {
            this.errors.push(`${prefix} proficiencyLevel must be a string`);
            return;
        }
        if (!validLevels.includes(level)) {
            this.errors.push(`${prefix} proficiencyLevel must be one of: ${validLevels.join(', ')}`);
        }
    }

    /**
     * Validate years of experience for skill
     * @param {number} years - Years of experience
     * @param {string} prefix - Error message prefix
     */
    validateYearsExperience(years, prefix) {
        if (years === undefined || years === null) {
            this.errors.push(`${prefix} yearsExperience is required`);
            return;
        }
        if (typeof years !== 'number' || !Number.isInteger(years)) {
            this.errors.push(`${prefix} yearsExperience must be an integer`);
            return;
        }
        if (years < 0 || years > 30) {
            this.errors.push(`${prefix} yearsExperience must be between 0 and 30`);
        }
    }

    /**
     * Validate icon URL
     * @param {string} iconUrl - Path to skill icon
     * @param {string} prefix - Error message prefix
     */
    validateIconUrl(iconUrl, prefix) {
        if (!iconUrl) {
            this.errors.push(`${prefix} iconUrl is required`);
            return;
        }
        if (typeof iconUrl !== 'string') {
            this.errors.push(`${prefix} iconUrl must be a string`);
            return;
        }
        if (iconUrl.length < 5) {
            this.errors.push(`${prefix} iconUrl must be a valid path`);
        }
    }

    /**
     * Validate skill description
     * @param {string} description - Skill description
     * @param {string} prefix - Error message prefix
     */
    validateSkillDescription(description, prefix) {
        if (!description) {
            this.errors.push(`${prefix} description is required`);
            return;
        }
        if (typeof description !== 'string') {
            this.errors.push(`${prefix} description must be a string`);
            return;
        }
        if (description.length < 10 || description.length > 300) {
            this.errors.push(`${prefix} description must be between 10 and 300 characters`);
        }
    }

    /**
     * Validate display order for category
     * @param {number} order - Display order
     * @param {string} prefix - Error message prefix
     */
    validateDisplayOrder(order, prefix) {
        if (order === undefined || order === null) {
            this.errors.push(`${prefix} displayOrder is required`);
            return;
        }
        if (typeof order !== 'number' || !Number.isInteger(order)) {
            this.errors.push(`${prefix} displayOrder must be an integer`);
            return;
        }
        if (order < 1) {
            this.errors.push(`${prefix} displayOrder must be a positive integer`);
        }
    }

    /**
     * Validate icon class
     * @param {string} iconClass - CSS icon class
     * @param {string} prefix - Error message prefix
     */
    validateIconClass(iconClass, prefix) {
        if (!iconClass) {
            this.warnings.push(`${prefix} iconClass is recommended for better UI`);
            return;
        }
        if (typeof iconClass !== 'string') {
            this.errors.push(`${prefix} iconClass must be a string`);
            return;
        }
        if (iconClass.length < 3) {
            this.errors.push(`${prefix} iconClass must be a valid CSS class`);
        }
    }

    /**
     * Check for duplicate category names
     * @param {Array} categories - Array of categories
     */
    checkDuplicateCategories(categories) {
        const names = categories.map(cat => cat.categoryName).filter(name => name);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        
        if (duplicates.length > 0) {
            this.errors.push(`Duplicate category names found: ${[...new Set(duplicates)].join(', ')}`);
        }
    }

    /**
     * Check for duplicate skill names within category
     * @param {Array} skills - Array of skills
     * @param {string} prefix - Error message prefix
     */
    checkDuplicateSkills(skills, prefix) {
        const names = skills.map(skill => skill.name).filter(name => name);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        
        if (duplicates.length > 0) {
            this.errors.push(`${prefix} Duplicate skill names: ${[...new Set(duplicates)].join(', ')}`);
        }
    }

    /**
     * Validate display order sequence
     * @param {Array} categories - Array of categories
     */
    validateDisplayOrder(categories) {
        const orders = categories
            .map(cat => cat.displayOrder)
            .filter(order => typeof order === 'number')
            .sort((a, b) => a - b);

        // Check for gaps in sequence
        for (let i = 1; i < orders.length; i++) {
            if (orders[i] === orders[i - 1]) {
                this.warnings.push(`Duplicate display order found: ${orders[i]}`);
            }
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
     * @param {Object} skillsData - Skills data
     * @returns {boolean} True if valid, false otherwise
     */
    static isValid(skillsData) {
        const validator = new SkillsValidator();
        return validator.validate(skillsData).isValid;
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillsValidator;
} else if (typeof window !== 'undefined') {
    window.SkillsValidator = SkillsValidator;
}