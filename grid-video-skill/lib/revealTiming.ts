/**
 * Weighted reveal cues for VO-synced page text.
 * Spreads block starts across the narration window; last enter finishes
 * before a short fully-visible hold at the end.
 */

export type RevealCue = {
  startFrame: number;
  enterDuration: number;
};

export type RevealTimingOptions = {
  durationInFrames: number;
  fps: number;
  /** Relative weights per content block (order = reveal order). */
  weights: number[];
  /** Enter animation length in seconds (default ~0.45s). */
  enterDurationSec?: number;
  /** Fully-visible hold at end (default 0.5s). */
  holdEndSec?: number;
  /** Delay before first block (default 0.08s). */
  startPadSec?: number;
};

export function computeRevealTiming({
  durationInFrames,
  fps,
  weights,
  enterDurationSec = 0.45,
  holdEndSec = 0.5,
  startPadSec = 0.08,
}: RevealTimingOptions): RevealCue[] {
  const n = weights.length;
  if (n === 0) {
    return [];
  }

  const enterDuration = Math.max(1, Math.round(enterDurationSec * fps));
  const startPad = Math.max(0, Math.round(startPadSec * fps));
  const holdEnd = Math.max(0, Math.round(holdEndSec * fps));

  // Last block should finish entering before the end hold.
  const lastStartMax = Math.max(
    startPad,
    durationInFrames - holdEnd - enterDuration,
  );
  const span = Math.max(0, lastStartMax - startPad);
  const totalWeight = weights.reduce((a, b) => a + Math.max(0, b), 0) || 1;

  let acc = 0;
  return weights.map((raw) => {
    const w = Math.max(0, raw);
    const startFrame = Math.round(startPad + (acc / totalWeight) * span);
    acc += w;
    return { startFrame, enterDuration };
  });
}

/**
 * Opening cover: title block in first half of VO, subtitle in second half,
 * curtain image shortly after subtitle.
 */
export function openingRevealTiming(
  durationInFrames: number,
  fps: number,
): {
  kicker: RevealCue;
  titleLines: RevealCue[];
  subtitle: RevealCue;
  image: RevealCue;
} {
  // kicker + 2 title lines early; subtitle mid; image after subtitle
  const cues = computeRevealTiming({
    durationInFrames,
    fps,
    weights: [0.7, 1.1, 1.1, 1.4, 0.9],
    enterDurationSec: 0.5,
    holdEndSec: 0.55,
    startPadSec: 0.12,
  });

  return {
    kicker: cues[0]!,
    titleLines: [cues[1]!, cues[2]!],
    subtitle: cues[3]!,
    image: cues[4]!,
  };
}

/** Build weights for a typical text / demo SceneLayout. */
export function sceneLayoutWeights(opts: {
  hasKicker: boolean;
  titleLineCount: number;
  hasSubtitle: boolean;
  bulletCount: number;
  hasExamples: boolean;
}): number[] {
  const weights: number[] = [];
  if (opts.hasKicker) {
    weights.push(0.75);
  }
  for (let i = 0; i < opts.titleLineCount; i++) {
    weights.push(1.15);
  }
  if (opts.hasSubtitle) {
    weights.push(1.35);
  }
  for (let i = 0; i < opts.bulletCount; i++) {
    weights.push(1.5);
  }
  if (opts.hasExamples) {
    // Demo strip / panels: appear after copy, slightly later window
    weights.push(1.8);
  }
  return weights;
}
