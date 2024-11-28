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
    if (!data?.current?.container) return;

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

    return gsap.to(data.current.container, {
      x: direction,
      duration: 1.5,
      ease: 'expo.inOut',
    });
  },
  enter(data) {
    if (!data?.next?.container) return;

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

    gsap.set(data.next.container, { x: isFromLeft ? '-100%' : '100%' });
    data.next.container.style.visibility = 'visible';

    return gsap.to(data.next.container, {
      x: 0,
      duration: 1.5,
      ease: 'expo.inOut',
    });
  },
};

export const fadeTransition = {
  name: 'fade-transition',
  from: { namespace: ['projects', 'digital', 'graphic', 'direction', 'imaging'] },
  to: { namespace: ['projects', 'digital', 'graphic', 'direction', 'imaging'] },
  leave(data) {
    if (!data?.current?.container) return;

    const videos = data.current.container.querySelectorAll('video');
    videos?.forEach?.((video) => {
      video?.pause?.();
      video?.remove?.();
    });

    return gsap.to(data.current.container, {
      opacity: 0,
      duration: 0.6,
      ease: 'expo.inOut',
    });
  },
  enter(data) {
    if (!data?.next?.container) return;

    return gsap.from(data.next.container, {
      opacity: 0,
      duration: 0.6,
      ease: 'expo.inOut',
    });
  },
};
