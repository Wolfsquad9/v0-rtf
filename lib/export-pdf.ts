// Browser-compatible export using native print functionality
export async function exportToPDF() {
  try {
    // Show loading state
    const loadingToast = document.createElement("div")
    loadingToast.textContent = "Preparing print view..."
    loadingToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #18181b;
      color: #fbbf24;
      padding: 16px 24px;
      border-radius: 8px;
      border: 1px solid #27272a;
      font-family: monospace;
      z-index: 9999;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `
    document.body.appendChild(loadingToast)

    // Small delay to show toast
    await new Promise(resolve => setTimeout(resolve, 500))

    // Remove loading toast before print dialog
    document.body.removeChild(loadingToast)

    // Use browser's native print functionality (user can save as PDF)
    window.print()

    // Show success toast after print dialog closes
    setTimeout(() => {
      const successToast = document.createElement("div")
      successToast.textContent = "Use 'Save as PDF' in the print dialog"
      successToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #14532d;
        color: #4ade80;
        padding: 16px 24px;
        border-radius: 8px;
        border: 1px solid #27272a;
        font-family: monospace;
        z-index: 9999;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      `
      document.body.appendChild(successToast)
      setTimeout(() => {
        if (successToast.parentNode) {
          document.body.removeChild(successToast)
        }
      }, 4000)
    }, 100)
  } catch (error) {
    console.error("PDF export failed:", error)
    alert("Failed to open print dialog. Please try again.")
  }
}
