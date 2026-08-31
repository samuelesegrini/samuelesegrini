let currentObserver: IntersectionObserver | undefined;
let currentBody: HTMLElement | undefined;
let lifecycleInstalled = false;
let focusHeadingAfterNavigation = false;

export function initializePageMotion(root: ParentNode = document): void {
	if (root === document && currentBody === document.body) return;
	currentObserver?.disconnect();
	currentObserver = undefined;
	currentBody = document.body;

	const items = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
	const motionRoot = document.documentElement;

	const Observer = window.IntersectionObserver;
	if (typeof Observer !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
		for (const item of items) item.dataset.revealed = '';
		motionRoot.dataset.motionStatic = '';
		motionRoot.dataset.motionReady = '';
		return;
	}

	delete motionRoot.dataset.motionStatic;
	motionRoot.dataset.motionReady = '';
	const observer = new Observer((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				(entry.target as HTMLElement).dataset.revealed = '';
				observer.unobserve(entry.target);
			}
		}
	}, { rootMargin: '0px 0px -8% 0px' });
	currentObserver = observer;
	for (const item of items) observer.observe(item);
}

function focusDestinationHeading(): void {
	if (!focusHeadingAfterNavigation) return;
	focusHeadingAfterNavigation = false;
	const heading = document.querySelector<HTMLElement>('main h1');
	if (!heading) return;
	if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
	heading.focus({ preventScroll: true });
}

export function installPageMotion(): void {
	if (!lifecycleInstalled) {
		document.addEventListener('astro:before-preparation', () => {
			focusHeadingAfterNavigation = true;
			currentObserver?.disconnect();
			currentObserver = undefined;
			currentBody = undefined;
		});
		document.addEventListener('astro:page-load', () => {
			initializePageMotion();
			focusDestinationHeading();
		});
		lifecycleInstalled = true;
	}
	initializePageMotion();
}
