const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat('en-US')

export function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

export function formatUnits(value: number): string {
  return integerFormatter.format(value)
}
