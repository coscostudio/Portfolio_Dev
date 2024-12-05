import { videoCacheManager } from './cacheManager';

export function initializeVideo(container: Element) {
  const videos = container.querySelectorAll('video');

  videos.forEach((video) => {
    if (video.dataset.initialized === 'true') return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const sources = video.querySelectorAll('source');
    sources.forEach(async (source) => {
      const originalSrc = source.getAttribute('src');
      if (!originalSrc) return;

      const cachedSrc = await videoCacheManager.getVideo(originalSrc);
      if (cachedSrc) {
        source.setAttribute('src', cachedSrc);
        video.load();
      }
    });

    video.dataset.initialized = 'true';
  });
}
