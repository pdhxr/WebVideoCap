import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  children: React.ReactNode;
  /** Frame when the enter animation begins. */
  from: number;
  /** Enter duration in frames. */
  duration: number;
  style?: React.CSSProperties;
};

/**
 * Magic UI Blur Fade — soft block-level blur + fade (no word stagger).
 * Remotion frame-driven only.
 */
export const BlurFadeRemotion: React.FC<Props> = ({
  children,
  from,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const end = from + Math.max(1, duration);

  const progress = interpolate(frame, [from, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const blurPx = interpolate(progress, [0, 1], [12, 0]);
  const y = interpolate(progress, [0, 1], [12, 0]);

  return (
    <div
      style={{
        opacity: progress,
        translate: `0px ${y}px`,
        filter: `blur(${blurPx}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
