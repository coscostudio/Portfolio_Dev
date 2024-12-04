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
  private fallbackCache = new Map<string, Blob>();

  private constructor() {
    this.startPreloading();
  }

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  private async startPreloading(): Promise<void> {
    if (this.isPreloading) return;
    this.isPreloading = true;

    for (const url of this.videoUrls) {
      if (this.videoCache.has(url)) continue;

      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit', // Important for CORS
          headers: {
            Accept: 'video/mp4,video/*',
          },
        });

        if (!response.ok) {
          console.warn(`Preload failed for ${url}`, response.status);
          continue;
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        this.videoCache.set(url, objectUrl);
      } catch (error) {
        console.warn(`Preload failed for ${url}`, error);
      }
    }
  }

  // Fallback caching mechanism
  async cacheSingleVideo(url: string): Promise<string | undefined> {
    // First check if we already have it cached
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url);
    }

    // Check fallback cache
    if (this.fallbackCache.has(url)) {
      const blob = this.fallbackCache.get(url);
      const objectUrl = URL.createObjectURL(blob);
      this.videoCache.set(url, objectUrl);
      return objectUrl;
    }

    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Accept: 'video/mp4,video/*',
        },
      });

      if (!response.ok) {
        console.warn(`Cache failed for ${url}`, response.status);
        return undefined;
      }

      const blob = await response.blob();
      // Store in fallback cache
      this.fallbackCache.set(url, blob);
      const objectUrl = URL.createObjectURL(blob);
      this.videoCache.set(url, objectUrl);
      return objectUrl;
    } catch (error) {
      console.warn(`Cache failed for ${url}`, error);
      return undefined;
    }
  }

  async getVideo(url: string): Promise<string | undefined> {
    // Try preloaded cache first
    const cachedUrl = this.videoCache.get(url);
    if (cachedUrl) {
      return cachedUrl;
    }

    // If not in cache, try fallback caching
    return this.cacheSingleVideo(url);
  }

  cleanup(): void {
    this.videoCache.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
    this.videoCache.clear();
    this.fallbackCache.clear();
    this.isPreloading = false;
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();
