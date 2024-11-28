let isTransitioning = false;

export function setTransitioning(value: boolean) {
  isTransitioning = value;
  const overlay = getOrCreateOverlay();
  overlay.style.display = value ? 'block' : 'none';
}

function getOrCreateOverlay() {
  let overlay = document.getElementById('transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: none;
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

export function handleNavClick(e: Event) {
  const link = e.currentTarget as HTMLElement;
  const currentNamespace = document
    .querySelector('[data-barba="container"]')
    ?.getAttribute('data-barba-namespace');
  const projectsNamespaces = ['projects', 'digital', 'graphic', 'direction', 'imaging'];
  const isProjectsButton = link.getAttribute('data-page') === 'projects';

  if (
    link.classList.contains('w--current') ||
    (isProjectsButton && projectsNamespaces.includes(currentNamespace))
  ) {
    e.preventDefault();
    e.stopPropagation();
  }
}

export function setupNavClickPrevention() {
  const navLinks = document.querySelectorAll('.nav-button');
  navLinks.forEach((link) => {
    link.removeEventListener('click', handleNavClick, true);
    link.addEventListener('click', handleNavClick, true);
  });
}
