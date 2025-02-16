import '@splidejs/splide/css';

import barba from '@barba/core';
import { restartWebflow } from '@finsweet/ts-utils';

import { initializeHoverEffects } from './components/interactions/hoverManager';
import {
  animateBackgroundToActiveLink,
  createActiveLinkBackground,
} from './components/navigation/activeLinkBackground';
import { setupNavClickPrevention } from './components/navigation/navClickHandler';
import {
  handleInitialNavigation,
  handleProjectsNavigation,
} from './components/navigation/navigationManager';
import { fadeTransition, slideTransition } from './components/transitions/barbaTransitions';
import { barbaViews } from './components/transitions/barbaViews';
import { videoCacheManager } from './components/video/cacheManager';
import { initializeVideo } from './components/video/videoLoader';
import { batchGSAPAnimations, optimizeAnimatedElements } from './utils/animationOptimizer';
import { globalStyles } from './utils/styles';
import { isAboveMinViewport } from './utils/viewport';

// Apply global styles
const styles = document.createElement('style');
styles.textContent = globalStyles;
document.head.appendChild(styles);

window.splide = {
  Extensions: {
    AutoScroll: (window as any).splide?.Extensions?.AutoScroll,
  },
};

// Initialize Barba
barba.init({
  debug: true,
  sync: true,
  preventRunning: true,
  transitions: [slideTransition, fadeTransition],
  views: barbaViews,
  prefetch: false,
});

// Barba hooks
barba.hooks.before(() => {
  const currentScroll = window.scrollY;

  barba.hooks.afterLeave(() => {
    window.scrollTo(0, 0);
  });

  return () => barba.hooks.afterLeave(() => {});
});

barba.hooks.leave((data) => {
  // Check if we're leaving a project-related namespace to a non-project one
  const projectNamespaces = ['projects', 'digital', 'graphic', 'direction', 'imaging'];
  const isLeavingProject = projectNamespaces.includes(data.current.namespace);
  const isEnteringNonProject = !projectNamespaces.includes(data.next.namespace);

  if (isLeavingProject && isEnteringNonProject) {
    animateBackgroundToActiveLink(data.next.container);
  }
});

barba.hooks.enter((data) => {
  const preloader = document.querySelector('.preload-container');
  if (preloader) {
    preloader.style.display = 'none';
  }
  handleProjectsNavigation(data);
});

barba.hooks.after(async ({ next }) => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  try {
    if (next?.container) {
      restartWebflow();
      await new Promise((resolve) => setTimeout(resolve, 100));
      animateBackgroundToActiveLink(next.container);
    }
  } catch (error) {
    console.warn('Error in barba after hook:', error);
  }
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  createActiveLinkBackground();
  animateBackgroundToActiveLink();
  setupNavClickPrevention();
  initializeVideo(document);
  initializeHoverEffects();
  handleInitialNavigation();
});

window.addEventListener('resize', () => {
  animateBackgroundToActiveLink();
  if (isAboveMinViewport()) {
    initializeVideo(document);
  }
});

window.addEventListener('unload', () => {
  videoCacheManager.cleanup();
});
