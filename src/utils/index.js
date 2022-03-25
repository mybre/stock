export function convertUint (t) {
  let e = Number(t)
  let n = 1
  // eslint-disable-next-line no-sequences,no-return-assign
  return e < 0 && (n = -1),
  e = Math.abs(e),
  // eslint-disable-next-line no-void
  isNaN(e) ? '--' : e < 1e4 ? e.toFixed(2) * n : e >= 1e4 && e < 1e8 ? (e / 1e4).toFixed(2) * n + '万' : e >= 1e8 ? (e / 1e8).toFixed(2) * n + '亿' : void 0
}
