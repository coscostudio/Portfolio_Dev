import Splide from '@splidejs/splide';
import { gsap } from 'gsap';

export function createAndAppendOverlay(projectSliderDiv: HTMLElement) {
  if (projectSliderDiv) {
    const overlayDiv = document.createElement('div');
    overlayDiv.id = 'splide-overlay';
    overlayDiv.style.position = 'absolute';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.backgroundColor = '#2b2b2b';
    overlayDiv.style.zIndex = '5000';

    projectSliderDiv.appendChild(overlayDiv);

    gsap.to(overlayDiv, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        overlayDiv.remove();
      },
    });
  }
}

export function destroySplide() {
  const splides = document.querySelectorAll('.splide');
  splides.forEach((slider) => {
    const splideInstance = (slider as any).splide;
    if (splideInstance) {
      splideInstance.destroy(true);
    }
  });
}

export function slider1() {
  const splides = document.querySelectorAll('.slider1');
  splides.forEach((slider) => {
    const splideInstance = new Splide(slider as Element, {
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
      },
    });

    splideInstance.mount(window.splide.Extensions);
  });
}
