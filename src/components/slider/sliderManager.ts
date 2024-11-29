import Splide from '@splidejs/splide';
import { gsap } from 'gsap';

export function slider1() {
  const splides = document.querySelectorAll('.slider1');

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

    const instance = new Splide(slider as Element, {
      type: 'loop',
      autoWidth: true,
      drag: 'free',
      gap: '1rem',
      focus: 'left',
      arrows: false,
      pagination: false,
      autoScroll: {
        autoStart: true,
        speed: 0.4,
        pauseOnHover: false,
        rewind: false,
      },
      dragMinThreshold: 10,
      flickMaxPages: 1,
      throttle: 100,
    });

    instance.on('mounted', () => {
      const videos = slider.querySelectorAll('video');
      const images = slider.querySelectorAll('img');

      videos.forEach((video) => {
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
      });

      const videoPromises = Array.from(videos).map((video) => {
        try {
          return video.play().catch(() => undefined);
        } catch {
          return Promise.resolve();
        }
      });

      const imagePromises = Array.from(images).map((img) =>
        img.complete ? Promise.resolve() : new Promise((resolve) => (img.onload = resolve))
      );

      Promise.allSettled([...videoPromises, ...imagePromises]).then(() => {
        // Fade out placeholders
        const placeholders = slider.querySelectorAll('.slide-placeholder');
        gsap.to(placeholders, {
          opacity: 0,
          duration: 0.5,
          ease: 'expo.inOut',
          onComplete: () => {
            placeholders.forEach((p) => p.remove());
          },
        });
      });
    });

    instance.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
  });
}
