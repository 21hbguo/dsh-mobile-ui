# dsh-mobile-ui — DSH Web GUI 手机端 UI 适配插件

在窄屏（默认视口宽度 ≤ 860px，可配置）下把 DeepSeek Harness Web GUI 从
桌面三栏布局重构为**全屏聊天布局**：

- **聊天区全宽**：三栏 + 右侧面板列全部脱离文档流，聊天占满整屏，不再挤在
  114px 的缝里。
- **侧栏 → 左侧抽屉**：点顶部 ☰ 滑出；点遮罩、侧栏自身收起按钮、或在侧栏里
  点了会话/「新会话」都会自动收起。
- **右侧面板 → 抽屉**：详情列与 aionui 的「资源列 / 预览列」都变为右侧抽屉
  （点顶部面板按钮或 aionui 自带浮出按钮打开，内部 chevron / 遮罩关闭）。
- **顶部悬浮操作条**：☰ 侧栏 · 面板 · ⛶ 全屏（Fullscreen API；iOS 无此 API
  时提示「添加到主屏幕」全屏使用）。
- **移动端细节**：`viewport-fit=cover` + 安全区适配（刘海/底部横条）、16px
  输入框字号防 iOS 聚焦缩放、双击缩放禁用、`apple-mobile-web-app-capable`
  等 PWA meta（可「添加到主屏幕」全屏运行）。
- **激活瞬间自动收起 aionui 已展开的列**：手机上打开时聊天优先，不弹文件树。

桌面宽度下零影响：所有规则挂在 `body.dsh-mobile` 开关类下，离开窄屏即恢复
桌面三栏布局与原始 viewport meta。

## 安装

```bash
# 在 DSH 主机上（以 web profile 为例）
cd ~/project/other/dsh/dsh-mobile-ui && bash scripts/build.sh
```

然后用 dev_install_package 热装配，或在 `~/.dsh/profiles/web/cordis.patch.yml`
加一行（重启后由 bundles 装配）：

```yaml
- insert:
    - id: mobile-ui
      name: '@dsh-external/dsh-mobile-ui'
```

## 配置

设置 → 插件 → 「手机端 UI 适配」卡片（命名空间 `mobile-ui`，已声明 `web: true`
暴露，可直接在设置页读写）：

| 字段 | 默认 | 说明 |
|---|---|---|
| `enabled` | `true` | 总开关；关闭即卸载全部适配（样式/操作条/观察器） |
| `breakpoint` | `860` | 视口宽度 ≤ 该值（px）时启用移动布局，范围 400–1280 |

也可直接编辑 `~/.dsh/settings.yaml`：

```yaml
mobile-ui:
  enabled: true
  breakpoint: 860
```

## 工作原理（维护者速览）

- 纯原生 DOM，无 react 依赖；client bundle ~10KB gzip。
- frame 定位：`[data-dsh-frame]`（web-ui-all 兼容 shim 打的标记）兜底
  `[data-sidebar-collapsed]`，找到后加 `dsh-mobile-frame` 标记类。
- 单列化：`grid-template-columns: minmax(0,1fr) !important` 覆盖 AppFrame 与
  aionui 写入的内联模板；各列 `position: fixed` 拖出文档流变为抽屉。
- 抽屉开合状态全部取自稳定钩子：侧栏 = `data-sidebar-collapsed` 属性；
  aionui 两列 = MutationObserver 解析 frame 内联 grid 轨道（第 4/5 轨）镜像为
  `dsh-mobile-explorer-open` / `dsh-mobile-preview-open` 类。
- 激活收起：aionui 列/模板/根初始化都晚于 frame，采用「观察器 + 150ms 定时
  复查 + 零连续窗口 300ms」收敛，8s 兜底强制视觉关闭（聊天优先）。
- 遮罩 = frame 的 `::before`（左）/`::after`（右），点击 target 即 frame 本身，
  按 侧栏 → 详情 → aionui 优先级逐个关闭。

## 已知限制

- iOS Safari 无网页 Fullscreen API：⛶ 按钮会提示「添加到主屏幕」。
- 桌面宽度下的 aionui 拖拽把手在移动端隐藏；抽屉宽度不可拖拽（固定
  84vw/320px 与 94vw/480px）。
- 详情列在 ≤860px 下会被 AppFrame 自动收起（布局约束），移动端主要使用
  aionui 右侧面板；详情抽屉规则作为兜底存在。
