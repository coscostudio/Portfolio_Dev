import { isAboveMinViewport } from '../../utils/viewport';

export function handleVideoLoad(container: Element) {
  if (!isAboveMinViewport()) return;

  const videos = container.querySelectorAll('video');
  videos.forEach((video) => {
    // Remove autoplay attribute but keep other attributes
    video.removeAttribute('autoplay');

    // Force preload
    video.preload = 'auto';
    video.load();

    // Set up mutation observer to watch for display changes on parent
    const parentDiv = video.parentElement;
    if (parentDiv) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            // Check if parent is now visible
            const isVisible = window.getComputedStyle(parentDiv).display !== 'none';
            if (isVisible && !video.playing) {
              video.play();
            } else if (!isVisible && video.playing) {
              video.pause();
            }
          }
        });
      });

      observer.observe(parentDiv, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }
  });
}
