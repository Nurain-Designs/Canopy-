/* Reusable Contact Modal Javascript - FINAL CLEAN VERSION */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // ── 1. Inject Stylesheet ──────────────────────────────────────────────────
    if (!document.querySelector('link[href*="contact.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './contact.css';
      document.head.appendChild(link);
    }

    // ── 2. Inject Modal HTML ──────────────────────────────────────────────────
    // Guard: don't inject twice (in case script is loaded multiple times)
    if (document.getElementById('canopy-contact-modal')) return;

    var overlay = document.createElement('div');
    overlay.id = 'canopy-contact-modal';
    overlay.className = 'cn-contact-overlay';
    overlay.innerHTML = [
      '<div class="cn-contact-modal">',
        '<button class="cn-contact-close" type="button" aria-label="Close">&times;</button>',
        '<div class="cn-contact-content">',
          '<h2>Contact Canopy</h2>',
          '<p>Request corporate access, submit project inquiries, or schedule a platform telemetry demo with our ESG team.</p>',
          '<form class="cn-contact-form" novalidate>',
            '<div class="cn-contact-group">',
              '<label for="cn-name">Full Name</label>',
              '<input type="text" id="cn-name" placeholder="John Doe" autocomplete="name">',
            '</div>',
            '<div class="cn-contact-group">',
              '<label for="cn-email">Corporate Email</label>',
              '<input type="email" id="cn-email" placeholder="john@company.com" autocomplete="email">',
            '</div>',
            '<div class="cn-contact-group">',
              '<label for="cn-org">Organization</label>',
              '<input type="text" id="cn-org" placeholder="Acme Climate Corp" autocomplete="organization">',
            '</div>',
            '<div class="cn-contact-group">',
              '<label for="cn-msg">Message</label>',
              '<textarea id="cn-msg" placeholder="How can we help your organization?"></textarea>',
            '</div>',
            '<button type="submit" class="cn-contact-submit">Send Message</button>',
          '</form>',
        '</div>',
        '<div class="cn-contact-success" style="display:none;">',
          '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">',
            '<circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>',
            '<path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>',
          '</svg>',
          '<h3>Message Sent!</h3>',
          '<p>Thank you for reaching out. An ESG specialist will contact you within 24 hours.</p>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    var form        = overlay.querySelector('.cn-contact-form');
    var formContent = overlay.querySelector('.cn-contact-content');
    var successView = overlay.querySelector('.cn-contact-success');
    var submitBtn   = overlay.querySelector('.cn-contact-submit');
    var closeBtn    = overlay.querySelector('.cn-contact-close');

    // ── 3. Open modal (exposed globally) ─────────────────────────────────────
    window.canopyOpenContactModal = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      form.reset();
      formContent.style.display = 'block';
      successView.style.display = 'none';
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      overlay.classList.add('active');
    };

    // ── 4. Close modal ────────────────────────────────────────────────────────
    function closeModal() {
      overlay.classList.remove('active');
    }

    closeBtn.addEventListener('click', closeModal);

    // Close only when clicking the DARK BACKDROP (not the white card)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });

    // ── 5. Submit handler ─────────────────────────────────────────────────────
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name  = document.getElementById('cn-name').value.trim();
      var email = document.getElementById('cn-email').value.trim();
      var msg   = document.getElementById('cn-msg').value.trim();
      if (!name || !email || !msg) return;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      setTimeout(function() {
        formContent.style.display = 'none';
        successView.style.display = 'flex';
      }, 1000);
    });

    // ── 6. Bind ONLY elements with .contact-trigger class ───────────────
    var triggers = document.querySelectorAll('.contact-trigger');
    triggers.forEach(function(el) {
      el.addEventListener('click', window.canopyOpenContactModal);
    });

  });
})();
