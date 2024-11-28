import { isAboveMinViewport } from '../../utils/viewport';

interface VideoLoadOptions {
  quality: 'high' | 'low';
  priority: 'high' | 'low';
}

export function initializeOptimizedVideoLoading(container: Element) {
  if (!isAboveMinViewport()) return;

  const videos = container.querySelectorAll('video');
  const videoArray = Array.from(videos);

  videoArray.forEach((video, index) => {
    const options: VideoLoadOptions = {
      quality: window.innerWidth > 1024 ? 'high' : 'low',
      priority: index < 2 ? 'high' : 'low',
    };
    loadVideoOptimized(video, options);
  });
}

export function loadVideoOptimized(video: HTMLVideoElement, options: VideoLoadOptions) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = options.priority === 'high' ? 'auto' : 'metadata';

  const sources = video.querySelectorAll('source');
  sources.forEach((source) => {
    const originalSrc = source.getAttribute('src');
    if (!originalSrc) return;
    source.dataset.loading = options.priority === 'high' ? 'eager' : 'lazy';
  });

  video.load();

  const parentDiv = video.parentElement;
  if (parentDiv && window.getComputedStyle(parentDiv).display !== 'none') {
    video.play().catch(() => {
      video.muted = true;
      video.play();
    });
  }

  setupVisibilityObserver(video);
}

function setupVisibilityObserver(video: HTMLVideoElement) {
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

  if (video.parentElement) {
    observer.observe(video.parentElement);
  }
}
