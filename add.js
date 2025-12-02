const rental = window.Rental;

if (!rental) {
  console.error("Rental core не найден");
} else {
  const { addEquipment, resetDemoData, seedDemoData } = rental;

  const dom = {
    form: document.getElementById("add-form"),
    feedback: document.getElementById("add-feedback"),
    seedBtn: document.getElementById("seed-demo"),
    resetBtn: document.getElementById("reset-data"),
  };

  dom.form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(dom.form);
    const payload = Object.fromEntries(formData.entries());
    payload.inService = formData.get("inService") === "on";

    const result = addEquipment(payload);
    if (!result.ok) {
      showFeedback(result.error, true);
      return;
    }

    dom.form.reset();
    if (dom.form.inService) dom.form.inService.checked = true;
    showFeedback("Оборудование сохранено");
  });

  dom.seedBtn?.addEventListener("click", () => {
    const added = seedDemoData();
    showFeedback(added ? `Добавлено ${added} демо-позиций` : "Все демо уже в каталоге");
  });

  dom.resetBtn?.addEventListener("click", () => {
    if (confirm("Очистить данные и загрузить демо-набор?")) {
      resetDemoData();
      showFeedback("Данные сброшены");
    }
  });

  function showFeedback(message, isError) {
    if (!dom.feedback) return;
    dom.feedback.textContent = message;
    dom.feedback.style.color = isError ? "var(--danger)" : "var(--muted)";
    clearTimeout(dom.feedback._timer);
    dom.feedback._timer = setTimeout(() => {
      dom.feedback.textContent = "";
    }, 3500);
  }
}

