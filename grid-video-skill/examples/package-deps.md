# npm 依赖与工程假设

把本 skill 的组件包拷入 Remotion 项目的 `src/` 后，按下列依赖对齐（版本可随 Remotion 大版本升级，建议同一套 `@remotion/*` 同号）。

## 运行时依赖

| 包 | 用途 |
| --- | --- |
| `remotion` | AbsoluteFill / Audio / Img / OffthreadVideo / interpolate / spring / staticFile 等 |
| `@remotion/cli` | Studio、`remotion render`、根配置 `Config` |
| `@remotion/transitions` | `TransitionSeries`、`linearTiming`、`fade` 转场 |
| `@remotion/google-fonts` | `fonts.ts` 加载 Noto Sans SC（`@remotion/google-fonts/NotoSansSC`） |
| `@remotion/media` | 媒体相关能力（模板常带；按需） |
| `react` / `react-dom` | UI（建议与 Remotion 模板一致，如 19.x） |

## 开发依赖（建议）

- `typescript`、`@types/react`、`@types/web`
- `@remotion/eslint-config-flat`、`eslint`、`prettier`（可选）

## 安装示例

```bash
npx create-video@latest my-grid-explainer   # 或复用已有 Remotion 工程
cd my-grid-explainer
npm i remotion @remotion/cli @remotion/transitions @remotion/google-fonts @remotion/media
```

然后把 skill 目录下的 `components/`、`lib/`、`magicui/`、`fonts.ts` **原样**拷到项目的 `src/`（相对路径已按 `src/components` → `../fonts` / `../lib` / `../magicui` 写好）。

可选：把 `examples/remotion.config.ts` 拷到项目根 `remotion.config.ts`（rspack、jpeg 帧、overwrite、premount）。

## CSS / Tailwind

- **不需要 Tailwind**。`lib/cn.ts` 是本地轻量拼接，无 `clsx` / `tailwind-merge`。
- 网格样式在 `magicui/retro-grid.tsx` 内联（含 CSS fallback）；无单独 `.css` 入口。
- 成片背景由主 composition 设 `backgroundColor: "#000"` + `<DualRetroGrid />`。

## public 素材约定

- 旁白：`public/voice/*.mp3`，场景内 `<Audio src={staticFile("voice/….mp3")} />`
- 示例图/视频：`public/examples/…`，经 `SchematicFocus` / `FocusedVideoDemo` / `FullVideoDemo` / `ExamplePanel` 引用

## 无头渲染

主 composition 建议 `defaultProps={{ forceCssFallback: true }}`，让 `DualRetroGrid` 走 CSS/Canvas 回退，避免离屏 WebGL 不稳定。
