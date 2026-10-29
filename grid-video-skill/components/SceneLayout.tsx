import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily, FONT_BUMP_TITLE, FONT_BUMP_BODY } from "../fonts";
import {
  computeRevealTiming,
  sceneLayoutWeights,
} from "../lib/revealTiming";
import { RevealBlock } from "./RevealBlock";
import { BlurFadeRemotion } from "./BlurFadeRemotion";
import { TextAnimateRemotion } from "./TextAnimateRemotion";
import { SpringReveal } from "./SpringReveal";
import { ClipWipeReveal } from "./ClipWipeReveal";

/**
 * Enter presets for SceneLayout.
 * - none: static
 * - blurInUp: Magic UI–style word blur+rise — default main film
 * - blurFade: Magic UI–inspired block fade
 * - reveal: Remotion interpolate + bezier (RevealBlock)
 * - spring: Remotion native spring() — not a component library
 * - clipWipe: clip-path wipe — another non–Magic-UI approach
 */
export type RevealMode =
  | "none"
  | "reveal"
  | "blurInUp"
  | "blurFade"
  | "spring"
  | "clipWipe";

type Props = {
  kicker?: string;
  title: string;
  bullets?: string[];
  subtitle?: string;
  hero?: boolean;
  examples?: React.ReactNode;
  fontBumpTitle?: number;
  fontBumpBody?: number;
  revealMode?: RevealMode;
};

type Cue = { startFrame: number; enterDuration: number };

const PassThrough: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => <div style={style}>{children}</div>;

/** Soft opacity shell so dots appear with word-level text. */
const FadeShell: React.FC<{
  from: number;
  duration: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from, duration, children, style }) => {
  const frame = useCurrentFrame();
  const end = from + Math.max(1, duration);
  const opacity = interpolate(frame, [from, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return <div style={{ opacity, ...style }}>{children}</div>;
};

function wrapBlock(
  mode: RevealMode,
  cue: Cue,
  children: React.ReactNode,
  style?: React.CSSProperties,
): React.ReactNode {
  if (mode === "none") {
    return <PassThrough style={style}>{children}</PassThrough>;
  }
  if (mode === "blurFade") {
    return (
      <BlurFadeRemotion
        from={cue.startFrame}
        duration={cue.enterDuration}
        style={style}
      >
        {children}
      </BlurFadeRemotion>
    );
  }
  if (mode === "reveal") {
    return (
      <RevealBlock
        from={cue.startFrame}
        duration={cue.enterDuration}
        style={style}
      >
        {children}
      </RevealBlock>
    );
  }
  if (mode === "spring") {
    return (
      <SpringReveal
        from={cue.startFrame}
        duration={cue.enterDuration}
        style={style}
      >
        {children}
      </SpringReveal>
    );
  }
  if (mode === "clipWipe") {
    return (
      <ClipWipeReveal
        from={cue.startFrame}
        duration={cue.enterDuration}
        direction="up"
        style={style}
      >
        {children}
      </ClipWipeReveal>
    );
  }
  // blurInUp: fade shell for layout + word animate on text
  return (
    <FadeShell
      from={cue.startFrame}
      duration={Math.max(4, Math.round(cue.enterDuration * 0.45))}
      style={style}
    >
      {children}
    </FadeShell>
  );
}

function wrapText(
  mode: RevealMode,
  cue: Cue,
  text: string,
): React.ReactNode {
  if (mode === "blurInUp") {
    return (
      <TextAnimateRemotion
        from={cue.startFrame}
        duration={cue.enterDuration}
        variant="blurInUp"
        staggerFrames={2}
      >
        {text}
      </TextAnimateRemotion>
    );
  }
  return text;
}

export const SceneLayout: React.FC<Props> = ({
  kicker,
  title,
  bullets,
  subtitle,
  hero = false,
  examples,
  fontBumpTitle = FONT_BUMP_TITLE,
  fontBumpBody = FONT_BUMP_BODY,
  revealMode = "blurInUp",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const bt = fontBumpTitle;
  const bb = fontBumpBody;
  const mode = revealMode;

  const titleLines = title.split("\n");
  const hasBullets = Boolean(bullets && bullets.length > 0);
  const hasExamples = Boolean(examples);
  const hasSubtitle = Boolean(subtitle);
  const hasKicker = Boolean(kicker);
  const demoOnly = hasExamples && !hasBullets;
  const packed = hasExamples && hasBullets;
  const evenSpread = hasBullets && !packed;

  const weights = sceneLayoutWeights({
    hasKicker,
    titleLineCount: Math.max(1, titleLines.length),
    hasSubtitle,
    bulletCount: hasBullets ? bullets!.length : 0,
    hasExamples,
  });

  // Demo pages: pack kicker/title early so the single example stays on screen
  // for most of the bridging VO (image is the point, not late reveal).
  const demoHoldEndSec = demoOnly
    ? Math.max(0.5, durationInFrames / fps - 1.2)
    : 0.5;
  const cues = computeRevealTiming({
    durationInFrames,
    fps,
    weights,
    enterDurationSec: demoOnly ? 0.4 : 0.48,
    holdEndSec: demoHoldEndSec,
    startPadSec: 0.08,
  });

  let cueIndex = 0;
  const nextCue = () => cues[cueIndex++]!;

  const kickerCue = hasKicker ? nextCue() : null;
  const titleCues = titleLines.map(() => nextCue());
  const subtitleCue = hasSubtitle ? nextCue() : null;
  const bulletCues = hasBullets ? bullets!.map(() => nextCue()) : [];
  const examplesCue = hasExamples ? nextCue() : null;

  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 0.35 * fps, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 1, 1),
    },
  );

  const titleFontSize = (hero ? 76 : packed ? 52 : demoOnly ? 48 : 64) + bt;
  const bodyFontSize = (packed ? 30 : 36) + bb;

  // Examples (non-text) fall back to block reveal when word-mode is active
  const examplesMode: RevealMode =
    mode === "blurInUp" ? "reveal" : mode;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: packed
          ? "300px 48px 420px"
          : demoOnly
            ? "260px 44px 380px"
            : hero
              ? "260px 56px 340px"
              : "220px 56px 300px",
        fontFamily,
        color: "#e8f1ff",
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          width: "100%",
          height: evenSpread || hero ? "100%" : "auto",
          maxWidth: demoOnly ? 1040 : 1020,
          display: "flex",
          flexDirection: "column",
          justifyContent: evenSpread
            ? "space-evenly"
            : hero
              ? "center"
              : "flex-start",
          gap: evenSpread
            ? 0
            : packed
              ? hero
                ? 28
                : 22
              : hero
                ? 48
                : demoOnly
                  ? 28
                  : 40,
          textAlign: "center",
        }}
      >
        {kicker && kickerCue
          ? wrapBlock(
              mode,
              kickerCue,
              <div
                style={{
                  fontSize: (packed ? 30 : demoOnly ? 32 : 36) + bt,
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(140, 190, 255, 0.75)",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                {wrapText(mode, kickerCue, kicker)}
              </div>,
            )
          : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: hero ? 10 : 6,
            alignItems: "center",
            width: "100%",
          }}
        >
          {titleLines.map((line, i) => {
            const cue = titleCues[i]!;
            return (
              <React.Fragment key={`title-${i}`}>
                {wrapBlock(
                  mode,
                  cue,
                  <h1
                    style={{
                      margin: 0,
                      fontSize: titleFontSize,
                      fontWeight: 700,
                      lineHeight: 1.42,
                      letterSpacing: "0.02em",
                      textShadow: "0 2px 24px rgba(0,0,0,0.85)",
                      overflowWrap: "anywhere",
                      wordBreak: "keep-all",
                    }}
                  >
                    {wrapText(mode, cue, line)}
                  </h1>,
                )}
              </React.Fragment>
            );
          })}
        </div>

        {subtitle && subtitleCue
          ? wrapBlock(
              mode,
              subtitleCue,
              <p
                style={{
                  margin: 0,
                  fontSize: bodyFontSize,
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: "rgba(200, 220, 255, 0.82)",
                  textShadow: "0 1px 12px rgba(0,0,0,0.8)",
                  whiteSpace: "pre-line",
                  overflowWrap: "break-word",
                }}
              >
                {wrapText(mode, subtitleCue, subtitle)}
              </p>,
            )
          : null}

        {hasBullets ? (
          <div
            style={{
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: packed ? 16 : 36,
              textAlign: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {bullets!.map((item, i) => {
              const cue = bulletCues[i]!;
              return (
                <React.Fragment key={i}>
                  {wrapBlock(
                    mode,
                    cue,
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "flex-start",
                        justifyContent: "center",
                        textAlign: "center",
                        fontSize: bodyFontSize,
                        lineHeight: 1.62,
                        whiteSpace: "pre-line" as const,
                        color: "rgba(220, 232, 255, 0.92)",
                        textShadow: "0 1px 10px rgba(0,0,0,0.75)",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: 9,
                          height: 9,
                          marginTop: 14,
                          borderRadius: "50%",
                          background: "rgba(120, 180, 255, 0.85)",
                          boxShadow: "0 0 10px rgba(120,180,255,0.55)",
                        }}
                      />
                      <span
                        style={{
                          whiteSpace: "pre-line",
                          overflowWrap: "break-word",
                        }}
                      >
                        {wrapText(mode, cue, item)}
                      </span>
                    </div>,
                    { width: "100%" },
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : null}

        {examples && examplesCue
          ? wrapBlock(examplesMode, examplesCue, examples, {
              marginTop: demoOnly ? 8 : 12,
              width: "100%",
            })
          : null}
      </div>
    </AbsoluteFill>
  );
};
