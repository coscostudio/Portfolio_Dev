import { animateBackgroundToActiveLink } from '../navigation/activeLinkBackground';
import { slider1 } from '../slider/sliderManager';
import { initializeOptimizedVideoLoading } from '../video/optimizedLoader';

const sharedProjectView = {
  beforeEnter({ next }: { next: { container: Element } }) {
    animateBackgroundToActiveLink();
    initializeOptimizedVideoLoading(next.container);
    slider1();
  },
};

export const barbaViews = [
  {
    namespace: 'info',
    beforeEnter({ next }: { next: { container: Element } }) {
      animateBackgroundToActiveLink();
    },
  },
  {
    namespace: 'archive',
    beforeEnter({ next }: { next: { container: Element } }) {
      animateBackgroundToActiveLink();
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
