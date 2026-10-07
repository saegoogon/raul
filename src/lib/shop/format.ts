export function formatPrice(centsWon: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(centsWon);
}

export function activePrice(price: number, salePrice: number | null) {
  return salePrice ?? price;
}
