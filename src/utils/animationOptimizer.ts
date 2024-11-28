import { gsap } from 'gsap';

export function optimizeAnimatedElements() {
  // Add will-change to elements that animate frequently
  const animatedElements = [
    '.active-link-background',
    '.barba-container',
    '.project-slider-video',
    '.splide__track',
  ];

  animatedElements.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      (el as HTMLElement).style.willChange = 'transform, opacity';
      (el as HTMLElement).style.transform = 'translateZ(0)';
    });
  });
}

export function batchGSAPAnimations(animations: gsap.TweenVars[]) {
  return gsap.to(
    {},
    {
      duration: 0,
      onStart: () => {
        animations.forEach((animation) => {
          gsap.set(animation.targets, { force3D: true });
        });
      },
    }
  );
}
