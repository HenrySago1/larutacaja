export function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return `${amount.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;
}
