export function formatRupiah(value: number) {
  const formatted = value
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `Rp ${formatted}`;
}
