import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  children: React.ReactNode;
  from: number;
  duration: number;
  /** Wipe direction (default upward reveal). */
  direction?: "up" | "left" | "right";
  style?: React.CSSProperties;
};

/**
 * Non–Magic-UI enter: clip-path wipe + soft fade.
 * Clearly different from spring / blur / word-stagger.
 */
export const ClipWipeReveal: React.FC<Props> = ({
  children,
  from,
  duration,
  direction = "up",
  style,
}) => {
  const frame = useCurrentFrame();
  const end = from + Math.max(1, duration);

  const progress = interpolate(frame, [from, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const rest = (1 - progress) * 100;
  const clipPath =
    direction === "left"
      ? `inset(0 ${rest}% 0 0)`
      : direction === "right"
        ? `inset(0 0 0 ${rest}%)`
        : `inset(${rest}% 0 0 0)`;

  return (
    <div
      style={{
        opacity: interpolate(progress, [0, 0.15, 1], [0, 1, 1]),
        clipPath,
        WebkitClipPath: clipPath,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
