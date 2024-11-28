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

function loadVideoOptimized(video: HTMLVideoElement, options: VideoLoadOptions) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = options.priority === 'high' ? 'auto' : 'metadata';

  const sources = video.querySelectorAll('source');
  sources.forEach((source) => {
    const originalSrc = source.getAttribute('src');
    if (!originalSrc) return;

    // Leave source as is, don't modify for quality
    source.dataset.loading = options.priority === 'high' ? 'eager' : 'lazy';
  });

  video.load();

  // Play video if parent is visible
  const parentDiv = video.parentElement;
  if (parentDiv && window.getComputedStyle(parentDiv).display !== 'none') {
    video.play().catch(() => {
      // Fallback for browsers that block autoplay
      video.muted = true;
      video.play();
    });
  }

  // Set up visibility observer
  setupVisibilityObserver(video);
}

function setupVisibilityObserver(video: HTMLVideoElement) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const parentDiv = video.parentElement;
        if (!parentDiv) return;

        const isVisible = window.getComputedStyle(parentDiv).display !== 'none';
        if (isVisible) {
          video.play().catch(() => {
            video.muted = true;
            video.play();
          });
        } else {
          video.pause();
        }
      }
    });
  });

  if (video.parentElement) {
    observer.observe(video.parentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }
}
