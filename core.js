(() => {
  const STORAGE_KEY = "rental-equipment-v2";
  const LEGACY_KEY = "rental-equipment";
  const HISTORY_LIMIT = 60;

  const defaultEquipment = [
    { id: "EQ-001", name: "Гироскутер «Летающий ёж»", price: 32000, status: "available", condition: "хорошее", note: "Готов к прогулкам" },
    { id: "EQ-002", name: "Mac Mini M2 «Студийный»", price: 95000, status: "available", condition: "отличное", note: "Для монтажа" },
    { id: "EQ-003", name: "Соковыжималка «Апельсинатор 3000»", price: 18000, status: "service", condition: "требует ремонта", note: "Шумит на максимуме" },
    { id: "EQ-004", name: "Робот-пылесос «Пёсик-робо»", price: 28000, status: "issued", condition: "хорошее", note: "Уехал в офис №2" },
    { id: "EQ-005", name: "VR-гарнитура «Глубокий сон»", price: 54000, status: "available", condition: "отличное", note: "" },
    { id: "EQ-006", name: "3D-принтер «Пластилиномёт»", price: 47000, status: "service", condition: "удовлетворительное", note: "Нужна калибровка" },
    { id: "EQ-007", name: "Дрон «Почтальон-лайт»", price: 61000, status: "issued", condition: "хорошее", note: "Тесты доставки" },
    { id: "EQ-008", name: "Кофеварка «Бодрый инженер»", price: 15000, status: "available", condition: "отличное", note: "" },
    { id: "EQ-009", name: "Комплект микрофонов «Подкастер PRO»", price: 38000, status: "available", condition: "отличное", note: "" },
    { id: "EQ-010", name: "Осветительный комплект «Солнышко XL»", price: 42000, status: "issued", condition: "хорошее", note: "Съёмка рекламы" },
    { id: "EQ-011", name: "Экшн-камера «Шмель»", price: 22000, status: "available", condition: "отличное", note: "" },
    { id: "EQ-012", name: "Лазерный уровень «Ровный Вася»", price: 12000, status: "available", condition: "хорошее", note: "" },
    { id: "EQ-013", name: "Ноутбук «Ультралайт 14»", price: 78000, status: "issued", condition: "хорошее", note: "Командировка" },
    { id: "EQ-014", name: "Планшет «Штабной»", price: 36000, status: "available", condition: "отличное", note: "" },
    { id: "EQ-015", name: "Проектор «Кинотеатр в кармане»", price: 40000, status: "service", condition: "удовлетворительное", note: "Замена лампы" },
    { id: "EQ-016", name: "Геймпад «Тестер UX»", price: 9000, status: "available", condition: "отличное", note: "" },
    { id: "EQ-017", name: "Станция бесперебойного питания «Жужа»", price: 51000, status: "available", condition: "хорошее", note: "" },
    { id: "EQ-018", name: "Смарт-колонка «Директор»", price: 8000, status: "available", condition: "отличное", note: "" },
    { id: "EQ-019", name: "Телепромптер «Честный взгляд»", price: 26000, status: "available", condition: "хорошее", note: "" },
    { id: "EQ-020", name: "Набор датчиков «Интернет вещей»", price: 30000, status: "service", condition: "удовлетворительное", note: "Нужна перепрошивка" },
  ].map((item, index) => ({
    ...item,
    updatedAt: new Date(Date.now() - index * 3_600_000).toISOString(),
  }));

  const numberFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  });

  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const historyMeta = {
    add: { icon: "+", label: "Добавлено" },
    issue: { icon: "⇄", label: "Выдано" },
    return: { icon: "↩", label: "Возвращено" },
    service: { icon: "⚙", label: "Сервис" },
    remove: { icon: "×", label: "Удалено" },
    update: { icon: "•", label: "Обновлено" },
  };

  const store = {
    state: loadState(),
    listeners: new Set(),
  };

  if (!store.state.equipments.length) {
    store.state = {
      equipments: clone(defaultEquipment),
      history: [],
    };
    persist();
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalizeState(JSON.parse(raw));

      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        return normalizeState({ equipments: JSON.parse(legacy), history: [] });
      }
    } catch (error) {
      console.error("Не удалось прочитать данные", error);
    }
    return { equipments: [], history: [] };
  }

  function normalizeState(payload) {
    const equipments = Array.isArray(payload?.equipments)
      ? payload.equipments
      : Array.isArray(payload)
      ? payload
      : [];
    const history = Array.isArray(payload?.history) ? payload.history : [];
    return { equipments, history };
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state));
  }

  function notify() {
    store.listeners.forEach((listener) => listener(store.state));
  }

  function clone(data) {
    try {
      return structuredClone(data);
    } catch {
      return JSON.parse(JSON.stringify(data));
    }
  }

  function getState() {
    return store.state;
  }

  function subscribe(listener) {
    store.listeners.add(listener);
    listener(store.state);
    return () => store.listeners.delete(listener);
  }

  function formatPrice(value) {
    return numberFormatter.format(value || 0);
  }

  function formatDate(value) {
    if (!value) return "—";
    try {
      return dateFormatter.format(new Date(value));
    } catch {
      return value;
    }
  }

  function getStats(state = store.state) {
    const total = state.equipments.length;
    const available = state.equipments.filter((item) => item.status === "available").length;
    const issued = state.equipments.filter((item) => item.status === "issued").length;
    const service = state.equipments.filter((item) => item.status === "service").length;
    const cost = state.equipments.reduce((sum, item) => sum + (item.price || 0), 0);
    return { total, available, issued, service, cost };
  }

  function addEquipment(payload) {
    const id = payload.id?.trim();
    const name = payload.name?.trim();
    const price = Number(payload.price);
    const condition = payload.condition || "отличное";
    const status = payload.status || (payload.inService ? "available" : "service");

    if (!id || !name || Number.isNaN(price)) {
      return { ok: false, error: "Заполни все поля" };
    }

    if (store.state.equipments.some((item) => item.id.toLowerCase() === id.toLowerCase())) {
      return { ok: false, error: "ID уже существует" };
    }

    const entry = {
      id,
      name,
      price,
      status,
      condition,
      note: payload.note ?? "",
      updatedAt: new Date().toISOString(),
    };

    store.state.equipments.unshift(entry);
    pushHistory("add", entry, payload.historyNote ?? "Добавлено вручную");
    persist();
    notify();
    return { ok: true, item: entry };
  }

  function changeStatus({
    id,
    targetStatus,
    note = "",
    condition,
    personId,
    email,
    iin,
    phone,
    deposit,
  }) {
    const index = store.state.equipments.findIndex(
      (item) => item.id.toLowerCase() === id?.trim().toLowerCase()
    );
    if (index < 0) return { ok: false, error: "ID не найден" };

    const current = store.state.equipments[index];
    if (targetStatus === "issued" && current.status !== "available") {
      return { ok: false, error: "Можно выдать только то, что в наличии" };
    }
    if (targetStatus === "available" && current.status === "available") {
      return { ok: false, error: "Элемент уже в наличии" };
    }

    const updated = {
      ...current,
      status: targetStatus,
      note: note || current.note,
      updatedAt: new Date().toISOString(),
    };
    if (condition) updated.condition = condition;

    if (targetStatus === "issued") {
      const numericDeposit = Number(deposit);
      updated.holder = {
        id: personId || "",
        email: email || "",
        iin: iin || "",
        phone: phone || "",
        deposit: Number.isFinite(numericDeposit) && numericDeposit > 0 ? numericDeposit : 0,
      };
    }

    if (targetStatus === "available") {
      updated.holder = null;
    }

    store.state.equipments[index] = updated;

    const historyType =
      targetStatus === "issued"
        ? "issue"
        : targetStatus === "available"
        ? "return"
        : targetStatus === "service"
        ? "service"
        : "update";

    pushHistory(historyType, updated, note);
    persist();
    notify();
    return { ok: true, item: updated };
  }

  function removeEquipment(id) {
    const index = store.state.equipments.findIndex(
      (item) => item.id.toLowerCase() === id?.trim().toLowerCase()
    );
    if (index < 0) return { ok: false, error: "ID не найден" };

    const [removed] = store.state.equipments.splice(index, 1);
    pushHistory("remove", removed, "Удалено вручную");
    persist();
    notify();
    return { ok: true };
  }

  function getFilteredEquipment(filters = {}) {
    const search = (filters.search ?? "").trim().toLowerCase();
    const status = filters.status ?? "all";
    const condition = filters.condition ?? "all";

    return store.state.equipments.filter((item) => {
      const matchesSearch =
        !search ||
        item.id.toLowerCase().includes(search) ||
        item.name.toLowerCase().includes(search) ||
        (item.note ?? "").toLowerCase().includes(search);
      const matchesStatus = status === "all" || item.status === status;
      const matchesCondition =
        condition === "all" ||
        (item.condition ?? "").toLowerCase() === condition.toLowerCase();
      return matchesSearch && matchesStatus && matchesCondition;
    });
  }

  function pushHistory(type, item, note) {
    const meta = historyMeta[type] ?? { icon: "∙", label: type };
    store.state.history.unshift({
      id: crypto.randomUUID?.() ?? `hist-${Date.now()}-${Math.random()}`,
      type,
      icon: meta.icon,
      label: meta.label,
      itemId: item.id,
      name: item.name,
      note,
      timestamp: new Date().toISOString(),
    });
    store.state.history = store.state.history.slice(0, HISTORY_LIMIT);
  }

  function resetDemoData() {
    store.state = { equipments: clone(defaultEquipment), history: [] };
    persist();
    notify();
  }

  function seedDemoData() {
    const existing = new Set(store.state.equipments.map((item) => item.id.toLowerCase()));
    let added = 0;
    defaultEquipment.forEach((item) => {
      if (!existing.has(item.id.toLowerCase())) {
        store.state.equipments.push({ ...item, updatedAt: new Date().toISOString() });
        added += 1;
      }
    });
    if (added) {
      persist();
      notify();
    }
    return added;
  }

  window.Rental = {
    addEquipment,
    changeStatus,
    formatDate,
    formatPrice,
    getFilteredEquipment,
    getState,
    getStats,
    removeEquipment,
    resetDemoData,
    seedDemoData,
    subscribe,
  };
})();

