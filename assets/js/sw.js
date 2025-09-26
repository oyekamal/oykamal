/**
 * Service Worker for Portfolio Website
 * 
 * Implements advanced caching strategies for optimal performance:
 * - Cache-first for static assets
 * - Network-first for dynamic content
 * - Stale-while-revalidate for JSON data
 * - Offline fallback pages
 * - Background sync for form submissions
 * 
 * @version 1.0.0
 * @author Portfolio Enhancement Team
 */

const CACHE_VERSION = 'v1.2.0';
const CACHE_PREFIX = 'portfolio-site';

// Cache names
const CACHES = {
    STATIC: `${CACHE_PREFIX}-static-${CACHE_VERSION}`,
    DYNAMIC: `${CACHE_PREFIX}-dynamic-${CACHE_VERSION}`,
    IMAGES: `${CACHE_PREFIX}-images-${CACHE_VERSION}`,
    FONTS: `${CACHE_PREFIX}-fonts-${CACHE_VERSION}`
};

// Static assets to precache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/css/bootstrap.min.css',
    '/assets/css/critical.min.css',
    '/assets/css/fonts-optimized.css',
    '/assets/js/main-optimized.js',
    '/assets/js/bootstrap.bundle.min.js',
    '/assets/js/aos.js',
    '/assets/js/modules/async-loader.js',
    '/assets/js/modules/font-loader.js',
    '/assets/js/modules/image-optimizer.js',
    '/assets/data/content/profile.json',
    '/assets/data/content/projects.json',
    '/assets/data/content/skills.json',
    '/assets/data/content/contact.json'
];

// Image assets for caching
const IMAGE_ASSETS = [
    '/assets/data/images/face.webp',
    '/assets/data/images/face@2x.webp'
];

// Font assets
const FONT_ASSETS = [
    'https://fonts.gstatic.com/s/baijamjuree/v7/LDIqapSCOBt_aeQQ7ftydoa0kePWkg.woff2',
    'https://fonts.gstatic.com/s/baijamjuree/v7/LDIrapSCOBt_aeQQ7ftydoa0egLKiREtBw.woff2'
];

// Network timeout for cache strategies
const NETWORK_TIMEOUT = 3000;

// Maximum cache sizes
const MAX_CACHE_ENTRIES = {
    DYNAMIC: 50,
    IMAGES: 30,
    FONTS: 10
};

/**
 * Install Event
 * Precache static assets and skip waiting
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHES.STATIC).then(cache => {
                console.log('[SW] Precaching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Cache images
            caches.open(CACHES.IMAGES).then(cache => {
                console.log('[SW] Precaching images');
                return cache.addAll(IMAGE_ASSETS);
            }),
            
            // Cache fonts
            caches.open(CACHES.FONTS).then(cache => {
                console.log('[SW] Precaching fonts');
                return cache.addAll(FONT_ASSETS);
            })
        ]).then(() => {
            console.log('[SW] Installation complete');
            return self.skipWaiting();
        })
    );
});

/**
 * Activate Event
 * Clean up old caches and claim clients
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith(CACHE_PREFIX) && 
                            !Object.values(CACHES).includes(cacheName)) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Claim all clients
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Activation complete');
        })
    );
});

/**
 * Fetch Event
 * Implement caching strategies based on request type
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests (except fonts and images)
    if (url.origin !== location.origin && 
        !url.hostname.includes('fonts.gstatic.com') &&
        !url.hostname.includes('fonts.googleapis.com')) {
        return;
    }
    
    // Route requests based on type
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isImage(request)) {
        event.respondWith(handleImage(request));
    } else if (isFont(request)) {
        event.respondWith(handleFont(request));
    } else if (isAPIRequest(request)) {
        event.respondWith(handleAPI(request));
    } else if (isHTMLRequest(request)) {
        event.respondWith(handleHTML(request));
    } else {
        event.respondWith(handleDefault(request));
    }
});

/**
 * Request Type Detection
 */
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.includes('/assets/') && 
           (url.pathname.endsWith('.css') || 
            url.pathname.endsWith('.js') || 
            url.pathname.endsWith('.json'));
}

function isImage(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(jpg|jpeg|png|webp|avif|svg|gif)$/i);
}

function isFont(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(woff|woff2|ttf|eot)$/i) ||
           url.hostname.includes('fonts.gstatic.com') ||
           url.hostname.includes('fonts.googleapis.com');
}

function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.includes('/api/') || 
           url.pathname.endsWith('.json');
}

function isHTMLRequest(request) {
    const acceptHeader = request.headers.get('Accept') || '';
    return acceptHeader.includes('text/html');
}

/**
 * Cache Strategies
 */

/**
 * Cache First Strategy - for static assets
 */
async function handleStaticAsset(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHES.STATIC);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Static asset fetch failed:', error);
        return createErrorResponse('Static asset unavailable');
    }
}

/**
 * Cache First with fallback - for images
 */
async function handleImage(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHES.IMAGES);
            cache.put(request, networkResponse.clone());
            
            // Limit cache size
            limitCacheSize(CACHES.IMAGES, MAX_CACHE_ENTRIES.IMAGES);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Image fetch failed:', error);
        return createPlaceholderImage();
    }
}

/**
 * Cache First - for fonts
 */
async function handleFont(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHES.FONTS);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Font fetch failed:', error);
        throw error; // Let browser handle font fallback
    }
}

/**
 * Stale While Revalidate - for API/JSON
 */
async function handleAPI(request) {
    const cache = await caches.open(CACHES.DYNAMIC);
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.error('[SW] API fetch failed:', error);
        throw error;
    });
    
    // Return cached response immediately, update in background
    if (cachedResponse) {
        fetchPromise.catch(() => {}); // Prevent unhandled rejection
        return cachedResponse;
    }
    
    // No cache, wait for network
    return fetchPromise;
}

/**
 * Network First with cache fallback - for HTML
 */
async function handleHTML(request) {
    try {
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
            )
        ]);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHES.DYNAMIC);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.warn('[SW] Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to offline page
        const offlineResponse = await caches.match('/index.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        return createOfflineResponse();
    }
}

/**
 * Default handler - basic caching
 */
async function handleDefault(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHES.DYNAMIC);
            cache.put(request, networkResponse.clone());
            
            // Limit cache size
            limitCacheSize(CACHES.DYNAMIC, MAX_CACHE_ENTRIES.DYNAMIC);
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Utility Functions
 */

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
        const keysToDelete = keys.slice(0, keys.length - maxEntries);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
}

/**
 * Create error response
 */
function createErrorResponse(message) {
    return new Response(
        JSON.stringify({ error: message }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

/**
 * Create placeholder image response
 */
function createPlaceholderImage() {
    // Simple 1x1 transparent PNG
    const imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const buffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
    
    return new Response(buffer, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'max-age=60'
        }
    });
}

/**
 * Create offline response
 */
function createOfflineResponse() {
    const offlineHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - Portfolio</title>
            <style>
                body {
                    font-family: system-ui, -apple-system, sans-serif;
                    text-align: center;
                    padding: 50px 20px;
                    background: #f8f9fa;
                }
                .offline-message {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                h1 { color: #495057; margin-bottom: 20px; }
                p { color: #6c757d; line-height: 1.6; }
                .retry-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="offline-message">
                <h1>You're Offline</h1>
                <p>This page isn't available offline. Please check your internet connection and try again.</p>
                <button class="retry-btn" onclick="location.reload()">Retry</button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(offlineHTML, {
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        }
    });
}

/**
 * Background Sync Event
 * Handle form submissions when back online
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'contact-form') {
        event.waitUntil(processContactForms());
    }
});

/**
 * Process queued contact forms
 */
async function processContactForms() {
    try {
        const db = await openDB();
        const transaction = db.transaction(['contact_forms'], 'readonly');
        const store = transaction.objectStore('contact_forms');
        const forms = await store.getAll();
        
        for (const form of forms) {
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form.data)
                });
                
                if (response.ok) {
                    // Remove from queue
                    const deleteTransaction = db.transaction(['contact_forms'], 'readwrite');
                    const deleteStore = deleteTransaction.objectStore('contact_forms');
                    await deleteStore.delete(form.id);
                }
            } catch (error) {
                console.error('[SW] Failed to send queued form:', error);
            }
        }
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

/**
 * Message Event
 * Handle messages from main thread
 */
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_INFO':
            getCacheInfo().then(info => {
                event.ports[0].postMessage(info);
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'QUEUE_CONTACT_FORM':
            queueContactForm(payload).then(() => {
                event.ports[0].postMessage({ queued: true });
            });
            break;
    }
});

/**
 * Get cache information
 */
async function getCacheInfo() {
    const cacheInfo = {};
    
    for (const [name, cacheName] of Object.entries(CACHES)) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[name] = {
            name: cacheName,
            size: keys.length,
            urls: keys.map(key => key.url)
        };
    }
    
    return cacheInfo;
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

/**
 * Queue contact form for background sync
 */
async function queueContactForm(formData) {
    try {
        const db = await openDB();
        const transaction = db.transaction(['contact_forms'], 'readwrite');
        const store = transaction.objectStore('contact_forms');
        
        await store.add({
            id: Date.now(),
            data: formData,
            timestamp: new Date().toISOString()
        });
        
        // Register background sync
        await self.registration.sync.register('contact-form');
    } catch (error) {
        console.error('[SW] Failed to queue contact form:', error);
    }
}

/**
 * Simple IndexedDB wrapper
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioSW', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('contact_forms')) {
                db.createObjectStore('contact_forms', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Push Event
 * Handle push notifications (future enhancement)
 */
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'New update available',
        icon: '/assets/data/images/face.webp',
        badge: '/assets/data/images/face.webp',
        data: data.url || '/',
        actions: [
            { action: 'open', title: 'Open Portfolio' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Portfolio Update', options)
    );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data || '/')
        );
    }
});

console.log('[SW] Service Worker loaded successfully');