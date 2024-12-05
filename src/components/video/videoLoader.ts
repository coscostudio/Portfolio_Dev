import { videoCacheManager } from './cacheManager';

export function initializeVideo(container: Element) {
  const videos = container.querySelectorAll('video');

  videos.forEach((video) => {
    if (video.dataset.initialized === 'true') return;

    // Setup basic attributes
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');

    // Handle sources
    const sources = video.querySelectorAll('source');
    sources.forEach(async (source) => {
      const originalSrc = source.getAttribute('src');
      if (!originalSrc) return;

      const cachedSrc = await videoCacheManager.getVideo(originalSrc);
      if (cachedSrc) {
        // Create a new source element to ensure headers are preserved
        const newSource = document.createElement('source');
        newSource.src = cachedSrc;
        newSource.type = 'video/mp4';

        // Replace old source with new one
        source.parentNode?.replaceChild(newSource, source);
      }
    });

    // Load the video after source updates
    video.load();
    video.dataset.initialized = 'true';
  });
}
