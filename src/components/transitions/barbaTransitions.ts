import { gsap } from 'gsap';

import { setTransitioning } from '../navigation/navClickHandler';

export const slideTransition = {
  name: 'slide-transition',
  sync: true,
  before(data) {
    setTransitioning(true);
    if (data?.next?.container) {
      gsap.set(data.next.container, { position: 'fixed', top: 0, left: 0, width: '100%' });
    }
  },
  leave(data) {
    if (!data?.current?.container) return;
    return gsap.to(data.current.container, {
      x: determineSlideDirection(data),
      duration: 1.5,
      ease: 'expo.inOut',
    });
  },
  enter(data) {
    if (!data?.next?.container) return;
    const isFromLeft = determineFromLeft(data);
    const nextContainer = data.next.container;

    gsap.set(nextContainer, { x: isFromLeft ? '-100%' : '100%' });
    nextContainer.style.visibility = 'visible';

    return gsap.to(nextContainer, {
      x: 0,
      duration: 1.5,
      ease: 'expo.inOut',
    });
  },
  after(data) {
    setTransitioning(false);
    if (data?.next?.container) {
      gsap.set(data.next.container, { clearProps: 'position,top,left,width' });
      window.scrollTo(0, 0);
    }
  },
};

export const fadeTransition = {
  name: 'fade-transition',
  from: { namespace: ['projects', 'digital', 'graphic', 'direction', 'imaging'] },
  to: { namespace: ['projects', 'digital', 'graphic', 'direction', 'imaging'] },
  leave(data) {
    if (!data?.current?.container) return;
    return gsap.to(data.current.container, {
      opacity: 0,
      duration: 0.75,
      ease: 'expo.inOut',
    });
  },
  enter(data) {
    if (!data?.next?.container) return;
    gsap.set(data.next.container, { opacity: 0 });
    return gsap.to(data.next.container, {
      opacity: 1,
      duration: 0.75,
      ease: 'expo.inOut',
    });
  },
};

function determineSlideDirection(data) {
  return (data.current.namespace === 'info' && isProjectOrArchive(data.next.namespace)) ||
    (isProject(data.current.namespace) && data.next.namespace === 'archive')
    ? '-100%'
    : '100%';
}

function determineFromLeft(data) {
  return (
    (data.current.namespace === 'archive' && isProjectOrInfo(data.next.namespace)) ||
    (isProject(data.current.namespace) && data.next.namespace === 'info')
  );
}

function isProject(namespace) {
  return ['projects', 'digital', 'graphic', 'direction', 'imaging'].includes(namespace);
}

function isProjectOrArchive(namespace) {
  return isProject(namespace) || namespace === 'archive';
}

function isProjectOrInfo(namespace) {
  return isProject(namespace) || namespace === 'info';
}
