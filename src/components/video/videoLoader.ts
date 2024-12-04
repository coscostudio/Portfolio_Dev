import { isAboveMinViewport } from '../../utils/viewport';
import { videoCacheManager } from './cacheManager';

interface VideoLoadOptions {
  quality: 'high' | 'low';
  priority: 'high' | 'low';
}

export function initializeVideo(container: Element) {
  if (!isAboveMinViewport()) return;

  const videos = container.querySelectorAll('video');
  const videoArray = Array.from(videos);

  videoArray.forEach((video, index) => {
    const options = {
      quality: window.innerWidth > 1024 ? 'high' : 'low',
      priority: index < 2 ? 'high' : 'low',
    };

    setupVideoAttributes(video);

    if (video.closest('.slider1')) {
      setupSliderVideo(video);
    } else {
      setupStandardVideo(video, options);
    }
  });
}

function setupVideoAttributes(video: HTMLVideoElement) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
}

function setupSliderVideo(video: HTMLVideoElement) {
  video.load();
  video.play().catch(() => {
    video.muted = true;
    video.play();
  });
}

function setupStandardVideo(video: HTMLVideoElement, options: VideoLoadOptions) {
  video.preload = options.priority === 'high' ? 'auto' : 'metadata';

  const sources = video.querySelectorAll('source');
  sources.forEach((source) => {
    const originalSrc = source.getAttribute('src');
    if (!originalSrc) return;

    const cachedSrc = videoCacheManager.getVideo(originalSrc);
    if (cachedSrc) {
      source.setAttribute('src', cachedSrc);
    }
    source.dataset.loading = options.priority === 'high' ? 'eager' : 'lazy';
  });

  video.load();
  setupVideoPlayback(video);
}

function setupVideoPlayback(video: HTMLVideoElement) {
  const parentDiv = video.parentElement;
  if (!parentDiv) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
      } else {
        video.pause();
      }
    });
  });

  observer.observe(parentDiv);
}
