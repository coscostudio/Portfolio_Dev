import { videoCacheManager } from './cacheManager';

export function initializeVideo(container: Element) {
  const videos = container.querySelectorAll('video');
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  videos.forEach(async (video) => {
    if (video.dataset.initialized === 'true') return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    if (isSafari) {
      video.crossOrigin = 'anonymous';
      video.preload = 'auto';
    }

    const sources = video.querySelectorAll('source');
    for (const source of sources) {
      const originalSrc = source.getAttribute('src');
      if (!originalSrc) continue;

      const cachedSrc = await videoCacheManager.getVideo(originalSrc);
      if (cachedSrc && !isSafari) {
        source.setAttribute('src', cachedSrc);
      }
    }

    if (!isSafari) {
      video.load();
    }

    video.dataset.initialized = 'true';
  });
}
