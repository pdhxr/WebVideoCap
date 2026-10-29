import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  RetroGrid,
} from "../magicui/retro-grid";

const STROKE = "rgba(195, 195, 200, 0.84)";
/** Columns across the near edge. */
const COLS = 20;
/**
 * How many row-steps along depth. Front row height = near cell width (1:1),
 * using the smaller on-screen pitch as the unit.
 */
type Props = { forceCssFallback?: boolean };

/**
 * Finite trapezoid grid in screen space.
 * Near-edge cells are forced 1:1 (height = width). Deeper rows follow
 * 1-point perspective so tiles stay roughly square in world space.
 */
const PerspectiveSquarePatch: React.FC<{
  side: "floor" | "ceiling";
}> = ({ side }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // One cell of inward travel per SCROLL_SECONDS — was 15s/cell (too slow → flicker-only)
  const SCROLL_SECONDS = 3.5;
  const cycle = ((frame / fps) % SCROLL_SECONDS) / SCROLL_SECONDS;
  const drift = interpolate(cycle, [0, 1], [0, 1]);

  const isCeiling = side === "ceiling";

  const geom = useMemo(() => {
    const cx = width / 2;
    // Vanishing point toward frame center
    const vpY = height * 0.5;
    // Finite patch band
    const nearY = height * 0.975;
    const farY = height * 0.813;
    const nearHalf = width * 0.543; // ~72% near width
    const farHalf = width * 0.257; // clear side margins at far edge

    // Near cell size (square side) — the "smaller" unit
    const cell = (2 * nearHalf) / COLS;

    // Perspective: width grows linearly with distance from VP
    // halfW(y) = k * (y - vpY); fit k from near
    const kNear = nearHalf / (nearY - vpY);

    // Depth positions for world-ish square tiles:
    // equal steps in 1/(y - vpY) space, front gap ≈ cell
    const invNear = 1 / (nearY - vpY);
    const invFar = 1 / (farY - vpY);
    // One step in inv-space corresponding to ~cell at near
    // dy ≈ cell → d(inv) ≈ cell / (nearY-vpY)^2
    const dInv = cell / Math.pow(nearY - vpY, 2);
    const invs: number[] = [];
    // scroll drift in inv-space (toward far = increasing inv)
    const driftInv = drift * dInv;
    for (let i = 0; i < 64; i++) {
      const inv = invNear + i * dInv + driftInv;
      if (inv >= invFar) break;
      invs.push(inv);
    }
    // Horizontals from depth steps only — no sealing front bar (open silhouette)
    const yHoriz = invs
      .map((inv) => vpY + 1 / inv)
      .filter((y) => y <= nearY - 2 && y >= farY - 0.5)
      .sort((a, b) => b - a);

    const ys: number[] = [];
    for (const y of yHoriz) {
      if (!ys.length || Math.abs(ys[ys.length - 1] - y) > 1.5) ys.push(y);
    }

    const halfAt = (y: number) => {
      const t = (y - nearY) / (farY - nearY); // 0 near → 1 far
      const persp = kNear * (y - vpY);
      const lin = nearHalf + t * (farHalf - nearHalf);
      return persp * (1 - Math.max(0, t) * 0.35) + lin * Math.max(0, t) * 0.35;
    };

    // Verticals poke past the outermost horizontal into black (not a closed frame)
    const tipY = Math.min(height - 1, nearY + cell * 0.55);
    const overhang = cell * 0.85; // horizontals clearly stick out past side verticals

    const verts: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i <= COLS; i++) {
      const u = i / COLS;
      const xNear = cx - nearHalf + u * 2 * nearHalf;
      const xFar = cx - farHalf + u * 2 * farHalf;
      // extrapolate past nearY to tipY along the same ray toward VP
      const xTip =
        cx + ((xNear - cx) * (tipY - vpY)) / (nearY - vpY);
      verts.push({ x1: xTip, y1: tipY, x2: xFar, y2: farY });
    }

    const hors: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const y of ys) {
      const h = halfAt(y) + overhang;
      hors.push({ x1: cx - h, y1: y, x2: cx + h, y2: y });
    }

    return { verts, hors, nearY, farY, tipY, cell, cx, nearHalf, farHalf };
  }, [width, height, drift]);

  const farPct = (geom.farY / height) * 100;
  const nearPct = (geom.nearY / height) * 100;
  // Fade toward card: keep outer band solid, dissolve into mid
  const fadeMask = `linear-gradient(to bottom, transparent 0%, transparent ${farPct - 4}%, rgba(0,0,0,0.35) ${farPct + 2}%, rgba(0,0,0,0.85) ${(farPct * 0.25 + nearPct * 0.75)}%, #000 ${nearPct - 4}%, #000 100%)`;
  const depthSpan = Math.max(1, geom.nearY - geom.farY); // near > far (screen y)

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: isCeiling ? "scaleY(-1)" : undefined,
        pointerEvents: "none",
        WebkitMaskImage: fadeMask,
        maskImage: fadeMask,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {geom.verts.map((l, i) => (
          <line
            key={`v${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={STROKE}
            strokeWidth={1}
            strokeLinecap="butt"
          />
        ))}
        {geom.hors.map((l, i) => {
          // 0 at near (outer), 1 at far (toward card)
          const t = (geom.nearY - l.y1) / depthSpan;
          const op = Math.max(0.35, 1 - t * 0.55);
          return (
            <line
              key={`h${i}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={STROKE}
              strokeWidth={1.15}
              strokeLinecap="butt"
              opacity={op}
            />
          );
        })}
      </svg>
    </div>
  );
};

export const DualRetroGrid: React.FC<Props> = ({
  forceCssFallback = false,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {forceCssFallback ? (
        <>
          <PerspectiveSquarePatch side="ceiling" />
          <PerspectiveSquarePatch side="floor" />
        </>
      ) : (
        <>
          <PerspectiveSquarePatch side="ceiling" />
          <PerspectiveSquarePatch side="floor" />
          {/* keep RetroGrid import used for non-css path parity */}
          <div style={{ display: "none" }}>
            <RetroGrid angle={42} cellSize={8} opacity={0} lineColor={STROKE} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
