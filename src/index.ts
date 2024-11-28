import barba from '@barba/core';
import { restartWebflow } from '@finsweet/ts-utils';

import { initializeHoverEffects } from './components/interactions/hoverManager';
import {
  animateBackgroundToActiveLink,
  createActiveLinkBackground,
} from './components/navigation/activeLinkBackground';
import { setupNavClickPrevention } from './components/navigation/navClickHandler';
import { fadeTransition, slideTransition } from './components/transitions/barbaTransitions';
import { barbaViews } from './components/transitions/barbaViews';
import { initializeOptimizedVideoLoading } from './components/video/optimizedLoader';
import { handleVideoLoad } from './components/video/videoLoader';
import { batchGSAPAnimations, optimizeAnimatedElements } from './utils/animationOptimizer';
import { globalStyles } from './utils/styles';
import { isAboveMinViewport } from './utils/viewport';

// Apply global styles
const styles = document.createElement('style');
styles.textContent = globalStyles;
document.head.appendChild(styles);

// Initialize Barba
barba.init({
  debug: true,
  sync: true,
  preventRunning: true,
  transitions: [slideTransition, fadeTransition],
  views: barbaViews,
});

// Barba hooks
barba.hooks.enter(() => {
  window.scrollTo(0, 0);
  const preloader = document.querySelector('.preload-container');
  if (preloader) {
    preloader.style.display = 'none';
  }
});

barba.hooks.after(async ({ next }) => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  restartWebflow();

  await new Promise((resolve) => setTimeout(resolve, 100));
  animateBackgroundToActiveLink();
  initializeHoverEffects();
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  createActiveLinkBackground();
  animateBackgroundToActiveLink();
  setupNavClickPrevention();
  initializeOptimizedVideoLoading(document);
  initializeHoverEffects();
});

window.addEventListener('resize', () => {
  animateBackgroundToActiveLink();
  if (isAboveMinViewport()) {
    handleVideoLoad(document);
  }
});
