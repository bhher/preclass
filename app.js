function getTabs(root) {
  const tablist = root.querySelector("[data-tablist]");
  const tabs = Array.from(root.querySelectorAll("[data-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-panel]"));
  return { tablist, tabs, panels };
}

function setActive({ tabs, panels }, nextTab) {
  const nextId = nextTab.getAttribute("aria-controls");

  tabs.forEach((t) => {
    const selected = t === nextTab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
  });

  panels.forEach((p) => {
    const isActive = p.id === nextId;
    p.classList.toggle("is-hidden", !isActive);
  });

  nextTab.focus();
}

function moveFocus({ tabs }, currentIndex, delta) {
  const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
  tabs[nextIndex].focus();
}

function initTabs() {
  const root = document.querySelector(".tabs");
  if (!root) return;

  const api = getTabs(root);

  api.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setActive(api, tab));
  });

  api.tablist?.addEventListener("keydown", (e) => {
    const currentIndex = api.tabs.findIndex((t) => t === document.activeElement);
    if (currentIndex === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveFocus(api, currentIndex, 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(api, currentIndex, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      api.tabs[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      api.tabs[api.tabs.length - 1].focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const tab = document.activeElement;
      if (tab && tab.matches?.("[data-tab]")) setActive(api, tab);
    }
  });
}

initTabs();


