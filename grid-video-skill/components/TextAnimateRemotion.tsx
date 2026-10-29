import React, { useMemo } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export type TextAnimateVariant = "blurInUp" | "slideUp";

type Props = {
  children: string;
  /** Frame when this block's enter begins. */
  from: number;
  /** Per-token enter duration in frames. */
  duration: number;
  variant: TextAnimateVariant;
  /** Extra frames between successive tokens (default 1–2). */
  staggerFrames?: number;
  style?: React.CSSProperties;
};

/**
 * Tokenize for Magic UI–style by-word / short-segment animation:
 * Latin words stay whole; CJK grouped in 2-char 短段; newlines kept.
 */
export function tokenizeForAnimate(text: string): string[] {
  const tokens: string[] = [];
  const re =
    /(\n+)|([A-Za-z0-9][A-Za-z0-9._/\-]*)|([\u4e00-\u9fff]+)|([<>/\-_]+)|(\s+)|(.)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const chunk = m[0];
    if (/^[\u4e00-\u9fff]+$/.test(chunk)) {
      for (let i = 0; i < chunk.length; i += 2) {
        tokens.push(chunk.slice(i, i + 2));
      }
    } else {
      tokens.push(chunk);
    }
  }
  return tokens.length > 0 ? tokens : [text];
}

/**
 * Remotion frame-driven Text Animate (blurInUp / slideUp by word|短段).
 * No CSS transitions / Framer Motion.
 */
export const TextAnimateRemotion: React.FC<Props> = ({
  children,
  from,
  duration,
  variant,
  staggerFrames = 2,
  style,
}) => {
  const frame = useCurrentFrame();
  const tokens = useMemo(() => tokenizeForAnimate(children), [children]);
  const enter = Math.max(1, duration);
  const withBlur = variant === "blurInUp";

  // Cap total stagger so long lines still finish inside a short preview window
  const maxStaggerSpan = Math.max(12, Math.round(enter * 1.8));
  const animatable = tokens.filter((t) => !t.includes("\n")).length;
  const effectiveStagger =
    animatable <= 1
      ? 0
      : Math.max(
          1,
          Math.min(staggerFrames, Math.floor(maxStaggerSpan / (animatable - 1))),
        );

  let animIndex = 0;

  return (
    <span
      style={{
        display: "inline",
        ...style,
      }}
    >
      {tokens.map((token, i) => {
        if (token.includes("\n")) {
          return (
            <React.Fragment key={`br-${i}`}>
              {token.split("").map((_, j) =>
                token[j] === "\n" ? <br key={`nl-${i}-${j}`} /> : null,
              )}
            </React.Fragment>
          );
        }

        const tokenAnimIndex = animIndex++;
        const start = from + tokenAnimIndex * effectiveStagger;
        const end = start + enter;
        const progress = interpolate(frame, [start, end], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        const y = interpolate(progress, [0, 1], [28, 0]);
        const blurPx = withBlur ? interpolate(progress, [0, 1], [8, 0]) : 0;
        const isSpace = /^\s+$/.test(token);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: isSpace ? "pre" : "normal",
              opacity: progress,
              translate: `0px ${y}px`,
              filter: withBlur ? `blur(${blurPx}px)` : undefined,
            }}
          >
            {isSpace ? token.replace(/ /g, "\u00A0") : token}
          </span>
        );
      })}
    </span>
  );
};
