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

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the layout plugin's Context merge (ctx.layout) and the
// slots SlotMap merge table for the settings card seat.
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'

/** Injected stylesheet element id. */
const MOBILE_CSS_ID = 'dsh-mobile-ui-style'
/** Floating top-bar element id. */
const BAR_ID = 'dsh-mobile-ui-bar'
/** One-shot toast element id. */
const TOAST_ID = 'dsh-mobile-ui-toast'
/** Marker class stamped onto the frame grid once found. */
const FRAME_MARKER = 'dsh-mobile-frame'
/** Original viewport meta content (restored on leave/dispose). */
const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1'
/** Mobile viewport content: cover safe areas + kill double-tap zoom. */
const MOBILE_VIEWPORT = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'

/** Frame selector: aionui's compat shim stamps data-dsh-frame; without it the
 *  frame carries data-sidebar-collapsed / data-details-collapsed at render. */
const FRAME_SELECTOR = '[data-dsh-frame], [data-sidebar-collapsed], [data-details-collapsed]'

/**
 * The injected stylesheet. Every rule is scoped under `body.dsh-mobile` so
 * desktop widths are untouched; frame children are addressed by stable DOM
 * position (sidebar/center/details/overlay) and aionui's un-hashed class
 * names rather than CSS-module hashes.
 */
const CSS = `
body.dsh-mobile {
  -webkit-text-size-adjust: 100%;
  touch-action: manipulation;
}
body.dsh-mobile * { -webkit-tap-highlight-color: transparent; }
body.dsh-mobile button { touch-action: manipulation; }

/* ① frame → 单列全屏聊天；给顶部操作条留出高度 */
body.dsh-mobile .dsh-mobile-frame {
  grid-template-columns: minmax(0, 1fr) !important;
}
body.dsh-mobile .dsh-mobile-frame > :nth-child(2) {
  padding-top: 52px;
}

/* ② 侧栏 → 左侧抽屉（开合由 data-sidebar-collapsed 驱动） */
body.dsh-mobile .dsh-mobile-frame > :first-child {
  position: fixed !important;
  top: 0; bottom: 0; left: 0;
  width: min(84vw, 320px) !important;
  z-index: 60;
  transform: translateX(-108%);
  transition: transform .26s cubic-bezier(.4, 0, .2, 1);
  box-shadow: 4px 0 28px rgba(0, 0, 0, .35);
  background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-1, #14161a));
}
body.dsh-mobile .dsh-mobile-frame:not([data-sidebar-collapsed]) > :first-child {
  transform: translateX(0);
}
/* 侧栏遮罩 */
body.dsh-mobile .dsh-mobile-frame:not([data-sidebar-collapsed])::before {
  content: ''; position: fixed; inset: 0; z-index: 59;
  background: rgba(0, 0, 0, .4);
}

/* ③ 详情列 → 右侧抽屉（移动端通常自动收起，规则作为兜底） */
body.dsh-mobile .dsh-mobile-frame > :nth-child(3) {
  position: fixed !important;
  top: 0; bottom: 0; right: 0;
  width: min(92vw, 480px) !important;
  z-index: 64;
  transform: translateX(108%);
  transition: transform .26s cubic-bezier(.4, 0, .2, 1);
  box-shadow: -4px 0 28px rgba(0, 0, 0, .35);
  background: var(--dsw-alias-bg-layer-1, #14161a);
}
body.dsh-mobile .dsh-mobile-frame:not([data-details-collapsed]) > :nth-child(3) {
  transform: translateX(0);
}

/* ④ aionui 资源列/预览列 → 右侧抽屉（开合由镜像类驱动） */
body.dsh-mobile .dsh-mobile-frame > .aionui-explorer-col,
body.dsh-mobile .dsh-mobile-frame > .aionui-preview-col {
  position: fixed !important;
  top: 0; bottom: 0; right: 0;
  width: min(94vw, 480px) !important;
  z-index: 62;
  transform: translateX(108%);
  transition: transform .26s cubic-bezier(.4, 0, .2, 1);
  box-shadow: -4px 0 28px rgba(0, 0, 0, .35);
}
body.dsh-mobile .dsh-mobile-frame.dsh-mobile-explorer-open > .aionui-explorer-col,
body.dsh-mobile .dsh-mobile-frame.dsh-mobile-preview-open > .aionui-preview-col {
  transform: translateX(0);
}
/* 资源列优先：两列同时开时只露资源列 */
body.dsh-mobile .dsh-mobile-frame.dsh-mobile-explorer-open > .aionui-preview-col {
  transform: translateX(108%);
}
/* 右侧遮罩 */
body.dsh-mobile .dsh-mobile-frame.dsh-mobile-explorer-open::after,
body.dsh-mobile .dsh-mobile-frame.dsh-mobile-preview-open::after {
  content: ''; position: fixed; inset: 0; z-index: 61;
  background: rgba(0, 0, 0, .4);
}
/* 移动端隐藏 aionui 拖拽把手，放大其浮出按钮便于点按 */
body.dsh-mobile .dsh-mobile-frame > .aionui-explorer-handle,
body.dsh-mobile .dsh-mobile-frame > .aionui-preview-handle {
  display: none !important;
}
body.dsh-mobile .aionui-floating-expand {
  width: 28px !important;
  height: 76px !important;
}

/* ⑤ 顶部悬浮操作条 */
.dsh-mobile-bar {
  display: none;
}
body.dsh-mobile .dsh-mobile-bar {
  display: flex;
  position: fixed;
  top: 0; left: 0; right: 0;
  padding: calc(env(safe-area-inset-top, 0px) + 8px) 12px 4px;
  justify-content: space-between;
  align-items: center;
  z-index: 58;
  pointer-events: none;
}
body.dsh-mobile .dsh-mobile-bar-btn {
  pointer-events: auto;
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, .14));
  background: var(--dsw-alias-button-floating-fill, rgba(18, 20, 24, .78));
  color: var(--dsw-alias-label-primary, #e8eaed);
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, .18);
}
body.dsh-mobile .dsh-mobile-bar-btn:active { opacity: .78; }
body.dsh-mobile .dsh-mobile-bar-btn[hidden] { display: none; }

/* ⑥ 输入区：底部安全区 + 16px 字号防 iOS 聚焦缩放 */
body.dsh-mobile [data-composer-seat] {
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px);
}
body.dsh-mobile [data-composer-seat] textarea {
  font-size: 16px !important;
}

/* ⑦ 一次性提示 toast */
.dsh-mobile-toast {
  display: none;
}
body.dsh-mobile .dsh-mobile-toast {
  display: block;
  position: fixed;
  left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 96px);
  transform: translateX(-50%);
  z-index: 90;
  max-width: 86vw;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  color: var(--dsw-alias-label-inverse, #fff);
  background: rgba(0, 0, 0, .82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, .35);
}
`

/** Parse an inline grid-template-columns string into track tokens (spaces
 *  inside parens must not split). */
function parseTracks(input: string): string[] {
  const tracks: string[] = []
  let depth = 0
  let current = ''
  for (const char of input) {
    if (char === '(') depth += 1
    if (char === ')') depth = Math.max(0, depth - 1)
    if (char === ' ' && depth === 0) {
      if (current !== '') { tracks.push(current); current = '' }
      continue
    }
    current += char
  }
  if (current !== '') tracks.push(current)
  return tracks
}

/** Extract a px width from one track (0 for fr/minmax/non-px tracks). */
function trackPx(track: string): number {
  const match = /^(-?[\d.]+)px$/.exec(track.trim())
  return match === null ? 0 : Number(match[1])
}

/** Small inline SVG icon set for the top bar. */
const ICONS = {
  menu: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12"/></svg>',
  panel: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M10.5 2.5v11"/></svg>',
  expand: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4"/></svg>',
  compress: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/></svg>',
} as const

/**
 * The mobile adaptation engine. Mount once per plugin apply; dispose removes
 * every DOM side effect (style, bar, meta patches, observers, listeners).
 */
export class MobileUiEngine {
  private readonly ctx: ClientContext
  private readonly breakpoint: () => number

  private mq: MediaQueryList | null = null
  private mqListener: (() => void) | null = null
  private frame: HTMLElement | null = null
  private styleEl: HTMLStyleElement | null = null
  private barEl: HTMLDivElement | null = null
  private toastEl: HTMLDivElement | null = null
  private toastTimer: number | undefined = undefined
  private waitObserver: MutationObserver | null = null
  private styleObserver: MutationObserver | null = null
  private childObserver: MutationObserver | null = null
  private fullscreenListener: (() => void) | null = null
  private sessionsOff: (() => void) | null = null
  private lastSessionId: string | undefined = undefined
  /** Whether the sessions store delivered its first snapshot. */
  private sessionsInitialized = false

  /** Whether the mobile layout is active right now. */
  private active = false
  /** Per-activation guard: aionui auto-collapse runs once per activation. */
  private autoClosed = false
  /** While true, the state mirror may only close drawers (activation wrap-up). */
  private suppressOpen = false
  /** Timestamp of the first consecutive all-closed observation (zero-streak). */
  private zeroStreakAt = 0
  /** Grace timestamp: settle "no aionui" after this many ms without a 5-track template. */
  private autoCloseGraceUntil = 0
  /** Deadline for the pending-chevron retry loop (reset per activation). */
  private autoCloseRetryAt = 0
  /** Pending auto-close retry timer (cleared on dispose/deactivate). */
  private retryTimer: number | undefined = undefined
  /** Keeps the original viewport content for restore. */
  private originalViewport = DEFAULT_VIEWPORT

  /**
   * @param ctx - client plugin context (ctx.layout / ctx.sessions used).
   * @param breakpoint - resolves the current breakpoint px (settings-aware).
   */
  constructor(ctx: ClientContext, breakpoint: () => number) {
    this.ctx = ctx
    this.breakpoint = breakpoint
  }

  /** Install everything. */
  mount(): void {
    try {
      this.injectStyle()
      this.patchMetas()
      this.buildBar()
      this.applyBreakpoint()
      this.watchFrame()
      // 会话切换后自动收起侧栏抽屉（点击会话/新建会话后回到聊天）
      try {
        const list = this.ctx.sessions?.list
        if (list !== undefined) {
          this.sessionsOff = list.subscribe(() => { this.onSessionsChange() })
        }
      } catch { /* sessions service unavailable — drawer stays manual */ }
    } catch (error) {
      console.warn('[mobile-ui] mount failed', error)
    }
  }

  /** Remove every DOM side effect. */
  dispose(): void {
    try {
      this.active = false
      document.body.classList.remove('dsh-mobile')
      this.frame?.classList.remove(FRAME_MARKER, 'dsh-mobile-explorer-open', 'dsh-mobile-preview-open')
      this.styleEl?.remove(); this.styleEl = null
      this.barEl?.remove(); this.barEl = null
      this.toastEl?.remove(); this.toastEl = null
      if (this.toastTimer !== undefined) { clearTimeout(this.toastTimer); this.toastTimer = undefined }
      this.waitObserver?.disconnect(); this.waitObserver = null
      this.styleObserver?.disconnect(); this.styleObserver = null
      this.childObserver?.disconnect(); this.childObserver = null
      if (this.mqListener !== null && this.mq !== null) {
        this.mq.removeEventListener('change', this.mqListener)
      }
      this.mq = null; this.mqListener = null
      if (this.retryTimer !== undefined) { clearTimeout(this.retryTimer); this.retryTimer = undefined }
      if (this.fullscreenListener !== null) {
        document.removeEventListener('fullscreenchange', this.fullscreenListener)
        this.fullscreenListener = null
      }
      this.sessionsOff?.(); this.sessionsOff = null
      this.restoreViewport()
    } catch (error) {
      console.warn('[mobile-ui] dispose failed', error)
    }
  }

  // ---------- install ----------

  private injectStyle(): void {
    if (document.getElementById(MOBILE_CSS_ID) !== null) return
    const style = document.createElement('style')
    style.id = MOBILE_CSS_ID
    style.textContent = CSS
    document.head.appendChild(style)
    this.styleEl = style
  }

  private patchMetas(): void {
    const ensureMeta = (name: string, content: string): void => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
      if (el === null) {
        el = document.createElement('meta')
        el.name = name
        document.head.appendChild(el)
      }
      el.content = content
    }
    const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
    if (viewport !== null) this.originalViewport = viewport.content
    ensureMeta('mobile-web-app-capable', 'yes')
    ensureMeta('apple-mobile-web-app-capable', 'yes')
    ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent')
    ensureMeta('theme-color', this.readThemeColor())
  }

  private readThemeColor(): string {
    try {
      const bg = getComputedStyle(document.body).backgroundColor
      return bg !== '' && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#101216'
    } catch { return '#101216' }
  }

  private buildBar(): void {
    const bar = document.createElement('div')
    bar.id = BAR_ID
    bar.className = 'dsh-mobile-bar'
    bar.setAttribute('data-dsh-mobile-bar', '')
    const btn = (action: 'sidebar' | 'panel' | 'fullscreen', icon: string, label: string): HTMLButtonElement => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'dsh-mobile-bar-btn'
      el.dataset.act = action
      el.setAttribute('aria-label', label)
      el.innerHTML = icon
      el.addEventListener('click', (event) => {
        event.stopPropagation()
        this.onBarAction(action)
      })
      return el
    }
    const sidebarBtn = btn('sidebar', ICONS.menu, '打开侧栏')
    const panelBtn = btn('panel', ICONS.panel, '打开右侧面板')
    const fullscreenBtn = btn('fullscreen', ICONS.expand, '全屏')
    bar.append(sidebarBtn, panelBtn, fullscreenBtn)
    document.body.appendChild(bar)
    this.barEl = bar

    this.fullscreenListener = (): void => {
      fullscreenBtn.innerHTML = document.fullscreenElement === null ? ICONS.expand : ICONS.compress
      fullscreenBtn.setAttribute('aria-label', document.fullscreenElement === null ? '全屏' : '退出全屏')
    }
    document.addEventListener('fullscreenchange', this.fullscreenListener)
  }

  // ---------- breakpoint / activation ----------

  /** Rebuild the matchMedia query (called on breakpoint setting change). */
  applyBreakpoint(): void {
    if (this.mqListener !== null && this.mq !== null) {
      this.mq.removeEventListener('change', this.mqListener)
    }
    const bp = Math.max(320, Math.min(1600, this.breakpoint()))
    const mq = window.matchMedia(`(max-width: ${bp}px)`)
    const listener = (): void => { this.setActive(mq.matches) }
    this.mq = mq
    this.mqListener = listener
    mq.addEventListener('change', listener)
    this.setActive(mq.matches)
  }

  private setActive(active: boolean): void {
    if (this.active === active) return
    this.active = active
    document.body.classList.toggle('dsh-mobile', active)
    if (active) {
      this.applyMobileViewport()
      this.autoClosed = false
      this.autoCloseGraceUntil = 0
      this.autoCloseRetryAt = 0
      this.zeroStreakAt = 0
      this.suppressOpen = true
      this.autoCloseAionui()
    } else {
      this.restoreViewport()
      this.suppressOpen = false
      if (this.retryTimer !== undefined) { clearTimeout(this.retryTimer); this.retryTimer = undefined }
      this.frame?.classList.remove('dsh-mobile-explorer-open', 'dsh-mobile-preview-open')
    }
  }

  private applyMobileViewport(): void {
    const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
    if (viewport !== null) viewport.content = MOBILE_VIEWPORT
  }

  private restoreViewport(): void {
    const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
    if (viewport !== null) viewport.content = this.originalViewport
  }

  // ---------- frame discovery & layout mirror ----------

  private watchFrame(): void {
    const tryAttach = (): void => {
      if (this.frame !== null) return
      const frame = document.querySelector<HTMLElement>(FRAME_SELECTOR)
      if (frame === null) return
      this.attachFrame(frame)
    }
    this.waitObserver = new MutationObserver(() => { tryAttach() })
    this.waitObserver.observe(document.body, { childList: true, subtree: true })
    tryAttach()
  }

  private attachFrame(frame: HTMLElement): void {
    this.frame = frame
    frame.classList.add(FRAME_MARKER)
    // 镜像 aionui 内联 grid 轨道 → 抽屉开合类；同时重试激活收起
    this.styleObserver = new MutationObserver(() => {
      this.syncAionuiState()
      if (this.active && !this.autoClosed) this.autoCloseAionui()
    })
    this.styleObserver.observe(frame, { attributes: true, attributeFilter: ['style'] })
    // aionui 列可能晚于 frame 挂载 → 同步右侧面板按钮可见性 + 重试激活收起
    this.childObserver = new MutationObserver(() => {
      this.syncPanelButton()
      if (this.active && !this.autoClosed) this.autoCloseAionui()
    })
    this.childObserver.observe(frame, { childList: true })
    // 点击遮罩（frame 自身的 ::before/::after）→ 关闭对应抽屉
    frame.addEventListener('click', (event) => {
      if (event.target !== frame) return
      this.onBackdropClick()
    })
    // 「新会话」不切换 current（新会话需手动选中）→ 点它也要收起抽屉；
    // 会话行切换 current 由 sessions 订阅处理；折叠按钮自身会关抽屉，排除。
    frame.children[0]?.addEventListener('click', (event) => {
      if (!this.active) return
      const button = (event.target as Element | null)?.closest?.('button')
      if (button === null || button === undefined) return
      const label = `${button.getAttribute('aria-label') ?? ''} ${button.textContent ?? ''}`
      if (button.hasAttribute('data-dsh-mobile-bar')) return
      const isCollapse = /收起|折叠|collapse/i.test(label)
      const isNewSession = /新建会话|新会话|new chat|new session|^新/i.test(label)
      if (!isCollapse && isNewSession) {
        window.setTimeout(() => {
          try { this.ctx.layout?.toggleSidebar() } catch { /* ignore */ }
        }, 250)
      }
    })
    this.syncAionuiState()
    this.syncPanelButton()
    if (this.active) this.autoCloseAionui()
  }

  private syncAionuiState(): void {
    const frame = this.frame
    if (frame === null) return
    if (this.suppressOpen) {
      // 激活收尾期间：只允许视觉关闭，禁止镜像类把抽屉重新打开
      frame.classList.remove('dsh-mobile-explorer-open', 'dsh-mobile-preview-open')
      return
    }
    const inline = frame.style.gridTemplateColumns
    if (inline === '') return
    const tracks = parseTracks(inline)
    const previewOpen = tracks.length >= 4 && trackPx(tracks[3]) > 0
    const explorerOpen = tracks.length >= 5 && trackPx(tracks[4]) > 0
    frame.classList.toggle('dsh-mobile-explorer-open', explorerOpen)
    frame.classList.toggle('dsh-mobile-preview-open', previewOpen)
  }

  private syncPanelButton(): void {
    if (this.barEl === null || this.frame === null) return
    const hasAionui = this.frame.querySelector('.aionui-explorer-col, .aionui-preview-col') !== null
    const btn = this.barEl.querySelector<HTMLButtonElement>('[data-act="panel"]')
    if (btn !== null) btn.hidden = !hasAionui
  }

  /** 激活瞬间收起 aionui 已展开的列（点击其内部 chevron；每激活一次）。
   *  aionui 列、5 轨模板和它的根初始化（会从 localStorage 恢复展开态）都晚于
   *  frame 挂载 → 本方法由 style/child 观察器 + 定时器反复触发：任何时刻只要
   *  看到展开轨道就点 chevron 并强制视觉关闭（聊天优先），直到轨道连续 ~300ms
   *  保持关闭才收场；8s 宽限兜底（aionui 无法收起时保持视觉关闭）。 */
  private autoCloseAionui(): void {
    const frame = this.frame
    if (frame === null || this.autoClosed || !this.active) return
    try {
      const tracks = parseTracks(frame.style.gridTemplateColumns)
      const fiveTracks = tracks.length >= 5
      const cols: Array<[number, string, string]> = [
        [4, '.aionui-explorer-col', 'dsh-mobile-explorer-open'],
        [3, '.aionui-preview-col', 'dsh-mobile-preview-open'],
      ]
      if (!fiveTracks) {
        // aionui 尚未写入 5 轨模板：宽限期后仍无 → 视为没有 aionui
        if (this.autoCloseGraceUntil === 0) this.autoCloseGraceUntil = performance.now() + 2500
        if (performance.now() >= this.autoCloseGraceUntil) {
          this.autoClosed = true
          this.suppressOpen = false
        }
        return
      }
      const openCols = cols.filter(([index]) => trackPx(tracks[index] ?? '') > 0)
      if (openCols.length === 0) {
        // 全关：要求连续 ~300ms 稳定（防异步根初始化回弹）
        if (this.zeroStreakAt === 0) this.zeroStreakAt = performance.now()
        if (performance.now() - this.zeroStreakAt >= 300) {
          this.autoClosed = true
          this.suppressOpen = false
          return
        }
        this.retryTimer = window.setTimeout(() => { this.autoCloseAionui() }, 150)
        return
      }
      this.zeroStreakAt = 0
      for (const [, selector, cls] of openCols) {
        const chevron = frame.querySelector<HTMLElement>(`${selector} .aionui-collapse-chevron`)
        if (chevron !== null) chevron.click()
        frame.classList.remove(cls) // 视觉先行，无论 aionui 是否响应
      }
      if (this.autoCloseRetryAt === 0) this.autoCloseRetryAt = performance.now() + 8000
      if (performance.now() >= this.autoCloseRetryAt) {
        this.autoClosed = true // 尽力而为：aionui 状态留原样，面板按钮可再打开
        this.suppressOpen = false
        return
      }
      this.retryTimer = window.setTimeout(() => { this.autoCloseAionui() }, 150)
    } catch { this.autoClosed = true /* aionui 状态异常时保持现状 */ }
  }

  // ---------- interactions ----------

  private onBarAction(action: 'sidebar' | 'panel' | 'fullscreen'): void {
    if (action === 'sidebar') {
      try { this.ctx.layout?.toggleSidebar() } catch (error) { console.warn('[mobile-ui] toggle sidebar failed', error) }
      return
    }
    if (action === 'panel') {
      this.toggleRightPanel()
      return
    }
    this.toggleFullscreen()
  }

  private toggleRightPanel(): void {
    const frame = this.frame
    if (frame === null) return
    const explorerOpen = frame.classList.contains('dsh-mobile-explorer-open')
    const previewOpen = frame.classList.contains('dsh-mobile-preview-open')
    if (explorerOpen || previewOpen) {
      // 关：点开着的列自己的 chevron（aionui 状态同步收起）
      const selector = explorerOpen ? '.aionui-explorer-col' : '.aionui-preview-col'
      const chevron = frame.querySelector<HTMLElement>(`${selector} .aionui-collapse-chevron`)
      if (chevron !== null) chevron.click()
      frame.classList.remove('dsh-mobile-explorer-open', 'dsh-mobile-preview-open')
      return
    }
    // 开：优先点 aionui 浮出按钮（aionui 状态 collapsed 时它可见）；
    // 否则 aionui 认为已开但抽屉关着 → 直接上类。
    this.suppressOpen = false // 手动打开 → 恢复状态镜像
    const floatBtn = document.querySelector<HTMLElement>('.aionui-floating-expand')
    if (floatBtn !== null && getComputedStyle(floatBtn).display !== 'none') {
      floatBtn.click()
      return
    }
    frame.classList.add('dsh-mobile-explorer-open')
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement !== null) {
      void document.exitFullscreen().catch(() => { /* ignore */ })
      return
    }
    if (typeof document.documentElement.requestFullscreen === 'function') {
      void document.documentElement.requestFullscreen().catch(() => {
        this.showToast('当前浏览器拒绝了全屏请求')
      })
      return
    }
    // iOS Safari 无 Fullscreen API → 提示添加到主屏幕
    this.showToast('建议：浏览器菜单 →「添加到主屏幕」，即可全屏使用')
  }

  private onBackdropClick(): void {
    const frame = this.frame
    if (frame === null || !this.active) return
    // 侧栏抽屉开着 → 先关它；再关详情抽屉；最后关右侧 aionui 面板
    if (!frame.hasAttribute('data-sidebar-collapsed')) {
      try { this.ctx.layout?.toggleSidebar() } catch { /* ignore */ }
      return
    }
    if (!frame.hasAttribute('data-details-collapsed')) {
      try { this.ctx.layout?.closeDetails() } catch { /* ignore */ }
      return
    }
    if (frame.classList.contains('dsh-mobile-explorer-open') || frame.classList.contains('dsh-mobile-preview-open')) {
      this.toggleRightPanel()
    }
  }

  private onSessionsChange(): void {
    try {
      const list = this.ctx.sessions?.list
      const state = list?.getSnapshot?.()
      const current = state?.current
      if (current === this.lastSessionId) return
      const first = this.lastSessionId === undefined && !this.sessionsInitialized
      this.sessionsInitialized = true
      const changed = !first && current !== this.lastSessionId
      this.lastSessionId = current
      if (!changed || !this.active || this.frame === null) return
      // 在侧栏里点了会话/新建会话 → 自动收起抽屉回到聊天
      if (!this.frame.hasAttribute('data-sidebar-collapsed')) {
        this.ctx.layout?.toggleSidebar()
      }
    } catch { /* ignore */ }
  }

  private showToast(message: string): void {
    if (this.toastEl === null) {
      const el = document.createElement('div')
      el.id = TOAST_ID
      el.className = 'dsh-mobile-toast'
      el.setAttribute('data-dsh-mobile-toast', '')
      document.body.appendChild(el)
      this.toastEl = el
    }
    this.toastEl.textContent = message
    this.toastEl.style.display = ''
    if (this.toastTimer !== undefined) clearTimeout(this.toastTimer)
    this.toastTimer = window.setTimeout(() => {
      if (this.toastEl !== null) this.toastEl.style.display = 'none'
      this.toastTimer = undefined
    }, 3200)
  }
}
