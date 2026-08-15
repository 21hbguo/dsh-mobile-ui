/**
 * MobileUiEngine — 浏览器半区核心：窄屏（默认 ≤860px）下的全屏聊天适配层。
 *
 * 策略（全部原生 DOM，无 react）：
 *  1. `body.dsh-mobile` 开关类由 matchMedia(breakpoint) 驱动，整个注入样式表
 *     都挂在它下面——桌面宽度零影响。
 *  2. 把三栏 + aionui 两栏的 frame 网格强制为单列（`!important` 覆盖内联
 *     grid-template-columns）：侧栏列 / 详情列 / aionui 预览&资源列全部脱离
 *     文档流，变成固定定位的左右抽屉（transform 进出场）。
 *  3. 抽屉开合状态全部取自 frame 自身稳定钩子：侧栏 = `data-sidebar-collapsed`
 *     属性（布局 store 决定）；aionui 两列 = 解析 frame 内联 grid 轨道宽度
 *     （aionui 每次切换都会重写内联模板，MutationObserver 镜像成
 *     `dsh-mobile-explorer-open` / `dsh-mobile-preview-open` 类）。
 *  4. 激活瞬间自动收起 aionui 已展开的列（点其内部 chevron），保证手机打开
 *     时是聊天优先，不弹抽屉。
 *  5. 顶部悬浮操作条：☰ 侧栏（ctx.layout.toggleSidebar）、面板（合成 aionui
 *     浮出按钮/chevron 点击）、⛶ 全屏（Fullscreen API；iOS 无此 API 时提示
 *     添加到主屏幕）。
 *  6. 视口 meta 改写（viewport-fit=cover、禁双击缩放）+ PWA 全屏 meta。
 *
 * 失败策略与 dsh-sysmon 一致：DOM 问题只记日志不抛错，绝不拖垮 web boot。
 * @module @dsh-external/dsh-mobile-ui/client
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * The mobile adaptation engine. Mount once per plugin apply; dispose removes
 * every DOM side effect (style, bar, meta patches, observers, listeners).
 */
export declare class MobileUiEngine {
    private readonly ctx;
    private readonly breakpoint;
    private mq;
    private mqListener;
    private frame;
    private styleEl;
    private barEl;
    private toastEl;
    private toastTimer;
    private waitObserver;
    private styleObserver;
    private childObserver;
    private fullscreenListener;
    private sessionsOff;
    private lastSessionId;
    /** Whether the sessions store delivered its first snapshot. */
    private sessionsInitialized;
    /** Whether the mobile layout is active right now. */
    private active;
    /** Per-activation guard: aionui auto-collapse runs once per activation. */
    private autoClosed;
    /** While true, the state mirror may only close drawers (activation wrap-up). */
    private suppressOpen;
    /** Timestamp of the first consecutive all-closed observation (zero-streak). */
    private zeroStreakAt;
    /** Grace timestamp: settle "no aionui" after this many ms without a 5-track template. */
    private autoCloseGraceUntil;
    /** Deadline for the pending-chevron retry loop (reset per activation). */
    private autoCloseRetryAt;
    /** Pending auto-close retry timer (cleared on dispose/deactivate). */
    private retryTimer;
    /** Keeps the original viewport content for restore. */
    private originalViewport;
    /**
     * @param ctx - client plugin context (ctx.layout / ctx.sessions used).
     * @param breakpoint - resolves the current breakpoint px (settings-aware).
     */
    constructor(ctx: ClientContext, breakpoint: () => number);
    /** Install everything. */
    mount(): void;
    /** Remove every DOM side effect. */
    dispose(): void;
    private injectStyle;
    private patchMetas;
    private readThemeColor;
    private buildBar;
    /** Rebuild the matchMedia query (called on breakpoint setting change). */
    applyBreakpoint(): void;
    private setActive;
    private applyMobileViewport;
    private restoreViewport;
    private watchFrame;
    private attachFrame;
    private syncAionuiState;
    private syncPanelButton;
    /** 激活瞬间收起 aionui 已展开的列（点击其内部 chevron；每激活一次）。
     *  aionui 列、5 轨模板和它的根初始化（会从 localStorage 恢复展开态）都晚于
     *  frame 挂载 → 本方法由 style/child 观察器 + 定时器反复触发：任何时刻只要
     *  看到展开轨道就点 chevron 并强制视觉关闭（聊天优先），直到轨道连续 ~300ms
     *  保持关闭才收场；8s 宽限兜底（aionui 无法收起时保持视觉关闭）。 */
    private autoCloseAionui;
    private onBarAction;
    private toggleRightPanel;
    private toggleFullscreen;
    private onBackdropClick;
    private onSessionsChange;
    private showToast;
}
