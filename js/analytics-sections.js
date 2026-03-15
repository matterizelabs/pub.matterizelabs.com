(function () {
  if (typeof window === "undefined") {
    return;
  }

  function emit(eventName, props) {
    if (typeof window.plausible !== "function") {
      return;
    }
    window.plausible(eventName, { props: props || {} });
  }

  function now() {
    return Date.now();
  }

  function toSeconds(ms) {
    return Math.max(0, Math.round(ms / 1000));
  }

  function secondsBucket(seconds) {
    if (seconds < 10) return "0-9s";
    if (seconds < 30) return "10-29s";
    if (seconds < 60) return "30-59s";
    if (seconds < 120) return "1-2m";
    if (seconds < 300) return "2-5m";
    return "5m+";
  }

  function scrollDepthBucket() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop || 0;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var pct = Math.min(100, Math.round((scrollTop / max) * 100));
    if (pct < 25) return "0-24%";
    if (pct < 50) return "25-49%";
    if (pct < 75) return "50-74%";
    return "75-100%";
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll("#main-content [data-section]"));
  if (!sections.length) {
    return;
  }

  var seen = new Set();
  var dwell = Object.create(null);
  var active = null;
  var activeAt = 0;

  function trackActiveDuration(until) {
    if (!active || !activeAt) return;
    var elapsed = until - activeAt;
    if (elapsed > 0) {
      dwell[active] = (dwell[active] || 0) + elapsed;
    }
  }

  function setActive(nextSection) {
    var t = now();
    if (active !== nextSection) {
      trackActiveDuration(t);
      active = nextSection;
      activeAt = t;
      if (active && !seen.has(active)) {
        seen.add(active);
        emit("section_view", {
          section: active,
          page: window.location.pathname
        });
      }
    }
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var section = entry.target.getAttribute("data-section");
        if (section) {
          setActive(section);
        }
      });
    },
    {
      root: null,
      rootMargin: "-20% 0px -45% 0px",
      threshold: [0.25, 0.5, 0.75]
    }
  );

  sections.forEach(function (sectionNode) {
    observer.observe(sectionNode);
  });

  var flushDone = false;

  function flush(reason) {
    if (flushDone) return;
    flushDone = true;

    var t = now();
    trackActiveDuration(t);

    Object.keys(dwell).forEach(function (section) {
      var seconds = toSeconds(dwell[section]);
      if (seconds <= 0) return;
      emit("section_dwell", {
        section: section,
        page: window.location.pathname,
        seconds: String(seconds),
        bucket: secondsBucket(seconds)
      });
    });

    emit("page_exit", {
      page: window.location.pathname,
      last_section: active || "unknown",
      scroll_depth: scrollDepthBucket(),
      reason: reason
    });
  }

  document.addEventListener(
    "click",
    function (event) {
      var link = event.target.closest("a[data-flow]");
      if (!link) return;
      emit("cta_click", {
        flow: link.getAttribute("data-flow"),
        page: window.location.pathname,
        target: link.getAttribute("href") || ""
      });
    },
    true
  );

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      flush("hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    flush("pagehide");
  });
})();
