(function () {
  // Devuelve null si el navegador no soporta <dialog>, y entonces los carruseles
  // se quedan sin ampliación en lugar de ofrecer un botón que no hace nada.
  function initLightbox() {
    const dialog = document.getElementById('portalLightbox');
    if (!dialog || typeof dialog.showModal !== 'function') return null;

    const canvas = dialog.querySelector('[data-lightbox-canvas]');
    const address = dialog.querySelector('[data-lightbox-address]');
    const caption = dialog.querySelector('[data-lightbox-caption]');
    const closeButton = dialog.querySelector('[data-lightbox-close]');
    if (!canvas || !address || !caption || !closeButton) return null;

    function open({ image, addressText, captionText }) {
      const enlargedImage = image.cloneNode();
      // la copia se muestra de inmediato, así que no tiene sentido diferir su carga
      enlargedImage.loading = 'eager';
      canvas.replaceChildren(enlargedImage);
      address.textContent = addressText;
      caption.textContent = captionText;
      dialog.showModal();
      // el diálogo enfoca su primer control; el contenedor evita abrir sobre el botón de cerrar
      dialog.focus();
    }

    function close() {
      if (dialog.open) dialog.close();
    }

    dialog.addEventListener('click', event => {
      if (event.target === dialog) close();
    });
    closeButton.addEventListener('click', close);

    return { open };
  }

  function initCarousel(carousel, lightbox) {
    const tabs = Array.from(carousel.querySelectorAll('[role="tab"][data-carousel-index]'));
    const panels = Array.from(carousel.querySelectorAll('[role="tabpanel"][data-carousel-index]'));
    const indicators = Array.from(carousel.querySelectorAll('.portal-indicators [data-carousel-index]'));
    const caption = carousel.querySelector('[data-carousel-caption]:not([role="tab"])');
    const address = carousel.querySelector('.portal-browser [data-carousel-address]');
    if (!tabs.length || tabs.length !== panels.length) return;

    let activeIndex = 0;

    function select(index, { focus = false } = {}) {
      if (index < 0 || index >= tabs.length) return;
      activeIndex = index;

      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== index;
      });

      indicators.forEach((indicator, indicatorIndex) => {
        const isActive = indicatorIndex === index;
        indicator.classList.toggle('is-active', isActive);
        indicator.setAttribute('aria-pressed', String(isActive));
      });

      if (caption) caption.textContent = tabs[index].dataset.carouselCaption || '';
      if (address) address.textContent = tabs[index].dataset.carouselAddress || '';
      if (focus) tabs[index].focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let nextIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex === undefined) return;
        event.preventDefault();
        select(nextIndex, { focus: true });
      });
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => select(index));
    });

    if (lightbox) {
      const panelsContainer = carousel.querySelector('.portal-panels');
      const expandButton = carousel.querySelector('[data-carousel-expand]');

      const openActiveScreenshot = () => {
        const image = panels[activeIndex].querySelector('img');
        if (!image) return;
        lightbox.open({
          image,
          addressText: tabs[activeIndex].dataset.carouselAddress || '',
          captionText: tabs[activeIndex].dataset.carouselCaption || '',
        });
      };

      if (panelsContainer) panelsContainer.addEventListener('click', openActiveScreenshot);
      if (expandButton) expandButton.addEventListener('click', openActiveScreenshot);
      carousel.classList.add('has-lightbox');
    }

    select(0);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
  let activeWipe = 0;

  // Los dos portales comparten sección: data-role decide cuál se ve, y el CSS se encarga
  // del tema, de la barra roja y del barrido que revela el bloque entrante.
  function initPortalSwitch(section) {
    const toggle = section.querySelector('[data-portal-toggle]');
    const roleBlocks = Array.from(section.querySelectorAll('.portal-stage > [data-portal-role]'));
    if (!toggle || roleBlocks.length !== 2) return;

    // el bloque oculto sale del foco y del árbol de accesibilidad
    const selectRole = role => {
      section.dataset.role = role;
      roleBlocks.forEach(block => { block.inert = block.dataset.portalRole !== role; });
    };

    // El barrido necesita la foto del estado saliente; sin soporte o con movimiento
    // reducido se aplica el rol directamente y queda el fundido de siempre.
    const switchRole = role => {
      const root = document.documentElement;
      if (typeof document.startViewTransition !== 'function' || prefersReducedMotion.matches) {
        selectRole(role);
        return;
      }

      const wipeId = ++activeWipe;
      root.dataset.portalWipe = role;
      root.classList.add('is-portal-wiping');

      const finishWipe = () => {
        // un segundo clic rápido cancela este barrido y ya ha preparado el suyo
        if (wipeId !== activeWipe) return;
        root.classList.remove('is-portal-wiping');
        delete root.dataset.portalWipe;
      };

      // Un segundo clic descarta la transición en curso y con ella rechaza sus dos
      // promesas; ambas se atienden para no dejar rechazos sueltos en la consola.
      const wipe = document.startViewTransition(() => selectRole(role));
      wipe.ready.catch(() => {});
      wipe.finished.then(finishWipe, finishWipe);
    };

    toggle.addEventListener('click', () => {
      switchRole(section.dataset.role === 'participant' ? 'authority' : 'participant');
    });

    selectRole(section.dataset.role);
  }

  const lightbox = initLightbox();
  document.querySelectorAll('[data-portal-carousel]').forEach(carousel => initCarousel(carousel, lightbox));
  document.querySelectorAll('[data-portal-switch]').forEach(initPortalSwitch);
})();
