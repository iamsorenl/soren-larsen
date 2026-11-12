// Jump to a section (optionally a Projects tab, optionally a specific card/tile).
export function goToSection({ section, tab, anchor }) {
    if (tab) window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: tab }));
    const el = (anchor && document.getElementById(anchor)) || document.getElementById(section);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}
