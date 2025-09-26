/**
 * Image Optimization Utilities
 * 
 * Handles responsive image loading, WebP detection, and performance optimization
 * for the portfolio website.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class ImageOptimizer {
    constructor() {
        this.supportsWebP = false;
        this.supportsAVIF = false;
        this.loadedImages = new Set();
        this.imageCache = new Map();
        
        this.init();
    }

    /**
     * Initialize image optimization features
     */
    async init() {
        // Detect supported formats
        await this.detectSupportedFormats();
        
        // Setup lazy loading
        this.setupLazyLoading();
        
        // Setup responsive images
        this.setupResponsiveImages();
        
        // Preload critical images
        this.preloadCriticalImages();
        
        console.log('Image Optimizer initialized', {
            webP: this.supportsWebP,
            avif: this.supportsAVIF
        });
    }

    /**
     * Detect supported image formats
     */
    async detectSupportedFormats() {
        // WebP detection
        this.supportsWebP = await this.testImageSupport(
            'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
        );

        // AVIF detection
        this.supportsAVIF = await this.testImageSupport(
            'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
        );

        // Add classes to document element
        document.documentElement.classList.toggle('webp', this.supportsWebP);
        document.documentElement.classList.toggle('no-webp', !this.supportsWebP);
        document.documentElement.classList.toggle('avif', this.supportsAVIF);
        document.documentElement.classList.toggle('no-avif', !this.supportsAVIF);
    }

    /**
     * Test if an image format is supported
     */
    testImageSupport(dataURI) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = function() {
                resolve(img.height === 2);
            };
            img.src = dataURI;
        });
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without IntersectionObserver
            this.loadAllImages();
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all lazy images
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    /**
     * Load a specific image with optimization
     */
    async loadImage(img) {
        try {
            // Skip if already loaded
            if (this.loadedImages.has(img)) return;

            const originalSrc = img.dataset.src || img.src;
            const optimizedSrc = this.getOptimizedImageSrc(originalSrc, img);

            // Add loading class
            img.classList.add('loading');

            // Create new image for preloading
            const preloadImg = new Image();
            
            // Setup srcset if available
            if (img.dataset.srcset) {
                preloadImg.srcset = this.optimizeSrcSet(img.dataset.srcset);
            }

            // Load the image
            await new Promise((resolve, reject) => {
                preloadImg.onload = resolve;
                preloadImg.onerror = reject;
                preloadImg.src = optimizedSrc;
            });

            // Update the actual image
            img.src = optimizedSrc;
            if (img.dataset.srcset) {
                img.srcset = this.optimizeSrcSet(img.dataset.srcset);
            }

            // Mark as loaded
            img.classList.remove('loading');
            img.classList.add('loaded');
            this.loadedImages.add(img);

            // Cache the result
            this.imageCache.set(originalSrc, optimizedSrc);

            console.log(`Loaded optimized image: ${optimizedSrc}`);

        } catch (error) {
            console.warn(`Failed to load optimized image, falling back:`, error);
            
            // Fallback to original source
            img.src = img.dataset.src || img.src;
            img.classList.remove('loading');
            img.classList.add('loaded', 'fallback');
        }
    }

    /**
     * Get optimized image source based on supported formats
     */
    getOptimizedImageSrc(originalSrc, imgElement) {
        // Check cache first
        if (this.imageCache.has(originalSrc)) {
            return this.imageCache.get(originalSrc);
        }

        // Determine optimal format
        const basePath = this.getBasePath(originalSrc);
        const fileName = this.getFileName(originalSrc);

        // Check for WebP/AVIF versions in data directory
        if (this.supportsAVIF) {
            const avifSrc = `./assets/data/images/${fileName}.avif`;
            if (this.imageExists(avifSrc)) {
                return avifSrc;
            }
        }

        if (this.supportsWebP) {
            const webpSrc = `./assets/data/images/${fileName}.webp`;
            if (this.imageExists(webpSrc)) {
                return webpSrc;
            }
        }

        // Return original if no optimized version available
        return originalSrc;
    }

    /**
     * Optimize srcset attribute for responsive images
     */
    optimizeSrcSet(srcset) {
        return srcset.split(',').map(src => {
            const [url, density] = src.trim().split(' ');
            const optimizedUrl = this.getOptimizedImageSrc(url);
            return `${optimizedUrl} ${density || '1x'}`;
        }).join(', ');
    }

    /**
     * Setup responsive images with picture elements
     */
    setupResponsiveImages() {
        const pictures = document.querySelectorAll('picture');
        
        pictures.forEach(picture => {
            const img = picture.querySelector('img');
            if (!img) return;

            const sources = picture.querySelectorAll('source');
            
            sources.forEach(source => {
                if (source.type === 'image/webp' && !this.supportsWebP) {
                    source.remove();
                } else if (source.type === 'image/avif' && !this.supportsAVIF) {
                    source.remove();
                }
            });
        });
    }

    /**
     * Preload critical images
     */
    preloadCriticalImages() {
        const criticalImages = [
            './assets/data/images/face.webp',
            './assets/images/face.jpeg'  // fallback
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            
            // Add type hint for WebP
            if (src.endsWith('.webp')) {
                link.type = 'image/webp';
            }
            
            document.head.appendChild(link);
        });
    }

    /**
     * Load all images immediately (fallback for older browsers)
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
            img.classList.add('loaded');
        });
    }

    /**
     * Check if image exists (simplified check)
     */
    imageExists(url) {
        // In a real implementation, you might want to check if the file exists
        // For now, we assume WebP versions exist for certain patterns
        const knownOptimizedImages = [
            'face.webp',
            'lip-sync.webp',
            'instamunch.webp',
            'owlsense.webp',
            'paintings-gallery.webp',
            'project-4.webp'
        ];
        
        return knownOptimizedImages.some(name => url.includes(name));
    }

    /**
     * Get base path from URL
     */
    getBasePath(url) {
        return url.substring(0, url.lastIndexOf('/'));
    }

    /**
     * Get filename without extension
     */
    getFileName(url) {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        return fileName.substring(0, fileName.lastIndexOf('.'));
    }

    /**
     * Generate responsive image HTML
     */
    generateResponsiveImage(baseName, alt, options = {}) {
        const {
            sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
            loading = 'lazy',
            decoding = 'async',
            className = ''
        } = options;

        const webpSrc = `./assets/data/images/${baseName}.webp`;
        const webp2xSrc = `./assets/data/images/${baseName}@2x.webp`;
        const fallbackSrc = `./assets/images/${baseName}.jpg`;
        const fallback2xSrc = `./assets/images/${baseName}@2x.jpg`;

        return `
            <picture class="responsive-image ${className}">
                <source 
                    srcset="${webpSrc} 1x, ${webp2xSrc} 2x" 
                    type="image/webp"
                    sizes="${sizes}">
                <img 
                    src="${fallbackSrc}"
                    srcset="${fallbackSrc} 1x, ${fallback2xSrc} 2x"
                    alt="${alt}"
                    loading="${loading}"
                    decoding="${decoding}"
                    sizes="${sizes}">
            </picture>
        `;
    }

    /**
     * Get performance metrics for images
     */
    getPerformanceMetrics() {
        return {
            loadedImages: this.loadedImages.size,
            cachedImages: this.imageCache.size,
            supportsWebP: this.supportsWebP,
            supportsAVIF: this.supportsAVIF
        };
    }
}

// Initialize and export
const imageOptimizer = new ImageOptimizer();
export default imageOptimizer;