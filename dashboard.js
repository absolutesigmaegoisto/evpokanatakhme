const rental = window.Rental;

if (!rental) {
  console.error("Rental core не найден");
} else {
  const { formatDate, formatPrice, getStats, resetDemoData, subscribe } = rental;

  const dom = {
    heroTotal: document.getElementById("hero-total"),
    statTotal: document.querySelector('[data-stat="total"]'),
    statAvailable: document.querySelector('[data-stat="available"]'),
    statIssued: document.querySelector('[data-stat="issued"]'),
    statService: document.querySelector('[data-stat="service"]'),
    statCost: document.querySelector('[data-stat="cost"]'),
    historyList: document.getElementById("history-list"),
    historyEmpty: document.getElementById("history-empty"),
    historyTemplate: document.getElementById("history-template"),
    resetBtn: document.getElementById("reset-data"),
  };

  dom.resetBtn?.addEventListener("click", () => {
    if (confirm("Сбросить состояние к демо-набору?")) {
      resetDemoData();
    }
  });

  subscribe(render);

  function render(state) {
    const stats = getStats(state);
    if (dom.heroTotal) dom.heroTotal.textContent = `${stats.total} ед.`;
    if (dom.statTotal) dom.statTotal.textContent = stats.total;
    if (dom.statAvailable) dom.statAvailable.textContent = stats.available;
    if (dom.statIssued) dom.statIssued.textContent = stats.issued;
    if (dom.statService) dom.statService.textContent = stats.service;
    if (dom.statCost) dom.statCost.textContent = formatPrice(stats.cost);
    renderHistory(state.history);
  }

  function renderHistory(history) {
    if (!dom.historyList || !dom.historyTemplate) return;
    dom.historyList.innerHTML = "";
    dom.historyEmpty.hidden = history.length > 0;

    history.forEach((entry) => {
      const fragment = dom.historyTemplate.content.cloneNode(true);
      fragment.querySelector('[data-field="icon"]').textContent = entry.icon;
      fragment.querySelector('[data-field="title"]').textContent = `${entry.label}: ${entry.itemId} · ${entry.name}`;
      fragment.querySelector('[data-field="time"]').textContent = `${formatDate(entry.timestamp)}${entry.note ? ` · ${entry.note}` : ""}`;
      dom.historyList.appendChild(fragment);
    });
  }
}


