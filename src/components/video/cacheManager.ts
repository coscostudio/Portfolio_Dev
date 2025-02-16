class VideoCacheManager {
  private static instance: VideoCacheManager;

  private constructor() {}

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  // Simplified cleanup method
  cleanup(): void {}
}

export const videoCacheManager = VideoCacheManager.getInstance();