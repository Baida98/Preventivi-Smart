export function initSecurity() {

  document.addEventListener("contextmenu", e => e.preventDefault());

  document.addEventListener("keydown", e => {
    if (e.ctrlKey && (e.key === "u" || e.key === "s")) {
      e.preventDefault();
    }
  });
}
