/**
 * Skill Interactions Module
 * 
 * Handles skill hover effects, category interactions, progress animations,
 * and skill showcase features.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class SkillInteractions {
    constructor(options = {}) {
        this.config = {
            enableProgressAnimation: true,
            enableHoverEffects: true,
            enableCategoryFiltering: true,
            enableTooltips: true,
            enableSkillComparison: true,
            progressAnimationDuration: 2000,
            hoverDelay: 200,
            tooltipDelay: 500,
            skillRatingSystem: 'percentage', // 'percentage', 'stars', 'level'
            ...options
        };
        
        this.elements = {
            skillsContainer: null,
            skillItems: [],
            categoryTabs: [],
            progressBars: [],
            skillTooltips: [],
            filterButtons: []
        };
        
        this.state = {
            activeCategory: 'all',
            animatedSkills: new Set(),
            hoveredSkill: null,
            comparisonMode: false,
            selectedSkills: new Set()
        };
        
        this.skillsData = new Map();
        this.categories = new Map();
        
        this.init();
    }
    
    /**
     * Initialize skill interactions
     */
    init() {
        try {
            this.cacheElements();
            this.loadSkillsData();
            this.bindEvents();
            this.setupIntersectionObserver();
            this.initializeProgressBars();
            this.createTooltips();
            this.setupCategoryFiltering();
            
            console.log('Skill interactions initialized successfully');
        } catch (error) {
            console.error('Skill interactions initialization failed:', error);
        }
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements.skillsContainer = document.querySelector(
            '.skills-container, .skills-section, [data-skills]'
        );
        
        this.elements.skillItems = Array.from(
            document.querySelectorAll('.skill-item, .skill-card, [data-skill]')
        );
        
        this.elements.categoryTabs = Array.from(
            document.querySelectorAll('.skill-category, .category-tab, [data-category]')
        );
        
        this.elements.filterButtons = Array.from(
            document.querySelectorAll('.skill-filter, [data-skill-filter]')
        );
        
        this.elements.progressBars = Array.from(
            document.querySelectorAll('.skill-progress, .progress-bar, [data-progress]')
        );
        
        console.log(`Found ${this.elements.skillItems.length} skill items`);
    }
    
    /**
     * Load skills data from elements
     */
    loadSkillsData() {
        this.elements.skillItems.forEach((item, index) => {
            const skillData = this.extractSkillData(item);
            skillData.index = index;
            skillData.element = item;
            
            this.skillsData.set(skillData.id, skillData);
            
            // Collect categories
            if (skillData.category && !this.categories.has(skillData.category)) {
                this.categories.set(skillData.category, {
                    name: skillData.category,
                    skills: [],
                    color: this.getCategoryColor(skillData.category)
                });
            }
            
            if (skillData.category) {
                this.categories.get(skillData.category).skills.push(skillData.id);
            }
        });
        
        console.log(`Loaded ${this.skillsData.size} skills in ${this.categories.size} categories`);
    }
    
    /**
     * Extract skill data from DOM element
     */
    extractSkillData(element) {
        const nameEl = element.querySelector('.skill-name, .skill-title');
        const levelEl = element.querySelector('.skill-level, [data-level]');
        const progressEl = element.querySelector('.skill-progress, [data-progress]');
        const categoryEl = element.querySelector('.skill-category, [data-category]');
        
        return {
            id: element.id || `skill-${Date.now()}-${Math.random()}`,
            name: nameEl ? nameEl.textContent.trim() : 'Unknown Skill',
            level: this.extractLevel(levelEl, progressEl),
            category: element.dataset.category || 
                     (categoryEl ? categoryEl.textContent.trim() : 'general'),
            description: element.dataset.description || '',
            experience: element.dataset.experience || '',
            projects: element.dataset.projects ? element.dataset.projects.split(',') : [],
            certifications: element.dataset.certifications ? element.dataset.certifications.split(',') : [],
            icon: element.querySelector('.skill-icon, i') ? 
                  element.querySelector('.skill-icon, i').className : '',
            color: element.dataset.color || this.getSkillColor(element),
            priority: parseInt(element.dataset.priority) || 0
        };
    }
    
    /**
     * Extract skill level from various sources
     */
    extractLevel(levelEl, progressEl) {
        // Try data attributes first
        if (levelEl && levelEl.dataset.level) {
            return parseInt(levelEl.dataset.level);
        }
        
        if (progressEl && progressEl.dataset.progress) {
            return parseInt(progressEl.dataset.progress);
        }
        
        // Try text content
        if (levelEl) {
            const levelText = levelEl.textContent.trim();
            const levelMatch = levelText.match(/(\d+)%?/);
            if (levelMatch) {
                return parseInt(levelMatch[1]);
            }
        }
        
        // Try progress bar width/value
        if (progressEl) {
            const progressBar = progressEl.querySelector('.progress-fill, .progress-value');
            if (progressBar) {
                const width = progressBar.style.width;
                if (width) {
                    const widthMatch = width.match(/(\d+)%/);
                    if (widthMatch) {
                        return parseInt(widthMatch[1]);
                    }
                }
            }
        }
        
        // Default level
        return 50;
    }
    
    /**
     * Get skill color based on category or name
     */
    getSkillColor(element) {
        const category = element.dataset.category;
        const colorMap = {
            'frontend': '#61dafb',
            'backend': '#68b968',
            'database': '#f29111',
            'devops': '#326ce5',
            'design': '#ff6b6b',
            'mobile': '#a4c639',
            'tools': '#764abc'
        };
        
        return colorMap[category] || '#667eea';
    }
    
    /**
     * Get category color
     */
    getCategoryColor(category) {
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
        ];
        
        // Simple hash to get consistent color for category
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Skill item interactions
        this.elements.skillItems.forEach(item => {
            this.bindSkillEvents(item);
        });
        
        // Category filter events
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleCategoryFilter(e));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        
        // Window resize
        window.addEventListener('resize', 
            this.debounce(() => this.handleResize(), 250)
        );
    }
    
    /**
     * Bind events for individual skill item
     */
    bindSkillEvents(item) {
        // Hover effects
        if (this.config.enableHoverEffects) {
            let hoverTimeout;
            
            item.addEventListener('mouseenter', (e) => {
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    this.handleSkillHover(item, true);
                }, this.config.hoverDelay);
            });
            
            item.addEventListener('mouseleave', (e) => {
                clearTimeout(hoverTimeout);
                this.handleSkillHover(item, false);
            });
        }
        
        // Click interactions
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.no-click')) {
                this.handleSkillClick(item, e);
            }
        });
        
        // Touch interactions for mobile
        let touchStartTime;
        item.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
        });
        
        item.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 500) { // Quick tap
                this.handleSkillClick(item, e);
            }
        });
        
        // Focus events for accessibility
        item.addEventListener('focus', () => {
            this.handleSkillFocus(item, true);
        });
        
        item.addEventListener('blur', () => {
            this.handleSkillFocus(item, false);
        });
        
        // Make focusable
        if (!item.hasAttribute('tabindex')) {
            item.setAttribute('tabindex', '0');
        }
        
        // ARIA attributes
        item.setAttribute('role', 'button');
        const skillData = this.skillsData.get(this.getSkillId(item));
        if (skillData) {
            item.setAttribute('aria-label', 
                `${skillData.name} skill, ${skillData.level}% proficiency`
            );
        }
    }
    
    /**
     * Handle skill hover
     */
    handleSkillHover(item, isHovering) {
        const skillId = this.getSkillId(item);
        const skillData = this.skillsData.get(skillId);
        
        if (!skillData) return;
        
        if (isHovering) {
            this.state.hoveredSkill = skillId;
            item.classList.add('skill-hovered');
            
            // Show enhanced progress animation
            this.animateSkillProgress(item, skillData);
            
            // Show tooltip
            if (this.config.enableTooltips) {
                this.showSkillTooltip(item, skillData);
            }
            
            // Highlight related skills
            this.highlightRelatedSkills(skillData);
            
        } else {
            this.state.hoveredSkill = null;
            item.classList.remove('skill-hovered');
            
            // Hide tooltip
            this.hideSkillTooltip(item);
            
            // Remove highlights
            this.clearSkillHighlights();
        }
        
        // Track hover
        this.trackSkillInteraction('hover', skillId, isHovering);
    }
    
    /**
     * Handle skill click
     */
    handleSkillClick(item, event) {
        const skillId = this.getSkillId(item);
        const skillData = this.skillsData.get(skillId);
        
        if (!skillData) return;
        
        // Toggle comparison mode
        if (this.state.comparisonMode) {
            this.toggleSkillComparison(skillId, item);
        } else {
            // Show detailed skill info
            this.showSkillDetails(skillData, item);
        }
        
        // Animate click feedback
        this.animateSkillClick(item);
        
        // Track click
        this.trackSkillInteraction('click', skillId);
    }
    
    /**
     * Handle skill focus
     */
    handleSkillFocus(item, isFocused) {
        if (isFocused) {
            item.classList.add('skill-focused');
            const skillId = this.getSkillId(item);
            const skillData = this.skillsData.get(skillId);
            
            if (skillData && this.config.enableTooltips) {
                setTimeout(() => {
                    this.showSkillTooltip(item, skillData);
                }, this.config.tooltipDelay);
            }
        } else {
            item.classList.remove('skill-focused');
            this.hideSkillTooltip(item);
        }
    }
    
    /**
     * Animate skill progress bar
     */
    animateSkillProgress(item, skillData) {
        if (!this.config.enableProgressAnimation) return;
        
        const progressBar = item.querySelector('.skill-progress, .progress-bar');
        const progressFill = progressBar ? progressBar.querySelector('.progress-fill, .progress-value') : null;
        
        if (!progressFill) return;
        
        // Reset animation
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        
        // Animate to target value
        requestAnimationFrame(() => {
            progressFill.style.transition = `width ${this.config.progressAnimationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            progressFill.style.width = `${skillData.level}%`;
        });
        
        // Animate percentage counter if exists
        const percentageCounter = item.querySelector('.skill-percentage, .percentage-value');
        if (percentageCounter) {
            this.animateCounter(percentageCounter, 0, skillData.level, this.config.progressAnimationDuration);
        }
    }
    
    /**
     * Animate counter from start to end value
     */
    animateCounter(element, startValue, endValue, duration) {
        const startTime = Date.now();
        const startVal = parseFloat(startValue) || 0;
        const endVal = parseFloat(endValue) || 0;
        const difference = endVal - startVal;
        
        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = startVal + (difference * easeOutCubic);
            
            element.textContent = Math.round(currentValue) + '%';
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        updateCounter();
    }
    
    /**
     * Show skill tooltip
     */
    showSkillTooltip(item, skillData) {
        let tooltip = item.querySelector('.skill-tooltip');
        
        if (!tooltip) {
            tooltip = this.createSkillTooltip(skillData);
            item.appendChild(tooltip);
        }
        
        // Update tooltip content
        this.updateTooltipContent(tooltip, skillData);
        
        // Position tooltip
        this.positionTooltip(tooltip, item);
        
        // Show tooltip
        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 50);
    }
    
    /**
     * Create skill tooltip
     */
    createSkillTooltip(skillData) {
        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <h4 class="tooltip-title">${skillData.name}</h4>
                <div class="tooltip-level">
                    <span class="level-label">Proficiency:</span>
                    <span class="level-value">${skillData.level}%</span>
                </div>
                ${skillData.description ? `
                    <p class="tooltip-description">${skillData.description}</p>
                ` : ''}
                ${skillData.experience ? `
                    <div class="tooltip-experience">
                        <span class="experience-label">Experience:</span>
                        <span class="experience-value">${skillData.experience}</span>
                    </div>
                ` : ''}
                ${skillData.projects.length > 0 ? `
                    <div class="tooltip-projects">
                        <span class="projects-label">Projects:</span>
                        <span class="projects-count">${skillData.projects.length}</span>
                    </div>
                ` : ''}
            </div>
            <div class="tooltip-arrow"></div>
        `;
        
        return tooltip;
    }
    
    /**
     * Update tooltip content
     */
    updateTooltipContent(tooltip, skillData) {
        const title = tooltip.querySelector('.tooltip-title');
        const levelValue = tooltip.querySelector('.level-value');
        const description = tooltip.querySelector('.tooltip-description');
        const experience = tooltip.querySelector('.experience-value');
        const projectsCount = tooltip.querySelector('.projects-count');
        
        if (title) title.textContent = skillData.name;
        if (levelValue) levelValue.textContent = skillData.level + '%';
        if (description) description.textContent = skillData.description;
        if (experience) experience.textContent = skillData.experience;
        if (projectsCount) projectsCount.textContent = skillData.projects.length;
    }
    
    /**
     * Position tooltip
     */
    positionTooltip(tooltip, item) {
        const itemRect = item.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = itemRect.left + (itemRect.width / 2) - (tooltipRect.width / 2);
        let top = itemRect.top - tooltipRect.height - 10;
        
        // Adjust for viewport boundaries
        if (left < 10) left = 10;
        if (left + tooltipRect.width > viewportWidth - 10) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        if (top < 10) {
            top = itemRect.bottom + 10;
            tooltip.classList.add('tooltip-bottom');
        } else {
            tooltip.classList.remove('tooltip-bottom');
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    /**
     * Hide skill tooltip
     */
    hideSkillTooltip(item) {
        const tooltip = item.querySelector('.skill-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.remove();
                }
            }, 300);
        }
    }
    
    /**
     * Highlight related skills
     */
    highlightRelatedSkills(skillData) {
        // Highlight skills in same category
        this.skillsData.forEach((otherSkill, otherId) => {
            if (otherSkill.category === skillData.category && otherId !== skillData.id) {
                const otherElement = otherSkill.element;
                if (otherElement) {
                    otherElement.classList.add('skill-related');
                }
            }
        });
    }
    
    /**
     * Clear skill highlights
     */
    clearSkillHighlights() {
        this.elements.skillItems.forEach(item => {
            item.classList.remove('skill-related');
        });
    }
    
    /**
     * Show skill details
     */
    showSkillDetails(skillData, item) {
        // Create or show skill details modal/panel
        const detailsPanel = this.createSkillDetailsPanel(skillData);
        document.body.appendChild(detailsPanel);
        
        // Show panel
        setTimeout(() => {
            detailsPanel.classList.add('visible');
        }, 50);
    }
    
    /**
     * Create skill details panel
     */
    createSkillDetailsPanel(skillData) {
        const panel = document.createElement('div');
        panel.className = 'skill-details-panel';
        panel.innerHTML = `
            <div class="panel-backdrop"></div>
            <div class="panel-content">
                <button class="panel-close" aria-label="Close skill details">
                    <i class="las la-times"></i>
                </button>
                <div class="panel-header">
                    ${skillData.icon ? `<div class="skill-icon">${skillData.icon}</div>` : ''}
                    <h2>${skillData.name}</h2>
                    <div class="skill-level-display">
                        <div class="level-bar">
                            <div class="level-fill" style="width: ${skillData.level}%"></div>
                        </div>
                        <span class="level-text">${skillData.level}%</span>
                    </div>
                </div>
                <div class="panel-body">
                    ${skillData.description ? `
                        <div class="skill-description">
                            <h3>About</h3>
                            <p>${skillData.description}</p>
                        </div>
                    ` : ''}
                    ${skillData.experience ? `
                        <div class="skill-experience">
                            <h3>Experience</h3>
                            <p>${skillData.experience}</p>
                        </div>
                    ` : ''}
                    ${skillData.projects.length > 0 ? `
                        <div class="skill-projects">
                            <h3>Related Projects</h3>
                            <ul>
                                ${skillData.projects.map(project => `<li>${project}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${skillData.certifications.length > 0 ? `
                        <div class="skill-certifications">
                            <h3>Certifications</h3>
                            <ul>
                                ${skillData.certifications.map(cert => `<li>${cert}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Bind close events
        const closeBtn = panel.querySelector('.panel-close');
        const backdrop = panel.querySelector('.panel-backdrop');
        
        closeBtn.addEventListener('click', () => this.hideSkillDetailsPanel(panel));
        backdrop.addEventListener('click', () => this.hideSkillDetailsPanel(panel));
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideSkillDetailsPanel(panel);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        return panel;
    }
    
    /**
     * Hide skill details panel
     */
    hideSkillDetailsPanel(panel) {
        panel.classList.remove('visible');
        setTimeout(() => {
            if (panel.parentNode) {
                panel.remove();
            }
        }, 300);
    }
    
    /**
     * Animate skill click feedback
     */
    animateSkillClick(item) {
        item.classList.add('skill-clicked');
        setTimeout(() => {
            item.classList.remove('skill-clicked');
        }, 200);
    }
    
    /**
     * Setup intersection observer for progress animations
     */
    setupIntersectionObserver() {
        if (!window.IntersectionObserver || !this.config.enableProgressAnimation) return;
        
        const options = {
            root: null,
            rootMargin: '-50px',
            threshold: 0.5
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillId = this.getSkillId(entry.target);
                    if (!this.state.animatedSkills.has(skillId)) {
                        this.state.animatedSkills.add(skillId);
                        const skillData = this.skillsData.get(skillId);
                        if (skillData) {
                            setTimeout(() => {
                                this.animateSkillProgress(entry.target, skillData);
                            }, Math.random() * 500); // Stagger animations
                        }
                    }
                }
            });
        }, options);
        
        this.elements.skillItems.forEach(item => {
            this.observer.observe(item);
        });
    }
    
    /**
     * Initialize progress bars
     */
    initializeProgressBars() {
        this.elements.skillItems.forEach(item => {
            const skillData = this.skillsData.get(this.getSkillId(item));
            if (!skillData) return;
            
            const progressBar = item.querySelector('.skill-progress, .progress-bar');
            const progressFill = progressBar ? progressBar.querySelector('.progress-fill, .progress-value') : null;
            
            if (progressFill) {
                // Set initial width to 0 for animation
                progressFill.style.width = '0%';
                progressFill.dataset.targetWidth = skillData.level + '%';
            }
        });
    }
    
    /**
     * Create tooltips
     */
    createTooltips() {
        if (!this.config.enableTooltips) return;
        
        // Tooltips are created on demand in showSkillTooltip
        // This method can be used for any global tooltip setup
    }
    
    /**
     * Setup category filtering
     */
    setupCategoryFiltering() {
        if (!this.config.enableCategoryFiltering) return;
        
        // Initialize filter buttons
        this.elements.filterButtons.forEach(button => {
            button.setAttribute('role', 'button');
            button.setAttribute('aria-pressed', 'false');
            
            if (button.dataset.skillFilter === 'all' || button.dataset.filter === 'all') {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            }
        });
    }
    
    /**
     * Handle category filter
     */
    handleCategoryFilter(event) {
        const button = event.currentTarget;
        const filter = button.dataset.skillFilter || button.dataset.filter;
        
        if (filter === this.state.activeCategory) return;
        
        this.applySkillFilter(filter);
        this.updateFilterButtons(button);
        
        this.trackSkillInteraction('filter', filter);
    }
    
    /**
     * Apply skill filter
     */
    applySkillFilter(filter) {
        this.state.activeCategory = filter;
        
        this.elements.skillItems.forEach(item => {
            const skillData = this.skillsData.get(this.getSkillId(item));
            const shouldShow = filter === 'all' || (skillData && skillData.category === filter);
            
            if (shouldShow) {
                item.classList.remove('skill-filtered');
                item.style.display = '';
            } else {
                item.classList.add('skill-filtered');
            }
        });
        
        // Animate filter transition
        this.animateFilterTransition();
    }
    
    /**
     * Update filter buttons
     */
    updateFilterButtons(activeButton) {
        this.elements.filterButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
        });
        
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
    }
    
    /**
     * Animate filter transition
     */
    animateFilterTransition() {
        if (this.elements.skillsContainer) {
            this.elements.skillsContainer.classList.add('filtering');
            setTimeout(() => {
                this.elements.skillsContainer.classList.remove('filtering');
            }, 500);
        }
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyNavigation(event) {
        const focusedElement = document.activeElement;
        
        if (!focusedElement.classList.contains('skill-item')) return;
        
        const currentIndex = this.elements.skillItems.indexOf(focusedElement);
        let nextIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (currentIndex + 1) % this.elements.skillItems.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = currentIndex === 0 ? 
                    this.elements.skillItems.length - 1 : 
                    currentIndex - 1;
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                focusedElement.click();
                return;
            default:
                return;
        }
        
        event.preventDefault();
        
        // Find next visible skill
        while (this.elements.skillItems[nextIndex].classList.contains('skill-filtered')) {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                nextIndex = (nextIndex + 1) % this.elements.skillItems.length;
            } else {
                nextIndex = nextIndex === 0 ? 
                    this.elements.skillItems.length - 1 : 
                    nextIndex - 1;
            }
            
            // Prevent infinite loop
            if (nextIndex === currentIndex) break;
        }
        
        this.elements.skillItems[nextIndex].focus();
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Reposition any visible tooltips
        this.elements.skillItems.forEach(item => {
            const tooltip = item.querySelector('.skill-tooltip.visible');
            if (tooltip) {
                const skillData = this.skillsData.get(this.getSkillId(item));
                if (skillData) {
                    this.positionTooltip(tooltip, item);
                }
            }
        });
    }
    
    /**
     * Get skill ID from element
     */
    getSkillId(element) {
        return element.id || element.dataset.skill || `skill-${Array.from(this.elements.skillItems).indexOf(element)}`;
    }
    
    /**
     * Track skill interaction
     */
    trackSkillInteraction(action, skillId, extra = null) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'skill_interaction', {
                event_category: 'engagement',
                event_label: skillId,
                custom_parameter_1: action,
                custom_parameter_2: extra
            });
        }
        
        // Custom event
        const event = new CustomEvent('skill:interaction', {
            detail: { action, skillId, extra, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    /**
     * Public API methods
     */
    
    /**
     * Animate all skill progress bars
     */
    animateAllProgressBars() {
        this.elements.skillItems.forEach(item => {
            const skillData = this.skillsData.get(this.getSkillId(item));
            if (skillData) {
                this.animateSkillProgress(item, skillData);
            }
        });
    }
    
    /**
     * Set skill filter
     */
    setSkillFilter(filter) {
        this.applySkillFilter(filter);
        const filterButton = this.elements.filterButtons.find(btn => 
            (btn.dataset.skillFilter || btn.dataset.filter) === filter
        );
        if (filterButton) {
            this.updateFilterButtons(filterButton);
        }
    }
    
    /**
     * Get skill data
     */
    getSkillData(skillId) {
        return this.skillsData.get(skillId);
    }
    
    /**
     * Get all skills data
     */
    getAllSkillsData() {
        return Array.from(this.skillsData.values());
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * Destroy instance
     */
    destroy() {
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyNavigation);
        
        // Clear tooltips
        document.querySelectorAll('.skill-tooltip').forEach(tooltip => {
            tooltip.remove();
        });
        
        // Clear highlights
        this.clearSkillHighlights();
        
        console.log('Skill interactions destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillInteractions;
}

// Global namespace
window.SkillInteractions = SkillInteractions;