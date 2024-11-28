import { gsap } from 'gsap';

let activeLinkBackground: HTMLElement | null = null;
let observer: MutationObserver;

export function createActiveLinkBackground() {
  if (activeLinkBackground) {
    return activeLinkBackground;
  }

  activeLinkBackground = document.createElement('div');
  activeLinkBackground.classList.add('active-link-background', 'active-link-overlay');

  Object.assign(activeLinkBackground.style, {
    position: 'absolute',
    top: '4px',
    height: '30px',
    borderRadius: '14px',
    zIndex: '1',
    pointerEvents: 'none',
  });

  const navbarContainer = document.querySelector('.navbar-container');
  if (navbarContainer && !navbarContainer.querySelector('.active-link-background')) {
    navbarContainer.appendChild(activeLinkBackground);
    startObservingLinkStyles();
  }
  return activeLinkBackground;
}

export function animateBackgroundToActiveLink() {
  const background = createActiveLinkBackground();
  if (!background) return;

  const infoLink = document.querySelector('[data-page="info"]');
  const projectsLink = document.querySelector('[data-page="projects"]');
  const archiveLink = document.querySelector('[data-page="archive"]');

  const oldActiveLink = document.querySelector('.nav-button.w--current');

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

  if (!activeLink) return;

  const activeLinkRect = activeLink.getBoundingClientRect();
  const navbarContainerRect = document.querySelector('.navbar-container').getBoundingClientRect();

  const targetX = activeLinkRect.left - navbarContainerRect.left;
  const targetWidth = activeLinkRect.width;

  gsap.to(background, {
    left: targetX,
    width: targetWidth,
    duration: 1.5,
    ease: 'expo.inOut',
  });

  if (oldActiveLink) oldActiveLink.style.color = 'var(--text-dark)';
  activeLink.style.color = 'var(--text-active-inverse)';
}

function startObservingLinkStyles() {
  const navLinks = document.querySelectorAll('.nav-button');
  const config = { attributes: true, attributeFilter: ['class'] };

  const callback = function (mutationsList: MutationRecord[], observer: MutationObserver) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        animateBackgroundToActiveLink();
      }
    }
  };

  observer = new MutationObserver(callback);
  navLinks.forEach((link) => {
    observer.observe(link, config);
  });
}
