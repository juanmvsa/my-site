// Internationalization functionality for language switching
class I18n {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = window.translations || {};
    this.init();
  }

  init() {
    // Check for saved language preference
    const savedLang = localStorage.getItem('language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }

    // Set up language toggle button
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', () => this.toggleLanguage());
      this.updateToggleButton();
    }

    // Apply translations when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.applyTranslations());
    } else {
      this.applyTranslations();
    }
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'es' : 'en';
    localStorage.setItem('language', this.currentLanguage);
    this.applyTranslations();
    this.updateToggleButton();
  }

  updateToggleButton() {
    const toggleButton = document.getElementById('language-toggle');
    if (toggleButton) {
      toggleButton.textContent = this.currentLanguage === 'en' ? 'ES' : 'EN';
      toggleButton.title = this.currentLanguage === 'en' ? 'Cambiar a Español' : 'Switch to English';
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  applyTranslations() {
    const currentTranslations = this.translations[this.currentLanguage];
    if (!currentTranslations) return;

    // Update document language attribute
    document.documentElement.lang = this.currentLanguage;

    // Handle simple text translations
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.getNestedValue(currentTranslations, key);
      if (translation) {
        element.textContent = translation;
      }
    });

    // Handle HTML translations (for content with links)
    document.querySelectorAll('[data-translate-html]').forEach(element => {
      const key = element.getAttribute('data-translate-html');
      const translation = this.getNestedValue(currentTranslations, key);
      if (translation) {
        element.innerHTML = translation;
      }
    });

    // Update page title
    if (currentTranslations.title) {
      document.title = currentTranslations.title;
    }
  }
}

// Initialize i18n when the script loads
window.i18n = new I18n();