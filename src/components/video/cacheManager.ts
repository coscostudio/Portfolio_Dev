class VideoCacheManager {
  private static instance: VideoCacheManager;
  private videoCache: Map<string, string> = new Map();
  private isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
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

  private constructor() {
    this.startPreloading();
  }

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  private async startPreloading() {
    if (this.isSafari) {
      // For Safari, use link preload
      this.videoUrls.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = url;
        document.head.appendChild(link);
      });
    } else {
      // For Chrome, fetch and cache
      const batchSize = 3;
      for (let i = 0; i < this.videoUrls.length; i += batchSize) {
        const batch = this.videoUrls.slice(i, i + batchSize);
        await Promise.all(batch.map((url) => this.getVideo(url)));
      }
    }
  }

  async getVideo(url: string): Promise<string | undefined> {
    // Skip caching entirely for Safari
    if (this.isSafari) {
      return url;
    }

    // Use existing caching system for Chrome
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url);
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      this.videoCache.set(url, objectUrl);
      return objectUrl;
    } catch (error) {
      console.warn(`Video fetch failed: ${url}`, error);
      return undefined;
    }
  }

  cleanup(): void {
    if (!this.isSafari) {
      this.videoCache.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
      this.videoCache.clear();
    }
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();
