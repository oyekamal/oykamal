/**
 * Content Loading Integration Test
 * Tests JSON content loading functionality and validates loaded data
 * 
 * @file assets/js/tests/content-loading-test.js
 * @requires ProfileValidator, SkillsValidator, ProjectValidator, ContactValidator
 */

class ContentLoadingTest {
    constructor() {
        this.testResults = [];
        this.basePath = './assets/data/content/';
        this.validators = {};
        
        // Initialize validators
        this.initializeValidators();
    }

    /**
     * Initialize validator instances
     */
    initializeValidators() {
        try {
            this.validators.profile = new ProfileValidator();
            this.validators.skills = new SkillsValidator();
            this.validators.project = new ProjectValidator();
            this.validators.contact = new ContactValidator();
        } catch (error) {
            this.logError('Validator initialization failed', error.message);
        }
    }

    /**
     * Run all content loading tests
     * @returns {Promise<Object>} Test results summary
     */
    async runAllTests() {
        this.testResults = [];
        this.log('Starting Content Loading Integration Tests...');

        // Test individual content loading
        await this.testProfileLoading();
        await this.testSkillsLoading();
        await this.testProjectsLoading();
        await this.testContactLoading();

        // Test batch loading
        await this.testBatchLoading();

        // Test error handling
        await this.testErrorHandling();

        // Generate summary
        return this.generateTestSummary();
    }

    /**
     * Test profile data loading and validation
     */
    async testProfileLoading() {
        try {
            this.log('Testing profile data loading...');
            const profileData = await this.loadJSON('profile.json');
            
            if (!profileData) {
                this.addTestResult('Profile Loading', false, 'Failed to load profile.json');
                return;
            }

            // Validate loaded data
            const validation = this.validators.profile.validate(profileData);
            
            this.addTestResult(
                'Profile Loading & Validation',
                validation.isValid,
                validation.isValid ? 'Profile loaded and validated successfully' : 
                `Validation errors: ${validation.errors.join(', ')}`
            );

            // Test required fields presence
            const requiredFields = ['name', 'title', 'specialization', 'tagline'];
            const missingFields = requiredFields.filter(field => !profileData[field]);
            
            this.addTestResult(
                'Profile Required Fields',
                missingFields.length === 0,
                missingFields.length === 0 ? 'All required fields present' :
                `Missing fields: ${missingFields.join(', ')}`
            );

        } catch (error) {
            this.addTestResult('Profile Loading', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test skills data loading and validation
     */
    async testSkillsLoading() {
        try {
            this.log('Testing skills data loading...');
            const skillsData = await this.loadJSON('skills.json');
            
            if (!skillsData) {
                this.addTestResult('Skills Loading', false, 'Failed to load skills.json');
                return;
            }

            // Validate loaded data
            const validation = this.validators.skills.validate(skillsData);
            
            this.addTestResult(
                'Skills Loading & Validation',
                validation.isValid,
                validation.isValid ? 'Skills loaded and validated successfully' : 
                `Validation errors: ${validation.errors.join(', ')}`
            );

            // Test skills structure
            if (skillsData.skillCategories && Array.isArray(skillsData.skillCategories)) {
                const categoryCount = skillsData.skillCategories.length;
                const skillCount = skillsData.skillCategories.reduce(
                    (total, cat) => total + (cat.skills ? cat.skills.length : 0), 0
                );
                
                this.addTestResult(
                    'Skills Data Structure',
                    categoryCount > 0 && skillCount > 0,
                    `${categoryCount} categories with ${skillCount} total skills`
                );
            }

        } catch (error) {
            this.addTestResult('Skills Loading', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test projects data loading and validation
     */
    async testProjectsLoading() {
        try {
            this.log('Testing projects data loading...');
            const projectsData = await this.loadJSON('projects.json');
            
            if (!projectsData) {
                this.addTestResult('Projects Loading', false, 'Failed to load projects.json');
                return;
            }

            // Validate loaded data
            const validation = this.validators.project.validate(projectsData);
            
            this.addTestResult(
                'Projects Loading & Validation',
                validation.isValid,
                validation.isValid ? 'Projects loaded and validated successfully' : 
                `Validation errors: ${validation.errors.join(', ')}`
            );

            // Test projects structure
            if (projectsData.projects && Array.isArray(projectsData.projects)) {
                const projectCount = projectsData.projects.length;
                const featuredCount = projectsData.projects.filter(p => p.featured).length;
                
                this.addTestResult(
                    'Projects Data Structure',
                    projectCount > 0,
                    `${projectCount} projects (${featuredCount} featured)`
                );

                // Test image assets
                const projectsWithImages = projectsData.projects.filter(
                    p => p.screenshots && p.screenshots.length > 0
                );
                
                this.addTestResult(
                    'Project Screenshots',
                    projectsWithImages.length > 0,
                    `${projectsWithImages.length} projects have screenshots`
                );
            }

        } catch (error) {
            this.addTestResult('Projects Loading', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test contact data loading and validation
     */
    async testContactLoading() {
        try {
            this.log('Testing contact data loading...');
            const contactData = await this.loadJSON('contact.json');
            
            if (!contactData) {
                this.addTestResult('Contact Loading', false, 'Failed to load contact.json');
                return;
            }

            // Validate loaded data
            const validation = this.validators.contact.validate(contactData);
            
            this.addTestResult(
                'Contact Loading & Validation',
                validation.isValid,
                validation.isValid ? 'Contact loaded and validated successfully' : 
                `Validation errors: ${validation.errors.join(', ')}`
            );

            // Test contact methods availability
            const contactMethods = [];
            if (contactData.email) contactMethods.push('email');
            if (contactData.linkedInUrl) contactMethods.push('LinkedIn');
            if (contactData.githubUrl) contactMethods.push('GitHub');
            
            this.addTestResult(
                'Contact Methods Available',
                contactMethods.length >= 2,
                `Available methods: ${contactMethods.join(', ')}`
            );

        } catch (error) {
            this.addTestResult('Contact Loading', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test loading all content files simultaneously
     */
    async testBatchLoading() {
        try {
            this.log('Testing batch content loading...');
            const startTime = Date.now();
            
            const promises = [
                this.loadJSON('profile.json'),
                this.loadJSON('skills.json'),
                this.loadJSON('projects.json'),
                this.loadJSON('contact.json')
            ];

            const results = await Promise.all(promises);
            const loadTime = Date.now() - startTime;
            
            const allLoaded = results.every(result => result !== null);
            
            this.addTestResult(
                'Batch Loading Performance',
                allLoaded && loadTime < 2000,
                allLoaded ? `All files loaded in ${loadTime}ms` : 'Some files failed to load'
            );

        } catch (error) {
            this.addTestResult('Batch Loading', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test error handling for missing files
     */
    async testErrorHandling() {
        try {
            this.log('Testing error handling...');
            
            // Test loading non-existent file
            const nonExistentData = await this.loadJSON('non-existent.json');
            
            this.addTestResult(
                'Error Handling - Missing File',
                nonExistentData === null,
                'Properly handles missing files by returning null'
            );

            // Test invalid JSON handling would require corrupted files
            // For now, we'll just verify our error handling structure exists

        } catch (error) {
            this.addTestResult('Error Handling', false, `Error: ${error.message}`);
        }
    }

    /**
     * Load JSON file from content directory
     * @param {string} filename - JSON filename
     * @returns {Promise<Object|null>} Parsed JSON data or null if failed
     */
    async loadJSON(filename) {
        try {
            const response = await fetch(this.basePath + filename);
            
            if (!response.ok) {
                this.log(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();
            this.log(`Successfully loaded ${filename}`);
            return data;
            
        } catch (error) {
            this.log(`Error loading ${filename}: ${error.message}`);
            return null;
        }
    }

    /**
     * Add test result
     * @param {string} testName - Name of the test
     * @param {boolean} passed - Whether the test passed
     * @param {string} message - Test result message
     */
    addTestResult(testName, passed, message) {
        this.testResults.push({
            testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅ PASS' : '❌ FAIL';
        this.log(`${status}: ${testName} - ${message}`);
    }

    /**
     * Generate test summary
     * @returns {Object} Test summary
     */
    generateTestSummary() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;

        const summary = {
            totalTests,
            passedTests,
            failedTests,
            successRate: parseFloat(successRate),
            isValid: failedTests === 0,
            results: this.testResults,
            timestamp: new Date().toISOString()
        };

        this.log('\n=== Content Loading Test Summary ===');
        this.log(`Total Tests: ${totalTests}`);
        this.log(`Passed: ${passedTests}`);
        this.log(`Failed: ${failedTests}`);
        this.log(`Success Rate: ${successRate}%`);
        
        if (failedTests === 0) {
            this.log('🎉 All content loading tests passed!');
        } else {
            this.log(`⚠️ ${failedTests} test(s) failed. Check individual results for details.`);
        }

        return summary;
    }

    /**
     * Log message to console
     * @param {string} message - Message to log
     */
    log(message) {
        console.log(`[ContentLoadingTest] ${message}`);
    }

    /**
     * Log error message
     * @param {string} context - Error context
     * @param {string} message - Error message
     */
    logError(context, message) {
        console.error(`[ContentLoadingTest] ERROR in ${context}: ${message}`);
    }

    /**
     * Static method to run tests quickly
     * @returns {Promise<Object>} Test results summary
     */
    static async runTests() {
        const tester = new ContentLoadingTest();
        return await tester.runAllTests();
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoadingTest;
} else if (typeof window !== 'undefined') {
    window.ContentLoadingTest = ContentLoadingTest;
}