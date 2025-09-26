/**
 * Service Worker Registration Module
 * 
 * Handles Service Worker registration, updates, and management
 * Provides interface for caching operations and offline functionality
 * 
 * @version 1.0.0
 * @author Portfolio Enhancement Team
 */

class ServiceWorkerManager {
    constructor(options = {}) {
        this.options = {
            swPath: '/assets/js/sw.js',
            scope: '/',
            enableNotifications: false,
            enableBackgroundSync: true,
            updateCheckInterval: 60000, // 1 minute
            ...options
        };
        
        this.registration = null;
        this.isOnline = navigator.onLine;
        this.updateAvailable = false;
        this.queuedForms = [];
        
        this.init();
    }
    
    /**
     * Initialize Service Worker
     */
    async init() {
        // Check for Service Worker support
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported');
            return;
        }
        
        try {
            // Register Service Worker
            await this.register();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up periodic update checks
            this.setupUpdateChecker();
            
            // Handle offline/online events
            this.setupConnectionMonitoring();
            
            console.log('[SW Manager] Initialized successfully');
            
        } catch (error) {
            console.error('[SW Manager] Initialization failed:', error);
        }
    }
    
    /**
     * Register Service Worker
     */
    async register() {
        try {
            this.registration = await navigator.serviceWorker.register(
                this.options.swPath,
                { scope: this.options.scope }
            );
            
            console.log('[SW Manager] Registration successful:', this.registration.scope);
            
            // Handle different registration states
            if (this.registration.installing) {
                console.log('[SW Manager] Service Worker installing...');
                this.trackInstallProgress(this.registration.installing);
            } else if (this.registration.waiting) {
                console.log('[SW Manager] Service Worker waiting...');
                this.updateAvailable = true;
                this.notifyUpdateAvailable();
            } else if (this.registration.active) {
                console.log('[SW Manager] Service Worker active');
            }
            
            // Listen for updates
            this.registration.addEventListener('updatefound', () => {
                console.log('[SW Manager] Update found');
                this.trackInstallProgress(this.registration.installing);
            });
            
            return this.registration;
            
        } catch (error) {
            console.error('[SW Manager] Registration failed:', error);
            throw error;
        }
    }
    
    /**
     * Track Service Worker installation progress
     */
    trackInstallProgress(worker) {
        worker.addEventListener('statechange', () => {
            console.log('[SW Manager] State changed:', worker.state);
            
            if (worker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                    // New update available
                    this.updateAvailable = true;
                    this.notifyUpdateAvailable();
                } else {
                    // First install
                    console.log('[SW Manager] Service Worker installed for the first time');
                    this.notifyInstallComplete();
                }
            }
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for Service Worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleMessage(event);
        });
        
        // Listen for Service Worker controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[SW Manager] Controller changed');
            window.location.reload();
        });
    }
    
    /**
     * Handle messages from Service Worker
     */
    handleMessage(event) {
        const { type, payload } = event.data;
        
        switch (type) {
            case 'CACHE_UPDATED':
                console.log('[SW Manager] Cache updated:', payload);
                this.dispatchEvent('cacheUpdated', payload);
                break;
                
            case 'OFFLINE_READY':
                console.log('[SW Manager] Offline functionality ready');
                this.dispatchEvent('offlineReady');
                break;
                
            case 'FORM_QUEUED':
                console.log('[SW Manager] Form queued for background sync');
                this.dispatchEvent('formQueued', payload);
                break;
        }
    }
    
    /**
     * Set up periodic update checking
     */
    setupUpdateChecker() {
        if (this.options.updateCheckInterval > 0) {
            setInterval(async () => {
                if (this.registration) {
                    await this.registration.update();
                }
            }, this.options.updateCheckInterval);
        }
    }
    
    /**
     * Set up connection monitoring
     */
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            console.log('[SW Manager] Back online');
            this.isOnline = true;
            this.dispatchEvent('online');
            this.processQueuedForms();
        });
        
        window.addEventListener('offline', () => {
            console.log('[SW Manager] Gone offline');
            this.isOnline = false;
            this.dispatchEvent('offline');
        });
    }
    
    /**
     * Update Service Worker
     */
    async update() {
        if (!this.updateAvailable) {
            console.log('[SW Manager] No update available');
            return;
        }
        
        try {
            if (this.registration.waiting) {
                // Send message to Service Worker to skip waiting
                this.sendMessage({ type: 'SKIP_WAITING' });
            }
            
        } catch (error) {
            console.error('[SW Manager] Update failed:', error);
        }
    }
    
    /**
     * Send message to Service Worker
     */
    async sendMessage(message) {
        if (!this.registration || !this.registration.active) {
            console.warn('[SW Manager] No active Service Worker to message');
            return;
        }
        
        return new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();
            
            messageChannel.port1.onmessage = (event) => {
                if (event.data.error) {
                    reject(event.data.error);
                } else {
                    resolve(event.data);
                }
            };
            
            this.registration.active.postMessage(message, [messageChannel.port2]);
        });
    }
    
    /**
     * Get cache information
     */
    async getCacheInfo() {
        try {
            return await this.sendMessage({ type: 'GET_CACHE_INFO' });
        } catch (error) {
            console.error('[SW Manager] Failed to get cache info:', error);
            return null;
        }
    }
    
    /**
     * Clear all caches
     */
    async clearCache() {
        try {
            await this.sendMessage({ type: 'CLEAR_CACHE' });
            console.log('[SW Manager] Cache cleared');
            this.dispatchEvent('cacheCleared');
        } catch (error) {
            console.error('[SW Manager] Failed to clear cache:', error);
        }
    }
    
    /**
     * Queue contact form for background sync
     */
    async queueContactForm(formData) {
        try {
            await this.sendMessage({ 
                type: 'QUEUE_CONTACT_FORM', 
                payload: formData 
            });
            
            this.queuedForms.push({
                data: formData,
                timestamp: new Date().toISOString()
            });
            
            console.log('[SW Manager] Form queued for sync');
            this.dispatchEvent('formQueued', formData);
            
        } catch (error) {
            console.error('[SW Manager] Failed to queue form:', error);
        }
    }
    
    /**
     * Process queued forms when back online
     */
    async processQueuedForms() {
        if (this.queuedForms.length === 0) return;
        
        console.log('[SW Manager] Processing queued forms');
        
        // Forms are handled by Service Worker background sync
        // Just clear local queue
        this.queuedForms = [];
        this.dispatchEvent('formsProcessed');
    }
    
    /**
     * Request notification permission
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('[SW Manager] Notifications not supported');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    }
    
    /**
     * Subscribe to push notifications
     */
    async subscribeToPush() {
        if (!this.registration) {
            console.warn('[SW Manager] No registration available for push');
            return null;
        }
        
        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlB64ToUint8Array(PUBLIC_VAPID_KEY)
            });
            
            console.log('[SW Manager] Push subscription successful');
            return subscription;
            
        } catch (error) {
            console.error('[SW Manager] Push subscription failed:', error);
            return null;
        }
    }
    
    /**
     * Notify about available update
     */
    notifyUpdateAvailable() {
        this.dispatchEvent('updateAvailable');
        
        // Show user-friendly notification
        this.showUpdateNotification();
    }
    
    /**
     * Notify about installation complete
     */
    notifyInstallComplete() {
        this.dispatchEvent('installComplete');
    }
    
    /**
     * Show update notification
     */
    showUpdateNotification() {
        // Create update notification element
        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <div class="sw-notification-content">
                <span>A new version is available!</span>
                <button class="sw-update-btn">Update</button>
                <button class="sw-dismiss-btn">×</button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .sw-update-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007bff;
                color: white;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
            }
            .sw-notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .sw-update-btn, .sw-dismiss-btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            }
            .sw-update-btn:hover, .sw-dismiss-btn:hover {
                background: rgba(255,255,255,0.3);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Handle button clicks
        notification.querySelector('.sw-update-btn').addEventListener('click', () => {
            this.update();
            notification.remove();
        });
        
        notification.querySelector('.sw-dismiss-btn').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    /**
     * Dispatch custom events
     */
    dispatchEvent(type, detail = null) {
        const event = new CustomEvent(`sw:${type}`, { detail });
        window.dispatchEvent(event);
    }
    
    /**
     * Check if app is running standalone (PWA)
     */
    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }
    
    /**
     * Get Service Worker status
     */
    getStatus() {
        return {
            supported: 'serviceWorker' in navigator,
            registered: !!this.registration,
            active: !!(this.registration && this.registration.active),
            updateAvailable: this.updateAvailable,
            isOnline: this.isOnline,
            isStandalone: this.isStandalone(),
            queuedForms: this.queuedForms.length
        };
    }
    
    /**
     * Utility: Convert VAPID key
     */
    urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
    
    /**
     * Unregister Service Worker (for debugging)
     */
    async unregister() {
        if (this.registration) {
            const result = await this.registration.unregister();
            console.log('[SW Manager] Unregistered:', result);
            return result;
        }
        return false;
    }
}

// VAPID public key (would be provided by push service)
const PUBLIC_VAPID_KEY = 'YOUR_PUBLIC_VAPID_KEY_HERE';

// Initialize Service Worker Manager
let swManager = null;

const initializeServiceWorker = (options = {}) => {
    if (swManager) {
        console.warn('[SW Manager] Already initialized');
        return swManager;
    }
    
    swManager = new ServiceWorkerManager(options);
    
    // Make available globally for debugging
    if (typeof window !== 'undefined') {
        window.swManager = swManager;
    }
    
    return swManager;
};

// Auto-initialize if not in module environment
if (typeof module === 'undefined') {
    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initializeServiceWorker());
    } else {
        initializeServiceWorker();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ServiceWorkerManager, initializeServiceWorker };
}

// Export for ES6 modules
export { ServiceWorkerManager, initializeServiceWorker };