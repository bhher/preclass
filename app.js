function getTabs(root) {
  const tablist = root.querySelector("[data-tablist]");
  const tabs = Array.from(root.querySelectorAll("[data-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-panel]"));
  return { tablist, tabs, panels };
}

function focusEl(el, { preventScroll = true } = {}) {
  if (!el) return;
  try {
    el.focus({ preventScroll });
  } catch {
    el.focus();
  }
}

function setActive({ tabs, panels }, nextTab, { focus = false, preventScroll = true } = {}) {
  const nextId = nextTab.getAttribute("aria-controls");

  tabs.forEach((t) => {
    const selected = t === nextTab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
  });

  panels.forEach((p) => {
    const isActive = p.id === nextId;
    p.hidden = !isActive;
  });

  if (focus) focusEl(nextTab, { preventScroll });
}

function moveFocus({ tabs }, currentIndex, delta) {
  const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
  tabs[nextIndex].focus();
}

function getInitialTab(api) {
  const preselected = api.tabs.find((t) => t.getAttribute("aria-selected") === "true");
  return preselected ?? api.tabs[0] ?? null;
}

function initTabs(root) {
  const api = getTabs(root);
  if (!api.tablist || api.tabs.length === 0 || api.panels.length === 0) return;

  // Ensure consistent initial state (one selected tab, others hidden)
  const initial = getInitialTab(api);
  if (initial) setActive(api, initial, { focus: false });

  api.tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      // Safety: if someone later changes tab into a link, avoid scroll-to-top (#)
      e.preventDefault?.();
      // Click already focuses the button; avoid forcing focus which can cause scroll jump.
      setActive(api, tab, { focus: false });
    });
  });

  api.tablist.addEventListener("keydown", (e) => {
    const currentIndex = api.tabs.findIndex((t) => t === document.activeElement);
    if (currentIndex === -1) return;

    const key = e.key;

    // 요구사항: ←/→로 "변경"(= 선택 + 패널 전환)
    if (key === "ArrowRight" || key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % api.tabs.length;
      setActive(api, api.tabs[nextIndex], { focus: true, preventScroll: true });
    } else if (key === "ArrowLeft" || key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = (currentIndex - 1 + api.tabs.length) % api.tabs.length;
      setActive(api, api.tabs[nextIndex], { focus: true, preventScroll: true });
    } else if (key === "Home") {
      e.preventDefault();
      setActive(api, api.tabs[0], { focus: true, preventScroll: true });
    } else if (key === "End") {
      e.preventDefault();
      setActive(api, api.tabs[api.tabs.length - 1], { focus: true, preventScroll: true });
    } else if (key === "Enter" || key === " ") {
      // Enter/Space도 동일하게 동작 (이미 선택된 탭이어도 재확인용)
      e.preventDefault();
      const tab = document.activeElement;
      if (tab && tab.matches?.("[data-tab]")) setActive(api, tab, { focus: true, preventScroll: true });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-tabs]").forEach((root) => initTabs(root));
});


