(function () {
  var tabRoot = document.getElementById("cert-tabs");
  if (!tabRoot) {
    return;
  }

  var tabs = Array.prototype.slice.call(tabRoot.querySelectorAll("[data-cert-tab]"));
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-cert-panel]"));
  if (!tabs.length || !panels.length) {
    return;
  }

  tabRoot.setAttribute("role", "tablist");

  function getTabByKey(key) {
    return tabs.find(function (tab) {
      return tab.getAttribute("data-cert-tab") === key;
    });
  }

  function getPanelByKey(key) {
    return panels.find(function (panel) {
      return panel.getAttribute("data-cert-panel") === key;
    });
  }

  function activate(key, updateHash) {
    var safeKey = getTabByKey(key) ? key : "matter";

    tabs.forEach(function (tab) {
      var selected = tab.getAttribute("data-cert-tab") === safeKey;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.setAttribute("tabindex", selected ? "0" : "-1");
      tab.classList.toggle("cert-tab--active", selected);
      tab.id = "tab-" + tab.getAttribute("data-cert-tab");
      tab.setAttribute("aria-controls", "panel-" + tab.getAttribute("data-cert-tab"));
    });

    panels.forEach(function (panel) {
      var selected = panel.getAttribute("data-cert-panel") === safeKey;
      panel.setAttribute("role", "tabpanel");
      panel.id = "panel-" + panel.getAttribute("data-cert-panel");
      panel.setAttribute("aria-labelledby", "tab-" + panel.getAttribute("data-cert-panel"));
      panel.hidden = !selected;
    });

    if (updateHash) {
      history.replaceState(null, "", "#" + safeKey);
    }
  }

  function fromHash() {
    return window.location.hash ? window.location.hash.replace("#", "") : "matter";
  }

  function focusByOffset(currentIndex, offset) {
    var nextIndex = (currentIndex + offset + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    activate(tabs[nextIndex].getAttribute("data-cert-tab"), true);
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function (event) {
      event.preventDefault();
      activate(tab.getAttribute("data-cert-tab"), true);
    });

    tab.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusByOffset(index, 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusByOffset(index, -1);
      } else if (event.key === "Home") {
        event.preventDefault();
        tabs[0].focus();
        activate(tabs[0].getAttribute("data-cert-tab"), true);
      } else if (event.key === "End") {
        event.preventDefault();
        tabs[tabs.length - 1].focus();
        activate(tabs[tabs.length - 1].getAttribute("data-cert-tab"), true);
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        activate(tab.getAttribute("data-cert-tab"), true);
      }
    });
  });

  window.addEventListener("hashchange", function () {
    activate(fromHash(), false);
  });

  activate(fromHash(), false);
})();
