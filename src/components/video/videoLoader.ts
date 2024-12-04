import { videoCacheManager } from './cacheManager';

export function initializeVideo(container: Element) {
  const videos = container.querySelectorAll('video');
  const videoArray = Array.from(videos);

  videoArray.forEach(async (video) => {
    // Check if video is already set up
    if (video.dataset.initialized) {
      return;
    }

    setupVideoAttributes(video);

    // Handle sources
    const sources = video.querySelectorAll('source');
    for (const source of sources) {
      const originalSrc = source.getAttribute('src');
      if (!originalSrc) continue;

      const cachedSrc = await videoCacheManager.getVideo(originalSrc);
      if (cachedSrc) {
        source.setAttribute('src', cachedSrc);
      }
    }

    // Mark as initialized
    video.dataset.initialized = 'true';
    video.load();

    // Set up playback control
    if (video.closest('.slider1')) {
      setupSliderVideo(video);
    } else {
      setupStandardVideo(video);
    }
  });
}

function setupVideoAttributes(video: HTMLVideoElement) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  // Remove webkit-playsinline as it's not needed with standard playsinline
}

function setupSliderVideo(video: HTMLVideoElement) {
  video.play().catch(() => {
    video.muted = true;
    video.play();
  });
}

function setupStandardVideo(video: HTMLVideoElement) {
  setupVideoPlayback(video);
}

function setupVideoPlayback(video: HTMLVideoElement) {
  const parentDiv = video.parentElement;
  if (!parentDiv) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && video.paused) {
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
      } else if (!entry.isIntersecting && !video.paused) {
        video.pause();
      }
    });
  });

  observer.observe(parentDiv);
}
