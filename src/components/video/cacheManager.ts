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

    const currentNamespace = document
      .querySelector('[data-barba="container"]')
      ?.getAttribute('data-barba-namespace');
    const isProjectPage = ['projects', 'digital', 'graphic', 'direction', 'imaging'].includes(
      currentNamespace || ''
    );

    // If on project page, preload with high priority
    if (isProjectPage) {
      await this.preloadVideos(true);
    } else {
      // On other pages, preload after initial page load
      requestIdleCallback(() => {
        this.preloadVideos(false);
      });
    }
  }

  private async preloadVideos(highPriority: boolean): Promise<void> {
    for (const url of this.videoUrls) {
      if (this.videoCache.has(url)) continue;

      try {
        const response = await fetch(url, {
          priority: highPriority ? 'high' : 'low',
          mode: 'cors', // Add this line
          credentials: 'same-origin', // Add this line
          headers: {
            Accept: 'video/mp4',
          },
        });

        if (!response.ok) {
          console.warn(`Failed to load video: ${url} - Status: ${response.status}`);
          continue;
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        this.videoCache.set(url, objectUrl);
      } catch (error) {
        console.error(`Failed to preload video: ${url}`, error);
      }
    }
  }

  getVideo(url: string): string | undefined {
    return this.videoCache.get(url);
  }

  cleanup(): void {
    this.videoCache.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
    this.videoCache.clear();
    this.isPreloading = false;
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();

export function updateVideoSources(container: Element): void {
  const videos = container.querySelectorAll('video source');
  videos.forEach((source) => {
    const originalSrc = source.getAttribute('src');
    if (originalSrc) {
      const cachedSrc = videoCacheManager.getVideo(originalSrc);
      if (cachedSrc) {
        source.setAttribute('src', cachedSrc);
        (source.parentElement as HTMLVideoElement)?.load();
      }
    }
  });
}
