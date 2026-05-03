import { File as ExpoFile, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const PDF_MARGINS = { top: 24, right: 24, bottom: 24, left: 24 };

type PdfOptions = {
  dialogTitle: string;
  filename: string;
  html: string;
};

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function displayValue(value: string | number | boolean | null | undefined) {
  const text = String(value ?? "").trim();
  return text ? escapeHtml(text) : "&nbsp;";
}

export function sanitizePdfFileName(name: string) {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned || "formulario"}.pdf`;
}

export function pdfField(label: string, value: string | number | boolean | null | undefined, span = 1) {
  return `
    <div class="field span-${span}">
      <div class="field-label">${escapeHtml(label)}</div>
      <div class="field-value">${displayValue(value)}</div>
    </div>
  `;
}

export function pdfSection(title: string, children: string) {
  return `
    <section class="section">
      <div class="section-title">${escapeHtml(title)}</div>
      <div class="section-body">${children}</div>
    </section>
  `;
}

export function pdfGrid(children: string) {
  return `<div class="grid">${children}</div>`;
}

export function pdfChecks(items: { label: string; checked: boolean }[]) {
  return `
    <div class="checks">
      ${items
        .map(
          (item) => `
            <div class="check-item">
              <span class="box">${item.checked ? "X" : ""}</span>
              <span>${escapeHtml(item.label)}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

export function pdfDocument(title: string, subtitle: string, body: string, footer: string) {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page { size: A4; margin: 14mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #fff;
        color: #111827;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        font-size: 10px;
        line-height: 1.25;
      }
      .document { width: 100%; }
      .header {
        border: 2px solid #1d4ed8;
        background: #eff6ff;
        padding: 12px;
        text-align: center;
        margin-bottom: 10px;
      }
      .title {
        color: #1d4ed8;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .subtitle {
        color: #475569;
        font-size: 10px;
        margin-top: 4px;
      }
      .section {
        border: 1px solid #94a3b8;
        margin-top: 8px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .section-title {
        background: #f1f5f9;
        border-bottom: 1px solid #94a3b8;
        color: #0f172a;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .6px;
        padding: 5px 7px;
        text-transform: uppercase;
      }
      .section-body { padding: 7px; }
      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }
      .field {
        border: 1px solid #cbd5e1;
        min-height: 34px;
        padding: 5px 6px;
        break-inside: avoid;
      }
      .span-2 { grid-column: span 2; }
      .span-3 { grid-column: span 3; }
      .span-4 { grid-column: span 4; }
      .field-label {
        color: #475569;
        font-size: 7.5px;
        font-weight: 800;
        letter-spacing: .45px;
        margin-bottom: 3px;
        text-transform: uppercase;
      }
      .field-value {
        color: #111827;
        font-size: 11px;
        font-weight: 700;
        min-height: 15px;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .checks {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px 10px;
      }
      .check-item {
        align-items: center;
        display: flex;
        gap: 5px;
        min-height: 18px;
      }
      .box {
        border: 1.5px solid #334155;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 13px;
        height: 13px;
        font-size: 9px;
        font-weight: 800;
        line-height: 1;
      }
      .signature {
        border: 1px dashed #64748b;
        height: 54px;
        margin-top: 8px;
        padding: 6px;
        text-align: center;
        color: #64748b;
        font-size: 8px;
        text-transform: uppercase;
      }
      .footer {
        border-top: 1px solid #cbd5e1;
        color: #64748b;
        font-size: 8px;
        margin-top: 10px;
        padding-top: 6px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main class="document">
      <header class="header">
        <div class="title">${escapeHtml(title)}</div>
        <div class="subtitle">${escapeHtml(subtitle)}</div>
      </header>
      ${body}
      <div class="footer">${escapeHtml(footer)}</div>
    </main>
  </body>
</html>
  `;
}

export async function sharePdfFromHtml({ html, filename, dialogTitle }: PdfOptions) {
  const safeFilename = sanitizePdfFileName(filename);

  if (Platform.OS === "web") {
    await Print.printAsync({ html, width: A4_WIDTH, height: A4_HEIGHT });
    Alert.alert("PDF", "Se abrio el dialogo de impresion. Elegi Guardar como PDF.");
    return;
  }

  const pdf = await Print.printToFileAsync({
    html,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    margins: PDF_MARGINS,
  });
  const sourceFile = new ExpoFile(pdf.uri);
  const destFile = new ExpoFile(Paths.cache, safeFilename);

  if (destFile.exists) {
    destFile.delete();
  }

  sourceFile.copy(destFile);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destFile.uri, {
      dialogTitle,
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    });
    return;
  }

  Alert.alert("PDF generado", `Archivo en:\n${destFile.uri}`);
}

export async function printPdfHtml(html: string) {
  await Print.printAsync({
    html,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    margins: PDF_MARGINS,
  });
}
