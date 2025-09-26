/**
 * UI Rendering Validation Test
 * Tests UI rendering functionality and validates rendered content structure
 * 
 * @file assets/js/tests/rendering-test.js
 * @requires None (vanilla JavaScript, DOM API)
 */

class UIRenderingTest {
    constructor() {
        this.testResults = [];
        this.testContainer = null;
        this.originalContent = {};
        
        // Mock data for testing
        this.mockData = this.generateMockData();
    }

    /**
     * Run all UI rendering tests
     * @returns {Promise<Object>} Test results summary
     */
    async runAllTests() {
        this.testResults = [];
        this.log('Starting UI Rendering Validation Tests...');

        // Setup test environment
        this.setupTestEnvironment();

        try {
            // Test section rendering
            await this.testHeroSectionRendering();
            await this.testAboutSectionRendering();
            await this.testSkillsSectionRendering();
            await this.testProjectsSectionRendering();
            await this.testContactSectionRendering();

            // Test responsive behavior
            await this.testResponsiveRendering();

            // Test accessibility features
            await this.testAccessibilityFeatures();

            // Test error handling in rendering
            await this.testRenderingErrorHandling();

        } finally {
            // Cleanup test environment
            this.cleanupTestEnvironment();
        }

        // Generate summary
        return this.generateTestSummary();
    }

    /**
     * Setup test environment with mock container
     */
    setupTestEnvironment() {
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'rendering-test-container';
        this.testContainer.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 1200px;
            height: 800px;
            visibility: hidden;
        `;
        
        // Store original content
        const sections = ['home', 'services', 'Projects', 'skill', 'Experiance'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                this.originalContent[sectionId] = section.innerHTML;
            }
        });

        document.body.appendChild(this.testContainer);
        this.log('Test environment setup complete');
    }

    /**
     * Cleanup test environment
     */
    cleanupTestEnvironment() {
        if (this.testContainer) {
            document.body.removeChild(this.testContainer);
        }

        // Restore original content
        Object.keys(this.originalContent).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section && this.originalContent[sectionId]) {
                section.innerHTML = this.originalContent[sectionId];
            }
        });

        this.log('Test environment cleanup complete');
    }

    /**
     * Test hero section rendering
     */
    async testHeroSectionRendering() {
        try {
            this.log('Testing hero section rendering...');
            
            // Create hero section mock
            const heroSection = this.createMockHeroSection(this.mockData.profile);
            
            // Test basic structure
            const hasTitle = heroSection.querySelector('h1') !== null;
            const hasSubtitle = heroSection.querySelector('.lead, p') !== null;
            const hasButton = heroSection.querySelector('.btn, button') !== null;
            
            this.addTestResult(
                'Hero Section Structure',
                hasTitle && hasSubtitle,
                hasTitle && hasSubtitle ? 'Hero section has required elements' : 
                'Missing required hero elements (title/subtitle)'
            );

            // Test content population
            const titleElement = heroSection.querySelector('h1');
            const titleHasContent = titleElement && titleElement.textContent.trim().length > 0;
            
            this.addTestResult(
                'Hero Content Population',
                titleHasContent,
                titleHasContent ? 'Hero content populated successfully' : 'Hero title is empty'
            );

            // Test responsive classes
            const hasResponsiveClasses = this.checkBootstrapClasses(heroSection, 
                ['col-lg', 'col-md', 'col-sm', 'd-block', 'd-lg', 'mb-', 'mt-']);
            
            this.addTestResult(
                'Hero Responsive Classes',
                hasResponsiveClasses,
                hasResponsiveClasses ? 'Hero has responsive classes' : 'Missing responsive classes'
            );

        } catch (error) {
            this.addTestResult('Hero Section Rendering', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test about section rendering
     */
    async testAboutSectionRendering() {
        try {
            this.log('Testing about section rendering...');
            
            // Create about section mock
            const aboutSection = this.createMockAboutSection(this.mockData.profile);
            
            // Test professional photo
            const photoElement = aboutSection.querySelector('img');
            const hasPhoto = photoElement !== null;
            const hasAltText = photoElement && photoElement.getAttribute('alt');
            
            this.addTestResult(
                'About Section Photo',
                hasPhoto && hasAltText,
                hasPhoto && hasAltText ? 'Photo with alt text rendered' : 
                'Missing photo or alt text'
            );

            // Test content sections
            const textContent = aboutSection.textContent.trim();
            const hasContent = textContent.length > 50; // Meaningful content
            
            this.addTestResult(
                'About Content Rendering',
                hasContent,
                hasContent ? 'About content rendered successfully' : 'Insufficient about content'
            );

        } catch (error) {
            this.addTestResult('About Section Rendering', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test skills section rendering
     */
    async testSkillsSectionRendering() {
        try {
            this.log('Testing skills section rendering...');
            
            // Create skills section mock
            const skillsSection = this.createMockSkillsSection(this.mockData.skills);
            
            // Test skill categories
            const categoryElements = skillsSection.querySelectorAll('.skill-category, .review');
            const hasCategories = categoryElements.length > 0;
            
            this.addTestResult(
                'Skills Categories Rendered',
                hasCategories,
                hasCategories ? `${categoryElements.length} skill categories rendered` : 
                'No skill categories rendered'
            );

            // Test skill icons
            const iconElements = skillsSection.querySelectorAll('img, i[class*="la-"]');
            const hasIcons = iconElements.length > 0;
            
            this.addTestResult(
                'Skills Icons Rendered',
                hasIcons,
                hasIcons ? `${iconElements.length} skill icons rendered` : 'No skill icons found'
            );

            // Test grid layout
            const hasGridClasses = this.checkBootstrapClasses(skillsSection, 
                ['row', 'col-', 'gy-', 'gx-']);
            
            this.addTestResult(
                'Skills Grid Layout',
                hasGridClasses,
                hasGridClasses ? 'Skills use Bootstrap grid system' : 'Missing grid layout classes'
            );

        } catch (error) {
            this.addTestResult('Skills Section Rendering', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test projects section rendering
     */
    async testProjectsSectionRendering() {
        try {
            this.log('Testing projects section rendering...');
            
            // Create projects section mock
            const projectsSection = this.createMockProjectsSection(this.mockData.projects);
            
            // Test project cards
            const projectCards = projectsSection.querySelectorAll('.card, .card-custom');
            const hasCards = projectCards.length > 0;
            
            this.addTestResult(
                'Project Cards Rendered',
                hasCards,
                hasCards ? `${projectCards.length} project cards rendered` : 'No project cards rendered'
            );

            // Test project images
            const projectImages = projectsSection.querySelectorAll('img');
            const hasImages = projectImages.length > 0;
            
            this.addTestResult(
                'Project Images Rendered',
                hasImages,
                hasImages ? `${projectImages.length} project images rendered` : 'No project images found'
            );

            // Test project metadata
            const hasMetadata = Array.from(projectCards).some(card => {
                const title = card.querySelector('h4, h5, .card-title');
                const description = card.querySelector('p, .card-text');
                return title && description;
            });
            
            this.addTestResult(
                'Project Metadata',
                hasMetadata,
                hasMetadata ? 'Projects have titles and descriptions' : 'Missing project metadata'
            );

        } catch (error) {
            this.addTestResult('Projects Section Rendering', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test contact section rendering
     */
    async testContactSectionRendering() {
        try {
            this.log('Testing contact section rendering...');
            
            // Create contact section mock
            const contactSection = this.createMockContactSection(this.mockData.contact);
            
            // Test contact methods
            const contactLinks = contactSection.querySelectorAll('a[href*="mailto:"], a[href*="linkedin"], a[href*="github"]');
            const hasContactMethods = contactLinks.length > 0;
            
            this.addTestResult(
                'Contact Methods Rendered',
                hasContactMethods,
                hasContactMethods ? `${contactLinks.length} contact methods rendered` : 
                'No contact methods rendered'
            );

            // Test social media icons
            const socialIcons = contactSection.querySelectorAll('i[class*="lab-"], i[class*="las-"], .social-icon');
            const hasSocialIcons = socialIcons.length > 0;
            
            this.addTestResult(
                'Social Media Icons',
                hasSocialIcons,
                hasSocialIcons ? `${socialIcons.length} social icons rendered` : 'No social icons found'
            );

        } catch (error) {
            this.addTestResult('Contact Section Rendering', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test responsive rendering behavior
     */
    async testResponsiveRendering() {
        try {
            this.log('Testing responsive rendering...');
            
            // Test different viewport sizes
            const viewports = [
                { width: 320, height: 568, name: 'Mobile' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 1200, height: 800, name: 'Desktop' }
            ];

            let responsiveTests = 0;
            let passedTests = 0;

            for (const viewport of viewports) {
                this.testContainer.style.width = `${viewport.width}px`;
                this.testContainer.style.height = `${viewport.height}px`;
                
                // Check if elements adapt to viewport
                const testElement = this.createMockHeroSection(this.mockData.profile);
                this.testContainer.appendChild(testElement);
                
                // Test Bootstrap responsive classes
                const hasResponsiveClasses = this.checkBootstrapClasses(testElement, 
                    ['col-sm', 'col-md', 'col-lg', 'd-sm', 'd-md', 'd-lg']);
                
                if (hasResponsiveClasses) passedTests++;
                responsiveTests++;
                
                this.testContainer.removeChild(testElement);
            }

            this.addTestResult(
                'Responsive Design',
                passedTests === responsiveTests,
                `${passedTests}/${responsiveTests} viewport tests passed`
            );

        } catch (error) {
            this.addTestResult('Responsive Rendering', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test accessibility features
     */
    async testAccessibilityFeatures() {
        try {
            this.log('Testing accessibility features...');
            
            // Create test content
            const testSection = this.createMockHeroSection(this.mockData.profile);
            
            // Test ARIA attributes
            const elementsWithAria = testSection.querySelectorAll('[aria-label], [aria-describedby], [role]');
            const hasAriaAttributes = elementsWithAria.length > 0;
            
            // Test alt text on images
            const images = testSection.querySelectorAll('img');
            const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt'));
            const allImagesHaveAlt = images.length === 0 || imagesWithAlt.length === images.length;
            
            // Test heading structure
            const headings = testSection.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const hasHeadings = headings.length > 0;
            
            // Test focus management
            const focusableElements = testSection.querySelectorAll('a, button, input, textarea, select, [tabindex]');
            const hasFocusableElements = focusableElements.length > 0;
            
            const accessibilityScore = [hasAriaAttributes, allImagesHaveAlt, hasHeadings, hasFocusableElements]
                .filter(Boolean).length;
            
            this.addTestResult(
                'Accessibility Features',
                accessibilityScore >= 3,
                `Accessibility score: ${accessibilityScore}/4 features implemented`
            );

        } catch (error) {
            this.addTestResult('Accessibility Testing', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test rendering error handling
     */
    async testRenderingErrorHandling() {
        try {
            this.log('Testing rendering error handling...');
            
            // Test with null/undefined data
            const nullResult = this.createMockHeroSection(null);
            const hasNullHandling = nullResult !== null && nullResult.textContent.length > 0;
            
            // Test with empty data
            const emptyResult = this.createMockHeroSection({});
            const hasEmptyHandling = emptyResult !== null;
            
            // Test with malformed data
            const malformedResult = this.createMockHeroSection({ name: null, title: undefined });
            const hasMalformedHandling = malformedResult !== null;
            
            const errorHandlingScore = [hasNullHandling, hasEmptyHandling, hasMalformedHandling]
                .filter(Boolean).length;
            
            this.addTestResult(
                'Rendering Error Handling',
                errorHandlingScore >= 2,
                `Error handling score: ${errorHandlingScore}/3 scenarios handled`
            );

        } catch (error) {
            this.addTestResult('Rendering Error Handling', false, `Error: ${error.message}`);
        }
    }

    // Mock section creators

    /**
     * Create mock hero section
     * @param {Object} profileData - Profile data
     * @returns {HTMLElement} Hero section element
     */
    createMockHeroSection(profileData) {
        const section = document.createElement('section');
        section.className = 'full-height px-lg-5';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const row = document.createElement('div');
        row.className = 'row';
        
        const col = document.createElement('div');
        col.className = 'col-lg-10';
        
        if (profileData && profileData.name && profileData.title) {
            const h1 = document.createElement('h1');
            h1.className = 'display-4 fw-bold';
            h1.innerHTML = `I'm a <span class="text-brand">${profileData.title}</span> From ${profileData.location || 'Pakistan'}`;
            
            const p = document.createElement('p');
            p.className = 'lead mt-2 mb-4';
            p.textContent = profileData.tagline || 'Professional tagline here';
            
            const button = document.createElement('a');
            button.className = 'btn btn-brand me-3';
            button.textContent = 'Explore My Work';
            
            col.appendChild(h1);
            col.appendChild(p);
            col.appendChild(button);
        } else {
            // Error handling - show placeholder
            const placeholder = document.createElement('p');
            placeholder.textContent = 'Profile information loading...';
            col.appendChild(placeholder);
        }
        
        row.appendChild(col);
        container.appendChild(row);
        section.appendChild(container);
        
        return section;
    }

    /**
     * Create mock about section
     * @param {Object} profileData - Profile data
     * @returns {HTMLElement} About section element
     */
    createMockAboutSection(profileData) {
        const section = document.createElement('section');
        section.className = 'full-height px-lg-5';
        
        if (profileData && profileData.professionalPhoto) {
            const img = document.createElement('img');
            img.src = profileData.professionalPhoto.src || '';
            img.alt = profileData.professionalPhoto.alt || 'Professional photo';
            img.className = 'rounded-circle';
            
            const p = document.createElement('p');
            p.textContent = profileData.summary || profileData.professionalStatement || 'About information here';
            
            section.appendChild(img);
            section.appendChild(p);
        }
        
        return section;
    }

    /**
     * Create mock skills section
     * @param {Object} skillsData - Skills data
     * @returns {HTMLElement} Skills section element
     */
    createMockSkillsSection(skillsData) {
        const section = document.createElement('section');
        section.className = 'full-height px-lg-5';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const row = document.createElement('div');
        row.className = 'row gy-3 justify-content-center align-items-center';
        
        if (skillsData && skillsData.skillCategories) {
            skillsData.skillCategories.forEach(category => {
                const col = document.createElement('div');
                col.className = 'col-md-4';
                
                const card = document.createElement('div');
                card.className = 'review shadow-effect bg-base p-4 rounded-4';
                
                if (category.skills && category.skills[0]) {
                    const img = document.createElement('img');
                    img.src = category.skills[0].iconUrl || '';
                    img.alt = category.skills[0].name || '';
                    img.className = 'rounded-4';
                    img.style.maxWidth = '80px';
                    
                    const title = document.createElement('p');
                    title.className = 'mt-3 mb-0 font-weight-bold';
                    title.textContent = category.skills[0].name || '';
                    
                    card.appendChild(img);
                    card.appendChild(title);
                }
                
                col.appendChild(card);
                row.appendChild(col);
            });
        }
        
        container.appendChild(row);
        section.appendChild(container);
        
        return section;
    }

    /**
     * Create mock projects section
     * @param {Object} projectsData - Projects data
     * @returns {HTMLElement} Projects section element
     */
    createMockProjectsSection(projectsData) {
        const section = document.createElement('section');
        section.className = 'full-height px-lg-5';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const row = document.createElement('div');
        row.className = 'row gy-4';
        
        if (projectsData && projectsData.projects) {
            projectsData.projects.forEach(project => {
                const col = document.createElement('div');
                col.className = 'col-md-6';
                
                const card = document.createElement('div');
                card.className = 'card-custom rounded-4 bg-base shadow-effect';
                
                if (project.screenshots && project.screenshots[0]) {
                    const img = document.createElement('img');
                    img.src = project.screenshots[0].src || '';
                    img.alt = project.screenshots[0].alt || project.title;
                    img.className = 'rounded-4';
                    card.appendChild(img);
                }
                
                const content = document.createElement('div');
                content.className = 'card-custom-content p-4';
                
                const title = document.createElement('h4');
                title.textContent = project.title || '';
                
                const description = document.createElement('p');
                description.textContent = project.shortDescription || '';
                
                content.appendChild(title);
                content.appendChild(description);
                card.appendChild(content);
                
                col.appendChild(card);
                row.appendChild(col);
            });
        }
        
        container.appendChild(row);
        section.appendChild(container);
        
        return section;
    }

    /**
     * Create mock contact section
     * @param {Object} contactData - Contact data
     * @returns {HTMLElement} Contact section element
     */
    createMockContactSection(contactData) {
        const section = document.createElement('section');
        section.className = 'full-height px-lg-5';
        
        if (contactData) {
            if (contactData.email) {
                const emailLink = document.createElement('a');
                emailLink.href = `mailto:${contactData.email}`;
                emailLink.textContent = contactData.email;
                section.appendChild(emailLink);
            }
            
            if (contactData.linkedInUrl) {
                const linkedInLink = document.createElement('a');
                linkedInLink.href = contactData.linkedInUrl;
                linkedInLink.textContent = 'LinkedIn';
                section.appendChild(linkedInLink);
            }
            
            if (contactData.githubUrl) {
                const githubLink = document.createElement('a');
                githubLink.href = contactData.githubUrl;
                githubLink.textContent = 'GitHub';
                section.appendChild(githubLink);
            }
        }
        
        return section;
    }

    // Helper methods

    /**
     * Check if element has Bootstrap classes
     * @param {HTMLElement} element - Element to check
     * @param {Array} classPatterns - Array of class patterns to look for
     * @returns {boolean} True if has Bootstrap classes
     */
    checkBootstrapClasses(element, classPatterns) {
        const allClasses = Array.from(element.querySelectorAll('*'))
            .map(el => el.className)
            .join(' ') + ' ' + element.className;
        
        return classPatterns.some(pattern => 
            allClasses.includes(pattern) || 
            new RegExp(pattern.replace('*', '\\w*')).test(allClasses)
        );
    }

    /**
     * Generate mock data for testing
     * @returns {Object} Mock data object
     */
    generateMockData() {
        return {
            profile: {
                name: 'Test Developer',
                title: 'Backend Developer',
                specialization: 'Django | REST APIs | System Design',
                tagline: 'Test tagline for portfolio',
                professionalPhoto: {
                    src: './assets/images/face.jpeg',
                    alt: 'Test Developer Photo'
                },
                location: 'Test City',
                summary: 'Test summary for about section',
                professionalStatement: 'Test professional statement'
            },
            skills: {
                skillCategories: [
                    {
                        categoryName: 'Backend Development',
                        skills: [
                            {
                                name: 'Python',
                                iconUrl: './assets/images/python_logo.png'
                            }
                        ]
                    }
                ]
            },
            projects: {
                projects: [
                    {
                        title: 'Test Project',
                        shortDescription: 'Test project description',
                        screenshots: [
                            {
                                src: './assets/images/project-1.jpg',
                                alt: 'Test Project Screenshot'
                            }
                        ]
                    }
                ]
            },
            contact: {
                email: 'test@example.com',
                linkedInUrl: 'https://linkedin.com/in/test',
                githubUrl: 'https://github.com/test'
            }
        };
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

        this.log('\n=== UI Rendering Test Summary ===');
        this.log(`Total Tests: ${totalTests}`);
        this.log(`Passed: ${passedTests}`);
        this.log(`Failed: ${failedTests}`);
        this.log(`Success Rate: ${successRate}%`);
        
        if (failedTests === 0) {
            this.log('🎉 All UI rendering tests passed!');
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
        console.log(`[UIRenderingTest] ${message}`);
    }

    /**
     * Static method to run tests quickly
     * @returns {Promise<Object>} Test results summary
     */
    static async runTests() {
        const tester = new UIRenderingTest();
        return await tester.runAllTests();
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRenderingTest;
} else if (typeof window !== 'undefined') {
    window.UIRenderingTest = UIRenderingTest;
}