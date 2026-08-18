(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Mobile nav toggle ---------------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.classList.toggle("open", !expanded);
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("open");
      });
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------------- Hero visual: initial zoom-out + pointer parallax (desktop only) ---------------- */
  var heroVisual = document.querySelector(".hero-visual");
  if (heroVisual && !prefersReducedMotion) {
    var layers = heroVisual.querySelectorAll("[data-depth]");
    var isFinePointer = window.matchMedia("(pointer: fine)").matches;
    var isWideViewport = window.matchMedia("(min-width: 900px)").matches;

    heroVisual.animate(
      [
        { transform: "scale(1.035)" },
        { transform: "scale(1)" }
      ],
      { duration: 1400, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "both" }
    );

    if (isFinePointer && isWideViewport && layers.length) {
      var rafId = null;
      var rect = null;

      var updateRect = function () { rect = heroVisual.getBoundingClientRect(); };
      updateRect();
      window.addEventListener("resize", updateRect);

      heroVisual.addEventListener("pointermove", function (e) {
        if (rafId) return;
        rafId = requestAnimationFrame(function () {
          rafId = null;
          if (!rect) return;
          var relX = (e.clientX - rect.left) / rect.width - 0.5;
          var relY = (e.clientY - rect.top) / rect.height - 0.5;
          layers.forEach(function (layer) {
            var depth = parseFloat(layer.getAttribute("data-depth")) || 0;
            var tx = (relX * depth).toFixed(2);
            var ty = (relY * depth).toFixed(2);
            layer.style.transform = "translate(" + tx + "px, " + ty + "px)";
          });
        });
      });

      heroVisual.addEventListener("pointerleave", function () {
        layers.forEach(function (layer) {
          layer.style.transform = "translate(0px, 0px)";
        });
      });
    }
  }

  /* ---------------- Contact form: mailto handoff (no booking backend) ---------------- */
  var contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(contactForm);
      var name = (data.get("name") || "").toString().trim();
      var phone = (data.get("phone") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var massage = (data.get("massage") || "").toString().trim();
      var preferredDate = (data.get("preferred_date") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      var target = "nois-royal-thaimassage@gmx.de";
      var subject = "Terminanfrage von " + (name || "Website-Besucher");
      var bodyLines = [
        "Name: " + name,
        "Telefon: " + phone,
        "E-Mail: " + email,
        "Gewünschte Massage: " + (massage || "-"),
        "Wunschtermin: " + (preferredDate || "-"),
        "",
        "Nachricht:",
        message
      ];
      var body = bodyLines.join("\n");

      var mailto = "mailto:" + target +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      var status = document.querySelector("#form-status");
      if (status) {
        status.textContent = "Ihr E-Mail-Programm öffnet sich mit der vorausgefüllten Anfrage. Bitte senden Sie die E-Mail dort ab.";
        status.classList.add("visible", "success");
      }

      window.location.href = mailto;
    });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.querySelector("#current-year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
})();
