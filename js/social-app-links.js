(function () {
  function isMobile() {
    return window.matchMedia("(max-width: 1023px)").matches;
  }

  function bind(link) {
    var appUrl = link.getAttribute("data-app-url");
    var webUrl = link.getAttribute("data-web-url") || link.getAttribute("href");
    if (!appUrl || !webUrl) {
      return;
    }

    link.addEventListener("click", function (event) {
      if (!isMobile()) {
        return;
      }

      event.preventDefault();

      var fallbackTimer = window.setTimeout(function () {
        window.location.href = webUrl;
      }, 400);

      var onHide = function () {
        window.clearTimeout(fallbackTimer);
        document.removeEventListener("visibilitychange", onHide);
      };

      document.addEventListener("visibilitychange", onHide);
      window.location.href = appUrl;
    });
  }

  document.querySelectorAll(".js-social-link").forEach(bind);
})();
