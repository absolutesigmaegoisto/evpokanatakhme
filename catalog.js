const rental = window.Rental;

if (!rental) {
  console.error("Rental core не найден");
} else {
  const {
    changeStatus,
    formatDate,
    formatPrice,
    getFilteredEquipment,
    getStats,
    removeEquipment,
    subscribe,
  } = rental;

  const dom = {
    search: document.getElementById("search-input"),
    status: document.getElementById("status-filter"),
    condition: document.getElementById("condition-filter"),
    tableBody: document.getElementById("equipment-body"),
    emptyState: document.getElementById("empty-state"),
    rowTemplate: document.getElementById("row-template"),
    statAvailable: document.querySelector('[data-stat="available"]'),
    issueModal: document.getElementById("issue-modal"),
    issueEqId: document.getElementById("issue-eq-id"),
    issueForm: document.getElementById("issue-person-form"),
  };

  const filters = {
    search: "",
    status: "all",
    condition: "all",
  };

  dom.search?.addEventListener("input", (event) => {
    filters.search = event.target.value;
    renderList();
  });

  dom.status?.addEventListener("change", (event) => {
    filters.status = event.target.value;
    renderList();
  });

  dom.condition?.addEventListener("change", (event) => {
    filters.condition = event.target.value;
    renderList();
  });

  dom.tableBody?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const row = button.closest("tr");
    const id = row?.dataset?.id;
    if (!id) return;

    if (button.dataset.action === "issue") {
      openIssueModal(id);
    } else if (button.dataset.action === "return") {
      const { ok, error } = changeStatus({ id, targetStatus: "available", note: "Возвращено из каталога" });
      if (!ok) alert(error);
    } else if (button.dataset.action === "remove") {
      if (confirm("Удалить запись?")) {
        const { ok, error } = removeEquipment(id);
        if (!ok) alert(error);
      }
    }
  });

  subscribe(() => {
    const stats = getStats();
    if (dom.statAvailable) dom.statAvailable.textContent = stats.available;
    renderList();
  });

  renderList();

  function renderList() {
    if (!dom.tableBody || !dom.rowTemplate) return;
    const list = getFilteredEquipment(filters);
    dom.tableBody.innerHTML = "";
    dom.emptyState.hidden = list.length > 0;

    list.forEach((item) => {
      const fragment = dom.rowTemplate.content.cloneNode(true);
      const row = fragment.querySelector("tr");
      row.dataset.id = item.id;

      fragment.querySelector('[data-field="id"]').textContent = item.id;
      fragment.querySelector('[data-field="name"]').textContent = item.name;
      fragment.querySelector('[data-field="price"]').textContent = formatPrice(item.price);
      const statusCell = fragment.querySelector('[data-field="status"]');
      statusCell.textContent = formatStatus(item.status);
      statusCell.className = getStatusBadge(item.status);
      fragment.querySelector('[data-field="condition"]').textContent = item.condition;
      fragment.querySelector('[data-field="note"]').textContent = item.note || "—";
      fragment.querySelector('[data-field="updated"]').textContent = formatDate(item.updatedAt);

      const issueBtn = fragment.querySelector('[data-action="issue"]');
      const returnBtn = fragment.querySelector('[data-action="return"]');
      issueBtn.disabled = item.status !== "available";
      returnBtn.disabled = item.status === "available";

      dom.tableBody.appendChild(fragment);
    });
  }

  function formatStatus(value) {
    if (value === "available") return "В наличии";
    if (value === "issued") return "Выдано";
    if (value === "service") return "На обслуживании";
    return value ?? "—";
  }

  function getStatusBadge(value) {
    return `status-badge ${
      value === "available"
        ? "status-available"
        : value === "issued"
        ? "status-issued"
        : value === "service"
        ? "status-service"
        : ""
    }`;
  }

  let currentIssueId = null;

  function openIssueModal(id) {
    currentIssueId = id;
    if (dom.issueEqId) dom.issueEqId.textContent = id;
    if (dom.issueModal) dom.issueModal.classList.remove("hidden");
  }

  function closeIssueModal() {
    currentIssueId = null;
    if (dom.issueForm) dom.issueForm.reset();
    if (dom.issueModal) dom.issueModal.classList.add("hidden");
  }

  dom.issueForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentIssueId) return;

    const formData = new FormData(dom.issueForm);
    const payload = {
      id: currentIssueId,
      targetStatus: "issued",
      note: formData.get("note"),
      personId: formData.get("personId"),
      email: formData.get("email"),
      iin: formData.get("iin"),
      phone: formData.get("phone"),
      deposit: formData.get("deposit"),
    };

    const { ok, error } = changeStatus(payload);
    if (!ok) {
      alert(error);
      return;
    }
    closeIssueModal();
  });

  dom.issueModal?.addEventListener("click", (event) => {
    if (event.target === dom.issueModal) {
      closeIssueModal();
    }
  });

  document.querySelectorAll('[data-close="issue-modal"]').forEach((btn) => {
    btn.addEventListener("click", closeIssueModal);
  });
}

