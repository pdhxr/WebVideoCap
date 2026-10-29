import React from "react";
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import type { FocusRect } from "./SchematicFocus";

type Beat = {
  holdUntil: number;
  transition: number;
  rect: FocusRect;
};

type Props = {
  /** Path under public/ */
  src: string;
  caption?: string;
  muted?: boolean;
  objectFit?: "contain" | "cover";
  /**
   * Ken Burns beats over the video frame (fractions 0–1 of the media).
   * Same model as SchematicFocus: overview → focus → back.
   */
  beats: Beat[];
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

/** Cover-style zoom from a focus rect; soft-capped like SchematicFocus. */
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
 * Full-page landscape video with optional CSS Ken Burns focus zooms.
 * Used by 08 apple-guess (1.5× asset + AI-result focus). Does not alter SchematicFocus.
 */
export const FocusedVideoDemo: React.FC<Props> = ({
  src,
  caption,
  muted = false,
  objectFit = "contain",
  beats,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 0.35 * fps, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 1, 1),
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

  const mediaBox: React.CSSProperties = {
    width: "100%",
    maxWidth: 1008,
    aspectRatio: "16 / 9",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(210, 220, 240, 0.28)",
    background: "#05070c",
    boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  return (
    <AbsoluteFill
      style={{
        opacity: enter * exit,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "220px 36px 280px",
        gap: 28,
        fontFamily,
        boxSizing: "border-box",
      }}
    >
      <div style={mediaBox}>
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <OffthreadVideo
            src={staticFile(src)}
            muted={muted}
            style={{
              width: "100%",
              height: "100%",
              objectFit,
              transform: `scale(${scale})`,
              transformOrigin: `${cx}% ${cy}%`,
            }}
          />
        </AbsoluteFill>
      </div>

      {caption ? (
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "rgba(200, 220, 255, 0.92)",
            textShadow: "0 2px 18px rgba(0,0,0,0.85)",
            textAlign: "center",
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
