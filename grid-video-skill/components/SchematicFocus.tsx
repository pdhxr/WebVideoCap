import React from "react";
import {
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";

/** Focus rect as fractions of image size [x0, x1, y0, y1], 0–1. */
export type FocusRect = readonly [number, number, number, number];

type Beat = {
  /** End frame of this hold (after transition into it). */
  holdUntil: number;
  /** Transition duration into this beat (frames). 0 = start state. */
  transition: number;
  rect: FocusRect;
};

type Props = {
  src: string;
  caption: string;
  mediaHeight?: number;
  /** Delay before the panel fades in (seconds). */
  delaySec?: number;
  /**
   * Ken Burns beats. First beat is the overview (usually full frame).
   * Fractions are of the on-disk image (curtain-schematic.png = 1744×888).
   */
  beats: Beat[];
};

const frameStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(210, 220, 240, 0.28)",
  background: "rgba(8, 12, 22, 0.72)",
  overflow: "hidden",
  boxShadow: "0 8px 28px rgba(0, 0, 0, 0.45)",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  width: "100%",
};

const FULL: FocusRect = [0, 1, 0, 1];

function lerpRect(a: FocusRect, b: FocusRect, t: number): FocusRect {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ];
}

/**
 * Map a focus rect to cover-style zoom:
 * scale = max(1/w, 1/h) so the rect fills the viewport (may crop edges).
 * Soft-capped so zoom stays readable on phone (asset now 1744×888).
 */
function zoomFromRect(rect: FocusRect) {
  const [x0, x1, y0, y1] = rect;
  const w = Math.max(0.08, x1 - x0);
  const h = Math.max(0.08, y1 - y0);
  const scale = Math.min(4.2, Math.max(1 / w, 1 / h));
  const cx = ((x0 + x1) / 2) * 100;
  const cy = ((y0 + y1) / 2) * 100;
  return { scale, cx, cy };
}

/**
 * Single schematic with animated focus (overview → regions).
 * Transform scale + origin — readable on 1080×1920 phone canvas.
 */
export const SchematicFocus: React.FC<Props> = ({
  src,
  caption,
  mediaHeight = 520,
  delaySec = 0.15,
  beats,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = interpolate(
    frame,
    [delaySec * fps, delaySec * fps + 0.45 * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  let rect: FocusRect = beats[0]?.rect ?? FULL;
  let prev = FULL;
  let beatStart = 0;

  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    const transStart = beatStart;
    const transEnd = beatStart + beat.transition;
    if (frame < transStart) {
      rect = prev;
      break;
    }
    if (frame < transEnd && beat.transition > 0) {
      const t = interpolate(frame, [transStart, transEnd], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
      rect = lerpRect(prev, beat.rect, t);
      break;
    }
    if (frame <= beat.holdUntil) {
      rect = beat.rect;
      break;
    }
    prev = beat.rect;
    beatStart = beat.holdUntil;
    rect = beat.rect;
  }

  const { scale, cx, cy } = zoomFromRect(rect);

  return (
    <div style={{ ...frameStyle, opacity: enter, fontFamily }}>
      <div
        style={{
          height: mediaHeight,
          width: "100%",
          background: "#05070c",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Img
          src={staticFile(src)}
          premountFor={fps}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${cx}% ${cy}%`,
            transform: `scale(${scale})`,
            transformOrigin: `${cx}% ${cy}%`,
          }}
        />
      </div>
      <div
        style={{
          padding: "10px 14px 12px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: "rgba(220, 232, 255, 0.95)",
            letterSpacing: "0.04em",
          }}
        >
          {caption}
        </div>
      </div>
    </div>
  );
};

/**
 * ConfirmFirstDemo Ken Burns targets on curtain-schematic.png (1744×888).
 * Inner webpage layout is 1280×800; fractions are of the on-disk asset.
 */
export const CURTAIN_SCHEMATIC_BEATS = {
  /** Full schematic overview */
  overview: [0, 1, 0, 1] as FocusRect,
  /** Curtain / doorway interaction region */
  curtain: [0.55, 0.78, 0.25, 0.55] as FocusRect,
  /** Right-side step timeline panel */
  timeline: [0.78, 0.98, 0.08, 0.92] as FocusRect,
};
