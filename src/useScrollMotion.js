import {useEffect} from 'react';

const clamp = value => Math.max(0, Math.min(1, value));

export function useScrollMotion(admin, setActive) {
  useEffect(() => {
    if (admin) return;
    const root = document.querySelector('main');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scenes = [...root.querySelectorAll('[data-scene]')];
    const reveals = [...root.querySelectorAll('.section-heading,.day-details h3,.quote-copy,.rsvp-intro,.rsvp-card,footer>.names')];
    const steps = [...root.querySelectorAll('.timeline-step')];
    const chapters = ['inicio', 'dia', 'presenca'].map(id => document.getElementById(id));
    let frame = 0;
    let disposed = false;

    function update() {
      frame = 0;
      const height = window.innerHeight;
      // Measure together before changing styles to avoid repeated layout work.
      const sceneRects = scenes.map(el => el.getBoundingClientRect());
      const revealRects = reveals.map(el => el.getBoundingClientRect());
      const stepRects = steps.map(el => el.getBoundingClientRect());
      const chapterRects = chapters.map(el => el.getBoundingClientRect());
      const reduced = preference.matches;
      root.classList.toggle('scroll-motion', !reduced);
      scenes.forEach((el, index) => {
        const rect = sceneRects[index];
        const pinned = el.classList.contains('hero') || el.classList.contains('invitation-section');
        const progress = pinned ? -rect.top / Math.max(1, rect.height - height) : (height - rect.top) / (height + rect.height);
        el.style.setProperty('--p', reduced ? 0 : clamp(progress));
      });
      reveals.forEach((el, index) => {
        el.classList.add('motion-reveal');
        const progress = clamp((height * .96 - revealRects[index].top) / (height * .42));
        el.style.setProperty('--reveal', reduced ? 1 : progress);
      });
      steps.forEach((el, index) => {
        const rect = stepRects[index];
        el.style.setProperty('--step', reduced ? 1 : clamp((height * .82 - rect.top) / (height * .4)));
        el.style.setProperty('--line', reduced ? 1 : clamp((height * .55 - rect.top) / Math.max(1, rect.height)));
      });
      let active = 'inicio';
      chapters.forEach((el, index) => {if (chapterRects[index].top < height * .5) active = el.id;});
      setActive(active);
    }
    function schedule() {
      if (!disposed && !frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    document.fonts.ready.then(schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
      root.classList.remove('scroll-motion');
      reveals.forEach(el => el.classList.remove('motion-reveal'));
    };
  }, [admin, setActive]);
}
