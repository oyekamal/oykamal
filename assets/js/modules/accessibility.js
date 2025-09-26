/**
 * Enhanced Accessibility Module
 * 
 * Provides comprehensive WCAG 2.1 AA compliance features including keyboard
 * navigation, screen reader support, focus management, and accessibility testing.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class EnhancedAccessibility {
    constructor(options = {}) {
        this.config = {
            enableKeyboardNavigation: true,
            enableFocusManagement: true,
            enableAriaEnhancements: true,
            enableScreenReaderSupport: true,
            enableColorContrastCheck: true,
            enableMotionReduction: true,
            enableLiveRegions: true,
            skipLinkTarget: '#main-content',
            focusOutlineColor: '#4A90E2',
            announcementDelay: 500,
            ...options
        };
        
        this.elements = {
            skipLink: null,
            focusableElements: [],
            landmarks: [],
            headings: [],
            buttons: [],
            links: [],
            forms: [],
            modals: [],
            tabPanels: []
        };
        
        this.state = {
            isInitialized: false,
            currentFocusIndex: -1,
            trapFocusElements: [],
            announcements: [],
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            highContrast: window.matchMedia('(prefers-contrast: high)').matches
        };
        
        this.keyboardNavigation = {
            trapStack: [],
            lastFocusedElement: null,
            roving: new Map()
        };
        
        this.init();
    }
    
    /**
     * Initialize accessibility features
     */
    init() {
        try {
            this.detectElements();
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
            this.setupAriaEnhancements();
            this.setupScreenReaderSupport();
            this.setupSkipLinks();
            this.setupLiveRegions();
            this.bindEvents();
            this.performInitialChecks();
            
            this.state.isInitialized = true;
            console.log('Enhanced accessibility initialized successfully');
        } catch (error) {
            console.error('Enhanced accessibility initialization failed:', error);
        }
    }
    
    /**
     * Detect and cache accessible elements
     */
    detectElements() {
        // Focusable elements
        const focusableSelectors = [
            'a[href]',
            'area[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            'iframe',
            'object',
            'embed',
            '[contenteditable]',
            '[tabindex]:not([tabindex^="-"])'
        ].join(', ');
        
        this.elements.focusableElements = Array.from(
            document.querySelectorAll(focusableSelectors)
        );
        
        // Landmark elements
        this.elements.landmarks = Array.from(
            document.querySelectorAll('main, nav, aside, header, footer, section, [role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"], [role="region"]')
        );
        
        // Heading elements
        this.elements.headings = Array.from(
            document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')
        );
        
        // Interactive elements
        this.elements.buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
        this.elements.links = Array.from(document.querySelectorAll('a[href], [role="link"]'));
        this.elements.forms = Array.from(document.querySelectorAll('form'));
        this.elements.modals = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal'));
        this.elements.tabPanels = Array.from(document.querySelectorAll('[role="tablist"], [role="tabpanel"]'));
        
        console.log(`Found ${this.elements.focusableElements.length} focusable elements`);
    }
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        if (!this.config.enableKeyboardNavigation) return;
        
        // Tab navigation enhancement
        this.setupTabNavigation();
        
        // Arrow key navigation for specific components
        this.setupArrowNavigation();
        
        // Escape key handling
        this.setupEscapeHandling();
        
        // Focus visibility enhancement
        this.setupFocusVisibility();
    }
    
    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }
    
    /**
     * Handle tab navigation
     */
    handleTabNavigation(event) {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        // Check if focus is trapped
        if (this.keyboardNavigation.trapStack.length > 0) {
            const trapContainer = this.keyboardNavigation.trapStack[this.keyboardNavigation.trapStack.length - 1];
            const trapFocusable = this.getFocusableElements(trapContainer);
            
            if (trapFocusable.length > 0) {
                this.handleTrappedTab(event, trapFocusable);
                return;
            }
        }
        
        // Regular tab navigation
        if (event.shiftKey) {
            // Shift + Tab (backward)
            if (currentIndex <= 0) {
                event.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Tab (forward)
            if (currentIndex >= focusableElements.length - 1) {
                event.preventDefault();
                focusableElements[0].focus();
            }
        }
    }
    
    /**
     * Handle trapped tab navigation
     */
    handleTrappedTab(event, focusableElements) {
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        if (event.shiftKey) {
            // Shift + Tab
            if (currentIndex <= 0) {
                event.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Tab
            if (currentIndex >= focusableElements.length - 1) {
                event.preventDefault();
                focusableElements[0].focus();
            }
        }
    }
    
    /**
     * Setup arrow key navigation
     */
    setupArrowNavigation() {
        // Tab panels
        this.elements.tabPanels.forEach(tabPanel => {
            this.setupTabPanelNavigation(tabPanel);
        });
        
        // Menu navigation
        document.querySelectorAll('[role="menu"], [role="menubar"]').forEach(menu => {
            this.setupMenuNavigation(menu);
        });
        
        // Radio groups
        document.querySelectorAll('[role="radiogroup"]').forEach(group => {
            this.setupRadioGroupNavigation(group);
        });
    }
    
    /**
     * Setup tab panel navigation
     */
    setupTabPanelNavigation(tabPanel) {
        const tabs = Array.from(tabPanel.querySelectorAll('[role="tab"]'));
        
        tabPanel.addEventListener('keydown', (e) => {
            const currentTab = e.target.closest('[role="tab"]');
            if (!currentTab) return;
            
            const currentIndex = tabs.indexOf(currentTab);
            let newIndex = currentIndex;
            
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    newIndex = (currentIndex + 1) % tabs.length;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
                    e.preventDefault();
                    break;
                case 'Home':
                    newIndex = 0;
                    e.preventDefault();
                    break;
                case 'End':
                    newIndex = tabs.length - 1;
                    e.preventDefault();
                    break;
            }
            
            if (newIndex !== currentIndex) {
                tabs[newIndex].focus();
                // Optionally activate tab
                if (tabPanel.dataset.autoActivate !== 'false') {
                    tabs[newIndex].click();
                }
            }
        });
    }
    
    /**
     * Setup menu navigation
     */
    setupMenuNavigation(menu) {
        const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
        
        menu.addEventListener('keydown', (e) => {
            const currentItem = e.target.closest('[role="menuitem"]');
            if (!currentItem) return;
            
            const currentIndex = menuItems.indexOf(currentItem);
            let newIndex = currentIndex;
            
            switch (e.key) {
                case 'ArrowDown':
                    newIndex = (currentIndex + 1) % menuItems.length;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    newIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
                    e.preventDefault();
                    break;
                case 'Home':
                    newIndex = 0;
                    e.preventDefault();
                    break;
                case 'End':
                    newIndex = menuItems.length - 1;
                    e.preventDefault();
                    break;
                case 'Enter':
                case ' ':
                    currentItem.click();
                    e.preventDefault();
                    break;
            }
            
            if (newIndex !== currentIndex) {
                menuItems[newIndex].focus();
            }
        });
    }
    
    /**
     * Setup radio group navigation
     */
    setupRadioGroupNavigation(group) {
        const radios = Array.from(group.querySelectorAll('[role="radio"]'));
        
        group.addEventListener('keydown', (e) => {
            const currentRadio = e.target.closest('[role="radio"]');
            if (!currentRadio) return;
            
            const currentIndex = radios.indexOf(currentRadio);
            let newIndex = currentIndex;
            
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    newIndex = (currentIndex + 1) % radios.length;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    newIndex = currentIndex === 0 ? radios.length - 1 : currentIndex - 1;
                    e.preventDefault();
                    break;
            }
            
            if (newIndex !== currentIndex) {
                // Uncheck current, check new
                radios.forEach(radio => radio.setAttribute('aria-checked', 'false'));
                radios[newIndex].setAttribute('aria-checked', 'true');
                radios[newIndex].focus();
            }
        });
    }
    
    /**
     * Setup escape key handling
     */
    setupEscapeHandling() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });
    }
    
    /**
     * Handle escape key
     */
    handleEscapeKey(event) {
        // Close modals
        const openModal = document.querySelector('.modal.show, [role="dialog"][aria-hidden="false"]');
        if (openModal) {
            this.closeModal(openModal);
            return;
        }
        
        // Close dropdowns
        const openDropdown = document.querySelector('.dropdown.show, [aria-expanded="true"]');
        if (openDropdown) {
            this.closeDropdown(openDropdown);
            return;
        }
        
        // Release focus trap
        if (this.keyboardNavigation.trapStack.length > 0) {
            this.releaseFocusTrap();
        }
    }
    
    /**
     * Setup focus visibility
     */
    setupFocusVisibility() {
        // Add focus styles
        const style = document.createElement('style');
        style.textContent = `
            .a11y-focus-visible {
                outline: 2px solid ${this.config.focusOutlineColor} !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.3) !important;
            }
            
            .a11y-focus-visible:focus {
                outline: 2px solid ${this.config.focusOutlineColor} !important;
                outline-offset: 2px !important;
            }
            
            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .a11y-focus-visible {
                    outline: 3px solid currentColor !important;
                    background-color: highlight !important;
                    color: highlighttext !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Track focus method
        let isMouseFocused = false;
        
        document.addEventListener('mousedown', () => {
            isMouseFocused = true;
        });
        
        document.addEventListener('keydown', () => {
            isMouseFocused = false;
        });
        
        // Apply focus styles only for keyboard focus
        document.addEventListener('focus', (e) => {
            if (!isMouseFocused && this.elements.focusableElements.includes(e.target)) {
                e.target.classList.add('a11y-focus-visible');
            }
        }, true);
        
        document.addEventListener('blur', (e) => {
            e.target.classList.remove('a11y-focus-visible');
        }, true);
    }
    
    /**
     * Setup focus management
     */
    setupFocusManagement() {
        if (!this.config.enableFocusManagement) return;
        
        // Track focus changes
        document.addEventListener('focusin', (e) => {
            this.handleFocusChange(e.target, 'in');
        });
        
        document.addEventListener('focusout', (e) => {
            this.handleFocusChange(e.target, 'out');
        });
        
        // Page load focus management
        window.addEventListener('load', () => {
            this.setInitialFocus();
        });
    }
    
    /**
     * Handle focus change
     */
    handleFocusChange(element, direction) {
        if (direction === 'in') {
            // Store last focused element
            this.keyboardNavigation.lastFocusedElement = element;
            
            // Announce focus change to screen readers if needed
            if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
                this.announceToScreenReader(`Focused on ${this.getAccessibleName(element)}`);
            }
        }
        
        // Track focus for analytics
        this.trackFocus(element, direction);
    }
    
    /**
     * Set initial focus
     */
    setInitialFocus() {
        // Check for skip link
        const skipLink = document.querySelector('.skip-link, [href="#main-content"]');
        if (skipLink) {
            return; // Skip link will handle initial focus
        }
        
        // Focus main content or first heading
        const mainContent = document.querySelector('main, #main-content, [role="main"]');
        const firstHeading = document.querySelector('h1');
        
        const focusTarget = mainContent || firstHeading;
        if (focusTarget) {
            // Make focusable if not already
            if (!focusTarget.hasAttribute('tabindex')) {
                focusTarget.setAttribute('tabindex', '-1');
            }
            focusTarget.focus();
        }
    }
    
    /**
     * Setup ARIA enhancements
     */
    setupAriaEnhancements() {
        if (!this.config.enableAriaEnhancements) return;
        
        this.enhanceButtons();
        this.enhanceLinks();
        this.enhanceForms();
        this.enhanceImages();
        this.enhanceHeadings();
        this.enhanceLandmarks();
    }
    
    /**
     * Enhance buttons
     */
    enhanceButtons() {
        this.elements.buttons.forEach(button => {
            // Ensure proper role
            if (!button.hasAttribute('role')) {
                button.setAttribute('role', 'button');
            }
            
            // Add accessible name if missing
            if (!this.hasAccessibleName(button)) {
                const text = button.textContent.trim();
                if (text) {
                    button.setAttribute('aria-label', text);
                } else {
                    console.warn('Button without accessible name:', button);
                }
            }
            
            // Handle toggle buttons
            if (button.classList.contains('toggle') || button.dataset.toggle) {
                const isPressed = button.classList.contains('active') || 
                                 button.getAttribute('aria-pressed') === 'true';
                button.setAttribute('aria-pressed', isPressed.toString());
            }
            
            // Handle disabled state
            if (button.disabled) {
                button.setAttribute('aria-disabled', 'true');
            }
        });
    }
    
    /**
     * Enhance links
     */
    enhanceLinks() {
        this.elements.links.forEach(link => {
            // External links
            if (link.hostname && link.hostname !== location.hostname) {
                if (!link.hasAttribute('aria-label')) {
                    const text = link.textContent.trim();
                    link.setAttribute('aria-label', `${text} (opens in new tab)`);
                }
                
                // Add visual indicator for screen readers
                if (!link.querySelector('.sr-only')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'sr-only';
                    indicator.textContent = ' (external link)';
                    link.appendChild(indicator);
                }
            }
            
            // Download links
            if (link.hasAttribute('download')) {
                const text = link.textContent.trim();
                const filename = link.getAttribute('download') || 'file';
                link.setAttribute('aria-label', `Download ${text || filename}`);
            }
            
            // Empty links
            if (!this.hasAccessibleName(link)) {
                console.warn('Link without accessible name:', link);
            }
        });
    }
    
    /**
     * Enhance forms
     */
    enhanceForms() {
        this.elements.forms.forEach(form => {
            const formFields = form.querySelectorAll('input, select, textarea');
            
            formFields.forEach(field => {
                // Associate with labels
                this.associateFieldWithLabel(field);
                
                // Add required indicators
                if (field.required && !field.hasAttribute('aria-required')) {
                    field.setAttribute('aria-required', 'true');
                }
                
                // Add error associations
                this.associateFieldWithError(field);
            });
        });
    }
    
    /**
     * Associate field with label
     */
    associateFieldWithLabel(field) {
        if (field.hasAttribute('aria-labelledby') || field.hasAttribute('aria-label')) {
            return; // Already has accessible name
        }
        
        // Find associated label
        let label = null;
        
        if (field.id) {
            label = document.querySelector(`label[for="${field.id}"]`);
        }
        
        if (!label) {
            label = field.closest('label');
        }
        
        if (label) {
            if (!label.id) {
                label.id = `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            field.setAttribute('aria-labelledby', label.id);
        } else {
            console.warn('Form field without associated label:', field);
        }
    }
    
    /**
     * Associate field with error
     */
    associateFieldWithError(field) {
        const errorElement = field.parentNode.querySelector('.error, .invalid-feedback, [role="alert"]');
        
        if (errorElement) {
            if (!errorElement.id) {
                errorElement.id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            const describedBy = field.getAttribute('aria-describedby') || '';
            if (!describedBy.includes(errorElement.id)) {
                field.setAttribute('aria-describedby', 
                    (describedBy + ' ' + errorElement.id).trim()
                );
            }
        }
    }
    
    /**
     * Enhance images
     */
    enhanceImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Decorative images
            if (img.alt === '' || img.hasAttribute('role')) {
                img.setAttribute('role', 'presentation');
                img.setAttribute('aria-hidden', 'true');
            }
            
            // Complex images
            if (img.dataset.description) {
                const descId = `img-desc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const description = document.createElement('div');
                description.id = descId;
                description.className = 'sr-only';
                description.textContent = img.dataset.description;
                
                img.parentNode.insertBefore(description, img.nextSibling);
                img.setAttribute('aria-describedby', descId);
            }
        });
    }
    
    /**
     * Enhance headings
     */
    enhanceHeadings() {
        // Check heading hierarchy
        let lastLevel = 0;
        
        this.elements.headings.forEach(heading => {
            const level = this.getHeadingLevel(heading);
            
            if (level > lastLevel + 1) {
                console.warn('Heading level skip detected:', heading);
            }
            
            lastLevel = level;
            
            // Add IDs for internal linking
            if (!heading.id) {
                const text = heading.textContent.trim().toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                heading.id = text;
            }
        });
    }
    
    /**
     * Get heading level
     */
    getHeadingLevel(heading) {
        if (heading.tagName.match(/^H[1-6]$/)) {
            return parseInt(heading.tagName.charAt(1));
        }
        
        const ariaLevel = heading.getAttribute('aria-level');
        return ariaLevel ? parseInt(ariaLevel) : 1;
    }
    
    /**
     * Enhance landmarks
     */
    enhanceLandmarks() {
        this.elements.landmarks.forEach(landmark => {
            // Add accessible names to regions
            if (landmark.tagName === 'SECTION' || landmark.getAttribute('role') === 'region') {
                if (!this.hasAccessibleName(landmark)) {
                    const heading = landmark.querySelector('h1, h2, h3, h4, h5, h6');
                    if (heading) {
                        if (!heading.id) {
                            heading.id = `heading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        }
                        landmark.setAttribute('aria-labelledby', heading.id);
                    }
                }
            }
        });
    }
    
    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        if (!this.config.enableScreenReaderSupport) return;
        
        // Add screen reader only text class
        this.addScreenReaderStyles();
        
        // Setup announcements
        this.setupAnnouncements();
        
        // Handle dynamic content changes
        this.setupContentChangeHandling();
    }
    
    /**
     * Add screen reader styles
     */
    addScreenReaderStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
            
            .sr-only-focusable:active,
            .sr-only-focusable:focus {
                position: static !important;
                width: auto !important;
                height: auto !important;
                padding: inherit !important;
                margin: inherit !important;
                overflow: visible !important;
                clip: auto !important;
                white-space: inherit !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Setup announcements
     */
    setupAnnouncements() {
        // Create live region
        this.announcementRegion = document.createElement('div');
        this.announcementRegion.setAttribute('aria-live', 'polite');
        this.announcementRegion.setAttribute('aria-atomic', 'true');
        this.announcementRegion.className = 'sr-only';
        this.announcementRegion.id = 'a11y-announcements';
        document.body.appendChild(this.announcementRegion);
        
        // Create assertive region for urgent announcements
        this.urgentAnnouncementRegion = document.createElement('div');
        this.urgentAnnouncementRegion.setAttribute('aria-live', 'assertive');
        this.urgentAnnouncementRegion.setAttribute('aria-atomic', 'true');
        this.urgentAnnouncementRegion.className = 'sr-only';
        this.urgentAnnouncementRegion.id = 'a11y-urgent-announcements';
        document.body.appendChild(this.urgentAnnouncementRegion);
    }
    
    /**
     * Setup content change handling
     */
    setupContentChangeHandling() {
        // Monitor DOM changes for accessibility updates
        if (window.MutationObserver) {
            this.observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.enhanceNewContent(node);
                            }
                        });
                    }
                });
            });
            
            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    /**
     * Enhance new content
     */
    enhanceNewContent(element) {
        // Re-detect elements in new content
        const focusableElements = element.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex^="-"])'
        );
        
        focusableElements.forEach(el => {
            if (!this.elements.focusableElements.includes(el)) {
                this.elements.focusableElements.push(el);
            }
        });
        
        // Apply enhancements to new content
        const buttons = element.querySelectorAll('button, [role="button"]');
        buttons.forEach(button => this.enhanceButtons([button]));
        
        const links = element.querySelectorAll('a[href], [role="link"]');
        links.forEach(link => this.enhanceLinks([link]));
        
        const images = element.querySelectorAll('img');
        images.forEach(img => this.enhanceImages([img]));
    }
    
    /**
     * Setup skip links
     */
    setupSkipLinks() {
        // Create skip link if not exists
        if (!document.querySelector('.skip-link')) {
            this.createSkipLink();
        }
        
        // Enhance existing skip links
        const skipLinks = document.querySelectorAll('.skip-link, [href^="#main"], [href^="#content"]');
        skipLinks.forEach(link => {
            this.enhanceSkipLink(link);
        });
    }
    
    /**
     * Create skip link
     */
    createSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = this.config.skipLinkTarget;
        skipLink.className = 'skip-link sr-only-focusable';
        skipLink.textContent = 'Skip to main content';
        
        // Add styles
        skipLink.style.position = 'absolute';
        skipLink.style.top = '-40px';
        skipLink.style.left = '6px';
        skipLink.style.width = 'auto';
        skipLink.style.height = 'auto';
        skipLink.style.padding = '8px';
        skipLink.style.backgroundColor = '#000';
        skipLink.style.color = '#fff';
        skipLink.style.textDecoration = 'none';
        skipLink.style.zIndex = '100000';
        skipLink.style.borderRadius = '0 0 4px 0';
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        this.elements.skipLink = skipLink;
    }
    
    /**
     * Enhance skip link
     */
    enhanceSkipLink(link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                // Make target focusable
                if (!target.hasAttribute('tabindex')) {
                    target.setAttribute('tabindex', '-1');
                }
                target.focus();
                
                // Scroll to target
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    
    /**
     * Setup live regions
     */
    setupLiveRegions() {
        if (!this.config.enableLiveRegions) return;
        
        // Enhance existing live regions
        const liveRegions = document.querySelectorAll('[aria-live]');
        liveRegions.forEach(region => {
            this.enhanceLiveRegion(region);
        });
    }
    
    /**
     * Enhance live region
     */
    enhanceLiveRegion(region) {
        // Ensure proper attributes
        if (!region.hasAttribute('aria-atomic')) {
            region.setAttribute('aria-atomic', 'true');
        }
        
        // Track changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(() => {
                this.trackLiveRegionChange(region);
            });
            
            observer.observe(region, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }
    
    /**
     * Track live region change
     */
    trackLiveRegionChange(region) {
        const content = region.textContent.trim();
        if (content) {
            console.log('Live region updated:', content);
        }
    }
    
    /**
     * Bind events
     */
    bindEvents() {
        // Reduced motion preference change
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addListener((e) => {
            this.state.reducedMotion = e.matches;
            this.handleReducedMotionChange();
        });
        
        // High contrast preference change
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        contrastQuery.addListener((e) => {
            this.state.highContrast = e.matches;
            this.handleHighContrastChange();
        });
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.performAccessibilityCheck();
            }
        });
    }
    
    /**
     * Handle reduced motion change
     */
    handleReducedMotionChange() {
        if (this.state.reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
            
            // Disable animations
            const style = document.createElement('style');
            style.id = 'reduced-motion-styles';
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            document.documentElement.classList.remove('reduce-motion');
            
            const reducedMotionStyles = document.getElementById('reduced-motion-styles');
            if (reducedMotionStyles) {
                reducedMotionStyles.remove();
            }
        }
    }
    
    /**
     * Handle high contrast change
     */
    handleHighContrastChange() {
        if (this.state.highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }
    
    /**
     * Perform initial accessibility checks
     */
    performInitialChecks() {
        this.checkHeadingHierarchy();
        this.checkColorContrast();
        this.checkKeyboardAccessibility();
        this.checkAriaUsage();
    }
    
    /**
     * Check heading hierarchy
     */
    checkHeadingHierarchy() {
        let issues = [];
        let lastLevel = 0;
        
        this.elements.headings.forEach((heading, index) => {
            const level = this.getHeadingLevel(heading);
            
            if (index === 0 && level !== 1) {
                issues.push(`First heading should be h1, found h${level}`);
            }
            
            if (level > lastLevel + 1) {
                issues.push(`Heading level skip: h${lastLevel} to h${level}`);
            }
            
            lastLevel = level;
        });
        
        if (issues.length > 0) {
            console.warn('Heading hierarchy issues:', issues);
        }
    }
    
    /**
     * Check keyboard accessibility
     */
    checkKeyboardAccessibility() {
        // Check for keyboard traps
        this.elements.focusableElements.forEach(element => {
            if (element.tabIndex < 0 && element.tabIndex !== -1) {
                console.warn('Element with invalid tabindex:', element);
            }
        });
        
        // Check for missing focus styles
        const elementsNeedingFocus = this.elements.focusableElements.filter(el => {
            const styles = getComputedStyle(el, ':focus');
            return styles.outline === 'none' && !styles.boxShadow.includes('shadow');
        });
        
        if (elementsNeedingFocus.length > 0) {
            console.warn('Elements without focus styles:', elementsNeedingFocus);
        }
    }
    
    /**
     * Check ARIA usage
     */
    checkAriaUsage() {
        // Check for empty ARIA labels
        const elementsWithAriaLabel = document.querySelectorAll('[aria-label]');
        elementsWithAriaLabel.forEach(element => {
            if (!element.getAttribute('aria-label').trim()) {
                console.warn('Element with empty aria-label:', element);
            }
        });
        
        // Check for invalid ARIA references
        const elementsWithAriaLabelledby = document.querySelectorAll('[aria-labelledby]');
        elementsWithAriaLabelledby.forEach(element => {
            const ids = element.getAttribute('aria-labelledby').split(' ');
            ids.forEach(id => {
                if (!document.getElementById(id)) {
                    console.warn('Invalid aria-labelledby reference:', id, element);
                }
            });
        });
    }
    
    /**
     * Check color contrast
     */
    checkColorContrast() {
        if (!this.config.enableColorContrastCheck) return;
        
        // This is a simplified contrast check
        // In a real implementation, you'd use a proper color contrast calculation
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
        
        textElements.forEach(element => {
            const styles = getComputedStyle(element);
            const textColor = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // Simple check - would need proper contrast ratio calculation
            if (textColor === backgroundColor) {
                console.warn('Potential contrast issue:', element);
            }
        });
    }
    
    /**
     * Utility methods
     */
    
    /**
     * Get focusable elements within container
     */
    getFocusableElements(container = document) {
        const selector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [contenteditable], [tabindex]:not([tabindex^="-"])';
        return Array.from(container.querySelectorAll(selector))
            .filter(element => this.isVisible(element));
    }
    
    /**
     * Check if element is visible
     */
    isVisible(element) {
        const styles = getComputedStyle(element);
        return styles.display !== 'none' && 
               styles.visibility !== 'hidden' && 
               styles.opacity !== '0';
    }
    
    /**
     * Check if element has accessible name
     */
    hasAccessibleName(element) {
        return element.hasAttribute('aria-label') ||
               element.hasAttribute('aria-labelledby') ||
               element.textContent.trim().length > 0;
    }
    
    /**
     * Get accessible name
     */
    getAccessibleName(element) {
        if (element.hasAttribute('aria-label')) {
            return element.getAttribute('aria-label');
        }
        
        if (element.hasAttribute('aria-labelledby')) {
            const ids = element.getAttribute('aria-labelledby').split(' ');
            return ids.map(id => {
                const labelElement = document.getElementById(id);
                return labelElement ? labelElement.textContent : '';
            }).join(' ').trim();
        }
        
        return element.textContent.trim();
    }
    
    /**
     * Public API methods
     */
    
    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message, priority = 'polite') {
        const region = priority === 'assertive' ? 
            this.urgentAnnouncementRegion : 
            this.announcementRegion;
        
        if (region) {
            region.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, this.config.announcementDelay);
        }
    }
    
    /**
     * Trap focus within container
     */
    trapFocus(container) {
        this.keyboardNavigation.trapStack.push(container);
        
        // Focus first focusable element
        const focusableElements = this.getFocusableElements(container);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
    
    /**
     * Release focus trap
     */
    releaseFocusTrap() {
        const container = this.keyboardNavigation.trapStack.pop();
        
        // Return focus to last focused element
        if (this.keyboardNavigation.lastFocusedElement) {
            this.keyboardNavigation.lastFocusedElement.focus();
        }
        
        return container;
    }
    
    /**
     * Perform accessibility check
     */
    performAccessibilityCheck() {
        const issues = [];
        
        // Re-run all checks
        this.checkHeadingHierarchy();
        this.checkKeyboardAccessibility();
        this.checkAriaUsage();
        
        return issues;
    }
    
    /**
     * Track focus for analytics
     */
    trackFocus(element, direction) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'accessibility_focus', {
                event_category: 'accessibility',
                event_label: element.tagName.toLowerCase(),
                custom_parameter_1: direction,
                custom_parameter_2: element.className || 'none'
            });
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
        // Disconnect observers
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleTabNavigation);
        window.removeEventListener('load', this.setInitialFocus);
        
        // Remove added elements
        if (this.announcementRegion && this.announcementRegion.parentNode) {
            this.announcementRegion.remove();
        }
        
        if (this.urgentAnnouncementRegion && this.urgentAnnouncementRegion.parentNode) {
            this.urgentAnnouncementRegion.remove();
        }
        
        // Clean up focus classes
        document.querySelectorAll('.a11y-focus-visible').forEach(el => {
            el.classList.remove('a11y-focus-visible');
        });
        
        console.log('Enhanced accessibility destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAccessibility;
}

// Global namespace
window.EnhancedAccessibility = EnhancedAccessibility;