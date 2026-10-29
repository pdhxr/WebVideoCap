import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";

type Props = {
  /** Path under public/ */
  src: string;
  caption?: string;
  /** Play with sound (default false = unmuted for full demos) */
  muted?: boolean;
  /** Optional still shown before the video starts */
  introImage?: string;
  /** Frames to hold the intro still (default 0) */
  introFrames?: number;
  /** object-fit for the video/image */
  objectFit?: "contain" | "cover";
};

/**
 * Large centered video page (portrait canvas, landscape source).
 * Used for 05 pressbutton-full and 08 apple-guess — audio unmuted by default.
 */
export const FullVideoDemo: React.FC<Props> = ({
  src,
  caption,
  muted = false,
  introImage,
  introFrames = 0,
  objectFit = "contain",
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

      <div style={{ ...mediaBox, position: "relative" }}>
        {introImage && introFrames > 0 ? (
          <>
            <Sequence from={0} durationInFrames={introFrames} layout="none">
              <AbsoluteFill>
                <Img
                  src={staticFile(introImage)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#0a0e16",
                  }}
                />
              </AbsoluteFill>
            </Sequence>
            <Sequence from={introFrames} layout="none">
              <AbsoluteFill>
                <OffthreadVideo
                  src={staticFile(src)}
                  muted={muted}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit,
                  }}
                />
              </AbsoluteFill>
            </Sequence>
          </>
        ) : (
          <OffthreadVideo
            src={staticFile(src)}
            muted={muted}
            style={{
              width: "100%",
              height: "100%",
              objectFit,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
