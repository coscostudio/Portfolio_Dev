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

  private constructor() {
    // Empty constructor
  }

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  async getVideo(url: string): Promise<string | undefined> {
    // Check if already cached
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url);
    }

    try {
      // Simple fetch with minimal options to match S3 CORS
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        console.warn(`Video fetch failed: ${url}`);
        return undefined;
      }

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
    this.videoCache.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
    this.videoCache.clear();
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();
