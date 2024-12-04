class VideoCacheManager {
  private static instance: VideoCacheManager;
  private videoCache: Map<string, string> = new Map();
  private isPreloading = false;
  private videoUrls = [
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/summit/js-1.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/summit/js-2.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/summit/js-4.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/summit/js-5.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/summit/js-6.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/summit/js-7.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_ss/optimized/ss-5.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_ss/optimized/ss-2.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_ss/optimized/ss-3.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_ss/optimized/ss-6.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_ss/optimized/ss-1.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_gilly/optimized/gilly-1.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_gilly/optimized/gilly-2.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_gilly/optimized/gilly-3.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_gilly/optimized/gilly-4.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_gilly/optimized/gilly-5.mp4',
    'https://coscoportfolio.s3.us-east-2.amazonaws.com/hauslabel_gilly/optimized/gilly-6.mp4',
  ];
  private loadedVideos = new Set<string>();

  private constructor() {
    // Initialize immediately but don't start loading
    this.initializeCache();
  }

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  private async initializeCache(): Promise<void> {
    // Check if browser supports the features we need
    const supportsCache = 'caches' in window;

    if (supportsCache) {
      try {
        const cache = await caches.open('video-cache');
        // Pre-warm the cache with HEAD requests
        this.videoUrls.forEach((url) => {
          cache.match(url).then((response) => {
            if (!response) {
              fetch(url, { method: 'HEAD' })
                .then((resp) => cache.put(url, resp))
                .catch(console.error);
            }
          });
        });
      } catch (error) {
        console.warn('Cache API failed, falling back to traditional loading', error);
      }
    }
  }

  async getVideo(url: string): Promise<string | undefined> {
    // First check our memory cache
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url);
    }

    // Then check browser's Cache API
    if ('caches' in window) {
      try {
        const cache = await caches.open('video-cache');
        const response = await cache.match(url);
        if (response) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          this.videoCache.set(url, objectUrl);
          return objectUrl;
        }
      } catch (error) {
        console.warn('Cache retrieval failed', error);
      }
    }

    // If not in cache, load it now
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      this.videoCache.set(url, objectUrl);
      return objectUrl;
    } catch (error) {
      console.error('Video fetch failed', error);
      return undefined;
    }
  }

  cleanup(): void {
    this.videoCache.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
    this.videoCache.clear();
    this.loadedVideos.clear();
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();
