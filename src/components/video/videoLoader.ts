import { videoCacheManager } from './cacheManager';

export function initializeVideo(container: Element) {
  const videos = container.querySelectorAll('video');
  const videoArray = Array.from(videos);

  videoArray.forEach((video) => {
    setupVideoAttributes(video);
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
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
}

function setupSliderVideo(video: HTMLVideoElement) {
  handleVideoSources(video);
  video.load();
  video.play().catch(() => {
    video.muted = true;
    video.play();
  });
}

function setupStandardVideo(video: HTMLVideoElement) {
  video.preload = 'auto';
  handleVideoSources(video);
  video.load();
  setupVideoPlayback(video);
}

// New function to handle video sources with fallback
async function handleVideoSources(video: HTMLVideoElement) {
  const sources = video.querySelectorAll('source');
  sources.forEach(async (source) => {
    const originalSrc = source.getAttribute('src');
    if (!originalSrc) return;

    try {
      const cachedSrc = await videoCacheManager.getVideo(originalSrc);
      if (cachedSrc) {
        source.setAttribute('src', cachedSrc);
        video.load(); // Reload video with new source
      }
    } catch (error) {
      console.warn('Failed to get cached video, using original source', error);
    }
  });

  // Add load event listener to cache the video if it loads successfully
  video.addEventListener('loadeddata', () => {
    const source = video.querySelector('source');
    const originalSrc = source?.getAttribute('src');
    if (originalSrc && !originalSrc.startsWith('blob:')) {
      videoCacheManager.cacheSingleVideo(originalSrc);
    }
  });
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
