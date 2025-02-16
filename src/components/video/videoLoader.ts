import { videoCacheManager } from './cacheManager';

export function initializeVideo(container: Element) {
  const videos = container.querySelectorAll('video');
  videos.forEach((video) => {
    if (video.dataset.initialized === 'true') return;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.dataset.initialized = 'true';
  });
}
