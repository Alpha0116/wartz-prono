const WA_CHANNEL = "https://whatsapp.com/channel/0029VbCXxoyJZg48UCwXYD2U";
const TG_CHANNEL = "https://t.me/+FRvJPahpBkJlMDg0";

const WA_SESSION_KEY = "wartz_wa_redirect";
const TG_SESSION_KEY = "wartz_tg_redirect";
const POPUP_DELAY_MS = 3000;

const consentLayer = document.getElementById("consentLayer");

function goToWhatsApp() {
  sessionStorage.setItem(WA_SESSION_KEY, "1");
  window.location.href = WA_CHANNEL;
}

function goToTelegram() {
  sessionStorage.setItem(TG_SESSION_KEY, "1");
  window.location.href = TG_CHANNEL;
}

let _scrollY = 0;

function showPopup() {
  if (!consentLayer) return;
  
  // Fixer le body sans overflow:hidden
  _scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${_scrollY}px`;
  document.body.style.width = '100%';
  
  consentLayer.hidden = false;
  requestAnimationFrame(() => {
    consentLayer.classList.add("is-visible");
  });
}

function closePopup() {
  if (!consentLayer) return;
  
  // Restaurer le scroll
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, _scrollY);
  
  consentLayer.classList.remove("is-visible");
  setTimeout(() => {
    consentLayer.hidden = true;
  }, 350);
}

function initPopup() {
  // La vérification de session a été retirée pour que la popup s'affiche à chaque fois après le délai (utile pour tester)
  setTimeout(showPopup, POPUP_DELAY_MS);
}

// Le bloqueur de touchmove a été retiré pour ne pas bloquer le rafraîchissement de la page (pull-to-refresh)

document.addEventListener("click", (e) => {
  // Liens Telegram -> On va vers Telegram
  if (e.target.closest("[data-redirect-tg]") || (e.target.closest("a[href]") && e.target.closest("a[href]").getAttribute("href").includes("t.me"))) {
    e.preventDefault();
    goToTelegram();
    return;
  }

  // Bouton de copie -> On le laisse fonctionner
  if (e.target.closest("#copyBtn, .promo__copy")) {
    return;
  }

  // N'importe quel autre clic -> On va vers WhatsApp
  e.preventDefault();
  goToWhatsApp();
});

// Initialize
initPopup();

// Copy promo code functionality
const copyBtn = document.getElementById("copyBtn");
const promoCode = document.getElementById("promoCode");

if (copyBtn && promoCode) {
  copyBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const code = promoCode.textContent.trim();
    try {
      await navigator.clipboard.writeText(code);
      copyBtn.classList.add("copied");
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.innerHTML = original;
      }, 2000);
    } catch {
      // Fallback selection if clipboard API fails
      const range = document.createRange();
      range.selectNodeContents(promoCode);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  });
}

// Fade-in animations on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".pick, .stat, .steps__list li").forEach((el, i) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
  observer.observe(el);
});

// Interception du bouton retour (back button)
history.pushState(null, null, location.href);
window.addEventListener("popstate", () => {
  // On remet un état dans l'historique pour empêcher le retour en arrière effectif
  history.pushState(null, null, location.href);
  goToWhatsApp();
});
