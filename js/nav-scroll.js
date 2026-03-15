(function () {
  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("site-nav-toggle");
  var panel = document.getElementById("site-nav-panel");

  if (!nav) {
    return;
  }

  var dockAt = 72;
  var undockAt = 4;
  var current = "top";
  var ticking = false;

  function updateThresholds() {
    var navHeight = nav.offsetHeight || 68;
    dockAt = Math.max(56, Math.round(navHeight));
    undockAt = 4;
  }

  function setMenuOpen(isOpen) {
    if (!toggle || !panel) {
      return;
    }

    nav.setAttribute("data-menu-open", isOpen ? "true" : "false");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }

  function setState(next) {
    if (next === current) {
      return;
    }
    current = next;
    nav.setAttribute("data-nav-state", next);
  }

  function onScroll() {
    ticking = false;
    if (current === "top" && window.scrollY > dockAt) {
      setState("docked");
      return;
    }
    if (current === "docked" && window.scrollY < undockAt) {
      setState("top");
    }
  }

  function syncState() {
    if (window.scrollY > dockAt) {
      setState("docked");
      return;
    }
    setState("top");
  }

  function onScrollRaf() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }

  function isMenuOpen() {
    return nav.getAttribute("data-menu-open") === "true";
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      setMenuOpen(!isMenuOpen());
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 1280px)").matches) {
        setMenuOpen(false);
      }
      updateThresholds();
      syncState();
    });
  }

  updateThresholds();
  syncState();
  window.requestAnimationFrame(function () {
    nav.setAttribute("data-nav-ready", "true");
  });
  window.addEventListener("pageshow", syncState);
  window.addEventListener("scroll", onScrollRaf, { passive: true });
})();
