import { isAboveMinViewport } from '../../utils/viewport';
import { videoCacheManager } from './cacheManager';

interface VideoLoadOptions {
  quality: 'high' | 'low';
  priority: 'high' | 'low';
}

export function initializeVideo(container: Element) {
  const videos = container.querySelectorAll('video');
  const videoArray = Array.from(videos);
  const isMobile = !isAboveMinViewport();

  videoArray.forEach((video, index) => {
    const options = {
      quality: isMobile ? 'low' : 'high',
      priority: isMobile ? (index < 1 ? 'high' : 'low') : index < 2 ? 'high' : 'low',
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

  // Add mobile-specific attributes
  if (!isAboveMinViewport()) {
    video.setAttribute('playsinline', ''); // Ensure inline playback on iOS
    video.setAttribute('webkit-playsinline', ''); // For older iOS versions
    video.preload = 'auto'; // Force preload on mobile
  }
}

function setupSliderVideo(video: HTMLVideoElement) {
  if (!isAboveMinViewport()) {
    // Mobile-specific slider video setup
    video.preload = 'auto';
  }

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

  // Enhance intersection observer options for mobile
  const observerOptions = {
    threshold: !isAboveMinViewport() ? 0.1 : 0.5, // Lower threshold for mobile
    rootMargin: !isAboveMinViewport() ? '50px' : '0px', // Larger margin on mobile
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
      } else {
        // Only pause if not mobile to prevent stuttering during scroll
        if (isAboveMinViewport()) {
          video.pause();
        }
      }
    });
  }, observerOptions);

  observer.observe(parentDiv);
}
