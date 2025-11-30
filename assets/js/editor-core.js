let pdfDoc = null;
let currentPage = 1;
let currentScale = 1.0;
let pdfBytesOriginal = null;

const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const zoomOutBtn = document.getElementById("zoom-out-btn");
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomLabel = document.getElementById("zoom-label");
const downloadBtn = document.getElementById("download-btn");
const dropHint = document.getElementById("drop-hint");
const canvasWrapper = document.getElementById("canvas-wrapper");
const pagesList = document.getElementById("pages-list");

const PDFJS = window["pdfjsLib"];
if (PDFJS) {
  PDFJS.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js";
}

async function loadPdfFromFile(file) {
  pdfBytesOriginal = await file.arrayBuffer();
  const loadingTask = PDFJS.getDocument({ data: pdfBytesOriginal });
  pdfDoc = await loadingTask.promise;
  currentPage = 1;
  currentScale = 1.0;
  renderPage(currentPage);
  buildPagesList();
  downloadBtn.disabled = false;
  if (dropHint) dropHint.style.display = "none";
}

async function renderPage(pageNum) {
  if (!pdfDoc) return;
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: currentScale });
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  canvas.style.display = "block";

  const renderContext = {
    canvasContext: ctx,
    viewport,
  };

  await page.render(renderContext).promise;
  zoomLabel.textContent = Math.round(currentScale * 100) + "%";
}

function buildPagesList() {
  pagesList.innerHTML = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const div = document.createElement("div");
    div.className = "page-thumb" + (i === currentPage ? " active" : "");
    div.textContent = "Page " + i;
    div.dataset.page = i;
    div.addEventListener("click", () => {
      currentPage = i;
      document
        .querySelectorAll(".page-thumb")
        .forEach((el) => el.classList.remove("active"));
      div.classList.add("active");
      renderPage(currentPage);
    });
    pagesList.appendChild(div);
  }
}

// Event handlers
if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      loadPdfFromFile(file);
    }
  });
}

// Drag & drop
if (canvasWrapper) {
  ["dragenter", "dragover"].forEach((eventName) => {
    canvasWrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvasWrapper.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    canvasWrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvasWrapper.classList.remove("dragging");
    });
  });

  canvasWrapper.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      loadPdfFromFile(file);
    }
  });
}

// Zoom
if (zoomInBtn) {
  zoomInBtn.addEventListener("click", () => {
    if (!pdfDoc) return;
    currentScale = Math.min(currentScale + 0.1, 3);
    renderPage(currentPage);
  });
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener("click", () => {
    if (!pdfDoc) return;
    currentScale = Math.max(currentScale - 0.1, 0.3);
    renderPage(currentPage);
  });
}

// Download (for now: just original file again – later we'll export edited PDF)
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    if (!pdfBytesOriginal) return;
    const blob = new Blob([pdfBytesOriginal], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited.pdf";
    a.click();
    URL.revokeObjectURL(url);
  });
}
