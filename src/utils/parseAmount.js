export function parseAmount(value) {
  const num = parseFloat(String(value).replace(',', '.'));
  return isNaN(num) ? 0 : num;
}