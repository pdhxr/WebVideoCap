import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  children: React.ReactNode;
  from: number;
  /** Kept for API parity; spring duration is config-driven. */
  duration?: number;
  style?: React.CSSProperties;
};

/**
 * Remotion-native spring enter: opacity + rise + scale.
 * Not a Magic UI port — uses remotion `spring()` only.
 */
export const SpringReveal: React.FC<Props> = ({
  children,
  from,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - from);

  const progress = spring({
    frame: local,
    fps,
    config: { damping: 18, mass: 0.85, stiffness: 120 },
  });

  const y = (1 - progress) * 36;
  const scale = 0.92 + progress * 0.08;

  return (
    <div
      style={{
        opacity: progress,
        translate: `0px ${y}px`,
        scale,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
