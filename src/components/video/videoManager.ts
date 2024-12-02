// videoManager.ts
interface VideoState {
  observer: IntersectionObserver | null;
  playing: boolean;
}

const videoStates = new WeakMap<HTMLVideoElement, VideoState>();

export function createVideoManager(video: HTMLVideoElement) {
  if (videoStates.has(video)) return;

  const isSliderVideo = video.closest('.slider1') !== null;

  // For slider videos, we only observe initial visibility
  const state: VideoState = {
    observer: isSliderVideo
      ? null
      : new IntersectionObserver((entries) => {
          const entry = entries[0];
          entry.isIntersecting ? playVideo(video) : pauseVideo(video);
        }),
    playing: false,
  };

  videoStates.set(video, state);

  if (isSliderVideo) {
    // For slider videos, we only need to start them once
    const startupObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          playVideo(video);
          startupObserver.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (video.parentElement) {
      startupObserver.observe(video.parentElement);
    }
  } else if (state.observer && video.parentElement) {
    // Regular videos get full visibility tracking
    state.observer.observe(video.parentElement);
  }
}

export function playVideo(video: HTMLVideoElement) {
  const state = videoStates.get(video);
  if (!state || state.playing) return;

  video.play().catch(() => {
    video.muted = true;
    video.play().catch(console.warn);
  });
  state.playing = true;
}

export function pauseVideo(video: HTMLVideoElement) {
  const state = videoStates.get(video);
  const isSliderVideo = video.closest('.slider1') !== null;

  // Don't pause slider videos
  if (!state || !state.playing || isSliderVideo) return;

  video.pause();
  state.playing = false;
}

export function initializeVideoManagement(container: Element) {
  const videos = container.querySelectorAll('video');

  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    createVideoManager(video);
  });
}

export function cleanupVideoAttributes() {
  document.querySelectorAll('video').forEach((video) => {
    video.removeAttribute('autoplay');
  });
}
