export function printPage(documentTitle?: string) {
  const previousTitle = document.title

  if (documentTitle) {
    document.title = documentTitle
  }

  function restoreTitle() {
    document.title = previousTitle
    window.removeEventListener("afterprint", restoreTitle)
  }

  window.addEventListener("afterprint", restoreTitle)
  window.print()
}
