class VideoCacheManager {
  private static instance: VideoCacheManager;
  private videoCache: Map<string, ArrayBuffer> = new Map();
  private isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  private videoUrls = [
    /* your video URLs */
  ];

  private constructor() {
    if (this.isSafari) {
      this.preloadVideos();
    }
  }

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  private async preloadVideos() {
    for (const url of this.videoUrls) {
      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        this.videoCache.set(url, buffer);
      } catch (error) {
        console.warn(`Failed to preload video: ${url}`, error);
      }
    }
  }

  async getVideo(url: string): Promise<string | Response | undefined> {
    if (this.isSafari) {
      return this.handleSafariVideo(url);
    }

    // Chrome handling remains the same
    if (this.videoCache.has(url)) {
      const buffer = this.videoCache.get(url);
      const blob = new Blob([buffer!], { type: 'video/mp4' });
      return URL.createObjectURL(blob);
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn(`Video fetch failed: ${url}`, error);
      return undefined;
    }
  }

  private async handleSafariVideo(url: string): Promise<Response | undefined> {
    const buffer = await this.getCachedBuffer(url);
    if (!buffer) return undefined;

    // Handle Safari's range request
    const rangeHeader = new Headers().get('range');
    if (rangeHeader) {
      const bytes = /^bytes=(\d+)-(\d+)?$/g.exec(rangeHeader);
      if (bytes) {
        const start = Number(bytes[1]);
        const end = bytes[2] ? Number(bytes[2]) : buffer.byteLength - 1;

        return new Response(buffer.slice(start, end + 1), {
          status: 206,
          statusText: 'Partial Content',
          headers: {
            'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
            'Accept-Ranges': 'bytes',
            'Content-Type': 'video/mp4',
            'Content-Length': String(end - start + 1),
          },
        });
      }
    }

    // Return full response if no range request
    return new Response(buffer, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Type': 'video/mp4',
        'Content-Length': String(buffer.byteLength),
      },
    });
  }

  private async getCachedBuffer(url: string): Promise<ArrayBuffer | undefined> {
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url);
    }

    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      this.videoCache.set(url, buffer);
      return buffer;
    } catch (error) {
      console.warn(`Failed to fetch video: ${url}`, error);
      return undefined;
    }
  }

  cleanup(): void {
    this.videoCache.clear();
  }
}

export const videoCacheManager = VideoCacheManager.getInstance();
