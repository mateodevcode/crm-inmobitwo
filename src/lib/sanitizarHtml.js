import DOMPurify from "dompurify";

// Única puerta para pintar HTML de descripciones (Tiptap) con
// dangerouslySetInnerHTML. Lista blanca estricta: solo las etiquetas que
// produce el editor y solo enlaces http(s), mailto y tel.
const CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "h1", "h2", "h3", "h4",
    "ul", "ol", "li", "a", "blockquote", "code", "pre", "hr", "span",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:)/i,
};

let hookInstalado = false;
function instalarHook() {
  if (hookInstalado || !DOMPurify.isSupported) return;
  // Todo enlace externo abre en pestaña nueva sin acceso a window.opener.
  DOMPurify.addHook("afterSanitizeAttributes", (nodo) => {
    if (nodo.tagName === "A" && nodo.getAttribute("href")) {
      nodo.setAttribute("target", "_blank");
      nodo.setAttribute("rel", "noopener noreferrer nofollow");
    }
  });
  hookInstalado = true;
}

const escapar = (s) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

export function sanitizarHtml(html) {
  if (!html) return "";
  // En el servidor (SSR) no hay DOM: se devuelve solo texto escapado.
  if (typeof window === "undefined" || !DOMPurify.isSupported) {
    return escapar(String(html).replace(/<[^>]*>/g, " "));
  }
  instalarHook();
  return DOMPurify.sanitize(String(html), CONFIG);
}
