import { gsap } from 'gsap';

import { setTransitioning } from '../navigation/navClickHandler';

export const slideTransition = {
  name: 'slide-transition',
  sync: true,
  before() {
    setTransitioning(true);
  },
  after() {
    setTransitioning(false);
  },
  leave(data) {
    const direction =
      (data.current.namespace === 'info' &&
        (data.next.namespace === 'projects' ||
          data.next.namespace === 'digital' ||
          data.next.namespace === 'graphic' ||
          data.next.namespace === 'direction' ||
          data.next.namespace === 'imaging' ||
          data.next.namespace === 'archive')) ||
      ((data.current.namespace === 'projects' ||
        data.current.namespace === 'digital' ||
        data.current.namespace === 'graphic' ||
        data.current.namespace === 'direction' ||
        data.current.namespace === 'imaging') &&
        data.next.namespace === 'archive')
        ? '-100%'
        : '100%';

    const mainWrapper = data.current.container.querySelector('.main_wrapper');
    const { container } = data.current;

    // Set initial position for stacking prevention
    gsap.set(container, { zIndex: 1 });

    return gsap.to([container, mainWrapper], {
      x: direction,
      duration: 1.5,
      ease: 'expo.inOut',
    });
  },
  enter(data) {
    const isFromLeft =
      (data.current.namespace === 'archive' &&
        (data.next.namespace === 'projects' ||
          data.next.namespace === 'digital' ||
          data.next.namespace === 'graphic' ||
          data.next.namespace === 'direction' ||
          data.next.namespace === 'imaging' ||
          data.next.namespace === 'info')) ||
      ((data.current.namespace === 'projects' ||
        data.current.namespace === 'digital' ||
        data.current.namespace === 'graphic' ||
        data.current.namespace === 'direction' ||
        data.current.namespace === 'imaging') &&
        data.next.namespace === 'info');

    const mainWrapper = data.next.container.querySelector('.main_wrapper');
    const { container } = data.next;

    gsap.set(container, {
      zIndex: 2,
      x: isFromLeft ? '-100%' : '100%',
    });
    data.next.container.style.visibility = 'visible';

    return gsap.to([container, mainWrapper], {
      x: 0,
      duration: 1.5,
      ease: 'expo.inOut',
    });
  },
};

// Fade transition remains unchanged
export const fadeTransition = {
  name: 'fade-transition',
  from: { namespace: ['projects', 'digital', 'graphic', 'direction', 'imaging'] },
  to: { namespace: ['projects', 'digital', 'graphic', 'direction', 'imaging'] },
  leave(data) {
    const videos = data.current.container.querySelectorAll('video');
    videos.forEach((video) => {
      video.pause();
      video.remove();
    });
    return gsap.to(data.current.container, {
      opacity: 0,
      duration: 0.6,
      ease: 'expo.inOut',
    });
  },
  enter(data) {
    return gsap.from(data.next.container, {
      opacity: 0,
      duration: 0.6,
      ease: 'expo.inOut',
    });
  },
};
