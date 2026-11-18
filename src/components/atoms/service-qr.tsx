// Deterministic QR-style matrix drawn from the opaque token.
// Demo only — the real app would use the `qrcode` package to encode a scannable URL.
export function ServiceQr({ token, size = 184 }: { token: string; size?: number }) {
  const n = 25;
  let h = 2166136261;
  const bits: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h ^= token.charCodeAt(i % token.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    bits.push((h & 0b1000) !== 0);
  }
  const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && bits[y * n + x]) cells.push({ x, y });
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox} y={oy} width={7} height={7} fill="#0f2440" />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill="#0f2440" />
    </g>
  );
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label="Service QR code" className="rounded-lg bg-white">
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="#fff" />
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1.02} height={1.02} fill="#0f2440" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}
