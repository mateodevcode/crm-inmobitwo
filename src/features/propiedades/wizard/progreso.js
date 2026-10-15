// Progreso del wizard (igual que el portal, con prefijo crm: para no chocar).
// - "crm:ultimoAnuncioId": { id, step, timestamp } (step 0 = datos, 1 = detalles, 2 = fotos)
// - "crm:publicarAnuncioForm": snapshot del form (pasos 0-1, autosave 500ms)
const CLAVE_PROGRESO = "crm:ultimoAnuncioId";
const CLAVE_FORM = "crm:publicarAnuncioForm";

export function leerProgreso() {
  try {
    const crudo = localStorage.getItem(CLAVE_PROGRESO);
    if (!crudo) return null;
    const parsed = JSON.parse(crudo);
    if (!parsed || typeof parsed !== "object") return null;
    const id = parsed.id ?? null;
    const step = parsed.step ?? (id ? 2 : 0);
    return { id, step, timestamp: parsed.timestamp ?? null };
  } catch {
    return null;
  }
}

export function guardarProgreso({ id = null, step = 0 } = {}) {
  localStorage.setItem(
    CLAVE_PROGRESO,
    JSON.stringify({ id: id ?? null, step, timestamp: new Date().toISOString() }),
  );
}

export function limpiarProgreso() {
  localStorage.removeItem(CLAVE_PROGRESO);
}

export function guardarSnapshot(form) {
  try {
    const { ...plano } = form;
    delete plano.featuresSel;
    localStorage.setItem(CLAVE_FORM, JSON.stringify(plano));
  } catch {
    /* extra silencioso: no rompe el flujo */
  }
}

export function leerSnapshot() {
  try {
    const crudo = localStorage.getItem(CLAVE_FORM);
    if (!crudo) return null;
    return JSON.parse(crudo);
  } catch {
    return null;
  }
}

export function limpiarTodo() {
  limpiarProgreso();
  try {
    localStorage.removeItem(CLAVE_FORM);
  } catch {
    /* nada */
  }
}
