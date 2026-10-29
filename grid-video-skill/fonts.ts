import { loadFont } from "@remotion/google-fonts/NotoSansSC";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "700"],
  ignoreTooManyRequestsWarning: true,
});

/**
 * Title / kicker / section bump from base.
 * @1080: kicker 44, section title 72.
 * Opening hero uses fontBumpTitle={10} → 86 (76+10).
 */
export const FONT_BUMP_TITLE = 8;

/**
 * Body / bullets / subtitle bump from base.
 * Body target @1080: ~46 → bump 10.
 * @1080: body 46.
 */
export const FONT_BUMP_BODY = 10;

/** @deprecated */
export const FONT_BUMP = FONT_BUMP_TITLE;
