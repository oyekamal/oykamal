/**
 * ContentLoader Module
 * 
 * Handles loading JSON content from data files with caching, error handling,
 * and validation using the existing validator classes.
 * 
 * @author Muhammad Kamal
 * @version 1.0.0
 */

class ContentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.validators = {};
        this.baseDataPath = 'assets/data/';
        
        // Initialize validators if available
        this.initializeValidators();
    }
    
    /**
     * Initialize validator classes if they exist
     * @private
     */
    initializeValidators() {
        try {
            // Check if validators are available
            if (typeof ProfileValidator !== 'undefined') {
                this.validators.profile = new ProfileValidator();
            }
            if (typeof SkillsValidator !== 'undefined') {
                this.validators.skills = new SkillsValidator();
            }
            if (typeof ProjectValidator !== 'undefined') {
                this.validators.project = new ProjectValidator();
            }
            if (typeof ContactValidator !== 'undefined') {
                this.validators.contact = new ContactValidator();
            }
        } catch (error) {
            console.warn('ContentLoader: Validators not available, proceeding without validation:', error.message);
        }
    }
    
    /**
     * Load content from JSON file
     * @param {string} contentType - Type of content (profile, skills, projects, contact)
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Loaded and validated content
     */
    async loadContent(contentType, options = {}) {
        const {
            useCache = true,
            validate = true,
            fallback = null,
            timeout = 5000
        } = options;
        
        // Check cache first
        if (useCache && this.cache.has(contentType)) {
            return this.cache.get(contentType);
        }
        
        // Check if already loading
        if (this.loadingPromises.has(contentType)) {
            return this.loadingPromises.get(contentType);
        }
        
        // Create loading promise
        const loadingPromise = this.performLoad(contentType, { validate, fallback, timeout });
        this.loadingPromises.set(contentType, loadingPromise);
        
        try {
            const result = await loadingPromise;
            
            // Cache successful result
            if (useCache) {
                this.cache.set(contentType, result);
            }
            
            return result;
        } catch (error) {
            throw error;
        } finally {
            // Clean up loading promise
            this.loadingPromises.delete(contentType);
        }
    }
    
    /**
     * Perform the actual content loading
     * @private
     * @param {string} contentType - Type of content to load
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Loaded content
     */
    async performLoad(contentType, { validate, fallback, timeout }) {
        const fileName = `${contentType}.json`;
        const url = `${this.baseDataPath}${fileName}`;
        
        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Loading ${contentType} timed out after ${timeout}ms`)), timeout);
            });
            
            // Create fetch promise
            const fetchPromise = fetch(url).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            });
            
            // Race between fetch and timeout
            const data = await Promise.race([fetchPromise, timeoutPromise]);
            
            // Validate if requested and validator available
            if (validate && this.validators[contentType]) {
                const validationResult = this.validators[contentType].validate(data);
                
                if (!validationResult.isValid) {
                    console.warn(`ContentLoader: Validation warnings for ${contentType}:`, validationResult.warnings);
                    
                    if (validationResult.errors.length > 0) {
                        throw new Error(`Validation failed for ${contentType}: ${validationResult.errors.join(', ')}`);
                    }
                }
            }
            
            return {
                data,
                contentType,
                loadedAt: new Date().toISOString(),
                source: url,
                validated: validate && this.validators[contentType] ? true : false
            };
            
        } catch (error) {
            console.error(`ContentLoader: Failed to load ${contentType}:`, error);
            
            // Use fallback if provided
            if (fallback) {
                console.log(`ContentLoader: Using fallback data for ${contentType}`);
                return {
                    data: fallback,
                    contentType,
                    loadedAt: new Date().toISOString(),
                    source: 'fallback',
                    validated: false
                };
            }
            
            throw new Error(`Failed to load ${contentType}: ${error.message}`);
        }
    }
    
    /**
     * Load multiple content types in batch
     * @param {string[]} contentTypes - Array of content types to load
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Object with loaded content by type
     */
    async loadBatch(contentTypes, options = {}) {
        const { 
            failFast = false,
            returnPartial = true 
        } = options;
        
        const results = {};
        const errors = {};
        
        if (failFast) {
            // Load sequentially and fail on first error
            for (const contentType of contentTypes) {
                try {
                    results[contentType] = await this.loadContent(contentType, options);
                } catch (error) {
                    throw new Error(`Batch loading failed at ${contentType}: ${error.message}`);
                }
            }
        } else {
            // Load all in parallel
            const promises = contentTypes.map(async contentType => {
                try {
                    const result = await this.loadContent(contentType, options);
                    return { contentType, result, error: null };
                } catch (error) {
                    return { contentType, result: null, error };
                }
            });
            
            const outcomes = await Promise.all(promises);
            
            outcomes.forEach(({ contentType, result, error }) => {
                if (result) {
                    results[contentType] = result;
                } else {
                    errors[contentType] = error;
                }
            });
            
            // If no results and not allowing partial, throw
            if (Object.keys(results).length === 0 && !returnPartial) {
                throw new Error(`All batch loading failed: ${Object.values(errors).map(e => e.message).join(', ')}`);
            }
        }
        
        return {
            results,
            errors: Object.keys(errors).length > 0 ? errors : null,
            loadedCount: Object.keys(results).length,
            errorCount: Object.keys(errors).length
        };
    }
    
    /**
     * Preload all standard content types
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Preloaded content
     */
    async preloadAll(options = {}) {
        const standardTypes = ['profile', 'skills', 'projects', 'contact'];
        return this.loadBatch(standardTypes, options);
    }
    
    /**
     * Clear cache for specific content type or all
     * @param {string} contentType - Content type to clear, or null for all
     */
    clearCache(contentType = null) {
        if (contentType) {
            this.cache.delete(contentType);
        } else {
            this.cache.clear();
        }
    }
    
    /**
     * Get cache status
     * @returns {Object} Cache information
     */
    getCacheStatus() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            loadingPromises: Array.from(this.loadingPromises.keys())
        };
    }
    
    /**
     * Reload content (bypass cache)
     * @param {string} contentType - Content type to reload
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Reloaded content
     */
    async reloadContent(contentType, options = {}) {
        this.clearCache(contentType);
        return this.loadContent(contentType, { ...options, useCache: false });
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoader;
} else if (typeof window !== 'undefined') {
    window.ContentLoader = ContentLoader;
}