class VideoCacheManager {
  private static instance: VideoCacheManager;
  private videoCache: Map<string, string> = new Map();
  private videoElements: Map<string, HTMLVideoElement> = new Map();
  private loadingPromises: Map<string, Promise<string | undefined>> = new Map();
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
    // Create hidden video elements for Safari preloading
    if (this.isSafari()) {
      this.preloadWithVideoElements();
    } else {
      this.preloadWithFetch();
    }
  }

  private isSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  private async preloadWithVideoElements() {
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    this.videoUrls.forEach((url) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;

      const source = document.createElement('source');
      source.src = url;
      source.type = 'video/mp4';

      video.appendChild(source);
      container.appendChild(video);

      // Store reference to video element
      this.videoElements.set(url, video);

      // Load the video
      video.load();

      // Create a blob URL once loaded
      video.addEventListener('loadeddata', async () => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          this.videoCache.set(url, objectUrl);
        } catch (error) {
          console.warn(`Failed to cache video: ${url}`, error);
        }
      });
    });
  }

  private async preloadWithFetch() {
    const batchSize = 3;
    for (let i = 0; i < this.videoUrls.length; i += batchSize) {
      const batch = this.videoUrls.slice(i, i + batchSize);
      await Promise.all(batch.map((url) => this.loadVideo(url)));
    }
  }

  private async loadVideo(url: string): Promise<string | undefined> {
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url);
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    const loadingPromise = (async () => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        this.videoCache.set(url, objectUrl);
        return objectUrl;
      } catch (error) {
        console.warn(`Failed to load video: ${url}`, error);
        return undefined;
      } finally {
        this.loadingPromises.delete(url);
      }
    })();

    this.loadingPromises.set(url, loadingPromise);
    return loadingPromise;
  }

  async getVideo(url: string): Promise<string | undefined> {
    if (this.isSafari()) {
      // For Safari, wait until video is actually loaded
      const videoElement = this.videoElements.get(url);
      if (videoElement && videoElement.readyState >= 3) {
        return this.videoCache.get(url);
      }
      // If not loaded yet, fall back to regular loading
      return this.loadVideo(url);
    }
    return this.loadVideo(url);
  }

  cleanup(): void {
    this.videoCache.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });

    // Clean up video elements if on Safari
    if (this.isSafari()) {
      this.videoElements.forEach((video) => {
        video.remove();
      });
      this.videoElements.clear();
    }

    this.videoCache.clear();
    this.loadingPromises.clear();
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();
