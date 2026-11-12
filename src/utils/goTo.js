// Jump to a section (optionally a Projects tab, optionally a specific card/tile).
const scrollToEl = (el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });

export function goToSection({ section, tab, anchor }) {
    if (tab) window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: tab }));
    const find = () => (anchor && document.getElementById(anchor)) || document.getElementById(section);
    const el = find();
    if (el) scrollToEl(el);
    // A card in a tab that was just switched to renders after this event, so
    // look again once React has committed and land on the card itself.
    if (anchor) {
        setTimeout(() => {
            const later = document.getElementById(anchor);
            if (later && later !== el) scrollToEl(later);
        }, 60);
    }
}
