/**
 * ContentRenderer Module
 * 
 * Handles rendering loaded content to DOM elements with template support,
 * animation integration, and accessibility features.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class ContentRenderer {
    constructor() {
        this.templates = new Map();
        this.renderCache = new Map();
        this.animationDelay = 100; // ms between animated elements
        
        // Initialize templates
        this.initializeTemplates();
    }
    
    /**
     * Initialize rendering templates
     * @private
     */
    initializeTemplates() {
        // Profile templates
        this.templates.set('profile-hero', {
            selector: '.hero-content',
            template: (data) => `
                <h1 class="display-4 fw-bold mb-3" data-aos="fade-up">
                    ${this.escapeHtml(data.name)}
                </h1>
                <h2 class="h3 text-primary mb-4" data-aos="fade-up" data-aos-delay="100">
                    ${this.escapeHtml(data.title)}
                </h2>
                <p class="lead mb-4" data-aos="fade-up" data-aos-delay="200">
                    ${this.escapeHtml(data.specialization)}
                </p>
                <div class="hero-meta" data-aos="fade-up" data-aos-delay="300">
                    <span class="badge bg-primary me-3">
                        <i class="las la-calendar"></i>
                        ${data.yearsOfExperience}+ Years Experience
                    </span>
                    <span class="badge bg-secondary me-3">
                        <i class="las la-map-marker"></i>
                        ${this.escapeHtml(data.location)}
                    </span>
                    <span class="badge bg-success">
                        <i class="las la-check-circle"></i>
                        ${this.escapeHtml(data.availability)}
                    </span>
                </div>
            `
        });
        
        this.templates.set('profile-about', {
            selector: '.about-content',
            template: (data) => `
                <div class="row align-items-center">
                    <div class="col-lg-4 mb-4 mb-lg-0" data-aos="fade-right">
                        <div class="profile-image-container">
                            <img src="${this.escapeHtml(data.professionalPhoto.url)}" 
                                 alt="${this.escapeHtml(data.professionalPhoto.altText)}"
                                 class="img-fluid rounded-3 shadow-lg profile-photo"
                                 loading="lazy">
                        </div>
                    </div>
                    <div class="col-lg-8" data-aos="fade-left" data-aos-delay="100">
                        <h3 class="h4 mb-3">About ${this.escapeHtml(data.name)}</h3>
                        <p class="lead mb-4">${this.escapeHtml(data.tagline)}</p>
                        <div class="experience-highlight">
                            <div class="row">
                                <div class="col-sm-6 mb-3">
                                    <div class="stat-item">
                                        <div class="stat-number">${data.yearsOfExperience}+</div>
                                        <div class="stat-label">Years Experience</div>
                                    </div>
                                </div>
                                <div class="col-sm-6 mb-3">
                                    <div class="stat-item">
                                        <div class="stat-number">Backend</div>
                                        <div class="stat-label">Specialization</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
        
        // Skills templates
        this.templates.set('skills-categories', {
            selector: '.skills-container',
            template: (data) => {
                if (!Array.isArray(data)) return '';
                
                return data.sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((category, index) => `
                        <div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                            <div class="skill-category-card h-100">
                                <div class="card-header">
                                    <div class="d-flex align-items-center">
                                        <i class="${this.escapeHtml(category.iconClass)} me-3"></i>
                                        <h4 class="h5 mb-0">${this.escapeHtml(category.categoryName)}</h4>
                                    </div>
                                    <p class="text-muted mt-2 mb-0">${this.escapeHtml(category.description)}</p>
                                </div>
                                <div class="card-body">
                                    <div class="skills-grid">
                                        ${category.skills.map(skill => `
                                            <div class="skill-item" title="${this.escapeHtml(skill.description)}">
                                                <div class="skill-icon">
                                                    <img src="${this.escapeHtml(skill.iconUrl)}" 
                                                         alt="${this.escapeHtml(skill.name)}" 
                                                         loading="lazy">
                                                </div>
                                                <div class="skill-info">
                                                    <div class="skill-name">${this.escapeHtml(skill.name)}</div>
                                                    <div class="skill-level ${skill.proficiencyLevel.toLowerCase()}">
                                                        ${this.escapeHtml(skill.proficiencyLevel)}
                                                    </div>
                                                    <div class="skill-experience">${skill.yearsExperience} years</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('');
            }
        });
        
        // Projects templates
        this.templates.set('projects-grid', {
            selector: '.projects-container',
            template: (data) => {
                if (!Array.isArray(data)) return '';
                
                return data.sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((project, index) => `
                        <div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                            <div class="project-card h-100" data-project-id="${project.id}">
                                <div class="project-image">
                                    <img src="${this.escapeHtml(project.images[0]?.url || 'assets/images/project-placeholder.jpg')}" 
                                         alt="${this.escapeHtml(project.images[0]?.altText || project.title)}"
                                         class="img-fluid"
                                         loading="lazy">
                                    <div class="project-overlay">
                                        <div class="project-actions">
                                            ${project.liveUrl ? `
                                                <a href="${this.escapeHtml(project.liveUrl)}" 
                                                   class="btn btn-primary btn-sm" 
                                                   target="_blank" 
                                                   rel="noopener noreferrer"
                                                   aria-label="View ${this.escapeHtml(project.title)} live">
                                                    <i class="las la-external-link-alt"></i>
                                                    Live Demo
                                                </a>
                                            ` : ''}
                                            ${project.repositoryUrl ? `
                                                <a href="${this.escapeHtml(project.repositoryUrl)}" 
                                                   class="btn btn-outline-light btn-sm" 
                                                   target="_blank" 
                                                   rel="noopener noreferrer"
                                                   aria-label="View ${this.escapeHtml(project.title)} source code">
                                                    <i class="lab la-github"></i>
                                                    Source
                                                </a>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                                <div class="project-content">
                                    <h4 class="project-title">${this.escapeHtml(project.title)}</h4>
                                    <p class="project-summary">${this.escapeHtml(project.shortDescription)}</p>
                                    <div class="project-tech">
                                        ${project.technologies.slice(0, 4).map(tech => `
                                            <span class="tech-badge">${this.escapeHtml(tech)}</span>
                                        `).join('')}
                                        ${project.technologies.length > 4 ? `
                                            <span class="tech-badge more">+${project.technologies.length - 4} more</span>
                                        ` : ''}
                                    </div>
                                    ${project.metrics ? `
                                        <div class="project-metrics">
                                            ${project.metrics.performanceImprovement ? `
                                                <div class="metric">
                                                    <i class="las la-tachometer-alt"></i>
                                                    ${project.metrics.performanceImprovement} faster
                                                </div>
                                            ` : ''}
                                            ${project.metrics.usersServed ? `
                                                <div class="metric">
                                                    <i class="las la-users"></i>
                                                    ${project.metrics.usersServed} users
                                                </div>
                                            ` : ''}
                                        </div>
                                    ` : ''}
                                    <button class="btn btn-link p-0 mt-2 expand-project" 
                                            data-project-id="${project.id}"
                                            aria-label="Read more about ${this.escapeHtml(project.title)}">
                                        Read More <i class="las la-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
            }
        });
        
        // Contact template
        this.templates.set('contact-info', {
            selector: '.contact-content',
            template: (data) => `
                <div class="row">
                    <div class="col-lg-6 mb-4" data-aos="fade-right">
                        <h3 class="h4 mb-4">Get In Touch</h3>
                        <div class="contact-methods">
                            <div class="contact-item">
                                <i class="las la-envelope"></i>
                                <div>
                                    <strong>Email</strong>
                                    <a href="mailto:${this.escapeHtml(data.email)}">${this.escapeHtml(data.email)}</a>
                                </div>
                            </div>
                            ${data.phone ? `
                                <div class="contact-item">
                                    <i class="las la-phone"></i>
                                    <div>
                                        <strong>Phone</strong>
                                        <a href="tel:${this.escapeHtml(data.phone)}">${this.escapeHtml(data.phone)}</a>
                                    </div>
                                </div>
                            ` : ''}
                            ${data.location ? `
                                <div class="contact-item">
                                    <i class="las la-map-marker"></i>
                                    <div>
                                        <strong>Location</strong>
                                        <span>${this.escapeHtml(data.location)}</span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="social-links mt-4">
                            ${data.socialMedia ? Object.entries(data.socialMedia).map(([platform, url]) => `
                                <a href="${this.escapeHtml(url)}" 
                                   class="social-link ${platform}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   aria-label="${platform} profile">
                                    <i class="lab la-${platform}"></i>
                                </a>
                            `).join('') : ''}
                        </div>
                    </div>
                    <div class="col-lg-6" data-aos="fade-left" data-aos-delay="100">
                        <div class="contact-cta">
                            <h4 class="h5 mb-3">Ready to Collaborate?</h4>
                            <p class="mb-4">I'm always interested in discussing new opportunities and challenging backend projects.</p>
                            <div class="cta-buttons">
                                <a href="mailto:${this.escapeHtml(data.email)}?subject=Project Discussion" 
                                   class="btn btn-primary me-3">
                                    <i class="las la-paper-plane"></i>
                                    Start Conversation
                                </a>
                                ${data.linkedinUrl ? `
                                    <a href="${this.escapeHtml(data.linkedinUrl)}" 
                                       class="btn btn-outline-primary" 
                                       target="_blank" 
                                       rel="noopener noreferrer">
                                        <i class="lab la-linkedin"></i>
                                        LinkedIn
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
    }
    
    /**
     * Render content to DOM
     * @param {string} templateName - Name of template to use
     * @param {Object} data - Content data to render
     * @param {Object} options - Rendering options
     * @returns {Promise<boolean>} Success status
     */
    async renderContent(templateName, data, options = {}) {
        const {
            animate = true,
            clearFirst = true,
            appendMode = false,
            errorFallback = null
        } = options;
        
        try {
            const template = this.templates.get(templateName);
            if (!template) {
                throw new Error(`Template '${templateName}' not found`);
            }
            
            const targetElement = document.querySelector(template.selector);
            if (!targetElement) {
                throw new Error(`Target element '${template.selector}' not found`);
            }
            
            // Generate HTML from template
            const html = template.template(data);
            
            // Clear or append content
            if (clearFirst && !appendMode) {
                targetElement.innerHTML = '';
            }
            
            if (appendMode) {
                targetElement.insertAdjacentHTML('beforeend', html);
            } else {
                targetElement.innerHTML = html;
            }
            
            // Reinitialize AOS animations if enabled
            if (animate && typeof AOS !== 'undefined') {
                // Small delay to ensure DOM is updated
                setTimeout(() => {
                    AOS.refresh();
                }, 50);
            }
            
            // Cache successful render
            this.renderCache.set(`${templateName}-${Date.now()}`, {
                templateName,
                data,
                renderedAt: new Date().toISOString()
            });
            
            return true;
            
        } catch (error) {
            console.error(`ContentRenderer: Failed to render ${templateName}:`, error);
            
            // Use fallback if provided
            if (errorFallback) {
                try {
                    const targetElement = document.querySelector(template.selector);
                    if (targetElement) {
                        targetElement.innerHTML = errorFallback;
                    }
                } catch (fallbackError) {
                    console.error('ContentRenderer: Fallback rendering also failed:', fallbackError);
                }
            }
            
            throw error;
        }
    }
    
    /**
     * Render multiple templates in sequence
     * @param {Array} renderTasks - Array of {templateName, data, options} objects
     * @param {Object} globalOptions - Options applied to all renders
     * @returns {Promise<Object>} Results object with successes and failures
     */
    async renderBatch(renderTasks, globalOptions = {}) {
        const results = {
            successes: [],
            failures: [],
            total: renderTasks.length
        };
        
        for (const task of renderTasks) {
            const { templateName, data, options = {} } = task;
            const mergedOptions = { ...globalOptions, ...options };
            
            try {
                await this.renderContent(templateName, data, mergedOptions);
                results.successes.push(templateName);
            } catch (error) {
                results.failures.push({
                    templateName,
                    error: error.message
                });
            }
            
            // Small delay between renders for better UX
            if (globalOptions.delayBetweenRenders) {
                await this.delay(globalOptions.delayBetweenRenders);
            }
        }
        
        return results;
    }
    
    /**
     * Render all content from loaded data
     * @param {Object} contentData - Object with loaded content by type
     * @param {Object} options - Rendering options
     * @returns {Promise<Object>} Rendering results
     */
    async renderAll(contentData, options = {}) {
        const renderTasks = [];
        
        // Map content types to templates
        if (contentData.profile) {
            renderTasks.push(
                { templateName: 'profile-hero', data: contentData.profile.data },
                { templateName: 'profile-about', data: contentData.profile.data }
            );
        }
        
        if (contentData.skills) {
            renderTasks.push({
                templateName: 'skills-categories',
                data: contentData.skills.data
            });
        }
        
        if (contentData.projects) {
            renderTasks.push({
                templateName: 'projects-grid',
                data: contentData.projects.data
            });
        }
        
        if (contentData.contact) {
            renderTasks.push({
                templateName: 'contact-info',
                data: contentData.contact.data
            });
        }
        
        return this.renderBatch(renderTasks, {
            delayBetweenRenders: this.animationDelay,
            ...options
        });
    }
    
    /**
     * Escape HTML to prevent XSS
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Utility delay function
     * @private
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Clear render cache
     * @param {string} pattern - Optional pattern to match cache keys
     */
    clearRenderCache(pattern = null) {
        if (pattern) {
            for (const [key] of this.renderCache) {
                if (key.includes(pattern)) {
                    this.renderCache.delete(key);
                }
            }
        } else {
            this.renderCache.clear();
        }
    }
    
    /**
     * Get rendering statistics
     * @returns {Object} Render cache statistics
     */
    getRenderStats() {
        return {
            cacheSize: this.renderCache.size,
            availableTemplates: Array.from(this.templates.keys()),
            lastRenders: Array.from(this.renderCache.values())
                .sort((a, b) => new Date(b.renderedAt) - new Date(a.renderedAt))
                .slice(0, 5)
        };
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentRenderer;
} else if (typeof window !== 'undefined') {
    window.ContentRenderer = ContentRenderer;
}