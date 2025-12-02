const rental = window.Rental;

if (!rental) {
  console.error("Rental core не найден");
} else {
  const { changeStatus, formatDate, getStats, subscribe } = rental;

  const dom = {
    issueForm: document.getElementById("issue-form"),
    returnForm: document.getElementById("return-form"),
    heroTotal: document.getElementById("hero-total"),
    historyList: document.getElementById("history-list"),
    historyEmpty: document.getElementById("history-empty"),
    historyTemplate: document.getElementById("history-template"),
  };

  dom.issueForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleStatus(event.currentTarget, "issued");
  });

  dom.returnForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleStatus(event.currentTarget, "available");
  });

  subscribe((state) => {
    const stats = getStats(state);
    if (dom.heroTotal) dom.heroTotal.textContent = `${stats.total} ед.`;
    renderHistory(state.history);
  });

  function handleStatus(form, targetStatus) {
    const formData = new FormData(form);
    const payload = {
      id: formData.get("id"),
      targetStatus,
      note: formData.get("note"),
      condition: formData.get("condition"),
    };

    if (targetStatus === "issued") {
      payload.personId = formData.get("personId")?.trim() || "";
      payload.email = formData.get("email")?.trim() || "";
      payload.iin = formData.get("iin")?.trim() || "";
      payload.phone = formData.get("phone")?.trim() || "";
      payload.deposit = formData.get("deposit");
    }

    const result = changeStatus(payload);
    const feedback = form.querySelector(".feedback");

    if (!result.ok) {
      showFeedback(feedback, result.error, true);
      return;
    }

    form.reset();
    showFeedback(feedback, "Готово");
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

  function showFeedback(element, message, isError) {
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? "var(--danger)" : "var(--muted)";
    clearTimeout(element._timer);
    element._timer = setTimeout(() => {
      element.textContent = "";
    }, 3500);
  }
}

