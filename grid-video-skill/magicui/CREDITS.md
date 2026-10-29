# Magic UI RetroGrid

Source adapted from [Magic UI RetroGrid](https://magicui.design/docs/components/retro-grid).

Original file preserved as `retro-grid.original.tsx`.
Remotion adaptation in `retro-grid.tsx`:
- Removed `requestAnimationFrame` / `cancelAnimationFrame` loops
- Drives `u_time` with Remotion `useCurrentFrame() / fps`
- CSS fallback scroll driven by `interpolate` / frame (no CSS `@keyframes`)
- Used as floor + ceiling layers in the video
