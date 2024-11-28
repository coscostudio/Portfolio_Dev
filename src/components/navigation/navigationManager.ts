import { gsap } from 'gsap';

type ProjectNamespace = 'projects' | 'digital' | 'graphic' | 'direction' | 'imaging';
const projectNamespaces: ProjectNamespace[] = [
  'projects',
  'digital',
  'graphic',
  'direction',
  'imaging',
];
const hideNamespaces = ['index', 'archive', 'info'];

const TRANSITION_DURATION = 1.5;
const TRANSITION_EASE = 'expo.inOut';

function setNavStyles(nav: HTMLElement) {
  nav.style.display = 'flex';
  nav.style.gap = '0.5rem';
  nav.style.flexDirection = 'row';
}

function handleProjectsNavigation(data: {
  current: { namespace: string };
  next: { namespace: string };
}) {
  const nav = document.querySelector('.projects-nav') as HTMLElement;
  if (!nav) return;

  const isEnteringProject =
    !projectNamespaces.includes(data.current.namespace as ProjectNamespace) &&
    projectNamespaces.includes(data.next.namespace as ProjectNamespace);

  const isLeavingToHidden =
    projectNamespaces.includes(data.current.namespace as ProjectNamespace) &&
    hideNamespaces.includes(data.next.namespace);

  if (hideNamespaces.includes(data.next.namespace)) {
    gsap.to(nav, {
      opacity: 0,
      duration: TRANSITION_DURATION,
      ease: TRANSITION_EASE,
      onComplete: () => gsap.set(nav, { display: 'none' }),
    });
    return;
  }

  if (isEnteringProject) {
    setNavStyles(nav);
    gsap.set(nav, { opacity: 0 });
    gsap.to(nav, {
      opacity: 1,
      duration: TRANSITION_DURATION,
      ease: TRANSITION_EASE,
    });
  } else if (isLeavingToHidden) {
    gsap.to(nav, {
      opacity: 0,
      duration: TRANSITION_DURATION,
      ease: TRANSITION_EASE,
      onComplete: () => gsap.set(nav, { display: 'none' }),
    });
  } else if (projectNamespaces.includes(data.next.namespace as ProjectNamespace)) {
    setNavStyles(nav);
    gsap.set(nav, { opacity: 1 });
  }
}

function handleInitialNavigation() {
  const nav = document.querySelector('.projects-nav') as HTMLElement;
  if (!nav) return;

  const currentNamespace = document
    .querySelector('[data-barba="container"]')
    ?.getAttribute('data-barba-namespace');

  if (hideNamespaces.includes(currentNamespace)) {
    gsap.set(nav, { display: 'none', opacity: 0 });
    return;
  }

  if (projectNamespaces.includes(currentNamespace as ProjectNamespace)) {
    setNavStyles(nav);
    gsap.fromTo(
      nav,
      { opacity: 0 },
      {
        opacity: 1,
        duration: TRANSITION_DURATION,
        ease: TRANSITION_EASE,
        delay: 0.1,
      }
    );
  } else {
    gsap.set(nav, { display: 'none', opacity: 0 });
  }
}

export { handleInitialNavigation, handleProjectsNavigation };
