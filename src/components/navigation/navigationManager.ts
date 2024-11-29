import { gsap } from 'gsap';

type ProjectNamespace = 'projects' | 'digital' | 'graphic' | 'direction' | 'imaging';
const projectNamespaces: ProjectNamespace[] = [
  'projects',
  'digital',
  'graphic',
  'direction',
  'imaging',
];
const hideNamespaces = ['archive', 'info'];

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

  const isEnteringProject = projectNamespaces.includes(data.next.namespace as ProjectNamespace);
  const isLeavingProject = !projectNamespaces.includes(data.next.namespace as ProjectNamespace);

  if (isLeavingProject) {
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
    gsap.set(nav, { display: 'flex', opacity: 0 });
    gsap.to(nav, {
      opacity: 1,
      duration: TRANSITION_DURATION,
      ease: TRANSITION_EASE,
    });
  }
}

function handleInitialNavigation() {
  const nav = document.querySelector('.projects-nav') as HTMLElement;
  if (!nav) {
    console.warn('Projects nav not found');
    return;
  }

  const container = document.querySelector('[data-barba="container"]');
  const currentNamespace = container?.getAttribute('data-barba-namespace');

  console.log('Current namespace:', currentNamespace);
  console.log(
    'Is project namespace:',
    projectNamespaces.includes(currentNamespace as ProjectNamespace)
  );

  if (!projectNamespaces.includes(currentNamespace as ProjectNamespace)) {
    gsap.set(nav, { display: 'none', opacity: 0 });
    return;
  }

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
}

export { handleInitialNavigation, handleProjectsNavigation };