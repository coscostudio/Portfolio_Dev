import barba from '@barba/core';
import { restartWebflow } from '@finsweet/ts-utils';
import { SLIDE } from '@splidejs/splide';
import { gsap } from 'gsap';

/// ----- Global Variables ----- //
let activeLinkBackground = null;
let observer; // MutationObserver to track style changes

// Function to Create and Style the Active Button Background Element
function createActiveLinkBackground() {
  // Check if background already exists
  if (activeLinkBackground) {
    return activeLinkBackground;
  }

  activeLinkBackground = document.createElement('div');
  activeLinkBackground.classList.add('active-link-background', 'active-link-overlay');

  // Set inline styles
  Object.assign(activeLinkBackground.style, {
    position: 'absolute',
    top: '4px',
    height: '30px',
    borderRadius: '14px',
    zIndex: '1',
    pointerEvents: 'none',
  });

  // Append to the navbar container
  const navbarContainer = document.querySelector('.navbar-container');
  if (navbarContainer && !navbarContainer.querySelector('.active-link-background')) {
    navbarContainer.appendChild(activeLinkBackground);
    startObservingLinkStyles();
  }

  return activeLinkBackground;
}

function animateBackgroundToActiveLink() {
  // Ensure background exists
  const background = createActiveLinkBackground();
  if (!background) return;

  const infoLink = document.querySelector('[data-page="info"]');
  const projectsLink = document.querySelector('[data-page="projects"]');
  const archiveLink = document.querySelector('[data-page="archive"]');

  // Get the current active link before updating
  const oldActiveLink = document.querySelector('.nav-button.w--current');

  // Determine active link based on current path
  let activeLink;
  if (window.location.pathname.startsWith('/projects')) {
    activeLink = projectsLink;
  } else if (window.location.pathname === '/info' || window.location.pathname === '/') {
    activeLink = infoLink;
  } else if (window.location.pathname === '/archive') {
    activeLink = archiveLink;
  } else {
    activeLink = document.querySelector('.nav-button.w--current');
  }

  // Exit if no active link found
  if (!activeLink) return;

  const activeLinkRect = activeLink.getBoundingClientRect();
  const navbarContainerRect = document.querySelector('.navbar-container').getBoundingClientRect();

  // Calculate animation properties
  const targetX = activeLinkRect.left - navbarContainerRect.left;
  const targetWidth = activeLinkRect.width;

  // Animate the background
  gsap.to(background, {
    left: targetX,
    width: targetWidth,
    duration: 1.5,
    ease: 'expo.inOut',
  });

  // Handle text colors
  if (oldActiveLink) oldActiveLink.style.color = 'var(--text-dark)';
  activeLink.style.color = 'var(--text-active-inverse)';
}

// ----- Function to Start Observing Link Styles ----- //
function startObservingLinkStyles() {
  const navLinks = document.querySelectorAll('.nav-button');

  const config = { attributes: true, attributeFilter: ['class'] };

  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        animateBackgroundToActiveLink(document);
      }
    }
  };

  observer = new MutationObserver(callback);

  navLinks.forEach((link) => {
    observer.observe(link, config);
  });
}

// Global slider-related functions (project pages)
function createAndAppendOverlay(projectSliderDiv) {
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

function destroySplide() {
  const splides = document.querySelectorAll('.splide');
  splides.forEach((slider) => {
    const splideInstance = slider.splide; // Access the existing Splide instance
    if (splideInstance) {
      splideInstance.destroy(); // Destroy the Splide instance to free up resources
    }
  });
}

function slider1() {
  const splides = document.querySelectorAll('.slider1');
  splides.forEach((slider) => {
    const splideInstance = new Splide(slider, {
      type: 'loop',
      autoWidth: true,
      drag: 'free',
      gap: '1rem',
      focus: 'left',
      arrows: false,
      pagination: false,
      autoScroll: {
        autoStart: true,
        speed: 0.1,
        pauseOnHover: false,
      },
    });

    splideInstance.mount(window.splide.Extensions);
  });
}

// ----- Barba Initialization ----- //
barba.init({
  debug: true,
  sync: true,
  transitions: [
    {
      name: 'slide-transition',
      sync: true,
      leave(data) {
        const direction =
          // Info to Projects/Digital/Graphic/Direction/Imaging or Info to Archive
          (data.current.namespace === 'info' &&
            (data.next.namespace === 'projects' ||
              data.next.namespace === 'digital' ||
              data.next.namespace === 'graphic' ||
              data.next.namespace === 'direction' ||
              data.next.namespace === 'imaging' ||
              data.next.namespace === 'archive')) ||
          // Projects/Digital/Graphic/Direction/Imaging to Archive
          ((data.current.namespace === 'projects' ||
            data.current.namespace === 'digital' ||
            data.current.namespace === 'graphic' ||
            data.current.namespace === 'direction' ||
            data.current.namespace === 'imaging') &&
            data.next.namespace === 'archive')
            ? '-100%' // Slide right-to-left
            : // Archive to Projects/Digital/Graphic/Direction/Imaging or Archive to Info: Slide left-to-right
              '100%'; // Slide left-to-right

        return gsap.to(data.current.container, {
          x: direction,
          duration: 1.5,
          ease: 'expo.inOut',
        });
      },
      enter(data) {
        const isFromLeft =
          // Projects/Digital/Graphic/Direction/Imaging to Info or Archive to Projects/Digital/Graphic/Direction/Imaging or Archive to Info
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

        // Set the initial position of the entering page *before* the animation
        gsap.set(data.next.container, { x: isFromLeft ? '-100%' : '100%' });

        // Make the entering page visible
        data.next.container.style.visibility = 'visible';

        // Slide the entering page in
        return gsap.to(data.next.container, {
          x: 0,
          duration: 1.5,
          ease: 'expo.inOut',
        });
      },
    },
    {
      name: 'fade-transition', // Transition for navigating between projects-related pages
      from: { namespace: ['projects', 'digital', 'graphic', 'direction', 'imaging'] }, // From any project-related namespace
      to: { namespace: ['projects', 'digital', 'graphic', 'direction', 'imaging'] }, // To any project-related namespace
      leave(data) {
        // Explicitly stop and remove video elements before leaving the page
        const videos = data.current.container.querySelectorAll('video');
        videos.forEach((video) => {
          video.pause();
          video.remove(); // Completely remove the video elements to force full reinitialization
        });

        return gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.6,
          ease: 'expo.inOut',
        });
      },
      enter(data) {
        return gsap.from(data.next.container, {
          opacity: 0,
          duration: 0.6,
          ease: 'expo.inOut',
        });
      },
    },
  ],

  views: [
    {
      namespace: 'info',
      beforeEnter({ next }) {
        animateBackgroundToActiveLink(next.container);
      },
    },
    {
      namespace: 'archive',
      beforeEnter({ next }) {
        animateBackgroundToActiveLink(next.container);
      },
    },
    {
      namespace: 'projects',
      beforeEnter({ next }) {
        animateBackgroundToActiveLink(next.container);

        slider1();

        const videos = next.container.querySelectorAll('video');
        videos.forEach((video) => {
          video.load();
          video.play();
        });
      },
      beforeLeave({ current }) {
        destroySplide();
      },
    },
    {
      namespace: 'digital',
      beforeEnter({ next }) {
        animateBackgroundToActiveLink(next.container);

        slider1();

        const videos = next.container.querySelectorAll('video');
        videos.forEach((video) => {
          video.load();
          video.play();
        });
      },
      beforeLeave({ current }) {
        destroySplide();
      },
    },
    {
      namespace: 'graphic',
      beforeEnter({ next }) {
        animateBackgroundToActiveLink(next.container);

        slider1();

        const videos = next.container.querySelectorAll('video');
        videos.forEach((video) => {
          video.load();
          video.play();
        });
      },
      beforeLeave({ current }) {
        destroySplide();
      },
    },
    {
      namespace: 'direction',
      beforeEnter({ next }) {
        animateBackgroundToActiveLink(next.container);

        slider1();

        const videos = next.container.querySelectorAll('video');
        videos.forEach((video) => {
          video.load();
          video.play();
        });
      },
      beforeLeave({ current }) {
        destroySplide();
      },
    },
    {
      namespace: 'imaging',
      beforeEnter({ next }) {
        animateBackgroundToActiveLink(next.container);

        slider1();

        const videos = next.container.querySelectorAll('video');
        videos.forEach((video) => {
          video.load();
          video.play();
        });
      },
      beforeLeave({ current }) {
        destroySplide();
      },
    },
  ],
});

// --- Barba Hooks --- //
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

  // Wait for a short delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Trigger animation after the delay
  animateBackgroundToActiveLink(next.container);
});

// DOMContentLoaded Event
document.addEventListener('DOMContentLoaded', () => {
  createActiveLinkBackground();
  animateBackgroundToActiveLink(document);
});

// Add event listener for window resize
window.addEventListener('resize', () => {
  animateBackgroundToActiveLink(document); // Recalculate and animate on resize
});
