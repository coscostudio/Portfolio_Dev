class VideoCacheManager {
  private static instance: VideoCacheManager;
  private videoCache: Map<string, string> = new Map();
  private isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  private videoElements: Map<string, HTMLVideoElement> = new Map(); // For Safari only
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

  private constructor() {}

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  async getVideo(url: string): Promise<string | undefined> {
    // Check existing cache first
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url);
    }

    try {
      if (this.isSafari) {
        return this.getSafariVideo(url);
      }

      return this.getStandardVideo(url);
    } catch (error) {
      console.warn(`Video fetch failed: ${url}`, error);
      return undefined;
    }
  }

  private async getStandardVideo(url: string): Promise<string | undefined> {
    const response = await fetch(url, {
      headers: {
        Accept: 'video/mp4,video/*',
        'Cache-Control': 'max-age=31536000',
      },
    });

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    this.videoCache.set(url, objectUrl);
    return objectUrl;
  }

  private async getSafariVideo(url: string): Promise<string | undefined> {
    // Check for existing video element
    if (this.videoElements.has(url)) {
      return url; // Return original URL for Safari
    }

    // Create persistent video element
    const video = document.createElement('video');
    video.style.display = 'none';
    video.preload = 'auto';
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const source = document.createElement('source');
    source.src = url;
    source.type = 'video/mp4';

    video.appendChild(source);
    document.body.appendChild(video);

    // Store video element
    this.videoElements.set(url, video);

    // Return original URL for Safari
    return url;
  }

  cleanup(): void {
    if (this.isSafari) {
      this.videoElements.forEach((video) => {
        video.remove();
      });
      this.videoElements.clear();
    } else {
      this.videoCache.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
      this.videoCache.clear();
    }
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();
