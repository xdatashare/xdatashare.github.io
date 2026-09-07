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

  initNavigation();
  initRevealAnimations();
})();
