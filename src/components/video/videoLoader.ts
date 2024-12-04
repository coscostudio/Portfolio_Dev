import { videoCacheManager } from './cacheManager';

interface VideoLoadOptions {
  quality: 'high' | 'low';
  priority: 'high' | 'low';
}

export function initializeVideo(container: Element) {
  const videos = container.querySelectorAll('video');
  const videoArray = Array.from(videos);

  videoArray.forEach(async (video, index) => {
    // Added async here
    const options = {
      quality: 'high',
      priority: index < 2 ? 'high' : 'low',
    };

    setupVideoAttributes(video);

    if (video.closest('.slider1')) {
      await setupSliderVideo(video); // Added async/await
    } else {
      await setupStandardVideo(video, options); // Added async/await
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

async function setupSliderVideo(video: HTMLVideoElement) {
  // Made async
  await updateVideoSources(video); // Added this function call
  video.load();
  video.play().catch(() => {
    video.muted = true;
    video.play();
  });
}

async function setupStandardVideo(video: HTMLVideoElement, options: VideoLoadOptions) {
  // Made async
  video.preload = 'auto';
  await updateVideoSources(video); // Added this function call
  video.load();
  setupVideoPlayback(video);
}

// New helper function
async function updateVideoSources(video: HTMLVideoElement) {
  const sources = video.querySelectorAll('source');
  for (const source of sources) {
    // Changed to for...of for async
    const originalSrc = source.getAttribute('src');
    if (!originalSrc) continue;

    try {
      const cachedSrc = await videoCacheManager.getVideo(originalSrc); // Now awaits the result
      if (cachedSrc) {
        source.setAttribute('src', cachedSrc);
      }
    } catch (error) {
      console.warn('Failed to get cached video', error);
    }
  }
}

function setupVideoPlayback(video: HTMLVideoElement) {
  const parentDiv = video.parentElement;
  if (!parentDiv) return;

  const observer = new IntersectionObserver(
    (entries) => {
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
    },
    { threshold: 0.1 }
  ); // Added lower threshold for better detection

  observer.observe(parentDiv);
}
