import React from "react";
import { Img, OffthreadVideo, staticFile } from "remotion";
import { fontFamily } from "../fonts";

export type ExampleMedia =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string; startFrom?: number; muted?: boolean };

type Props = {
  media: ExampleMedia;
  caption: string;
  /** Optional second line under caption (e.g. path) */
  subcaption?: string;
  /** Flex grow weight inside a strip */
  flex?: number;
  /** Cap media height inside the panel */
  mediaHeight?: number;
  /** How media fills the tile (default cover; schematics/screenshots prefer contain) */
  objectFit?: "cover" | "contain";
  /** Mute video (default true for strip tiles) */
  muted?: boolean;
};

const frameStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(210, 220, 240, 0.28)",
  background: "rgba(8, 12, 22, 0.72)",
  overflow: "hidden",
  boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

export const ExamplePanel: React.FC<Props> = ({
  media,
  caption,
  subcaption,
  flex = 1,
  mediaHeight = 220,
  objectFit = "cover",
  muted,
}) => {
  const videoMuted =
    muted ?? (media.kind === "video" ? (media.muted ?? true) : true);

  return (
    <div style={{ ...frameStyle, flex }}>
      <div
        style={{
          height: mediaHeight,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070c",
          overflow: "hidden",
        }}
      >
        {media.kind === "image" ? (
          <Img
            src={staticFile(media.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit,
            }}
          />
        ) : (
          <OffthreadVideo
            src={staticFile(media.src)}
            muted={videoMuted}
            startFrom={media.startFrom ?? 0}
            style={{
              width: "100%",
              height: "100%",
              objectFit,
            }}
          />
        )}
      </div>
      <div
        style={{
          padding: "10px 14px 12px",
          fontFamily,
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
        {subcaption ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 20,
              color: "rgba(160, 185, 230, 0.72)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {subcaption}
          </div>
        ) : null}
      </div>
    </div>
  );
};
