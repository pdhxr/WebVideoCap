---
name: 网格视频生成skill
description: >-
  竖屏 Remotion 技术说明片：天花板/地板网格 + blurInUp；含可移植组件包、GitHub
  来源、硬烧录字幕，以及与网页录屏共通的专用目录/确认门禁/定稿清理工程规矩。
---
# 网格视频生成skill

用 Remotion 做竖屏「技术说明 / Skill 讲解」成片：黑底 + **天花板与地板透视网格**、中部说明文案、可选示例演示。与「网页交互录屏」skill 分工：录屏 skill 产出网页操作素材；本 skill 提供**可移植组件包 + 制作流程**，把文案、旁白、示意图与演示片组装成同风格讲解片。

涉及 Remotion API / 渲染细节时，配合 [remotion-best-practices](sand-workflow:remotion-best-practices) 与 [remotion-render](sand-workflow:remotion-render)。

**禁止**一上来就全片渲染。先弄懂需求 → **为本次成片新建专用工程目录** → 拷入组件包与规格写进 README → 文案/时间轴确认 → 网格与字号确认 → 关键动效片段确认 → 再合片 → **硬烧录字幕** → 交片后**整理过程文件**。

以下「确认」指：**硬停，等用户明确回复 OK** 才继续（不是只展示、默默往下跑）。与网页录屏 skill 相同的工程纪律，技术栈换成 Remotion。


## 制作原则（成片脚本与节奏硬规矩）

做讲解片时始终遵守；写旁白、剪演示、排页序前先自检：

1. **不重复说话**：除非特殊场景必要，同一信息只说一次（文字页与示例页不要各念一遍）。写完 `scripts.json` 后通读全表去重。
2. **演示要快、不拖沓**：样品演示优先剪到高潮；操作录像默认 **2×**（`setpts` + `atempo` 保调），静图示例页也压到够看即可，勿冗长垫片。
3. **开头要有趣**：开场尽量用有画面张力的动态/钩子（如抓帘、关键动作），避免干巴巴念标题。
4. **要有抽象总结**：收尾不只罗列步骤，要抽出一层意思。例：本 Skill **既含技术与细节设计，也含工程管理**——做菜要好吃，做完菜也要收拾好厨房台面，不留垃圾残局。
5. **给人看效果、做选择；照做交给 Agent**：片子不是 DIY 教程。观众欣赏成品、决定要不要用；执行靠 Agent 按脚本生成 Skill，或下载本 Skill 照做。
6. **省 token 的安装入口（片尾必留）**：片尾硬烧一行机器可读地址，勿把整份 Skill 念进旁白。固定格式（单行）：
   `SKILL_URL=https://raw.githubusercontent.com/pdhxr/GridVideoSkill/main/SKILL.md`
   Agent 只需抓这一行（OCR / 字幕 / 描述区）即可 curl 全文；Grok Bot 也可说「安装网格视频生成skill」。


---

## 怎么读这份 Skill

0. **制作原则**：不重复旁白、演示要快、开头有趣、收尾抽象总结。
1. **一、成片规格**：画幅、网格、字号、动效默认值。
2. **二、全程工程硬规矩**（与录屏 skill 共通）：专用目录、README、确认门禁、唯一真相源、定稿后整理。
3. **三、组件包**：拷贝到任意 Remotion 项目即可复用同风格。
4. **四、组件 GitHub 来源**：上游仓库 / 文档与本包原创边界。
5. **五、制作流程**：立项 → 文案时间轴 → 网格与版式 → 旁白 → 示例页 → 片段确认 → 合片 → **硬烧录字幕** → 整理。
6. **六、接线配方与骨架**。
7. **七、交付清单**。

---

# 一、成片规格（默认）

| 项 | 默认 |
| --- | --- |
| 画幅 | **1080×1920** 竖屏，30fps |
| 背景 | 纯黑 `#000` + 顶/底透视方格网格（天花板 + 地板） |
| 网格组件 | `DualRetroGrid`（可 `forceCssFallback`） |
| 转场 | `TransitionSeries` + fade，约 0.5s（15 帧 @30fps） |
| 文字进场 | 讲解页默认 **blurInUp**（词/短段错开模糊上浮）；**封面/开场标题保持静态**，无进场动画 |
| 字体 | Noto Sans SC（`fonts.ts` via `@remotion/google-fonts`） |

## 竖屏字号（@1080 宽）

- **最小可读**：叠字 ≥ **36px**
- 经验档：开场主标题约 **84–86**；节标题约 **72**；kicker 约 **44**；正文/条目/副标题约 **44–46**
- 行高宜略松：标题 ~1.42，正文 ~1.62–1.65；条目间距约 36px
- 子弹页用较高中卡带 + `space-evenly`，避免挤在中间一条
- 写进本任务 README（成片分辨率旁注明推荐字号与最小字号）

## 网格（天花板 / 地板）

- 双份透视方格：上下对称，近大远小，缓慢向灭点漂移
- **无头渲染优先 CSS/Canvas 回退**（`forceCssFallback`），避免 WebGL 离屏不稳定
- 观感：细浅灰线、半透明；近缘单元格接近正方形；侧边留白清晰，不抢字
- 改密度/速度后：先渲几秒网格动态预览确认，再进文案

## 文字与版式

- 统一 `SceneLayout`：kicker + 标题 + 正文/条目；正文默认居中
- 冒号后长句可主动换行，避免一行过长
- 讲解页 `revealMode="blurInUp"`；开场关动画（`none` / 自定义静态页）


## 硬烧录字幕（定稿成片必须）

- 交付成片须带**硬烧录**字幕（画面像素内，不是可选软字幕轨）
- 文案与旁白一致：以 `public/voice/scripts.json`（或等价文案表）为源，按页/`SCENE_DURATIONS` 时间轴对齐
- 竖屏 @1080：字幕字号 ≥ **36px**；底部安全区约 120–180px；半透明底或描边保证可读，不挡关键演示区
- 合片无字幕版可先作中间件；**交用户定稿前**必须完成烧录步骤（见「五、8. 硬烧录字幕」）

---

# 二、全程工程硬规矩（与网页录屏共通）

以下与「网页操作录屏」skill **工作流工程层**一致；不包含录屏专有的鼠标/DOM/探针/CDP 等技术细节。贯穿每一次网格讲解片，不随阶段跳过。

## 任务目录管理（每次开新成片任务必须遵守）

每发起**一部讲解片 / 一次成片任务**，必须**单独新建一个专用工程目录**；该任务从摸索到交片的所有资料与文件，**只写进这个目录**，禁止混进其它任务目录或散落在 `/workspace` 根下。

1. **何时建目录**
   - 需求收齐（或至少已确定主题与成片规格）之后、开始拷组件 / 写文案 / 渲预览之前
   - 用户新开一个不同主题或明确说「再做一部」→ **新建**目录，不要往旧任务目录里继续堆
2. **命名**
   - 建议：`/workspace/<短名>-grid-video/` 或 `/workspace/skill-explainer-<短名>/`
   - `<短名>` 来自主题意图（如 `skill-explainer`、`api-intro`），可读、唯一
   - 同一主题的重渲、改字号、改某一示例 → **仍用同一任务目录**；不要每渲一次新建一堆平行目录
3. **目录内应有什么（全部落在本任务 ROOT 下）**
   - 根：`README.md`、`package.json`、`remotion.config.ts`、`src/`（含本 skill 组件包拷贝）、旁白文案表（如 `public/voice/scripts.json`）
   - `public/voice/`：各页 TTS；`public/examples/`：本片用到的示意图/演示素材
   - `out/`：定稿成片、已确认的网格/字号/动效预览（整理后只留有价值的）
   - 署名/许可（Magic UI `CREDITS.md`、若有第三方素材说明）也放本目录
4. **禁止**
   - 把 A 片的旁白、试片、示例写进 B 片目录
   - 在 `/workspace` 根或其它任务目录留下本任务的临时试片、确认图、日志
   - 用软链接「偷用」其它任务的可变产物当本任务真相源（可复用的**只读共享素材**除外；一旦拷入本任务，以本任务内副本为准）
5. **与定稿整理的关系**
   - 整理、删除试片、保留清单，都只针对**本任务专用目录**
   - 回复用户时写明本任务工程路径

## README（每个任务目录必须有）

在本任务根写清，并随改口更新：

- 主题、语言、页数结构（开场 / 讲解节 / 示例 / 收尾）
- **成片像素分辨率与横竖屏**（默认 1080×1920）、fps
- 字号 bump、最小 36px、进场动效约定（讲解 blurInUp、封面静态）
- 主 composition id、关键 `Anim*` 预览 composition
- 旁白来源（TTS 音色）、`SCENE_DURATIONS` 如何由 VO 推算
- 示例素材清单与来源（含是否来自录屏 skill 成品）
- 导出命令与交付文件名
- 字幕：硬烧录；`public/captions/` 路径与生成方式（Remotion 层或 ffmpeg SRT）

## 确认门禁（硬停等 OK）

与录屏 skill 一样：**未确认不得进入下一步重操作**。

| 门禁 | 未确认前禁止 |
| --- | --- |
| 需求复述 + 成片规格（分辨率/横竖屏/字号档） | 禁止大规模拷贝工程以外的「正式开写」与渲染 |
| 文案结构 + 旁白时间轴（页序、每页要点、时长表） | 禁止按旧时长合全片 |
| 网格观感短预览 / 关键字号静态页 | 禁止当作定稿字号全片交片 |
| 关键动效或示例的**短 composition 预览** | 禁止把该改动合进全片当最终交付 |
| 用户说「可以 / 合成全视频」 | 才允许主 composition 全片 render |

用户改口 → **先改** README / 文案 / 时长 / 素材 / 代码 → **再请确认** → 再渲。禁止只改一侧。

## 唯一真相源

- 页序与文案：场景文件 + README / scripts 表（保持一致）
- 时长：`SCENE_DURATIONS`（或等价表）须与 `public/voice/*.mp3` 实际时长对齐；Root 里预览 composition 的 `durationInFrames` 同步
- 示例路径：以本任务 `public/examples/` 内文件为准
- 改文案必须重生成 VO 并改时长表；改示例必须先单独预览再合片

## 成片规格门禁

发起网格确认帧、字号静帧、动效预览或全片渲染之前，必须已敲定**成片像素分辨率与横竖屏**（适合目标平台，默认竖屏 1080×1920），并写入本任务 README。未敲定 → 先问清，**禁止**当定稿渲。

## 交付前自检（不通过则不要当定稿交）

- **旁白无重复**（对照 `scripts.json`）；示例页无第二遍念同一句
- **演示节奏紧**：高潮已剪齐，加速档符合约定（默认演示 2×）
- **开场有钩子**；**收尾有抽象总结**（技术/细节 + 工程管理一类收口）
- 画幅、fps、顶/底网格可见且不抢字
- 开场静态、讲解页 blurInUp；叠字 ≥36px
- 每页旁白可听且与时长表一致；全片有 AAC（若设计有声）
- 用户点名改过的示例/动效：已单独预览通过后再合片
- ffprobe 核对时长与音轨
- 定稿含硬烧录字幕（与旁白一致、≥36px）

## 定稿后整理过程文件（对应录屏 skill 阶段 3）

用户认可成片（或明确说「这版定了」）后立刻整理**本任务专用目录**：**没有留用价值的中间版删除**；成果物与可复用资产保留。整理完列一份「保留清单」给用户，并写明工程路径。

### 必须保留（成果物）

- **定稿成片**：最终 mp4（只留定稿名，如 `skill-explainer.mp4`），不堆一堆 `_v2`/`_final` 后缀
- **源码**：`src/`（含组件包）、`package.json`、`remotion.config.ts`、`fonts.ts`
- **旁白**：`public/voice/*.mp3` + `scripts.json`（或等价文案表）
- **本片实际用到的示例素材**（`public/examples/` 内定稿引用）
- **工作流说明** README（规格、字号、动效、composition、导出命令）
- **Magic UI / 第三方署名**（`magicui/CREDITS.md` 等）
- 可选：一两份关键已确认预览（如最终字号静帧、最终采纳的某段 Anim 预览）——若用户要留对照

### 默认删除（无留用过程垃圾）

- 旧版成片与试片：重复 mp4、未采纳的 `anim*-*.mp4` 对比件（用户未点名要留的）
- 大量字号/版式试验静帧目录（`font-preview*`、`layout-*` 试验树），定稿后只留必要对照或全删
- 过期 `check-*.png`、网格试验帧（非 README 引用的）
- 无用日志、临时 ffmpeg 中间文件、`__pycache__`、仅为本任务临时的缓存

### 整理规则

1. **先定稿再删**：用户未认可成片前，可先把旧版挪到 `out/_trash/` 或暂留；认可后再物理删除。
2. **目录干净可读**：`src/` + `public/` + README；`out/` ideally 只留定稿视频（+ 少量已确认对照）。
3. **删前快速列清单**：准备删除的文件名发用户看一眼（或写在整理回复里）；用户说某份要留则留下。
4. 整理完成后回复：保留了什么、删了什么、**本任务工程路径**。

---

# 三、组件包

把本 skill 目录下下列文件**原样**拷入**本任务** Remotion 项目的 `src/`（相对路径已对齐，无需改 import）：

```
src/
  fonts.ts
  components/   ← 本包 components/
  lib/          ← 本包 lib/
  magicui/      ← 本包 magicui/（含 CREDITS.md）
```

详见 `examples/README.md`、`examples/package-deps.md`；可选参考 `examples/remotion.config.ts`。

## 文件一览

| 路径 | 用途 |
| --- | --- |
| `fonts.ts` | Noto Sans SC + `FONT_BUMP_TITLE` / `FONT_BUMP_BODY` |
| `lib/cn.ts` | 轻量 class 拼接（无 Tailwind） |
| `lib/revealTiming.ts` | SceneLayout 进场时序权重 |
| `magicui/retro-grid.tsx` | Magic UI RetroGrid 的 Remotion 帧驱动适配（WebGL + CSS 回退） |
| `magicui/CREDITS.md` | Magic UI 署名与改编说明（**再分发须保留**） |
| `components/DualRetroGrid.tsx` | 顶/底双层网格壳 |
| `components/SceneLayout.tsx` | 讲解页统一版式 + revealMode |
| `components/TextAnimateRemotion.tsx` | blurInUp / slideUp 词段动画 |
| `components/BlurFadeRemotion.tsx` | 块级模糊淡入 |
| `components/RevealBlock.tsx` | interpolate + bezier 进场 |
| `components/SpringReveal.tsx` | Remotion `spring()` 进场 |
| `components/ClipWipeReveal.tsx` | clip-path 擦除进场 |
| `components/SchematicFocus.tsx` | 静图全景 → 局部放大 → 缩回 |
| `components/FocusedVideoDemo.tsx` | 竖屏内 16:9 视频 + 可选焦点放大 |
| `components/FullVideoDemo.tsx` | 大画幅居中完整操作录像 |
| `components/ExamplePanel.tsx` | 示例媒体面板 |
| `components/DemoStrip.tsx` | 多示例条带布局 |

---

# 四、组件 GitHub 来源

再分发或移植本包时：**保留 `magicui/CREDITS.md` 与下游许可要求**；改编自 Magic UI 的代码须注明原项目。

## 上游依赖与灵感

| 概念 / 本包文件 | 上游 | 链接 |
| --- | --- | --- |
| Remotion 核心、`Video` / `Audio` / `Img` / `OffthreadVideo`、`interpolate` / `spring` | remotion-dev/remotion | https://github.com/remotion-dev/remotion · 文档 https://www.remotion.dev |
| `TransitionSeries`、`fade`、`linearTiming` | `@remotion/transitions`（同仓库） | 同上 |
| `@remotion/google-fonts`（Noto Sans SC） | 同仓库 Google Fonts 包 | 同上 |
| `magicui/retro-grid.tsx`（RetroGrid Remotion 适配） | Magic UI **Retro Grid** | 文档 https://magicui.design/docs/components/retro-grid · 仓库 https://github.com/magicuidesign/magicui（registry：`retro-grid`） |
| `TextAnimateRemotion`（blurInUp 等） | Magic UI **Text Animate**（灵感 / 观感；本文件为 Remotion 重写，非逐行拷贝） | https://magicui.design/docs/components/text-animate · 同仓库 |
| `BlurFadeRemotion` | Magic UI **Blur Fade**（灵感；Remotion 帧驱动重写） | https://magicui.design/docs/components/blur-fade · 同仓库 |

Magic UI 许可一般为 **MIT**：拷贝或改编其代码时保留版权与许可声明；本包已在 `magicui/CREDITS.md` 记录 RetroGrid 改编要点。

## 本包原创（以本 skill 为准，非上游原样拷贝）

下列文件是为竖屏讲解片写的**项目原创 / Remotion 适配层**，应随本 skill 组件包复制；上游只需按上表给 Remotion / Magic UI **署名**，不要指望从 GitHub 直接下到同款成片组件：

- `components/DualRetroGrid.tsx` — 顶/底双层 + 透视方格补丁（调用适配后的 `RetroGrid`）
- `components/SceneLayout.tsx` — 讲解页版式与 revealMode 编排
- `components/SchematicFocus.tsx` / `FocusedVideoDemo.tsx` / `FullVideoDemo.tsx` / `ExamplePanel.tsx` / `DemoStrip.tsx`
- `components/RevealBlock.tsx` / `SpringReveal.tsx` / `ClipWipeReveal.tsx`（后两者刻意非 Magic UI）
- `fonts.ts`、`lib/cn.ts`、`lib/revealTiming.ts`

**怎么选来源**：要同风格成片 → **拷本 skill 组件包**；要最新 Magic UI DOM/Framer 版 → 回 GitHub / magicui.design，再自行改成帧驱动（勿混用 rAF 与 Remotion 时间轴）。

---

# 五、制作流程

## 0. 立项（含建目录）

1. 明确主题、页数上限（建议 ≤10 个讲解节 + 必要示例）、语言
2. **新建本任务专用目录**（见「二、任务目录管理」）；写 README（规格、字号、结构）
3. 在该目录建 Remotion 工程 → 按「三、组件包」拷入 `src/`
4. 安装依赖见 `examples/package-deps.md`
5. `Root` 注册主 composition 与若干**短预览** composition（单页动效、单示例）
6. 把理解复述给用户；规格未确认前不进入大规模渲染

## 1. 文案与结构（须确认）

1. 每页：kicker（如 `01 · …`）、标题、条目/正文 → 写入本任务目录
2. 常见：开场（有趣钩子 + 标题静态）→ 若干「文字页 + 可选示例页」→ **抽象总结收尾**
3. 无示例的节不要硬塞演示；**文字页已讲过的话，示例页不要再念一遍**
4. 通读旁白表做去重自检；演示素材按「制作原则」剪短/加速
5. **硬停**：用户确认页序与文案结构后再生成全套 VO / 定时长表

## 2. 网格与版式（须确认）

1. 主片底层：`<DualRetroGrid forceCssFallback />` + 黑底
2. 讲解页套 `SceneLayout`，`revealMode="blurInUp"`；开场静态
3. 调网格后先短预览；字号试验用静帧/短预览 composition
4. **硬停**：网格与字号 OK 后再当定稿参数写进 README / `fonts.ts`

## 3. 旁白（VO）定时长

1. 每页短旁白 → TTS → 本任务 `public/voice/*.mp3`
2. `SCENE_DURATIONS` ≈ VO 时长 + **0.7–1s** 垫；收尾可再 +1–2s
3. 页内 `<Audio src={staticFile("voice/….mp3")} />`；改文案后重生成 VO 并改时长
4. 时长表与 Root 预览 `durationInFrames` 保持同步

## 4. 示例 / 演示页

| 类型 | 组件 |
| --- | --- |
| 静图 / 示意图 | `SchematicFocus`（高清原图；Ken Burns 式放大） |
| 完整操作录像 | `FullVideoDemo` / `FocusedVideoDemo`（竖屏内 16:9 contain；需声默认开声） |
| 只要高潮 | ffmpeg 剪段；加速用 `setpts` + `atempo`，放入本任务 `public/examples/` |

硬规矩：先单独渲该示例预览再合全片；改放大优先放宽 focus 矩形；说明文字放媒体下方短 caption。素材只进本任务目录。

## 5. 片段确认 → 合片

1. 关键动效注册短 composition，只渲该段 → **等用户 OK**
2. 用户说「可以 / 合成全视频」后再：`npx remotion render <主CompositionId> out/<成片名>-master.mp4`（路径均在本任务目录；此步可先无字幕，作中间件）
3. ffprobe 核对 1080×1920、时长、AAC
4. 大改示例未合片前，回复里写明「全片尚未重渲」
5. **合片之后必须进入「8. 硬烧录字幕」**；未烧字幕不得当定稿交片

## 6. 迭代

- 一次只改点名的页；不要顺手改其它页节拍
- 改口：README + 文案/时长/代码一起改 → 再确认 → 再渲
- 改旁白后：重生成 VO → 改时长表 → **重做字幕时间轴并重烧**，不要只换音轨留旧字幕

## 7. 定稿整理

用户认可后执行「二、定稿后整理过程文件」：删试片、留成果、发保留清单与工程路径。定稿成片名建议不含 `-master`，只留烧好字幕的最终 mp4。

## 8. 硬烧录字幕（合片后、交片前）

讲解片旁白要变成画面里的字幕，**硬烧进像素**（关闭播放器字幕开关也看得见）。与网页录屏 skill 的「成片叠字 ≥36px」同一可读底线。

### 8.1 准备字幕时间轴

1. 源文案：`public/voice/scripts.json` 各页句子（与成片旁白一字不差，或经用户确认的字幕精简版）
2. 按 `SCENE_DURATIONS` + 转场重叠算出**全片绝对时间**（每页起点 = 前面各段时长之和 − 已发生的 fade 重叠）
3. 产出本任务内文件其一即可：
   - `public/captions/captions.json`：`@remotion/captions` 的 `Caption[]`（`text` / `startMs` / `endMs`）
   - 或 `public/captions/captions.srt`：标准 SRT
4. 长句拆成短行（竖屏一行不宜过长）；页内多句按 VO 自然停顿切条
5. **硬停（建议）**：先出 5–10 秒带字幕预览或静帧，用户 OK 字号/位置后再全片烧录

### 8.2 推荐做法 A：Remotion 内烧录（优先）

一次渲染即含字幕，时间轴与 composition 同源。

1. `npx remotion add @remotion/captions`（见 [remotion-captions](sand-workflow:remotion-captions)）
2. 用官方 Basic Captions 元素（或等价自绘字幕层）叠在主 composition **最上层**
3. 竖屏建议：`bottom` 约 120–180；字号 ≥36；深色半透明底或描边；宽度约 900–1000，水平居中
4. 直接渲定稿：`npx remotion render <主CompositionId> out/<成片名>.mp4`
5. 若已有无字幕 master：改 composition 加上字幕层后**重渲全片**（不要只 ffmpeg 贴一层却不同步时轴）

### 8.3 备选做法 B：ffmpeg 烧 SRT（已有无字幕 master 时）

```bash
ffmpeg -y -i out/<成片名>-master.mp4 \
  -vf "subtitles=public/captions/captions.srt:force_style='FontName=Noto Sans SC,FontSize=36,Outline=2,Shadow=0,MarginV=80,Alignment=2'" \
  -c:a copy out/<成片名>.mp4
```

- `FontSize` 按 1080 宽可读性微调，但成片观感不得低于约 36px 等效
- 烧完后用播放器抽查开场、中段、结尾；`ffprobe` 确认时长与音轨仍在
- master 可进 `_trash/` 或定稿整理时删除；**交付只留烧好字幕的文件**

### 8.4 自检

- 关字幕开关仍能看见字（确认为硬烧）
- 与旁白同步，无明显提前/滞后；无错字（对照 scripts.json）
- 不遮挡示例视频关键操作区；网格与标题区不被大块字幕糊死


---

# 六、接线配方与最小骨架

## 推荐接线

1. **底层**：`AbsoluteFill` 黑底 + `DualRetroGrid`
2. **时间轴**：`TransitionSeries` + `fade()` + `linearTiming({ durationInFrames: 15 })`
3. **文字页**：`Audio` + `SceneLayout`（`revealMode="blurInUp"`）
4. **示例页**：`SchematicFocus` / `FocusedVideoDemo` / `FullVideoDemo`
5. **Root**：主 composition `defaultProps={{ forceCssFallback: true }}`；另注册 `Anim*` 预览

## 最小 composition 骨架

```tsx
import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { DualRetroGrid } from "./components/DualRetroGrid";
import { SceneLayout } from "./components/SceneLayout";

const FADE = 15;

export const GridExplainer: React.FC<{ forceCssFallback?: boolean }> = ({
  forceCssFallback = true,
}) => {
  const fadeTiming = linearTiming({ durationInFrames: FADE });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <DualRetroGrid forceCssFallback={forceCssFallback} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={240}>
          <AbsoluteFill>
            <Audio src={staticFile("voice/page01.mp3")} />
            <SceneLayout
              kicker="01 · 示例"
              title="这一页讲什么"
              bullets={["要点一", "要点二"]}
              revealMode="blurInUp"
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />
        {/* 后续页… */}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

Root 注册：`width={1080}` `height={1920}` `fps={30}`，并设 `forceCssFallback: true`。

---

# 七、交付清单

- [ ] **本任务专用目录**已建；过程文件未散落在 workspace 根或其它任务目录
- [ ] README 含分辨率/横竖屏、字号、动效、composition、导出命令
- [ ] 组件包已拷入本任务 `src/`，`magicui/CREDITS.md` 仍在
- [ ] 画幅 1080×1920 @30fps；顶/底网格可见且不抢字
- [ ] 开场标题静态；讲解页 blurInUp；叠字 ≥36px
- [ ] 文案/时长/关键预览已经用户确认后再合片
- [ ] 每页旁白与 `SCENE_DURATIONS` 对齐；全片有声（若设计有声）
- [ ] **硬烧录字幕**已完成：与旁白一致、≥36px、关播放器字幕轨仍可见；定稿文件为烧录后版本
- [ ] 示例：高清、剪点正确；需局部放大的已单独预览通过
- [ ] 定稿后已整理：保留清单 + 删除清单 + **工程路径**已告知用户
- [ ] 再分发时保留 Magic UI / Remotion 署名要求

---

# 可选参考

若本机已有成功成片工程（例如曾用过的 `skill-explainer-video`），可对照其 `Root` / 场景文件，但**新任务仍须新建专用目录**，以本 skill 组件包为准移植，勿把新片文件堆进旧目录或依赖他人机器上的绝对路径。
