import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ExamplePanel, type ExampleMedia } from "./ExamplePanel";
import { fontFamily } from "../fonts";

export type DemoItem = {
  media: ExampleMedia;
  caption: string;
  subcaption?: string;
  flex?: number;
  objectFit?: "cover" | "contain";
  muted?: boolean;
};

type Props = {
  items: DemoItem[];
  /** Delay before strip fades in (seconds) */
  delaySec?: number;
  /** Media tile height */
  mediaHeight?: number;
  /** Optional strip title above tiles */
  label?: string;
  /** Layout: row of equal tiles, or 2x2 grid */
  layout?: "row" | "grid2" | "grid2x2";
  /** When true, play video items sequentially (one Sequence each) */
  sequentialVideos?: boolean;
  /** Seconds each sequential video slot stays visible */
  sequentialSec?: number;
  /** Default object-fit for panels */
  objectFit?: "cover" | "contain";
};

export const DemoStrip: React.FC<Props> = ({
  items,
  delaySec = 0.35,
  mediaHeight = 200,
  label,
  layout = "row",
  sequentialVideos = false,
  sequentialSec = 1.8,
  objectFit = "cover",
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

  if (sequentialVideos) {
    const slot = Math.round(sequentialSec * fps);
    return (
      <div
        style={{
          width: "100%",
          opacity: enter,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          fontFamily,
        }}
      >
        {label ? (
          <div
            style={{
              fontSize: 24,
              color: "rgba(160, 190, 240, 0.78)",
              letterSpacing: "0.12em",
              textAlign: "center",
            }}
          >
            {label}
          </div>
        ) : null}
        <div style={{ position: "relative", width: "100%", height: mediaHeight + 70 }}>
          {items.map((item, i) => (
            <Sequence
              key={i}
              from={Math.round(delaySec * fps) + i * slot}
              durationInFrames={slot}
              layout="none"
            >
              <AbsoluteFill
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}
              >
                <ExamplePanel
                  media={item.media}
                  caption={item.caption}
                  subcaption={item.subcaption}
                  mediaHeight={mediaHeight}
                  objectFit={item.objectFit ?? objectFit}
                  muted={item.muted}
                />
              </AbsoluteFill>
            </Sequence>
          ))}
        </div>
      </div>
    );
  }

  const isGrid = layout === "grid2" || layout === "grid2x2";

  return (
    <div
      style={{
        width: "100%",
        opacity: enter,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily,
      }}
    >
      {label ? (
        <div
          style={{
            fontSize: 24,
            color: "rgba(160, 190, 240, 0.78)",
            letterSpacing: "0.12em",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={
          isGrid
            ? {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                width: "100%",
              }
            : {
                display: "flex",
                flexDirection: "row",
                gap: 14,
                width: "100%",
                alignItems: "stretch",
              }
        }
      >
        {items.map((item, i) => (
          <ExamplePanel
            key={i}
            media={item.media}
            caption={item.caption}
            subcaption={item.subcaption}
            flex={item.flex ?? 1}
            mediaHeight={mediaHeight}
            objectFit={item.objectFit ?? objectFit}
            muted={item.muted}
          />
        ))}
      </div>
    </div>
  );
};
