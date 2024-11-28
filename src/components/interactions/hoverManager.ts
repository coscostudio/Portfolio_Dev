import { gsap } from 'gsap';

import { isAboveMinViewport } from '../../utils/viewport';

export function initializeHoverEffects() {
  if (!isAboveMinViewport()) return;

  const hoverPairs = [
    { trigger: '#creative-hover', target: '.creative-direction-hover' },
    { trigger: '#digital-hover', target: '.digital-hover' },
    { trigger: '#identity-hover', target: '.identity-hover' },
    { trigger: '#imaging-hover', target: '.imaging-hover' },
  ];

  hoverPairs.forEach(({ trigger, target }) => {
    const triggerElement = document.querySelector(trigger);
    const targetElement = document.querySelector(target) as HTMLElement;

    if (!triggerElement || !targetElement) return;

    const showTimeline = gsap
      .timeline({ paused: true })
      .set(targetElement, { display: 'flex' })
      .fromTo(targetElement, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'power2.out' });

    const hideTimeline = gsap.timeline({ paused: true }).to(targetElement, {
      opacity: 0,
      duration: 0.1,
      ease: 'power2.in',
      onComplete: () => gsap.set(targetElement, { display: 'none' }),
    });

    triggerElement.addEventListener('mouseenter', () => {
      hideTimeline.kill();
      showTimeline.restart();
    });

    triggerElement.addEventListener('mouseleave', () => {
      showTimeline.kill();
      hideTimeline.restart();
    });
  });
}
