import { initializeHoverEffects } from '../interactions/hoverManager';
import { animateBackgroundToActiveLink } from '../navigation/activeLinkBackground';
import { destroySplide, slider1 } from '../slider/sliderManager';
import { initializeVideo } from '../video/videoLoader';

const sharedProjectView = {
  beforeEnter({ next }: { next: { container: Element } }) {
    animateBackgroundToActiveLink();
    initializeVideo(next.container);
    slider1();
  },
  beforeLeave() {
    destroySplide();
  },
};

const archiveLightboxModifier = () => {
  let timeout: NodeJS.Timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const close = document.querySelector('.w-lightbox-control.w-lightbox-close');
      if (close) {
        close.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.839 2.60298L15.56 1.88197L14.118 0.439941L13.397 1.16095L7.99997 6.55794L2.60298 1.16095L1.88197 0.439941L0.439941 1.88197L1.16095 2.60298L6.55794 7.99997L1.16095 13.397L0.439941 14.118L1.88197 15.56L2.60298 14.839L7.99997 9.442L13.397 14.839L14.118 15.56L15.56 14.118L14.839 13.397L9.442 7.99997L14.839 2.60298Z" />
                </svg>`;
      }
    }, 100);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
};

export const barbaViews = [
  {
    namespace: 'info',
    beforeEnter({ next }) {
      // Explicitly clear projects link state
      const projectsLink = document.querySelector('[data-page="projects"]');
      if (projectsLink) {
        projectsLink.classList.remove('w--current');
        projectsLink.style.color = 'var(--text-dark)';
      }
      animateBackgroundToActiveLink();
      initializeHoverEffects();
    },
  },
  {
    namespace: 'archive',
    beforeEnter({ next }) {
      // Explicitly clear projects link state
      const projectsLink = document.querySelector('[data-page="projects"]');
      if (projectsLink) {
        projectsLink.classList.remove('w--current');
        projectsLink.style.color = 'var(--text-dark)';
      }
      animateBackgroundToActiveLink();
      archiveLightboxModifier();
    },
  },
  {
    namespace: 'projects',
    ...sharedProjectView,
  },
  {
    namespace: 'digital',
    ...sharedProjectView,
  },
  {
    namespace: 'graphic',
    ...sharedProjectView,
  },
  {
    namespace: 'direction',
    ...sharedProjectView,
  },
  {
    namespace: 'imaging',
    ...sharedProjectView,
  },
];
