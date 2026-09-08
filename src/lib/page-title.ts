/** Browser-tab title: keep an existing name, otherwise append it. */
export function pageTitle(title: string, name: string): string {
	const page = title.trim();
	if (!page) return name;
	if (page === name || page.includes(name)) return page;
	return `${page} — ${name}`;
}
