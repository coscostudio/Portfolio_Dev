class VideoCacheManager {
  private static instance: VideoCacheManager;
  private videoCache: Map<string, string> = new Map();
  private loadingPromises: Map<string, Promise<string | undefined>> = new Map();
  private blobCache: Map<string, Blob> = new Map(); // Added blob cache to prevent duplicate blobs
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
    this.preloadAllVideos();
    // Add unload cleanup
    window.addEventListener('pagehide', () => this.cleanup(), { capture: true });
  }

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  private async preloadAllVideos(): Promise<void> {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const batchSize = isSafari ? 2 : 3; // Smaller batch size for Safari

    for (let i = 0; i < this.videoUrls.length; i += batchSize) {
      const batch = this.videoUrls.slice(i, i + batchSize);
      await Promise.all(batch.map((url) => this.loadVideo(url)));
      // Small delay between batches on Safari
      if (isSafari) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  private async loadVideo(url: string): Promise<string | undefined> {
    // Check existing caches
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url);
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    const loadingPromise = (async () => {
      try {
        // Try to use existing blob first
        if (this.blobCache.has(url)) {
          const blob = this.blobCache.get(url);
          const objectUrl = URL.createObjectURL(blob);
          this.videoCache.set(url, objectUrl);
          return objectUrl;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'video/mp4,video/*',
            'Cache-Control': 'no-store',
            Pragma: 'no-cache',
          },
          cache: 'force-cache',
        });

        if (!response.ok) {
          console.warn(`Video fetch failed: ${url}`);
          return undefined;
        }

        const blob = await response.blob();
        this.blobCache.set(url, blob); // Cache the blob
        const objectUrl = URL.createObjectURL(blob);
        this.videoCache.set(url, objectUrl);
        return objectUrl;
      } catch (error) {
        console.warn(`Video fetch failed: ${url}`, error);
        return undefined;
      } finally {
        this.loadingPromises.delete(url);
      }
    })();

    this.loadingPromises.set(url, loadingPromise);
    return loadingPromise;
  }

  async getVideo(url: string): Promise<string | undefined> {
    return this.loadVideo(url);
  }

  cleanup(): void {
    this.videoCache.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
    this.videoCache.clear();
    this.blobCache.clear();
    this.loadingPromises.clear();
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();
