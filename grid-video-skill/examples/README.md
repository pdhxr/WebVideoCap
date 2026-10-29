# examples/

- `package-deps.md` — 必装 npm 包与「无 Tailwind」说明
- `remotion.config.ts` — 可拷到 Remotion 项目根作参考配置

## 把组件包接到任意 Remotion 工程

本 skill 根目录对标项目的 `src/`：

```
skill根/
  fonts.ts
  components/*.tsx
  lib/cn.ts
  lib/revealTiming.ts
  magicui/retro-grid.tsx
```

拷贝到目标项目后应为：

```
src/fonts.ts
src/components/...
src/lib/...
src/magicui/...
```

相对 import（如 `../fonts`、`../lib/cn`、`../magicui/retro-grid`）无需改动。

## 署名 / 上游

- Remotion：https://github.com/remotion-dev/remotion
- Magic UI Retro Grid / Text Animate / Blur Fade：https://github.com/magicuidesign/magicui  
  文档：https://magicui.design/docs/components/retro-grid 、text-animate 、blur-fade
- 再分发 `magicui/` 改编代码时保留 `CREDITS.md`（详见 skill 正文「组件 GitHub 来源」）
