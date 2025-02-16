import Splide from '@splidejs/splide';
import { gsap } from 'gsap';

export function slider1() {
  const splides = document.querySelectorAll('.slider1');
  if (!splides.length) return;

  splides.forEach((slider) => {
    const projectDiv = slider.closest('.project-div');
    if (projectDiv) {
      gsap.set(projectDiv, { opacity: 0 });
    }

    // Create placeholder overlay for each slide
    slider.querySelectorAll('.splide__slide').forEach((slide) => {
      const placeholder = document.createElement('div');
      placeholder.className = 'slide-placeholder';
      Object.assign(placeholder.style, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#7D7D7D',
        zIndex: 1,
      });
      slide.appendChild(placeholder);
    });

    // Show project div with placeholders
    if (projectDiv) {
      gsap.to(projectDiv, {
        opacity: 1,
        duration: 1,
        ease: 'expo.inOut',
      });
    }

    try {
      const instance = new Splide(slider as Element, {
        type: 'loop',
        autoWidth: true,
        drag: true,
        gap: '1rem',
        focus: 'left',
        arrows: false,
        pagination: false,
        dragMinThreshold: 10,
        flickMaxPages: 1,
        throttle: 100,
        speed: 400,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      });

      instance.on('mounted', () => {
        // Fade out placeholders after a short delay
        setTimeout(() => {
          const placeholders = slider.querySelectorAll('.slide-placeholder');
          gsap.to(placeholders, {
            opacity: 0,
            duration: 0.5,
            ease: 'expo.inOut',
            onComplete: () => {
              placeholders.forEach((p) => p.remove());
            },
          });
        }, 500);
      });

      instance.mount();
    } catch (error) {
      console.warn('Error initializing Splide:', error);
    }
  });
}

export function destroySplide() {
  const splides = document.querySelectorAll('.splide');
  splides.forEach((slider) => {
    try {
      const splideInstance = (slider as any).splide;
      if (splideInstance) {
        splideInstance.destroy(true); // true = completely remove
      }
    } catch (error) {
      console.warn('Error destroying Splide:', error);
    }
  });
}
