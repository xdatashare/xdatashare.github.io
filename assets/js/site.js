(function () {
  function initNavigation() {
    const nav = document.getElementById('nav');
    const updateNavigation = () => nav.classList.toggle('scrolled', window.scrollY > 40);

    window.addEventListener('scroll', updateNavigation);
    updateNavigation();
  }

  function initRevealAnimations() {
    window.addEventListener('load', () => {
      document.querySelectorAll('.hero .rv').forEach(element => element.classList.add('in'));
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .14 });

    document.querySelectorAll('section .rv').forEach(element => observer.observe(element));
  }

  // The dropdown is a native <details>/<summary> — opening/closing needs no JS.
  // This only adds the affordances a native disclosure lacks: closing on an outside
  // click or Escape. Returns a close() the mobile menu can call to tidy up its state.
  function initLanguageDropdown() {
    const details = document.querySelector('.language-switcher');
    if (!details) return { close() {} };

    const close = () => { details.open = false; };

    document.addEventListener('click', event => {
      if (details.open && !details.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && details.open) {
        close();
        details.querySelector('summary')?.focus();
      }
    });

    return { close };
  }

  function initMobileMenu(languageDropdown) {
    const nav = document.getElementById('nav');
    const toggleButton = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!nav || !toggleButton || !menu) return;

    // mirrors the collapse breakpoint declared in site.css
    const mobileQuery = window.matchMedia('(max-width:1000px)');
    const isMenuOpen = () => nav.classList.contains('menu-open');

    const setMenuOpen = shouldOpen => {
      nav.classList.toggle('menu-open', shouldOpen);
      toggleButton.setAttribute('aria-expanded', String(shouldOpen));
      const label = shouldOpen ? toggleButton.dataset.labelClose : toggleButton.dataset.labelOpen;
      if (label) toggleButton.setAttribute('aria-label', label);
    };

    const closeMenu = ({ restoreFocus = false } = {}) => {
      if (!isMenuOpen()) return;
      setMenuOpen(false);
      languageDropdown.close();
      if (restoreFocus) toggleButton.focus();
    };

    toggleButton.addEventListener('click', () => setMenuOpen(!isMenuOpen()));
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu({ restoreFocus: true });
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target)) closeMenu();
    });
    mobileQuery.addEventListener('change', event => {
      if (!event.matches) closeMenu();
    });
  }

  initNavigation();
  initRevealAnimations();
  initMobileMenu(initLanguageDropdown());
})();
