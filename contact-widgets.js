// ============================================================
// Request a Quote + Get in Touch modals
// Shared across every page. Injects the modal markup once,
// wires up open/close behaviour, and (for the quote form)
// assembles a pre-filled email for the visitor's own mail app.
// ============================================================

(function () {
  const SALES_EMAIL = "sales@murtazacorporation.com.pk";
  const PHONE_DISPLAY = "+92 (21) 35141451";
  const PHONE_TEL = "+922135141451";
  const WHATSAPP_DISPLAY = "+92 334 3791852";
  const WHATSAPP_LINK = "https://wa.me/923343791852";
  const ADDRESS = "516/517, Sector 6-A, Mehran Town, Korangi Industrial Area, Karachi - 74900, Pakistan";
  const HOURS = "Monday – Saturday, 9am – 6pm";

  const PRODUCTS = [
    "Pipes",
    "Fittings",
    "Valves",
    "Flanges",
    "Tubes",
    "Dairy tubes & fittings",
    "Not sure / need advice",
  ];

  function buildModalsMarkup() {
    const productChecks = PRODUCTS.map((p, i) => `
      <label class="mc-check">
        <input type="checkbox" name="products" value="${p}" id="mc-product-${i}">
        <span>${p}</span>
      </label>`).join("");

    return `
    <div class="mc-overlay" id="mcQuoteOverlay" aria-hidden="true">
      <div class="mc-modal" role="dialog" aria-modal="true" aria-labelledby="mcQuoteTitle">
        <button type="button" class="mc-close" id="mcQuoteClose" aria-label="Close">&times;</button>
        <p class="mc-eyebrow">Request a quote</p>
        <h3 id="mcQuoteTitle" class="mc-title">Tell us what you need.</h3>
        <p class="mc-sub">Select the products you're after and share your details — we'll open a pre-filled email to our sales team so you don't have to type it twice.</p>

        <form id="mcQuoteForm" novalidate>
          <!-- Honeypot: invisible to real visitors, but bots tend to fill in every field they find. -->
          <div class="mc-field mc-hp" aria-hidden="true">
            <label for="mcWebsite">Leave this field empty</label>
            <input type="text" id="mcWebsite" name="website" tabindex="-1" autocomplete="off">
          </div>

          <div class="mc-row">
            <div class="mc-field">
              <label for="mcName">Full name*</label>
              <input type="text" id="mcName" name="name" required autocomplete="name">
            </div>
            <div class="mc-field">
              <label for="mcCompany">Company name</label>
              <input type="text" id="mcCompany" name="company" autocomplete="organization">
            </div>
          </div>

          <div class="mc-row">
            <div class="mc-field">
              <label for="mcEmail">Email address*</label>
              <input type="email" id="mcEmail" name="email" required autocomplete="email" placeholder="name@company.com">
              <p class="mc-error" id="mcEmailError" hidden>Please enter a valid email address (e.g. name@company.com).</p>
            </div>
            <div class="mc-field">
              <label for="mcPhone">Phone number*</label>
              <input type="tel" id="mcPhone" name="phone" required autocomplete="tel" placeholder="+92 3xx xxxxxxx">
              <p class="mc-error" id="mcPhoneError" hidden>Please enter a valid Pakistani number, e.g. 0334 3791852 or +92 334 3791852.</p>
            </div>
          </div>

          <div class="mc-field">
            <label>Product(s) required*</label>
            <div class="mc-check-grid">${productChecks}</div>
            <p class="mc-error" id="mcProductError" hidden>Please select at least one product.</p>
          </div>

          <div class="mc-field">
            <label for="mcSpec">Sizes, grades, quantity &amp; standards*</label>
            <textarea id="mcSpec" name="spec" rows="3" required placeholder="e.g. 316L pipe, 2&quot; SCH40, ASTM A312, approx. 500m"></textarea>
          </div>

          <div class="mc-field">
            <label for="mcMessage">Anything else we should know?</label>
            <textarea id="mcMessage" name="message" rows="2" placeholder="Delivery timeline, project location, etc. (optional)"></textarea>
          </div>

          <div class="mc-field mc-captcha-field">
            <label for="mcCaptchaAnswer">Quick check: what is <span id="mcCaptchaQuestion">?</span>*</label>
            <input type="number" id="mcCaptchaAnswer" name="captcha" inputmode="numeric" autocomplete="off" required>
            <p class="mc-error" id="mcCaptchaError" hidden>That's not quite right — try the new sum below.</p>
          </div>

          <button type="submit" class="btn btn-primary mc-submit">
            <span>Send quote request</span> <span class="arrow">&rarr;</span>
          </button>
          <p class="mc-note">This opens your email app with everything filled in — just hit send. Prefer to talk instead? <button type="button" class="mc-link-btn" id="mcSwitchToContact">Get in touch</button>.</p>
        </form>
      </div>
    </div>

    <div class="mc-overlay" id="mcContactOverlay" aria-hidden="true">
      <div class="mc-modal mc-modal-sm" role="dialog" aria-modal="true" aria-labelledby="mcContactTitle">
        <button type="button" class="mc-close" id="mcContactClose" aria-label="Close">&times;</button>
        <p class="mc-eyebrow">Get in touch</p>
        <h3 id="mcContactTitle" class="mc-title">Talk to our sales team.</h3>
        <p class="mc-sub">Karachi shop and Korangi warehouse. Reach us directly — no call centre.</p>

        <div class="mc-contact-list">
          <a class="mc-contact-row" href="tel:${PHONE_TEL}">
            <span class="mc-contact-icon"><i class="fa-solid fa-phone"></i></span>
            <span class="mc-contact-text">
              <strong>Call us</strong>
              <span>${PHONE_DISPLAY}</span>
            </span>
          </a>
          <a class="mc-contact-row" href="${WHATSAPP_LINK}" target="_blank" rel="noopener">
            <span class="mc-contact-icon"><i class="fa-brands fa-whatsapp"></i></span>
            <span class="mc-contact-text">
              <strong>WhatsApp</strong>
              <span>${WHATSAPP_DISPLAY}</span>
            </span>
          </a>
          <a class="mc-contact-row" href="mailto:${SALES_EMAIL}">
            <span class="mc-contact-icon"><i class="fa-solid fa-envelope"></i></span>
            <span class="mc-contact-text">
              <strong>Email</strong>
              <span>${SALES_EMAIL}</span>
            </span>
          </a>
          <div class="mc-contact-row mc-contact-row-static">
            <span class="mc-contact-icon"><i class="fa-solid fa-location-dot"></i></span>
            <span class="mc-contact-text">
              <strong>Address</strong>
              <span>${ADDRESS}</span>
            </span>
          </div>
          <div class="mc-contact-row mc-contact-row-static">
            <span class="mc-contact-icon"><i class="fa-solid fa-clock"></i></span>
            <span class="mc-contact-text">
              <strong>Hours</strong>
              <span>${HOURS}</span>
            </span>
          </div>
        </div>

        <button type="button" class="btn btn-ghost mc-full-width" id="mcSwitchToQuote">Prefer email? Request a quote instead</button>
      </div>
    </div>`;
  }

  function init() {
    document.body.insertAdjacentHTML("beforeend", buildModalsMarkup());

    const quoteOverlay = document.getElementById("mcQuoteOverlay");
    const contactOverlay = document.getElementById("mcContactOverlay");
    const quoteForm = document.getElementById("mcQuoteForm");
    let lastFocused = null;
    let captchaSum = 0;

    // Simple, reasonably strict email check — catches typos like a missing
    // "@" or a missing domain dot without rejecting valid addresses.
    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value);
    }

    // Accepts common ways people type a Pakistani number (with/without
    // +92, with a leading 0 trunk prefix, with spaces/dashes/brackets)
    // and returns it normalised to "+92XXXXXXXXXX" for the outgoing
    // email, or null if it doesn't look like a valid PK number.
    function normalizePakistaniPhone(value) {
      let digits = value.replace(/[^\d+]/g, "");
      if (digits.startsWith("+92")) {
        digits = digits.slice(3);
      } else if (digits.startsWith("0092")) {
        digits = digits.slice(4);
      } else if (digits.startsWith("92")) {
        digits = digits.slice(2);
      } else if (digits.startsWith("0")) {
        digits = digits.slice(1);
      } else {
        return null;
      }
      if (!/^\d{9,10}$/.test(digits)) return null;
      return "+92" + digits;
    }

    function generateCaptcha() {
      const a = Math.floor(Math.random() * 9) + 1; // 1-9
      const b = Math.floor(Math.random() * 9) + 1; // 1-9
      captchaSum = a + b;
      document.getElementById("mcCaptchaQuestion").textContent = `${a} + ${b}`;
      document.getElementById("mcCaptchaAnswer").value = "";
      document.getElementById("mcCaptchaError").hidden = true;
    }

    function openModal(overlay) {
      lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("mc-lock-scroll");
      const firstField = overlay.querySelector("input, textarea, button.mc-close");
      if (firstField) setTimeout(() => firstField.focus(), 50);
    }

    function closeModal(overlay) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      if (!quoteOverlay.classList.contains("is-open") && !contactOverlay.classList.contains("is-open")) {
        document.body.classList.remove("mc-lock-scroll");
      }
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function resetQuoteErrors() {
      ["mcEmailError", "mcPhoneError", "mcProductError", "mcCaptchaError"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });
    }

    window.openQuoteModal = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      closeModal(contactOverlay);
      openModal(quoteOverlay);
      generateCaptcha();
      resetQuoteErrors();
    };
    window.openContactModal = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      closeModal(quoteOverlay);
      openModal(contactOverlay);
    };

    document.getElementById("mcQuoteClose").addEventListener("click", () => closeModal(quoteOverlay));
    document.getElementById("mcContactClose").addEventListener("click", () => closeModal(contactOverlay));
    document.getElementById("mcSwitchToContact").addEventListener("click", () => { closeModal(quoteOverlay); openModal(contactOverlay); });
    document.getElementById("mcSwitchToQuote").addEventListener("click", () => { closeModal(contactOverlay); openModal(quoteOverlay); generateCaptcha(); });

    [quoteOverlay, contactOverlay].forEach((overlay) => {
      overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(overlay); });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (quoteOverlay.classList.contains("is-open")) closeModal(quoteOverlay);
      if (contactOverlay.classList.contains("is-open")) closeModal(contactOverlay);
    });

    // Wire up every existing "Request a quote" and "Get in touch" trigger
    // on the page (nav button, hero/section CTAs, contact section button)
    // without needing each page's markup to be hand-edited.
    document.querySelectorAll("[data-open-quote]").forEach((el) => {
      el.addEventListener("click", window.openQuoteModal);
    });
    document.querySelectorAll("[data-open-contact]").forEach((el) => {
      el.addEventListener("click", window.openContactModal);
    });

    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Honeypot: a real visitor never sees or fills this field. If it has
      // a value, silently drop the submission without tipping the bot off.
      const honeypot = document.getElementById("mcWebsite");
      if (honeypot && honeypot.value.trim() !== "") {
        quoteForm.reset();
        return;
      }

      const name = document.getElementById("mcName").value.trim();
      const company = document.getElementById("mcCompany").value.trim();
      const email = document.getElementById("mcEmail").value.trim();
      const phoneRaw = document.getElementById("mcPhone").value.trim();
      const spec = document.getElementById("mcSpec").value.trim();
      const message = document.getElementById("mcMessage").value.trim();
      const products = [...quoteForm.querySelectorAll('input[name="products"]:checked')].map((c) => c.value);

      const emailError = document.getElementById("mcEmailError");
      if (!isValidEmail(email)) {
        emailError.hidden = false;
        document.getElementById("mcEmail").focus();
        return;
      }
      emailError.hidden = true;

      const phoneError = document.getElementById("mcPhoneError");
      const phone = normalizePakistaniPhone(phoneRaw);
      if (!phone) {
        phoneError.hidden = false;
        document.getElementById("mcPhone").focus();
        return;
      }
      phoneError.hidden = true;

      const productError = document.getElementById("mcProductError");
      if (products.length === 0) {
        productError.hidden = false;
        quoteForm.querySelector(".mc-check-grid").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      productError.hidden = true;

      const captchaInput = document.getElementById("mcCaptchaAnswer");
      const captchaError = document.getElementById("mcCaptchaError");
      const captchaGiven = parseInt(captchaInput.value, 10);
      if (isNaN(captchaGiven) || captchaGiven !== captchaSum) {
        captchaError.hidden = false;
        generateCaptcha();
        captchaInput.focus();
        return;
      }
      captchaError.hidden = true;

      const subject = `Quote request — ${products.join(", ")} — ${name || "Murtaza Corporation website"}`;
      const bodyLines = [
        `Name: ${name}`,
        `Company: ${company || "-"}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Products required: ${products.join(", ")}`,
        ``,
        `Sizes / grades / quantity / standards:`,
        spec,
        ``,
        `Additional message:`,
        message || "-",
      ];
      const mailto = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

      window.location.href = mailto;

      const note = quoteForm.querySelector(".mc-note");
      const originalNote = note.innerHTML;
      note.innerHTML = "Your email app should be opening now with the request filled in — just hit send. If nothing happened, email us directly at " +
        `<a href="mailto:${SALES_EMAIL}">${SALES_EMAIL}</a>.`;
      setTimeout(() => { note.innerHTML = originalNote; }, 8000);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();