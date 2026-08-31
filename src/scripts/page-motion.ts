export function initializePageMotion(root: ParentNode = document): void {
	const items = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
	const motionRoot = document.documentElement;

	if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
		for (const item of items) item.dataset.revealed = '';
		motionRoot.dataset.motionReady = '';
		return;
	}

	motionRoot.dataset.motionReady = '';
	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				(entry.target as HTMLElement).dataset.revealed = '';
				observer.unobserve(entry.target);
			}
		}
	}, { rootMargin: '0px 0px -8% 0px' });
	for (const item of items) observer.observe(item);
}
