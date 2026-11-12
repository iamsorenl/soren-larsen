import { goToSection } from '../goTo';

afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
});

const section = (id, top) => {
    const el = document.createElement('div');
    el.id = id;
    el.getBoundingClientRect = () => ({ top });
    document.body.appendChild(el);
    return el;
};

test('scrolls to a card that only renders after the tab switch', () => {
    jest.useFakeTimers();
    section('projects', 1000);
    // the Projects card renders the requested tab's cards a moment after the event
    const onTab = () => setTimeout(() => section('project-no-ragrets', 1600), 0);
    window.addEventListener('portfolio:projects-tab', onTab);
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    goToSection({ section: 'projects', tab: 'research', anchor: 'project-no-ragrets' });
    jest.advanceTimersByTime(200);
    window.removeEventListener('portfolio:projects-tab', onTab);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 1520, behavior: 'smooth' });
    scrollTo.mockRestore();
});

test('falls back to the section when the anchor never appears', () => {
    jest.useFakeTimers();
    section('education', 700);
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    goToSection({ section: 'education', anchor: 'nope' });
    jest.advanceTimersByTime(200);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 620, behavior: 'smooth' });
    scrollTo.mockRestore();
});
