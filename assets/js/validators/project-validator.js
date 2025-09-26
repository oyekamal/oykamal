/**
 * Project Validator
 * Validates Project data structures according to data model specification
 * 
 * @file assets/js/validators/project-validator.js
 * @requires None (vanilla JavaScript)
 */

class ProjectValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Validate complete projects data structure
     * @param {Object} projectsData - Projects data with projects array
     * @returns {Object} Validation result with isValid, errors, warnings
     */
    validate(projectsData) {
        this.errors = [];
        this.warnings = [];

        // Check if projectsData exists and is an object
        if (!projectsData || typeof projectsData !== 'object') {
            this.errors.push('Projects data is required and must be an object');
            return this.getResult();
        }

        // Check if projects exists and is an array
        if (!projectsData.projects) {
            this.errors.push('projects array is required');
            return this.getResult();
        }

        if (!Array.isArray(projectsData.projects)) {
            this.errors.push('projects must be an array');
            return this.getResult();
        }

        if (projectsData.projects.length === 0) {
            this.warnings.push('At least one project is recommended for portfolio display');
            return this.getResult();
        }

        // Validate each project
        projectsData.projects.forEach((project, index) => {
            this.validateProject(project, index);
        });

        // Check for duplicate project titles
        this.checkDuplicateTitles(projectsData.projects);

        // Validate display order sequence
        this.validateDisplayOrderSequence(projectsData.projects);

        return this.getResult();
    }

    /**
     * Validate individual project
     * @param {Object} project - Project object
     * @param {number} index - Project index for error reporting
     */
    validateProject(project, index) {
        const prefix = `Project [${index}]:`;

        if (!project || typeof project !== 'object') {
            this.errors.push(`${prefix} Project must be an object`);
            return;
        }

        // Validate required fields
        this.validateTitle(project.title, prefix);
        this.validateShortDescription(project.shortDescription, prefix);
        this.validateDetailedDescription(project.detailedDescription, prefix);
        this.validateProblemStatement(project.problemStatement, prefix);
        this.validateSolution(project.solution, prefix);
        this.validateKeyChallenges(project.keyChallengess, prefix); // Note: typo in data model
        this.validateTechnologies(project.technologies, prefix);
        this.validateScreenshots(project.screenshots, prefix);
        this.validateMetrics(project.metrics, prefix);
        this.validateDateCompleted(project.dateCompleted, prefix);
        this.validateFeatured(project.featured, prefix);
        this.validateDisplayOrder(project.displayOrder, prefix);

        // Validate optional fields
        this.validateOptionalUrls(project, prefix);
    }

    /**
     * Validate project title
     * @param {string} title - Project title
     * @param {string} prefix - Error message prefix
     */
    validateTitle(title, prefix) {
        if (!title) {
            this.errors.push(`${prefix} title is required`);
            return;
        }
        if (typeof title !== 'string') {
            this.errors.push(`${prefix} title must be a string`);
            return;
        }
        if (title.length < 5 || title.length > 100) {
            this.errors.push(`${prefix} title must be between 5 and 100 characters`);
        }
    }

    /**
     * Validate short description
     * @param {string} description - Short description
     * @param {string} prefix - Error message prefix
     */
    validateShortDescription(description, prefix) {
        if (!description) {
            this.errors.push(`${prefix} shortDescription is required`);
            return;
        }
        if (typeof description !== 'string') {
            this.errors.push(`${prefix} shortDescription must be a string`);
            return;
        }
        if (description.length < 10 || description.length > 200) {
            this.errors.push(`${prefix} shortDescription must be between 10 and 200 characters`);
        }
    }

    /**
     * Validate detailed description
     * @param {string} description - Detailed description
     * @param {string} prefix - Error message prefix
     */
    validateDetailedDescription(description, prefix) {
        if (!description) {
            this.errors.push(`${prefix} detailedDescription is required`);
            return;
        }
        if (typeof description !== 'string') {
            this.errors.push(`${prefix} detailedDescription must be a string`);
            return;
        }
        if (description.length < 50 || description.length > 1000) {
            this.errors.push(`${prefix} detailedDescription must be between 50 and 1000 characters`);
        }
    }

    /**
     * Validate problem statement
     * @param {string} statement - Problem statement
     * @param {string} prefix - Error message prefix
     */
    validateProblemStatement(statement, prefix) {
        if (!statement) {
            this.errors.push(`${prefix} problemStatement is required`);
            return;
        }
        if (typeof statement !== 'string') {
            this.errors.push(`${prefix} problemStatement must be a string`);
            return;
        }
        if (statement.length < 20 || statement.length > 500) {
            this.errors.push(`${prefix} problemStatement must be between 20 and 500 characters`);
        }
    }

    /**
     * Validate solution
     * @param {string} solution - Solution description
     * @param {string} prefix - Error message prefix
     */
    validateSolution(solution, prefix) {
        if (!solution) {
            this.errors.push(`${prefix} solution is required`);
            return;
        }
        if (typeof solution !== 'string') {
            this.errors.push(`${prefix} solution must be a string`);
            return;
        }
        if (solution.length < 20 || solution.length > 500) {
            this.errors.push(`${prefix} solution must be between 20 and 500 characters`);
        }
    }

    /**
     * Validate key challenges array
     * @param {Array} challenges - Array of key challenges
     * @param {string} prefix - Error message prefix
     */
    validateKeyChallenges(challenges, prefix) {
        if (!challenges) {
            this.errors.push(`${prefix} keyChallengess is required`);
            return;
        }
        if (!Array.isArray(challenges)) {
            this.errors.push(`${prefix} keyChallengess must be an array`);
            return;
        }
        if (challenges.length === 0) {
            this.errors.push(`${prefix} At least one key challenge is required`);
            return;
        }

        challenges.forEach((challenge, index) => {
            if (!challenge || typeof challenge !== 'string') {
                this.errors.push(`${prefix} Challenge [${index}] must be a non-empty string`);
            } else if (challenge.length < 10 || challenge.length > 200) {
                this.errors.push(`${prefix} Challenge [${index}] must be between 10 and 200 characters`);
            }
        });
    }

    /**
     * Validate technologies array
     * @param {Array} technologies - Array of technologies
     * @param {string} prefix - Error message prefix
     */
    validateTechnologies(technologies, prefix) {
        if (!technologies) {
            this.errors.push(`${prefix} technologies is required`);
            return;
        }
        if (!Array.isArray(technologies)) {
            this.errors.push(`${prefix} technologies must be an array`);
            return;
        }
        if (technologies.length === 0) {
            this.errors.push(`${prefix} At least one technology is required`);
            return;
        }

        technologies.forEach((tech, index) => {
            if (!tech || typeof tech !== 'string') {
                this.errors.push(`${prefix} Technology [${index}] must be a non-empty string`);
            } else if (tech.length < 2 || tech.length > 50) {
                this.errors.push(`${prefix} Technology [${index}] must be between 2 and 50 characters`);
            }
        });

        // Check for duplicates
        const duplicates = technologies.filter((tech, index) => technologies.indexOf(tech) !== index);
        if (duplicates.length > 0) {
            this.warnings.push(`${prefix} Duplicate technologies: ${[...new Set(duplicates)].join(', ')}`);
        }
    }

    /**
     * Validate screenshots array
     * @param {Array} screenshots - Array of ImageAsset objects
     * @param {string} prefix - Error message prefix
     */
    validateScreenshots(screenshots, prefix) {
        if (!screenshots) {
            this.warnings.push(`${prefix} screenshots are recommended for visual project showcase`);
            return;
        }
        if (!Array.isArray(screenshots)) {
            this.errors.push(`${prefix} screenshots must be an array`);
            return;
        }

        screenshots.forEach((screenshot, index) => {
            this.validateImageAsset(screenshot, `${prefix} Screenshot [${index}]:`);
        });
    }

    /**
     * Validate ImageAsset object
     * @param {Object} imageAsset - ImageAsset object
     * @param {string} prefix - Error message prefix
     */
    validateImageAsset(imageAsset, prefix) {
        if (!imageAsset || typeof imageAsset !== 'object') {
            this.errors.push(`${prefix} ImageAsset must be an object`);
            return;
        }

        // Required fields
        if (!imageAsset.src || typeof imageAsset.src !== 'string') {
            this.errors.push(`${prefix} src is required and must be a valid path`);
        }
        if (!imageAsset.alt || typeof imageAsset.alt !== 'string') {
            this.errors.push(`${prefix} alt text is required for accessibility`);
        }

        // Optional fields validation
        if (imageAsset.width && (typeof imageAsset.width !== 'number' || imageAsset.width <= 0)) {
            this.errors.push(`${prefix} width must be a positive number`);
        }
        if (imageAsset.height && (typeof imageAsset.height !== 'number' || imageAsset.height <= 0)) {
            this.errors.push(`${prefix} height must be a positive number`);
        }
        if (imageAsset.lazyLoad !== undefined && typeof imageAsset.lazyLoad !== 'boolean') {
            this.errors.push(`${prefix} lazyLoad must be a boolean`);
        }
    }

    /**
     * Validate project metrics
     * @param {Object} metrics - ProjectMetrics object
     * @param {string} prefix - Error message prefix
     */
    validateMetrics(metrics, prefix) {
        if (!metrics) {
            this.warnings.push(`${prefix} metrics are recommended for project impact demonstration`);
            return;
        }
        if (typeof metrics !== 'object') {
            this.errors.push(`${prefix} metrics must be an object`);
            return;
        }

        // Validate metrics fields
        const metricsFields = ['performanceImprovements', 'scalabilityAchievements', 'businessImpact', 'technicalMetrics'];
        let hasValidMetrics = false;

        metricsFields.forEach(field => {
            if (metrics[field]) {
                hasValidMetrics = true;
                if (typeof metrics[field] !== 'string') {
                    this.errors.push(`${prefix} ${field} must be a string`);
                } else if (metrics[field].length < 5 || metrics[field].length > 200) {
                    this.errors.push(`${prefix} ${field} must be between 5 and 200 characters`);
                }
            }
        });

        if (!hasValidMetrics) {
            this.warnings.push(`${prefix} At least one metric field is recommended`);
        }
    }

    /**
     * Validate date completed
     * @param {string} date - Date completed
     * @param {string} prefix - Error message prefix
     */
    validateDateCompleted(date, prefix) {
        if (!date) {
            this.errors.push(`${prefix} dateCompleted is required`);
            return;
        }
        if (typeof date !== 'string') {
            this.errors.push(`${prefix} dateCompleted must be a string`);
            return;
        }

        // Check if it's a valid date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            this.errors.push(`${prefix} dateCompleted must be in YYYY-MM-DD format`);
            return;
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            this.errors.push(`${prefix} dateCompleted must be a valid date`);
        }
    }

    /**
     * Validate featured flag
     * @param {boolean} featured - Featured flag
     * @param {string} prefix - Error message prefix
     */
    validateFeatured(featured, prefix) {
        if (featured !== undefined && typeof featured !== 'boolean') {
            this.errors.push(`${prefix} featured must be a boolean`);
        }
    }

    /**
     * Validate display order
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
     * Validate optional URL fields
     * @param {Object} project - Project object
     * @param {string} prefix - Error message prefix
     */
    validateOptionalUrls(project, prefix) {
        const urlFields = ['githubUrl', 'liveUrl', 'caseStudyUrl'];
        
        urlFields.forEach(field => {
            if (project[field] !== undefined) {
                if (typeof project[field] !== 'string') {
                    this.errors.push(`${prefix} ${field} must be a string`);
                } else if (project[field] && project[field].length < 5) {
                    this.errors.push(`${prefix} ${field} must be a valid URL or empty string`);
                }
            }
        });
    }

    /**
     * Check for duplicate project titles
     * @param {Array} projects - Array of projects
     */
    checkDuplicateTitles(projects) {
        const titles = projects.map(proj => proj.title).filter(title => title);
        const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
        
        if (duplicates.length > 0) {
            this.errors.push(`Duplicate project titles found: ${[...new Set(duplicates)].join(', ')}`);
        }
    }

    /**
     * Validate display order sequence
     * @param {Array} projects - Array of projects
     */
    validateDisplayOrderSequence(projects) {
        const orders = projects
            .map(proj => proj.displayOrder)
            .filter(order => typeof order === 'number')
            .sort((a, b) => a - b);

        // Check for duplicate display orders
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
     * @param {Object} projectsData - Projects data
     * @returns {boolean} True if valid, false otherwise
     */
    static isValid(projectsData) {
        const validator = new ProjectValidator();
        return validator.validate(projectsData).isValid;
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectValidator;
} else if (typeof window !== 'undefined') {
    window.ProjectValidator = ProjectValidator;
}