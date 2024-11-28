let isTransitioning = false;

export function setTransitioning(value: boolean) {
  isTransitioning = value;
}

export function handleNavClick(e: Event) {
  const link = e.currentTarget as HTMLElement;
  const isActive = link.classList.contains('w--current');

  if (isTransitioning || isActive) {
    e.preventDefault();
    return;
  }
}

export function setupNavClickPrevention() {
  const navLinks = document.querySelectorAll('.nav-button');
  navLinks.forEach((link) => {
    link.addEventListener('click', handleNavClick);
  });
}
