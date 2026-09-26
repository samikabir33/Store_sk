export function money(n) {
  return "৳ " + Number(n).toLocaleString("en-BD");
}

export function genOrderNumber() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FF${y}${m}-${rand}`;
}
