# WebVideoCap · 网页操作录屏

面向 coding agent / Cursor 的 **网页操作录屏 Skill**：按确认流程，把任意网站的浏览与操作录成演示视频（脚本驱动、自定义鼠标、系统/浏览器音效、可选 BGM）。

## 演示

竖屏讲解片，硬烧中英字幕 — 网页交互录屏 Skill。

<video src="./readme.mp4" controls width="360"></video>

[演示说明视频 (readme.mp4)](./readme.mp4)

## 安装

把本仓库的 `SKILL.md` 放到你的 agent skills / workflows 目录（或按你所用工具的 skill 安装方式引用本文件）。

Skill 名称：`网页操作录屏`

## 它做什么

- 每次录制任务单独建目录，过程文件与成品隔离
- 先写时间轴脚本（优先 DOM 选择器，像素坐标兜底）并画操作示意图，确认后再开录
- 开录前确认成片分辨率/横竖屏、始帧录屏范围、点击穿透与音效解锁
- 成片约束：点后移开鼠标、关键文案放大看清、验证动效生效、音效进成片
- 竖屏手机叠字推荐字号与最小 36px@1080

完整流程与硬规矩见 [`SKILL.md`](./SKILL.md)。

## 许可

[MIT License](./LICENSE)。本仓库以 Skill 文档形式发布。
