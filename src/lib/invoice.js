import "regenerator-runtime/runtime.js"; // required by @pdf-lib/fontkit's Bengali/Indic script shaping engine
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

const BENGALI_FONT_PATH = path.join(process.cwd(), "src", "lib", "fonts", "NotoSansBengali.ttf");

// Anything outside basic Latin (0x00-0xFF) — e.g. Bengali — needs the embedded
// Noto Sans Bengali font instead of the built-in Helvetica, which can only
// encode Latin/WinAnsi characters.
function needsBengaliFont(str) {
  return /[^\x00-\xFF]/.test(str);
}

function money(n) {
  return `Tk ${Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export async function generateInvoicePdf(order, items) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const bengaliFontBytes = fs.readFileSync(BENGALI_FONT_PATH);
  const bengaliFont = await doc.embedFont(bengaliFontBytes, { subset: true });

  const margin = 48;
  const pageWidth = page.getWidth();
  let y = page.getHeight() - margin;

  // Only two colors are used throughout this invoice: Black and Camellia Rose.
  const pink = rgb(0.922, 0.376, 0.506); // Camellia Rose — #EB6081
  const ink = rgb(0, 0, 0); // Black
  const muted = ink; // previously a light gray — now solid black for readability
  const line = rgb(0.85, 0.85, 0.85);

  function text(str, x, yPos, opts = {}) {
    const value = str === null || str === undefined ? "" : String(str);
    if (!value) return;
    const chosenFont = needsBengaliFont(value) ? bengaliFont : opts.bold ? bold : font;
    page.drawText(value, {
      x,
      y: yPos,
      size: opts.size || 10,
      font: chosenFont,
      color: opts.color || ink,
    });
  }

  function hLine(yPos) {
    page.drawLine({ start: { x: margin, y: yPos }, end: { x: pageWidth - margin, y: yPos }, thickness: 0.75, color: line });
  }

  // ---- Header ----
  text("Fahmida's Fashion", margin, y, { size: 20, bold: true, color: pink });
  text("INVOICE", pageWidth - margin - 70, y, { size: 14, bold: true, color: ink });
  y -= 18;
  text("Timeless designs for the modern woman", margin, y, { size: 9, color: muted });
  y -= 28;
  hLine(y);
  y -= 24;

  // ---- Order meta ----
  text(`Order No: ${order.orderNumber}`, margin, y, { size: 11, bold: true });
  text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-GB")}`, pageWidth - margin - 150, y, { size: 10 });
  y -= 16;
  text(`Status: ${order.status.toUpperCase()}`, margin, y, { size: 10, color: muted });
  text(`Payment: ${order.paymentMethod.toUpperCase()}${order.paymentVerified ? " (Verified)" : ""}`, pageWidth - margin - 200, y, { size: 10, color: muted });
  y -= 28;

  text("Bill To", margin, y, { size: 10, bold: true, color: pink });
  y -= 15;
  text(order.customerName, margin, y, { size: 10 });
  y -= 14;
  text(order.phone + (order.email ? `  ·  ${order.email}` : ""), margin, y, { size: 10, color: muted });
  y -= 14;
  text(order.detailedAddress, margin, y, { size: 10, color: muted });
  y -= 14;
  text(`${order.thana}, ${order.district} (${order.deliveryArea === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})`, margin, y, { size: 10, color: muted });
  y -= 28;
  hLine(y);
  y -= 20;

  // ---- Items table header ----
  const colItem = margin;
  const colVariant = margin + 220;
  const colQty = margin + 330;
  const colPrice = margin + 380;
  const colTotal = pageWidth - margin - 70;

  text("Item", colItem, y, { size: 9, bold: true, color: muted });
  text("Variant", colVariant, y, { size: 9, bold: true, color: muted });
  text("Qty", colQty, y, { size: 9, bold: true, color: muted });
  text("Price", colPrice, y, { size: 9, bold: true, color: muted });
  text("Total", colTotal, y, { size: 9, bold: true, color: muted });
  y -= 8;
  hLine(y);
  y -= 18;

  for (const it of items) {
    if (y < 140) {
      y = page.getHeight() - margin; // simple overflow guard for very long item lists
    }
    text(it.productName, colItem, y, { size: 10 });
    text([it.size, it.color].filter(Boolean).join(" / ") || "—", colVariant, y, { size: 9, color: muted });
    text(String(it.qty), colQty, y, { size: 10 });
    text(money(it.price), colPrice, y, { size: 10 });
    text(money(it.price * it.qty), colTotal, y, { size: 10, bold: true });
    y -= 20;
  }

  y -= 6;
  hLine(y);
  y -= 22;

  // ---- Totals ----
  function totalRow(label, value, opts = {}) {
    text(label, pageWidth - margin - 200, y, { size: 10, color: opts.bold ? ink : muted, bold: !!opts.bold });
    text(value, colTotal, y, { size: 10, bold: !!opts.bold, color: opts.pink ? pink : ink });
    y -= 18;
  }

  totalRow("Subtotal", money(order.subtotal));
  totalRow("Delivery Fee", money(order.deliveryFee));
  if (order.discount > 0) totalRow(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `- ${money(order.discount)}`);
  y -= 4;
  hLine(y);
  y -= 20;
  totalRow("Total", money(order.total), { bold: true, pink: true });

  y -= 30;
  text("Thank you for shopping with Fahmida's Fashion!", margin, y, { size: 10, color: muted });
  y -= 14;
  text("For any questions about this order, please contact us via WhatsApp or the Contact page.", margin, y, { size: 8.5, color: muted });

  return doc.save(); // Uint8Array
}