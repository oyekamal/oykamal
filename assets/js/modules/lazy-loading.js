/**
 * Image Lazy Loading Module
 * 
 * Provides intelligent lazy loading for images with fallbacks, progressive
 * enhancement, intersection observer optimization, and accessibility features.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class ImageLazyLoading {
    constructor(options = {}) {
        this.config = {
            enableLazyLoading: true,
            enableProgressiveLoading: true,
            enableWebPSupport: true,
            enableRetina: true,
            enableFadeAnimation: true,
            rootMargin: '50px',
            threshold: 0.01,
            fadeInDuration: 500,
            placeholderDataURI: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTAiIHN0cm9rZT0iI0U1RTdFQiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiPgogICAgPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIHZhbHVlcz0iMCAyMCAyMDszNjAgMjAgMjAiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+CjwvY2lyY2xlPgo8L3N2Zz4K',
            retryAttempts: 3,
            retryDelay: 1000,
            imageFormats: ['webp', 'avif', 'jpg', 'png'],
            ...options
        };
        
        this.elements = {
            lazyImages: [],
            backgroundImages: [],
            pictureElements: [],
            videoElements: []
        };
        
        this.state = {
            isSupported: false,
            loadedImages: new Set(),
            loadingImages: new Map(),
            failedImages: new Set(),
            retryCount: new Map()
        };
        
        this.observer = null;
        this.webPSupported = null;
        this.avifSupported = null;
        
        this.init();
    }
    
    /**
     * Initialize lazy loading
     */
    init() {
        try {
            this.checkSupport();
            this.detectFormatSupport();
            this.cacheElements();
            this.setupIntersectionObserver();
            this.preprocessImages();
            this.bindEvents();
            
            console.log('Image lazy loading initialized successfully');
        } catch (error) {
            console.error('Image lazy loading initialization failed:', error);
            this.fallbackToNormalLoading();
        }
    }
    
    /**
     * Check browser support
     */
    checkSupport() {
        this.state.isSupported = {
            intersectionObserver: 'IntersectionObserver' in window,
            loading: 'loading' in HTMLImageElement.prototype,
            webP: null, // Will be detected asynchronously
            avif: null  // Will be detected asynchronously
        };
    }
    
    /**
     * Detect format support
     */
    async detectFormatSupport() {
        // Test WebP support
        this.webPSupported = await this.testImageFormat('webp');
        this.state.isSupported.webP = this.webPSupported;
        
        // Test AVIF support
        this.avifSupported = await this.testImageFormat('avif');
        this.state.isSupported.avif = this.avifSupported;
        
        console.log(`Format support - WebP: ${this.webPSupported}, AVIF: ${this.avifSupported}`);
    }
    
    /**
     * Test image format support
     */
    testImageFormat(format) {
        return new Promise((resolve) => {
            const testImages = {
                webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
                avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
            };
            
            const img = new Image();
            img.onload = () => resolve(img.width > 0 && img.height > 0);
            img.onerror = () => resolve(false);
            img.src = testImages[format];
            
            // Timeout fallback
            setTimeout(() => resolve(false), 1000);
        });
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        // Lazy images with data-src
        this.elements.lazyImages = Array.from(
            document.querySelectorAll('img[data-src], [data-lazy]')
        );
        
        // Background images
        this.elements.backgroundImages = Array.from(
            document.querySelectorAll('[data-bg], [data-background]')
        );
        
        // Picture elements
        this.elements.pictureElements = Array.from(
            document.querySelectorAll('picture')
        );
        
        // Video elements (for lazy loading video posters)
        this.elements.videoElements = Array.from(
            document.querySelectorAll('video[data-poster]')
        );
        
        console.log(`Found ${this.elements.lazyImages.length} lazy images`);
    }
    
    /**
     * Setup intersection observer
     */
    setupIntersectionObserver() {
        if (!this.state.isSupported.intersectionObserver) {
            this.fallbackToScrollListener();
            return;
        }
        
        const options = {
            root: null,
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        // Observe all lazy elements
        [...this.elements.lazyImages, 
         ...this.elements.backgroundImages, 
         ...this.elements.videoElements].forEach(element => {
            this.observer.observe(element);
        });
    }
    
    /**
     * Preprocess images for optimization
     */
    preprocessImages() {
        this.elements.lazyImages.forEach(img => {
            this.preprocessImage(img);
        });
        
        this.elements.backgroundImages.forEach(element => {
            this.preprocessBackgroundImage(element);
        });
        
        this.elements.pictureElements.forEach(picture => {
            this.preprocessPictureElement(picture);
        });
    }
    
    /**
     * Preprocess individual image
     */
    preprocessImage(img) {
        // Set placeholder if not already set
        if (!img.src || img.src === window.location.href) {
            img.src = this.config.placeholderDataURI;
        }
        
        // Add loading class
        img.classList.add('lazy-loading');
        
        // Store original dimensions if available
        if (img.dataset.width && img.dataset.height) {
            img.style.width = img.dataset.width + 'px';
            img.style.height = img.dataset.height + 'px';
        }
        
        // Add aspect ratio container if specified
        if (img.dataset.aspectRatio) {
            this.createAspectRatioContainer(img);
        }
        
        // Prepare srcset for responsive images
        if (img.dataset.srcset) {
            img.dataset.originalSrcset = img.dataset.srcset;
        }
        
        // Check for retina support
        if (this.config.enableRetina && window.devicePixelRatio > 1) {
            this.prepareRetinaImage(img);
        }
    }
    
    /**
     * Preprocess background image
     */
    preprocessBackgroundImage(element) {
        element.classList.add('lazy-bg-loading');
        
        // Set placeholder background
        if (!element.style.backgroundImage) {
            element.style.backgroundImage = `url(${this.config.placeholderDataURI})`;
        }
    }
    
    /**
     * Preprocess picture element
     */
    preprocessPictureElement(picture) {
        const img = picture.querySelector('img');
        if (img) {
            this.preprocessImage(img);
        }
        
        // Process source elements
        const sources = picture.querySelectorAll('source[data-srcset]');
        sources.forEach(source => {
            source.dataset.originalSrcset = source.dataset.srcset;
            source.classList.add('lazy-source');
        });
    }
    
    /**
     * Create aspect ratio container
     */
    createAspectRatioContainer(img) {
        const container = document.createElement('div');
        container.className = 'lazy-aspect-ratio-container';
        container.style.position = 'relative';
        container.style.paddingBottom = img.dataset.aspectRatio + '%';
        container.style.height = '0';
        container.style.overflow = 'hidden';
        
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
    }
    
    /**
     * Prepare retina image
     */
    prepareRetinaImage(img) {
        const src = img.dataset.src;
        const retinaMarkers = ['@2x', '_2x', '-2x'];
        
        // Check if retina version exists
        retinaMarkers.forEach(marker => {
            const extension = src.split('.').pop();
            const baseName = src.replace(`.${extension}`, '');
            const retinaSrc = `${baseName}${marker}.${extension}`;
            
            // Store retina source for later use
            img.dataset.retinaSrc = retinaSrc;
        });
    }
    
    /**
     * Load image
     */
    async loadImage(element) {
        const type = this.getElementType(element);
        
        if (this.state.loadingImages.has(element) || this.state.loadedImages.has(element)) {
            return;
        }
        
        this.state.loadingImages.set(element, Date.now());
        
        try {
            switch (type) {
                case 'img':
                    await this.loadImageElement(element);
                    break;
                case 'background':
                    await this.loadBackgroundImage(element);
                    break;
                case 'video':
                    await this.loadVideoElement(element);
                    break;
            }
            
            this.onImageLoaded(element, type);
            
        } catch (error) {
            this.onImageError(element, error, type);
        }
    }
    
    /**
     * Get element type
     */
    getElementType(element) {
        if (element.tagName === 'IMG') return 'img';
        if (element.tagName === 'VIDEO') return 'video';
        if (element.dataset.bg || element.dataset.background) return 'background';
        return 'unknown';
    }
    
    /**
     * Load image element
     */
    async loadImageElement(img) {
        return new Promise(async (resolve, reject) => {
            const src = await this.getBestImageSource(img);
            
            // Create new image for preloading
            const tempImg = new Image();
            
            tempImg.onload = () => {
                // Update original image
                img.src = src;
                
                // Update srcset if available
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                
                resolve(tempImg);
            };
            
            tempImg.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            tempImg.src = src;
        });
    }
    
    /**
     * Get best image source based on format support
     */
    async getBestImageSource(img) {
        const originalSrc = img.dataset.src;
        
        if (!this.config.enableWebPSupport) {
            return originalSrc;
        }
        
        // Check for format-specific sources
        if (this.avifSupported && img.dataset.avif) {
            return img.dataset.avif;
        }
        
        if (this.webPSupported && img.dataset.webp) {
            return img.dataset.webp;
        }
        
        // Check for retina version
        if (this.config.enableRetina && window.devicePixelRatio > 1 && img.dataset.retinaSrc) {
            // Test if retina version exists
            try {
                await this.testImageExists(img.dataset.retinaSrc);
                return img.dataset.retinaSrc;
            } catch {
                // Fall back to regular source
            }
        }
        
        return originalSrc;
    }
    
    /**
     * Test if image exists
     */
    testImageExists(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => reject(false);
            img.src = src;
        });
    }
    
    /**
     * Load background image
     */
    async loadBackgroundImage(element) {
        return new Promise(async (resolve, reject) => {
            const src = element.dataset.bg || element.dataset.background;
            
            // Create temp image to preload
            const tempImg = new Image();
            
            tempImg.onload = () => {
                element.style.backgroundImage = `url(${src})`;
                resolve(tempImg);
            };
            
            tempImg.onerror = () => {
                reject(new Error('Failed to load background image'));
            };
            
            tempImg.src = src;
        });
    }
    
    /**
     * Load video element
     */
    async loadVideoElement(video) {
        return new Promise((resolve, reject) => {
            if (video.dataset.poster) {
                const tempImg = new Image();
                
                tempImg.onload = () => {
                    video.poster = video.dataset.poster;
                    resolve(tempImg);
                };
                
                tempImg.onerror = () => {
                    reject(new Error('Failed to load video poster'));
                };
                
                tempImg.src = video.dataset.poster;
            } else {
                resolve();
            }
        });
    }
    
    /**
     * Handle successful image load
     */
    onImageLoaded(element, type) {
        this.state.loadingImages.delete(element);
        this.state.loadedImages.add(element);
        
        // Remove loading classes
        element.classList.remove('lazy-loading', 'lazy-bg-loading');
        element.classList.add('lazy-loaded');
        
        // Apply fade-in animation
        if (this.config.enableFadeAnimation) {
            this.animateImageIn(element);
        }
        
        // Update picture sources if needed
        if (element.tagName === 'IMG' && element.closest('picture')) {
            this.updatePictureSources(element.closest('picture'));
        }
        
        // Dispatch loaded event
        const event = new CustomEvent('image:loaded', {
            detail: { element, type, timestamp: Date.now() }
        });
        element.dispatchEvent(event);
        
        // Track loading
        this.trackImageLoad(element, type, 'success');
    }
    
    /**
     * Handle image load error
     */
    onImageError(element, error, type) {
        this.state.loadingImages.delete(element);
        this.state.failedImages.add(element);
        
        const retryCount = this.state.retryCount.get(element) || 0;
        
        if (retryCount < this.config.retryAttempts) {
            // Retry loading
            this.state.retryCount.set(element, retryCount + 1);
            setTimeout(() => {
                this.state.failedImages.delete(element);
                this.loadImage(element);
            }, this.config.retryDelay * (retryCount + 1));
            
        } else {
            // Show fallback
            this.showFallbackImage(element, type);
            
            // Dispatch error event
            const event = new CustomEvent('image:error', {
                detail: { element, error, type, timestamp: Date.now() }
            });
            element.dispatchEvent(event);
            
            // Track error
            this.trackImageLoad(element, type, 'error');
        }
        
        console.warn('Image loading failed:', error);
    }
    
    /**
     * Animate image in
     */
    animateImageIn(element) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${this.config.fadeInDuration}ms ease`;
        
        // Use RAF to ensure smooth animation
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
        
        // Clean up transition after animation
        setTimeout(() => {
            element.style.transition = '';
        }, this.config.fadeInDuration);
    }
    
    /**
     * Update picture sources
     */
    updatePictureSources(picture) {
        const sources = picture.querySelectorAll('source.lazy-source');
        sources.forEach(source => {
            if (source.dataset.srcset) {
                source.srcset = source.dataset.srcset;
                source.classList.remove('lazy-source');
            }
        });
    }
    
    /**
     * Show fallback image
     */
    showFallbackImage(element, type) {
        element.classList.remove('lazy-loading', 'lazy-bg-loading');
        element.classList.add('lazy-error');
        
        switch (type) {
            case 'img':
                // Use fallback image or show broken image icon
                element.src = element.dataset.fallback || this.createBrokenImageSrc();
                element.alt = element.alt || 'Image could not be loaded';
                break;
            case 'background':
                // Remove background image
                element.style.backgroundImage = 'none';
                element.classList.add('bg-image-error');
                break;
        }
    }
    
    /**
     * Create broken image data URI
     */
    createBrokenImageSrc() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkwyNCAyNE0yNCAxNkwxNiAyNCIgc3Ryb2tlPSIjOUI5QkExIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
    }
    
    /**
     * Fallback to scroll listener for older browsers
     */
    fallbackToScrollListener() {
        const checkImages = this.throttle(() => {
            [...this.elements.lazyImages, ...this.elements.backgroundImages].forEach(element => {
                if (this.isElementInViewport(element)) {
                    this.loadImage(element);
                }
            });
        }, 100);
        
        window.addEventListener('scroll', checkImages);
        window.addEventListener('resize', checkImages);
        
        // Initial check
        checkImages();
    }
    
    /**
     * Check if element is in viewport (fallback)
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const margin = parseInt(this.config.rootMargin);
        
        return (
            rect.bottom >= -margin &&
            rect.right >= -margin &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) + margin
        );
    }
    
    /**
     * Fallback to normal loading
     */
    fallbackToNormalLoading() {
        console.warn('Falling back to immediate image loading');
        
        [...this.elements.lazyImages, ...this.elements.backgroundImages].forEach(element => {
            this.loadImage(element);
        });
    }
    
    /**
     * Bind events
     */
    bindEvents() {
        // Window events
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Connection change events
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.resumeLazyLoading();
            }
        });
    }
    
    /**
     * Handle resize
     */
    handleResize() {
        // Refresh intersection observer
        if (this.observer) {
            // Re-observe elements that might now be in viewport
            this.elements.lazyImages.forEach(img => {
                if (!this.state.loadedImages.has(img) && this.isElementInViewport(img)) {
                    this.loadImage(img);
                }
            });
        }
    }
    
    /**
     * Handle connection change
     */
    handleConnectionChange() {
        if (navigator.connection.effectiveType === 'slow-2g') {
            // Pause lazy loading on slow connections
            if (this.observer) {
                this.observer.disconnect();
            }
        } else {
            // Resume lazy loading
            this.resumeLazyLoading();
        }
    }
    
    /**
     * Resume lazy loading
     */
    resumeLazyLoading() {
        if (this.observer) {
            // Re-observe unloaded elements
            [...this.elements.lazyImages, ...this.elements.backgroundImages].forEach(element => {
                if (!this.state.loadedImages.has(element)) {
                    this.observer.observe(element);
                }
            });
        }
    }
    
    /**
     * Track image loading
     */
    trackImageLoad(element, type, status) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'image_lazy_load', {
                event_category: 'performance',
                event_label: type,
                custom_parameter_1: status,
                custom_parameter_2: element.src || element.dataset.src
            });
        }
        
        // Custom event
        const event = new CustomEvent('lazyload:tracked', {
            detail: { element, type, status, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Utility: Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
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
     * Load all images immediately
     */
    loadAllImages() {
        [...this.elements.lazyImages, ...this.elements.backgroundImages].forEach(element => {
            if (!this.state.loadedImages.has(element)) {
                this.loadImage(element);
            }
        });
    }
    
    /**
     * Refresh lazy loading
     */
    refresh() {
        this.cacheElements();
        this.preprocessImages();
        
        if (this.observer) {
            // Re-observe new elements
            [...this.elements.lazyImages, ...this.elements.backgroundImages].forEach(element => {
                if (!this.state.loadedImages.has(element)) {
                    this.observer.observe(element);
                }
            });
        }
    }
    
    /**
     * Get loading statistics
     */
    getStats() {
        return {
            total: this.elements.lazyImages.length + this.elements.backgroundImages.length,
            loaded: this.state.loadedImages.size,
            loading: this.state.loadingImages.size,
            failed: this.state.failedImages.size,
            pending: (this.elements.lazyImages.length + this.elements.backgroundImages.length) - 
                    this.state.loadedImages.size - this.state.failedImages.size
        };
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
        window.removeEventListener('scroll', this.fallbackToScrollListener);
        document.removeEventListener('visibilitychange', this.resumeLazyLoading);
        
        // Clean up elements
        [...this.elements.lazyImages, ...this.elements.backgroundImages].forEach(element => {
            element.classList.remove('lazy-loading', 'lazy-loaded', 'lazy-error', 'lazy-bg-loading');
        });
        
        // Clear state
        this.state.loadedImages.clear();
        this.state.loadingImages.clear();
        this.state.failedImages.clear();
        this.state.retryCount.clear();
        
        console.log('Image lazy loading destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageLazyLoading;
}

// Global namespace
window.ImageLazyLoading = ImageLazyLoading;