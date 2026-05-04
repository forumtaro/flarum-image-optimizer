export default class ImageOptimizer {
    constructor() {
        this.config = {
            serviceUrl: 'https://images.weserv.nl/',
            
            avatarSizes: {
                'DiscussionListItem': { w: 50, h: 50 },
                'PostUser': { w: 128, h: 128 }
            },
            
            defaultAvatarSize: { w: 50, h: 50 },
            thumbnailSize: { w: 50, h: 50 },
            
            quality: {
                avatar: 75,
                postImageAsAvatar: 70,
                post: 80,
                thumbnail: 75
            }
        };
        
        this.observer = null;
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.startObserving();
        });
    }
    
    getAvatarSize(img) {
        const parent = img.closest('.Avatar')?.parentElement;
        if (!parent) return this.config.defaultAvatarSize;
        
        for (const [className, size] of Object.entries(this.config.avatarSizes)) {
            if (parent.closest('.' + className)) return size;
        }
        return this.config.defaultAvatarSize;
    }
    
    buildUrl(originalUrl, img) {
        if (!originalUrl || originalUrl.includes('data:')) return originalUrl;
        
        const params = new URLSearchParams();
        params.append('url', originalUrl);
        params.append('output', 'webp');
        params.append('we', '');
        params.append('il', '');
        
        const isAvatar = img.closest('.Avatar');
        const isThumbnail = img.closest('.DiscussionListItem') && !isAvatar;
        
        if (isAvatar) {
            const size = this.getAvatarSize(img);
            params.append('w', size.w);
            params.append('h', size.h);
            params.append('fit', 'cover');
            
            const src = img.src || img.dataset.src || '';
            params.append('q', src.includes('/files/') ? this.config.quality.postImageAsAvatar : this.config.quality.avatar);
        } 
        else if (isThumbnail) {
            params.append('w', this.config.thumbnailSize.w);
            params.append('h', this.config.thumbnailSize.h);
            params.append('fit', 'cover');
            params.append('q', this.config.quality.thumbnail);
        } 
        else {
            params.append('q', this.config.quality.post);
        }
        
        return this.config.serviceUrl + '?' + params.toString();
    }
    
    processImage(img) {
        if (img.hasAttribute('data-opt')) return;
        
        const originalSrc = img.src || img.dataset.src;
        if (!originalSrc || originalSrc.includes(this.config.serviceUrl)) return;
        
        img.setAttribute('data-opt', 'true');
        
        const newUrl = this.buildUrl(originalSrc, img);
        
        img.onerror = function() {
            img.src = originalSrc;
        };
        
        const setSrc = () => {
            img.src = newUrl;
            if (!img.loading) img.loading = 'lazy';
        };
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback(setSrc);
        } else {
            setTimeout(setSrc, 0);
        }
    }
    
    observeImages() {
        const images = document.querySelectorAll('img:not([data-opt])');
        
        images.forEach(img => {
            if (this.observer) {
                this.observer.observe(img);
            }
        });
    }
    
    startObserving() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.processImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '200px' });
        } else {
            this.observer = {
                observe: (img) => this.processImage(img),
                unobserve: () => {}
            };
        }
        
        this.observeImages();
        
        let timeout;
        this.mutationObserver = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.observeImages(), 500);
        });
        
        this.mutationObserver.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }
}

// Запускаємо при ініціалізації Flarum
if (typeof flarum !== 'undefined') {
    flarum.initializers.add('foumtaro-image-optimizer', () => {
        new ImageOptimizer();
    });
}
