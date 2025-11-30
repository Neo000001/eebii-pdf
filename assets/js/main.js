// Theme toggle (auto / light / dark)
(function () {
  const html = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const cycleTheme = () => {
    const current = html.getAttribute("data-theme") || "auto";
    const next = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
    html.setAttribute("data-theme", next);
    localStorage.setItem("pdfsuite-theme", next);
    btn.title = `Theme: ${next}`;
  };

  const saved = localStorage.getItem("pdfsuite-theme");
  if (saved) {
    html.setAttribute("data-theme", saved);
    btn.title = `Theme: ${saved}`;
  } else {
    html.setAttribute("data-theme", "auto");
    btn.title = "Theme: auto";
  }

  btn.addEventListener("click", cycleTheme);
})();

// Tools tabs switching
(function () {
  const tabs = document.querySelectorAll(".tool-tab");
  const panels = document.querySelectorAll(".tools-panel");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) =>
        p.classList.toggle("active", p.getAttribute("data-panel") === target)
      );
      tab.classList.add("active");
    });
  });
})();
