(function () {
  const preferenceKey = 'xdatashare.language';
  const supportedLanguages = ['es', 'en'];
  const documentElement = document.documentElement;
  const alternateLanguage = documentElement.dataset.alternateLanguage;
  const alternateUrl = documentElement.dataset.alternateUrl;

  function normalizeLanguage(language) {
    if (typeof language !== 'string') return null;
    const normalized = language.toLowerCase().split('-')[0];
    return supportedLanguages.includes(normalized) ? normalized : null;
  }

  function readPreference() {
    try {
      return normalizeLanguage(window.localStorage.getItem(preferenceKey));
    } catch (_) {
      return null;
    }
  }

  function savePreference(language) {
    try {
      window.localStorage.setItem(preferenceKey, language);
    } catch (_) {
      // The language links still work when storage is unavailable.
    }
  }

  function browserLanguage() {
    const preferred = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;
    return typeof preferred === 'string' && preferred.toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  function currentLocationWithoutLanguageParameter() {
    const url = new URL(window.location.href);
    url.searchParams.delete('lang');
    return url;
  }

  function redirectToAlternatePage() {
    const cleanedUrl = currentLocationWithoutLanguageParameter();
    const target = new URL(alternateUrl, window.location.href);
    target.search = cleanedUrl.search;
    target.hash = cleanedUrl.hash;
    window.location.replace(target.href);
  }

  // Keeps the ES/EN links pointing at the section the visitor is currently reading,
  // so the href is already correct for a normal, middle or modifier click.
  function syncLanguageLinks() {
    const cleanedUrl = currentLocationWithoutLanguageParameter();
    document.querySelectorAll('[data-language-link]').forEach(link => {
      const target = new URL(link.dataset.languageHref, window.location.href);
      cleanedUrl.searchParams.forEach((value, key) => {
        if (!target.searchParams.has(key)) target.searchParams.append(key, value);
      });
      target.hash = cleanedUrl.hash;
      link.href = target.href;
    });
  }

  function initLanguageLinks() {
    document.querySelectorAll('[data-language-link]').forEach(link => {
      link.dataset.languageHref = link.getAttribute('href');
    });
    syncLanguageLinks();
    window.addEventListener('hashchange', syncLanguageLinks);
  }

  const explicitLanguage = normalizeLanguage(new URL(window.location.href).searchParams.get('lang'));
  let selectedLanguage = explicitLanguage || readPreference();

  if (explicitLanguage) {
    savePreference(explicitLanguage);
    if (explicitLanguage === alternateLanguage) {
      redirectToAlternatePage();
      return;
    }
    const cleanedUrl = currentLocationWithoutLanguageParameter();
    window.history.replaceState(null, '', `${cleanedUrl.pathname}${cleanedUrl.search}${cleanedUrl.hash}`);
  } else if (documentElement.hasAttribute('data-language-detect')) {
    if (!selectedLanguage) {
      selectedLanguage = browserLanguage();
      savePreference(selectedLanguage);
    }
    if (selectedLanguage === alternateLanguage) {
      redirectToAlternatePage();
      return;
    }
  }

  document.addEventListener('DOMContentLoaded', initLanguageLinks);
})();
