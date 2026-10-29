import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  children: React.ReactNode;
  /** Frame when the enter animation begins. */
  from: number;
  /** Enter duration in frames. */
  duration: number;
  /** Soft rise from below (default) or fade-only. */
  direction?: "up" | "none";
  style?: React.CSSProperties;
};

/**
 * Soft reveal: opacity + slight rise + scale + blur→sharp.
 * Driven only by Remotion interpolate (no CSS transitions).
 */
export const RevealBlock: React.FC<Props> = ({
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
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const y = direction === "up" ? interpolate(progress, [0, 1], [32, 0]) : 0;
  const blurPx = interpolate(progress, [0, 1], [10, 0]);

  return (
    <div
      style={{
        opacity: progress,
        translate: `0px ${y}px`,
        scale: interpolate(frame, [from, end], [0.965, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          output: "perceptual-scale",
        }),
        filter: `blur(${blurPx}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
