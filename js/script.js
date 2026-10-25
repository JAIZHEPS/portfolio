(function () {
  var d = document;
  var r = d.documentElement;
  var rm = matchMedia("(prefers-reduced-motion:reduce)").matches;

  // Set default mode
  r.dataset.mode = "design";

  // Mode switcher (Design / Code)
  var sw = d.getElementById("sw");
  if (sw) {
    sw.addEventListener("click", function () {
      var c = r.dataset.mode === "code";
      r.dataset.mode = c ? "design" : "code";
      sw.setAttribute("aria-pressed", String(!c));
    });
  }

  // Observe and sync data-mode to body
  d.body.dataset.mode = "";
  new MutationObserver(function () {
    d.body.dataset.mode = r.dataset.mode;
  }).observe(r, { attributes: true, attributeFilter: ["data-mode"] });
  d.body.dataset.mode = r.dataset.mode;

  // Reveal elements on scroll
  var io = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  d.querySelectorAll(".rv").forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    io.observe(el);
  });

  // Animated text highlighting in About section
  var ab = d.getElementById("ab");
  var sp = [];
  if (ab) {
    var words = ab.textContent.trim().split(/\s+/);
    ab.innerHTML = words
      .map(function (w) {
        return "<span>" + w + "</span>";
      })
      .join(" ");
    sp = ab.querySelectorAll("span");
  }

  // Reading progress bar & About text illumination
  var bar = d.getElementById("bar");
  var tick = false;

  function up() {
    tick = false;
    var h = d.documentElement.scrollHeight - innerHeight;
    if (bar) {
      bar.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")";
    }

    if (ab && sp.length) {
      var b = ab.getBoundingClientRect();
      var p = (innerHeight * 0.85 - b.top) / (b.height + innerHeight * 0.35);
      var n = Math.round(Math.min(1, Math.max(0, p)) * sp.length);
      sp.forEach(function (s, i) {
        s.classList.toggle("on", i < n);
      });
    }
  }

  addEventListener(
    "scroll",
    function () {
      if (!tick) {
        tick = true;
        requestAnimationFrame(up);
      }
    },
    { passive: true }
  );
  up();

  // Floating hover preview
  var pv = d.getElementById("pv");
  var x = 0;
  var y = 0;
  var tx = 0;
  var ty = 0;
  var run = false;

  function loop() {
    x += (tx - x) * 0.14;
    y += (ty - y) * 0.14;
    if (pv) {
      pv.style.transform =
        "translate(" +
        x +
        "px," +
        y +
        "px) scale(" +
        (pv.classList.contains("on") ? 1 : 0.7) +
        ") rotate(" +
        (tx - x) * 0.05 +
        "deg)";
    }
    if (run) requestAnimationFrame(loop);
  }

  // Hash-based routing for case studies
  var keys = ["wander", "blinkbuy", "carevo", "health", "unavu", "farmfresh"];
  var names = [
    "Wander India",
    "BlinkBuy",
    "Carevo",
    "Health Prediction",
    "UNAVU",
    "Farm Fresh"
  ];
  var pans = d.querySelectorAll(".cp");
  var nx = d.getElementById("nx");

  function route() {
    var h = location.hash.slice(1);
    var i = keys.indexOf(h);
    var was = r.dataset.view;

    if (i > -1) {
      r.dataset.view = "case";
      pans.forEach(function (p) {
        p.classList.toggle("on", p.id === "cp-" + h);
      });
      var n = (i + 1) % keys.length;
      if (nx) {
        nx.href = "#" + keys[n];
        nx.textContent = names[n] + " \u2192";
      }
      if (pv) {
        pv.classList.remove("on");
      }
      scrollTo({ top: 0, behavior: "instant" });
    } else {
      r.dataset.view = "home";
      if (was === "case") {
        var el = h && d.getElementById(h);
        if (el) el.scrollIntoView();
        else scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }

  addEventListener("hashchange", route);
  route();


  // Row hover preview interactions
  d.querySelectorAll(".row").forEach(function (row) {
    row.addEventListener("mouseenter", function () {
      if (pv) {
        if (row.dataset.img) {
          pv.classList.add("is-dialogue");
          pv.style.background = "";
          pv.innerHTML =
            '<div class="dialogue-inner"><img src="' +
            row.dataset.img +
            '" alt="' +
            (row.dataset.l || "Preview") +
            '"></div>';
        } else {
          pv.classList.remove("is-dialogue");
          pv.innerHTML = "";
          pv.style.background = row.dataset.c;
          pv.textContent = row.dataset.l;
        }
        pv.classList.add("on");
      }
      if (!run) {
        run = true;
        loop();
      }
    });

    row.addEventListener("mouseleave", function () {
      if (pv) {
        pv.classList.remove("on");
      }
      setTimeout(function () {
        if (pv && !pv.classList.contains("on")) {
          run = false;
          pv.classList.remove("is-dialogue");
          pv.innerHTML = "";
        }
      }, 500);
    });

    row.addEventListener("mousemove", function (e) {
      tx = e.clientX + 20;
      ty = e.clientY - 200;
    });
  });

  // Toast notification helper
  var toastTimer = null;
  function showToast(msg) {
    var toast = d.getElementById("toast-notice");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2800);
  }

  // Copy email utility
  function copyEmailToClipboard(btn, defaultText) {
    var email = "vjaissy@gmail.com";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(
        function () {
          if (btn) {
            btn.textContent = "Copied";
            setTimeout(function () {
              btn.textContent = defaultText;
            }, 2000);
          }
          showToast("Email copied to clipboard");
        },
        function () {
          fallbackCopy(email, btn, defaultText);
        }
      );
    } else {
      fallbackCopy(email, btn, defaultText);
    }
  }

  function fallbackCopy(text, btn, defaultText) {
    try {
      var ta = d.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      d.body.appendChild(ta);
      ta.select();
      d.execCommand("copy");
      d.body.removeChild(ta);
      if (btn) {
        btn.textContent = "Copied";
        setTimeout(function () {
          btn.textContent = defaultText;
        }, 2000);
      }
      showToast("Email copied to clipboard");
    } catch (err) {
      showToast(text);
    }
  }

  // Big email link copy on click
  var bigEmailLink = d.querySelector(".big[href^='mailto:']");
  if (bigEmailLink) {
    bigEmailLink.addEventListener("click", function () {
      copyEmailToClipboard(null, "");
    });
  }

  // Header Copy Email link
  var topCopyBtn = d.getElementById("copy-email-top-btn");
  if (topCopyBtn) {
    topCopyBtn.addEventListener("click", function () {
      copyEmailToClipboard(topCopyBtn, "Copy email");
    });
  }

  // Contact form handling
  var contactForm = d.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (d.getElementById("contact-name").value || "").trim();
      var email = (d.getElementById("contact-email").value || "").trim();
      var message = (d.getElementById("contact-message").value || "").trim();

      var fullSubject = "Portfolio message from " + (name || "visitor");
      var fullBody =
        message +
        "\n\n---\n" +
        name +
        "\n" +
        email;

      var mailtoUrl =
        "mailto:vjaissy@gmail.com?subject=" +
        encodeURIComponent(fullSubject) +
        "&body=" +
        encodeURIComponent(fullBody);

      var gmailUrl =
        "https://mail.google.com/mail/?view=cm&fs=1&to=vjaissy@gmail.com&su=" +
        encodeURIComponent(fullSubject) +
        "&body=" +
        encodeURIComponent(fullBody);

      var status = d.getElementById("contact-status");
      if (status) {
        status.innerHTML =
          '<span class="status-success">Opening your email app... If you prefer webmail, <a href="' +
          gmailUrl +
          '" target="_blank" rel="noopener noreferrer">send via Gmail ↗</a></span>';
      }

      showToast("Opening email composer...");
      window.location.href = mailtoUrl;
    });
  }
})();
