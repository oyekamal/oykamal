/**
 * Project Interactions Module
 * 
 * Handles project card expansion, filtering, modal displays,
 * and interactive project showcase features.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class ProjectInteractions {
    constructor(options = {}) {
        this.config = {
            expandAnimation: 'smooth', // 'smooth', 'fast', 'none'
            expandDuration: 400,
            enableModal: true,
            enableFiltering: true,
            enableLightbox: true,
            autoCloseExpanded: true,
            maxExpandedCards: 1,
            enableKeyboardNavigation: true,
            enableSwipeGestures: false,
            ...options
        };
        
        this.elements = {
            projectsContainer: null,
            projectCards: [],
            filterButtons: [],
            modal: null,
            lightbox: null,
            loadMoreButton: null
        };
        
        this.state = {
            expandedCards: new Set(),
            currentFilter: 'all',
            visibleProjects: [],
            currentModal: null,
            currentLightboxIndex: 0,
            touchStart: null,
            isAnimating: false
        };
        
        this.filters = new Map();
        this.projects = [];
        
        this.init();
    }
    
    /**
     * Initialize project interactions
     */
    init() {
        try {
            this.cacheElements();
            this.bindEvents();
            this.setupFiltering();
            this.initializeCards();
            this.createModal();
            this.createLightbox();
            
            console.log('Project interactions initialized successfully');
        } catch (error) {
            console.error('Project interactions initialization failed:', error);
        }
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements.projectsContainer = document.querySelector(
            '.projects-container, .project-grid, [data-projects]'
        );
        
        this.elements.projectCards = Array.from(
            document.querySelectorAll('.project-card, [data-project]')
        );
        
        this.elements.filterButtons = Array.from(
            document.querySelectorAll('.filter-btn, [data-filter]')
        );
        
        this.elements.loadMoreButton = document.querySelector(
            '.load-more, [data-load-more]'
        );
        
        console.log(`Found ${this.elements.projectCards.length} project cards`);
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Project card interactions
        this.elements.projectCards.forEach((card, index) => {
            this.bindCardEvents(card, index);
        });
        
        // Filter button events
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        
        // Load more button
        if (this.elements.loadMoreButton) {
            this.elements.loadMoreButton.addEventListener('click', () => {
                this.loadMoreProjects();
            });
        }
        
        // Global keyboard navigation
        if (this.config.enableKeyboardNavigation) {
            document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        }
        
        // Close expanded cards on outside click
        document.addEventListener('click', (e) => {
            if (this.config.autoCloseExpanded && 
                !e.target.closest('.project-card') &&
                this.state.expandedCards.size > 0) {
                this.collapseAllCards();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', 
            this.debounce(() => this.handleResize(), 250)
        );
    }
    
    /**
     * Bind events for individual project card
     */
    bindCardEvents(card, index) {
        const expandButton = card.querySelector('.expand-btn, [data-expand]');
        const detailsButton = card.querySelector('.details-btn, [data-details]');
        const projectImage = card.querySelector('.project-image, .card-image');
        
        // Expand/collapse functionality
        if (expandButton) {
            expandButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCard(card);
            });
        }
        
        // Click on card to expand (optional)
        card.addEventListener('click', (e) => {
            // Don't expand if clicking on links or buttons
            if (e.target.closest('a, button, .no-expand')) return;
            
            this.toggleCard(card);
        });
        
        // Details modal
        if (detailsButton) {
            detailsButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openProjectModal(card, index);
            });
        }
        
        // Image lightbox
        if (projectImage && this.config.enableLightbox) {
            projectImage.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openLightbox(card, index);
            });
        }
        
        // Keyboard navigation for card
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleCard(card);
            }
        });
        
        // Touch gestures (if enabled)
        if (this.config.enableSwipeGestures) {
            this.bindTouchEvents(card);
        }
        
        // Make card focusable
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
        
        // ARIA attributes
        card.setAttribute('role', 'button');
        card.setAttribute('aria-expanded', 'false');
        
        const cardTitle = card.querySelector('.project-title, .card-title');
        if (cardTitle) {
            const titleText = cardTitle.textContent.trim();
            card.setAttribute('aria-label', `${titleText} project details`);
        }
    }
    
    /**
     * Toggle card expanded state
     */
    toggleCard(card) {
        if (this.state.isAnimating) return;
        
        const cardId = this.getCardId(card);
        const isExpanded = this.state.expandedCards.has(cardId);
        
        if (isExpanded) {
            this.collapseCard(card);
        } else {
            this.expandCard(card);
        }
    }
    
    /**
     * Expand a project card
     */
    expandCard(card) {
        const cardId = this.getCardId(card);
        
        // Check if we need to collapse other cards
        if (this.config.maxExpandedCards === 1 && this.state.expandedCards.size > 0) {
            this.collapseAllCards();
        }
        
        // Check max expanded limit
        if (this.state.expandedCards.size >= this.config.maxExpandedCards) {
            return;
        }
        
        this.state.isAnimating = true;
        this.state.expandedCards.add(cardId);
        
        // Update card state
        card.classList.add('expanding');
        card.setAttribute('aria-expanded', 'true');
        
        // Get or create expanded content
        const expandedContent = this.getExpandedContent(card);
        
        // Animate expansion
        this.animateCardExpansion(card, expandedContent, () => {
            card.classList.remove('expanding');
            card.classList.add('expanded');
            this.state.isAnimating = false;
            
            // Focus the first interactive element in expanded content
            const firstFocusable = expandedContent.querySelector(
                'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            // Track expansion
            this.trackCardInteraction('expand', cardId);
        });
    }
    
    /**
     * Collapse a project card
     */
    collapseCard(card) {
        const cardId = this.getCardId(card);
        
        if (!this.state.expandedCards.has(cardId)) return;
        
        this.state.isAnimating = true;
        this.state.expandedCards.delete(cardId);
        
        // Update card state
        card.classList.add('collapsing');
        card.setAttribute('aria-expanded', 'false');
        
        // Animate collapse
        this.animateCardCollapse(card, () => {
            card.classList.remove('collapsing', 'expanded');
            this.state.isAnimating = false;
            
            // Return focus to card
            card.focus();
            
            // Track collapse
            this.trackCardInteraction('collapse', cardId);
        });
    }
    
    /**
     * Collapse all expanded cards
     */
    collapseAllCards() {
        const expandedCards = Array.from(this.elements.projectCards)
            .filter(card => this.state.expandedCards.has(this.getCardId(card)));
        
        expandedCards.forEach(card => this.collapseCard(card));
    }
    
    /**
     * Get or create expanded content for a card
     */
    getExpandedContent(card) {
        let expandedContent = card.querySelector('.project-expanded-content');
        
        if (!expandedContent) {
            expandedContent = this.createExpandedContent(card);
        }
        
        return expandedContent;
    }
    
    /**
     * Create expanded content for a project card
     */
    createExpandedContent(card) {
        const expandedDiv = document.createElement('div');
        expandedDiv.className = 'project-expanded-content';
        
        // Extract project data
        const projectData = this.extractProjectData(card);
        
        expandedDiv.innerHTML = `
            <div class="expanded-header">
                <h4 class="expanded-title">${projectData.title}</h4>
                <button class="collapse-btn" aria-label="Collapse project details">
                    <i class="las la-times"></i>
                </button>
            </div>
            
            <div class="expanded-body">
                <div class="project-gallery">
                    ${this.createProjectGallery(projectData)}
                </div>
                
                <div class="project-details">
                    <div class="project-description">
                        <h5>Description</h5>
                        <p>${projectData.description}</p>
                    </div>
                    
                    <div class="project-technologies">
                        <h5>Technologies Used</h5>
                        <div class="tech-stack">
                            ${projectData.technologies.map(tech => 
                                `<span class="tech-badge">${tech}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="project-features">
                        <h5>Key Features</h5>
                        <ul>
                            ${projectData.features.map(feature => 
                                `<li>${feature}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div class="project-links">
                        ${projectData.liveUrl ? 
                            `<a href="${projectData.liveUrl}" class="btn-primary" target="_blank" rel="noopener">
                                <i class="las la-external-link-alt"></i> Live Demo
                            </a>` : ''
                        }
                        ${projectData.repoUrl ? 
                            `<a href="${projectData.repoUrl}" class="btn-secondary" target="_blank" rel="noopener">
                                <i class="lab la-github"></i> View Code
                            </a>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
        
        // Bind collapse button
        const collapseBtn = expandedDiv.querySelector('.collapse-btn');
        collapseBtn.addEventListener('click', () => this.collapseCard(card));
        
        // Insert into card
        card.appendChild(expandedDiv);
        
        return expandedDiv;
    }
    
    /**
     * Create project gallery
     */
    createProjectGallery(projectData) {
        if (!projectData.images || projectData.images.length === 0) {
            return '<p>No images available</p>';
        }
        
        return `
            <div class="gallery-main">
                <img src="${projectData.images[0]}" alt="${projectData.title} screenshot" 
                     class="gallery-main-image" loading="lazy">
                <div class="gallery-controls">
                    <button class="gallery-prev" aria-label="Previous image">
                        <i class="las la-chevron-left"></i>
                    </button>
                    <button class="gallery-next" aria-label="Next image">
                        <i class="las la-chevron-right"></i>
                    </button>
                </div>
            </div>
            ${projectData.images.length > 1 ? `
                <div class="gallery-thumbnails">
                    ${projectData.images.map((img, index) => 
                        `<img src="${img}" alt="Screenshot ${index + 1}" 
                             class="gallery-thumb ${index === 0 ? 'active' : ''}" 
                             data-index="${index}" loading="lazy">`
                    ).join('')}
                </div>
            ` : ''}
        `;
    }
    
    /**
     * Extract project data from card
     */
    extractProjectData(card) {
        const titleEl = card.querySelector('.project-title, .card-title');
        const descEl = card.querySelector('.project-description, .card-text');
        const techEls = card.querySelectorAll('.tech-badge, .technology');
        const imageEl = card.querySelector('.project-image img, .card-image img');
        
        return {
            title: titleEl ? titleEl.textContent.trim() : 'Untitled Project',
            description: descEl ? descEl.textContent.trim() : 'No description available',
            technologies: Array.from(techEls).map(el => el.textContent.trim()),
            features: this.extractFeatures(card),
            images: this.extractImages(card),
            liveUrl: this.extractUrl(card, 'live'),
            repoUrl: this.extractUrl(card, 'repo'),
            category: card.dataset.category || 'general'
        };
    }
    
    /**
     * Extract features from card
     */
    extractFeatures(card) {
        const featuresEl = card.querySelector('.project-features, [data-features]');
        if (featuresEl) {
            const featuresText = featuresEl.textContent || featuresEl.dataset.features;
            return featuresText.split(',').map(f => f.trim()).filter(Boolean);
        }
        
        // Default features based on category
        const category = card.dataset.category;
        const defaultFeatures = {
            'web': ['Responsive Design', 'Cross-browser Compatible', 'SEO Optimized'],
            'mobile': ['Native Performance', 'Offline Capability', 'Push Notifications'],
            'desktop': ['Cross-platform', 'High Performance', 'User-friendly Interface'],
            'api': ['RESTful Design', 'Comprehensive Documentation', 'Rate Limiting']
        };
        
        return defaultFeatures[category] || ['Modern Architecture', 'Best Practices', 'Well Documented'];
    }
    
    /**
     * Extract images from card
     */
    extractImages(card) {
        const images = [];
        
        // Main project image
        const mainImage = card.querySelector('.project-image img, .card-image img');
        if (mainImage && mainImage.src) {
            images.push(mainImage.src);
        }
        
        // Additional images from data attributes
        const additionalImages = card.dataset.images;
        if (additionalImages) {
            const imageUrls = additionalImages.split(',').map(url => url.trim());
            images.push(...imageUrls);
        }
        
        return images;
    }
    
    /**
     * Extract URL from card
     */
    extractUrl(card, type) {
        const selector = type === 'live' ? 
            '.live-link, [data-live-url]' : 
            '.repo-link, [data-repo-url]';
        
        const linkEl = card.querySelector(selector);
        return linkEl ? (linkEl.href || linkEl.dataset.liveUrl || linkEl.dataset.repoUrl) : null;
    }
    
    /**
     * Animate card expansion
     */
    animateCardExpansion(card, expandedContent, callback) {
        const duration = this.config.expandDuration;
        
        // Set initial state
        expandedContent.style.opacity = '0';
        expandedContent.style.transform = 'translateY(-20px)';
        expandedContent.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        // Add expanded class to trigger CSS animations
        card.classList.add('card-expanding');
        
        // Animate content in
        requestAnimationFrame(() => {
            expandedContent.style.opacity = '1';
            expandedContent.style.transform = 'translateY(0)';
        });
        
        setTimeout(() => {
            card.classList.remove('card-expanding');
            callback();
        }, duration);
    }
    
    /**
     * Animate card collapse
     */
    animateCardCollapse(card, callback) {
        const duration = this.config.expandDuration;
        const expandedContent = card.querySelector('.project-expanded-content');
        
        if (!expandedContent) {
            callback();
            return;
        }
        
        // Animate content out
        expandedContent.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        expandedContent.style.opacity = '0';
        expandedContent.style.transform = 'translateY(-20px)';
        
        // Add collapsing class
        card.classList.add('card-collapsing');
        
        setTimeout(() => {
            card.classList.remove('card-collapsing');
            expandedContent.remove();
            callback();
        }, duration);
    }
    
    /**
     * Handle filter button clicks
     */
    handleFilterClick(event) {
        const button = event.currentTarget;
        const filter = button.dataset.filter || 'all';
        
        if (filter === this.state.currentFilter) return;
        
        this.applyFilter(filter);
        this.updateFilterButtons(button);
    }
    
    /**
     * Apply project filter
     */
    applyFilter(filter) {
        this.state.currentFilter = filter;
        
        this.elements.projectCards.forEach(card => {
            const cardCategory = card.dataset.category || 'general';
            const shouldShow = filter === 'all' || cardCategory === filter;
            
            if (shouldShow) {
                card.classList.remove('filtered-out');
                card.style.display = '';
            } else {
                card.classList.add('filtered-out');
                // Collapse if expanded
                if (this.state.expandedCards.has(this.getCardId(card))) {
                    this.collapseCard(card);
                }
            }
        });
        
        // Animate filter transition
        this.animateFilterTransition();
        
        // Track filter change
        this.trackFilterChange(filter);
    }
    
    /**
     * Update filter button states
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
        if (!this.elements.projectsContainer) return;
        
        this.elements.projectsContainer.classList.add('filtering');
        
        setTimeout(() => {
            this.elements.projectsContainer.classList.remove('filtering');
        }, 400);
    }
    
    /**
     * Setup project filtering
     */
    setupFiltering() {
        if (!this.config.enableFiltering) return;
        
        // Extract categories from project cards
        const categories = new Set(['all']);
        this.elements.projectCards.forEach(card => {
            const category = card.dataset.category;
            if (category) {
                categories.add(category);
            }
        });
        
        // Store categories
        this.filters = new Map();
        categories.forEach(category => {
            this.filters.set(category, category);
        });
        
        // Initialize filter buttons
        this.elements.filterButtons.forEach(button => {
            button.setAttribute('role', 'button');
            button.setAttribute('aria-pressed', 'false');
            
            if (button.dataset.filter === 'all') {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            }
        });
    }
    
    /**
     * Initialize project cards
     */
    initializeCards() {
        this.elements.projectCards.forEach((card, index) => {
            // Assign card ID if not present
            if (!card.id) {
                card.id = `project-card-${index}`;
            }
            
            // Add loading states for images
            const images = card.querySelectorAll('img');
            images.forEach(img => {
                if (!img.complete) {
                    img.addEventListener('load', () => {
                        card.classList.add('image-loaded');
                    });
                }
            });
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.classList.add('hovered');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hovered');
            });
        });
    }
    
    /**
     * Get unique card identifier
     */
    getCardId(card) {
        return card.id || card.dataset.project || `card-${Array.from(this.elements.projectCards).indexOf(card)}`;
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyNavigation(event) {
        // Escape key to close expanded cards or modals
        if (event.key === 'Escape') {
            if (this.state.currentModal) {
                this.closeModal();
            } else if (this.state.expandedCards.size > 0) {
                this.collapseAllCards();
            }
            return;
        }
        
        // Arrow key navigation through cards
        if (event.target.classList.contains('project-card')) {
            const currentIndex = this.elements.projectCards.indexOf(event.target);
            let nextIndex = currentIndex;
            
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    nextIndex = (currentIndex + 1) % this.elements.projectCards.length;
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    nextIndex = currentIndex === 0 ? 
                        this.elements.projectCards.length - 1 : 
                        currentIndex - 1;
                    break;
                default:
                    return;
            }
            
            event.preventDefault();
            this.elements.projectCards[nextIndex].focus();
        }
    }
    
    /**
     * Create modal for project details
     */
    createModal() {
        if (!this.config.enableModal) return;
        
        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Close modal">
                    <i class="las la-times"></i>
                </button>
                <div class="modal-body">
                    <!-- Content will be injected here -->
                </div>
            </div>
        `;
        
        // Bind modal events
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        backdrop.addEventListener('click', () => this.closeModal());
        
        document.body.appendChild(modal);
        this.elements.modal = modal;
    }
    
    /**
     * Create lightbox for images
     */
    createLightbox() {
        if (!this.config.enableLightbox) return;
        
        const lightbox = document.createElement('div');
        lightbox.className = 'project-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close lightbox">
                    <i class="las la-times"></i>
                </button>
                <div class="lightbox-image-container">
                    <img class="lightbox-image" alt="">
                    <div class="lightbox-controls">
                        <button class="lightbox-prev" aria-label="Previous image">
                            <i class="las la-chevron-left"></i>
                        </button>
                        <button class="lightbox-next" aria-label="Next image">
                            <i class="las la-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="lightbox-info">
                    <h4 class="lightbox-title"></h4>
                    <p class="lightbox-description"></p>
                </div>
            </div>
        `;
        
        // Bind lightbox events
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const backdrop = lightbox.querySelector('.lightbox-backdrop');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        closeBtn.addEventListener('click', () => this.closeLightbox());
        backdrop.addEventListener('click', () => this.closeLightbox());
        prevBtn.addEventListener('click', () => this.previousLightboxImage());
        nextBtn.addEventListener('click', () => this.nextLightboxImage());
        
        document.body.appendChild(lightbox);
        this.elements.lightbox = lightbox;
    }
    
    /**
     * Open project modal
     */
    openProjectModal(card, index) {
        if (!this.elements.modal) return;
        
        const projectData = this.extractProjectData(card);
        const modalBody = this.elements.modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="modal-project-content">
                <h2>${projectData.title}</h2>
                <div class="modal-project-image">
                    <img src="${projectData.images[0] || ''}" alt="${projectData.title}">
                </div>
                <div class="modal-project-details">
                    <p>${projectData.description}</p>
                    <div class="modal-technologies">
                        ${projectData.technologies.map(tech => 
                            `<span class="tech-badge">${tech}</span>`
                        ).join('')}
                    </div>
                    <div class="modal-links">
                        ${projectData.liveUrl ? 
                            `<a href="${projectData.liveUrl}" class="btn-primary" target="_blank">Live Demo</a>` : ''
                        }
                        ${projectData.repoUrl ? 
                            `<a href="${projectData.repoUrl}" class="btn-secondary" target="_blank">View Code</a>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
        
        this.elements.modal.classList.add('active');
        this.state.currentModal = projectData;
        document.body.style.overflow = 'hidden';
        
        // Focus management
        setTimeout(() => {
            const closeBtn = this.elements.modal.querySelector('.modal-close');
            closeBtn.focus();
        }, 100);
        
        this.trackCardInteraction('modal', this.getCardId(card));
    }
    
    /**
     * Close modal
     */
    closeModal() {
        if (!this.elements.modal || !this.state.currentModal) return;
        
        this.elements.modal.classList.remove('active');
        this.state.currentModal = null;
        document.body.style.overflow = '';
    }
    
    /**
     * Open lightbox
     */
    openLightbox(card, index) {
        if (!this.elements.lightbox) return;
        
        const projectData = this.extractProjectData(card);
        if (!projectData.images || projectData.images.length === 0) return;
        
        const lightboxImage = this.elements.lightbox.querySelector('.lightbox-image');
        const lightboxTitle = this.elements.lightbox.querySelector('.lightbox-title');
        const lightboxDesc = this.elements.lightbox.querySelector('.lightbox-description');
        
        lightboxImage.src = projectData.images[0];
        lightboxImage.alt = `${projectData.title} screenshot`;
        lightboxTitle.textContent = projectData.title;
        lightboxDesc.textContent = projectData.description;
        
        this.state.currentLightboxIndex = 0;
        this.elements.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.trackCardInteraction('lightbox', this.getCardId(card));
    }
    
    /**
     * Close lightbox
     */
    closeLightbox() {
        if (!this.elements.lightbox) return;
        
        this.elements.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate expanded card layouts
        if (this.state.expandedCards.size > 0) {
            // Could trigger a re-layout if needed
        }
    }
    
    /**
     * Track card interaction
     */
    trackCardInteraction(action, cardId) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'project_interaction', {
                event_category: 'engagement',
                event_label: cardId,
                custom_parameter_1: action
            });
        }
        
        // Custom event
        const event = new CustomEvent('project:interaction', {
            detail: { action, cardId, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Track filter change
     */
    trackFilterChange(filter) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'project_filter', {
                event_category: 'navigation',
                event_label: filter
            });
        }
        
        const event = new CustomEvent('project:filter', {
            detail: { filter, timestamp: Date.now() }
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
     * Expand specific card by ID
     */
    expandCardById(cardId) {
        const card = document.getElementById(cardId);
        if (card && this.elements.projectCards.includes(card)) {
            this.expandCard(card);
        }
    }
    
    /**
     * Get expanded cards
     */
    getExpandedCards() {
        return Array.from(this.state.expandedCards);
    }
    
    /**
     * Set filter
     */
    setFilter(filter) {
        this.applyFilter(filter);
        const filterButton = this.elements.filterButtons.find(btn => 
            btn.dataset.filter === filter
        );
        if (filterButton) {
            this.updateFilterButtons(filterButton);
        }
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
        // Remove event listeners
        this.elements.projectCards.forEach(card => {
            // Remove all bound events (would need to store references)
        });
        
        // Remove modals and lightboxes
        if (this.elements.modal) {
            this.elements.modal.remove();
        }
        if (this.elements.lightbox) {
            this.elements.lightbox.remove();
        }
        
        // Collapse all cards
        this.collapseAllCards();
        
        console.log('Project interactions destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectInteractions;
}

// Global namespace
window.ProjectInteractions = ProjectInteractions;