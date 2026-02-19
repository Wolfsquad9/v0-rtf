export async function exportToPDF() {
  try {
    const html2canvasModule = await import("html2canvas")
    const html2canvas = html2canvasModule.default
    const jsPDFModule = await import("jspdf")
    const jsPDF = jsPDFModule.default

    const element = document.getElementById("planner-content")
    if (!element) {
      throw new Error("Planner content not found")
    }

    // Show loading state
    const loadingToast = document.createElement("div")
    loadingToast.textContent = "Generating PDF... This may take a moment."
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

    // Capture with high quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    const pdf = new jsPDF("p", "mm", "a4")
    let position = 0

    // Add first page
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Generate filename with date
    const date = new Date().toISOString().split("T")[0]
    const filename = `RTF-Training-Plan-${date}.pdf`

    pdf.save(filename)

    // Remove loading toast
    document.body.removeChild(loadingToast)

    // Show success toast
    const successToast = document.createElement("div")
    successToast.textContent = "✓ PDF exported successfully!"
    successToast.style.cssText = loadingToast.style.cssText
    successToast.style.background = "#14532d"
    successToast.style.color = "#4ade80"
    document.body.appendChild(successToast)
    setTimeout(() => document.body.removeChild(successToast), 3000)
  } catch (error) {
    console.error("PDF export failed:", error)
    alert("Failed to export PDF. Please try again.")
  }
}
