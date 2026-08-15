window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-mobile-ui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
		//#endregion
		let react = require("react");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region src/client/mobile.ts
		/** Injected stylesheet element id. */
		const MOBILE_CSS_ID = "dsh-mobile-ui-style";
		/** Floating top-bar element id. */
		const BAR_ID = "dsh-mobile-ui-bar";
		/** One-shot toast element id. */
		const TOAST_ID = "dsh-mobile-ui-toast";
		/** Marker class stamped onto the frame grid once found. */
		const FRAME_MARKER = "dsh-mobile-frame";
		/** Original viewport meta content (restored on leave/dispose). */
		const DEFAULT_VIEWPORT = "width=device-width, initial-scale=1";
		/** Mobile viewport content: cover safe areas + kill double-tap zoom. */
		const MOBILE_VIEWPORT = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
		/** Frame selector: aionui's compat shim stamps data-dsh-frame; without it the
		*  frame carries data-sidebar-collapsed / data-details-collapsed at render. */
		const FRAME_SELECTOR = "[data-dsh-frame], [data-sidebar-collapsed], [data-details-collapsed]";
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
`;
		/** Parse an inline grid-template-columns string into track tokens (spaces
		*  inside parens must not split). */
		function parseTracks(input) {
			const tracks = [];
			let depth = 0;
			let current = "";
			for (const char of input) {
				if (char === "(") depth += 1;
				if (char === ")") depth = Math.max(0, depth - 1);
				if (char === " " && depth === 0) {
					if (current !== "") {
						tracks.push(current);
						current = "";
					}
					continue;
				}
				current += char;
			}
			if (current !== "") tracks.push(current);
			return tracks;
		}
		/** Extract a px width from one track (0 for fr/minmax/non-px tracks). */
		function trackPx(track) {
			const match = /^(-?[\d.]+)px$/.exec(track.trim());
			return match === null ? 0 : Number(match[1]);
		}
		/** Small inline SVG icon set for the top bar. */
		const ICONS = {
			menu: "<svg width=\"18\" height=\"18\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M2 4h12M2 8h12M2 12h12\"/></svg>",
			panel: "<svg width=\"18\" height=\"18\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"1.5\" y=\"2.5\" width=\"13\" height=\"11\" rx=\"1.5\"/><path d=\"M10.5 2.5v11\"/></svg>",
			expand: "<svg width=\"18\" height=\"18\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4\"/></svg>",
			compress: "<svg width=\"18\" height=\"18\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4\"/></svg>"
		};
		/**
		* The mobile adaptation engine. Mount once per plugin apply; dispose removes
		* every DOM side effect (style, bar, meta patches, observers, listeners).
		*/
		var MobileUiEngine = class {
			ctx;
			breakpoint;
			mq = null;
			mqListener = null;
			frame = null;
			styleEl = null;
			barEl = null;
			toastEl = null;
			toastTimer = void 0;
			waitObserver = null;
			styleObserver = null;
			childObserver = null;
			fullscreenListener = null;
			sessionsOff = null;
			lastSessionId = void 0;
			/** Whether the sessions store delivered its first snapshot. */
			sessionsInitialized = false;
			/** Whether the mobile layout is active right now. */
			active = false;
			/** Per-activation guard: aionui auto-collapse runs once per activation. */
			autoClosed = false;
			/** While true, the state mirror may only close drawers (activation wrap-up). */
			suppressOpen = false;
			/** Timestamp of the first consecutive all-closed observation (zero-streak). */
			zeroStreakAt = 0;
			/** Grace timestamp: settle "no aionui" after this many ms without a 5-track template. */
			autoCloseGraceUntil = 0;
			/** Deadline for the pending-chevron retry loop (reset per activation). */
			autoCloseRetryAt = 0;
			/** Pending auto-close retry timer (cleared on dispose/deactivate). */
			retryTimer = void 0;
			/** Keeps the original viewport content for restore. */
			originalViewport = DEFAULT_VIEWPORT;
			/**
			* @param ctx - client plugin context (ctx.layout / ctx.sessions used).
			* @param breakpoint - resolves the current breakpoint px (settings-aware).
			*/
			constructor(ctx, breakpoint) {
				this.ctx = ctx;
				this.breakpoint = breakpoint;
			}
			/** Install everything. */
			mount() {
				try {
					this.injectStyle();
					this.patchMetas();
					this.buildBar();
					this.applyBreakpoint();
					this.watchFrame();
					try {
						const list = this.ctx.sessions?.list;
						if (list !== void 0) this.sessionsOff = list.subscribe(() => {
							this.onSessionsChange();
						});
					} catch {}
				} catch (error) {
					console.warn("[mobile-ui] mount failed", error);
				}
			}
			/** Remove every DOM side effect. */
			dispose() {
				try {
					this.active = false;
					document.body.classList.remove("dsh-mobile");
					this.frame?.classList.remove(FRAME_MARKER, "dsh-mobile-explorer-open", "dsh-mobile-preview-open");
					this.styleEl?.remove();
					this.styleEl = null;
					this.barEl?.remove();
					this.barEl = null;
					this.toastEl?.remove();
					this.toastEl = null;
					if (this.toastTimer !== void 0) {
						clearTimeout(this.toastTimer);
						this.toastTimer = void 0;
					}
					this.waitObserver?.disconnect();
					this.waitObserver = null;
					this.styleObserver?.disconnect();
					this.styleObserver = null;
					this.childObserver?.disconnect();
					this.childObserver = null;
					if (this.mqListener !== null && this.mq !== null) this.mq.removeEventListener("change", this.mqListener);
					this.mq = null;
					this.mqListener = null;
					if (this.retryTimer !== void 0) {
						clearTimeout(this.retryTimer);
						this.retryTimer = void 0;
					}
					if (this.fullscreenListener !== null) {
						document.removeEventListener("fullscreenchange", this.fullscreenListener);
						this.fullscreenListener = null;
					}
					this.sessionsOff?.();
					this.sessionsOff = null;
					this.restoreViewport();
				} catch (error) {
					console.warn("[mobile-ui] dispose failed", error);
				}
			}
			injectStyle() {
				if (document.getElementById(MOBILE_CSS_ID) !== null) return;
				const style = document.createElement("style");
				style.id = MOBILE_CSS_ID;
				style.textContent = CSS;
				document.head.appendChild(style);
				this.styleEl = style;
			}
			patchMetas() {
				const ensureMeta = (name, content) => {
					let el = document.querySelector(`meta[name="${name}"]`);
					if (el === null) {
						el = document.createElement("meta");
						el.name = name;
						document.head.appendChild(el);
					}
					el.content = content;
				};
				const viewport = document.querySelector("meta[name=\"viewport\"]");
				if (viewport !== null) this.originalViewport = viewport.content;
				ensureMeta("mobile-web-app-capable", "yes");
				ensureMeta("apple-mobile-web-app-capable", "yes");
				ensureMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
				ensureMeta("theme-color", this.readThemeColor());
			}
			readThemeColor() {
				try {
					const bg = getComputedStyle(document.body).backgroundColor;
					return bg !== "" && bg !== "rgba(0, 0, 0, 0)" ? bg : "#101216";
				} catch {
					return "#101216";
				}
			}
			buildBar() {
				const bar = document.createElement("div");
				bar.id = BAR_ID;
				bar.className = "dsh-mobile-bar";
				bar.setAttribute("data-dsh-mobile-bar", "");
				const btn = (action, icon, label) => {
					const el = document.createElement("button");
					el.type = "button";
					el.className = "dsh-mobile-bar-btn";
					el.dataset.act = action;
					el.setAttribute("aria-label", label);
					el.innerHTML = icon;
					el.addEventListener("click", (event) => {
						event.stopPropagation();
						this.onBarAction(action);
					});
					return el;
				};
				const sidebarBtn = btn("sidebar", ICONS.menu, "打开侧栏");
				const panelBtn = btn("panel", ICONS.panel, "打开右侧面板");
				const fullscreenBtn = btn("fullscreen", ICONS.expand, "全屏");
				bar.append(sidebarBtn, panelBtn, fullscreenBtn);
				document.body.appendChild(bar);
				this.barEl = bar;
				this.fullscreenListener = () => {
					fullscreenBtn.innerHTML = document.fullscreenElement === null ? ICONS.expand : ICONS.compress;
					fullscreenBtn.setAttribute("aria-label", document.fullscreenElement === null ? "全屏" : "退出全屏");
				};
				document.addEventListener("fullscreenchange", this.fullscreenListener);
			}
			/** Rebuild the matchMedia query (called on breakpoint setting change). */
			applyBreakpoint() {
				if (this.mqListener !== null && this.mq !== null) this.mq.removeEventListener("change", this.mqListener);
				const bp = Math.max(320, Math.min(1600, this.breakpoint()));
				const mq = window.matchMedia(`(max-width: ${bp}px)`);
				const listener = () => {
					this.setActive(mq.matches);
				};
				this.mq = mq;
				this.mqListener = listener;
				mq.addEventListener("change", listener);
				this.setActive(mq.matches);
			}
			setActive(active) {
				if (this.active === active) return;
				this.active = active;
				document.body.classList.toggle("dsh-mobile", active);
				if (active) {
					this.applyMobileViewport();
					this.autoClosed = false;
					this.autoCloseGraceUntil = 0;
					this.autoCloseRetryAt = 0;
					this.zeroStreakAt = 0;
					this.suppressOpen = true;
					this.autoCloseAionui();
				} else {
					this.restoreViewport();
					this.suppressOpen = false;
					if (this.retryTimer !== void 0) {
						clearTimeout(this.retryTimer);
						this.retryTimer = void 0;
					}
					this.frame?.classList.remove("dsh-mobile-explorer-open", "dsh-mobile-preview-open");
				}
			}
			applyMobileViewport() {
				const viewport = document.querySelector("meta[name=\"viewport\"]");
				if (viewport !== null) viewport.content = MOBILE_VIEWPORT;
			}
			restoreViewport() {
				const viewport = document.querySelector("meta[name=\"viewport\"]");
				if (viewport !== null) viewport.content = this.originalViewport;
			}
			watchFrame() {
				const tryAttach = () => {
					if (this.frame !== null) return;
					const frame = document.querySelector(FRAME_SELECTOR);
					if (frame === null) return;
					this.attachFrame(frame);
				};
				this.waitObserver = new MutationObserver(() => {
					tryAttach();
				});
				this.waitObserver.observe(document.body, {
					childList: true,
					subtree: true
				});
				tryAttach();
			}
			attachFrame(frame) {
				this.frame = frame;
				frame.classList.add(FRAME_MARKER);
				this.styleObserver = new MutationObserver(() => {
					this.syncAionuiState();
					if (this.active && !this.autoClosed) this.autoCloseAionui();
				});
				this.styleObserver.observe(frame, {
					attributes: true,
					attributeFilter: ["style"]
				});
				this.childObserver = new MutationObserver(() => {
					this.syncPanelButton();
					if (this.active && !this.autoClosed) this.autoCloseAionui();
				});
				this.childObserver.observe(frame, { childList: true });
				frame.addEventListener("click", (event) => {
					if (event.target !== frame) return;
					this.onBackdropClick();
				});
				frame.children[0]?.addEventListener("click", (event) => {
					if (!this.active) return;
					const button = event.target?.closest?.("button");
					if (button === null || button === void 0) return;
					const label = `${button.getAttribute("aria-label") ?? ""} ${button.textContent ?? ""}`;
					if (button.hasAttribute("data-dsh-mobile-bar")) return;
					const isCollapse = /收起|折叠|collapse/i.test(label);
					const isNewSession = /新建会话|新会话|new chat|new session|^新/i.test(label);
					if (!isCollapse && isNewSession) window.setTimeout(() => {
						try {
							this.ctx.layout?.toggleSidebar();
						} catch {}
					}, 250);
				});
				this.syncAionuiState();
				this.syncPanelButton();
				if (this.active) this.autoCloseAionui();
			}
			syncAionuiState() {
				const frame = this.frame;
				if (frame === null) return;
				if (this.suppressOpen) {
					frame.classList.remove("dsh-mobile-explorer-open", "dsh-mobile-preview-open");
					return;
				}
				const inline = frame.style.gridTemplateColumns;
				if (inline === "") return;
				const tracks = parseTracks(inline);
				const previewOpen = tracks.length >= 4 && trackPx(tracks[3]) > 0;
				const explorerOpen = tracks.length >= 5 && trackPx(tracks[4]) > 0;
				frame.classList.toggle("dsh-mobile-explorer-open", explorerOpen);
				frame.classList.toggle("dsh-mobile-preview-open", previewOpen);
			}
			syncPanelButton() {
				if (this.barEl === null || this.frame === null) return;
				const hasAionui = this.frame.querySelector(".aionui-explorer-col, .aionui-preview-col") !== null;
				const btn = this.barEl.querySelector("[data-act=\"panel\"]");
				if (btn !== null) btn.hidden = !hasAionui;
			}
			/** 激活瞬间收起 aionui 已展开的列（点击其内部 chevron；每激活一次）。
			*  aionui 列、5 轨模板和它的根初始化（会从 localStorage 恢复展开态）都晚于
			*  frame 挂载 → 本方法由 style/child 观察器 + 定时器反复触发：任何时刻只要
			*  看到展开轨道就点 chevron 并强制视觉关闭（聊天优先），直到轨道连续 ~300ms
			*  保持关闭才收场；8s 宽限兜底（aionui 无法收起时保持视觉关闭）。 */
			autoCloseAionui() {
				const frame = this.frame;
				if (frame === null || this.autoClosed || !this.active) return;
				try {
					const tracks = parseTracks(frame.style.gridTemplateColumns);
					const fiveTracks = tracks.length >= 5;
					const cols = [[
						4,
						".aionui-explorer-col",
						"dsh-mobile-explorer-open"
					], [
						3,
						".aionui-preview-col",
						"dsh-mobile-preview-open"
					]];
					if (!fiveTracks) {
						if (this.autoCloseGraceUntil === 0) this.autoCloseGraceUntil = performance.now() + 2500;
						if (performance.now() >= this.autoCloseGraceUntil) {
							this.autoClosed = true;
							this.suppressOpen = false;
						}
						return;
					}
					const openCols = cols.filter(([index]) => trackPx(tracks[index] ?? "") > 0);
					if (openCols.length === 0) {
						if (this.zeroStreakAt === 0) this.zeroStreakAt = performance.now();
						if (performance.now() - this.zeroStreakAt >= 300) {
							this.autoClosed = true;
							this.suppressOpen = false;
							return;
						}
						this.retryTimer = window.setTimeout(() => {
							this.autoCloseAionui();
						}, 150);
						return;
					}
					this.zeroStreakAt = 0;
					for (const [, selector, cls] of openCols) {
						const chevron = frame.querySelector(`${selector} .aionui-collapse-chevron`);
						if (chevron !== null) chevron.click();
						frame.classList.remove(cls);
					}
					if (this.autoCloseRetryAt === 0) this.autoCloseRetryAt = performance.now() + 8e3;
					if (performance.now() >= this.autoCloseRetryAt) {
						this.autoClosed = true;
						this.suppressOpen = false;
						return;
					}
					this.retryTimer = window.setTimeout(() => {
						this.autoCloseAionui();
					}, 150);
				} catch {
					this.autoClosed = true;
				}
			}
			onBarAction(action) {
				if (action === "sidebar") {
					try {
						this.ctx.layout?.toggleSidebar();
					} catch (error) {
						console.warn("[mobile-ui] toggle sidebar failed", error);
					}
					return;
				}
				if (action === "panel") {
					this.toggleRightPanel();
					return;
				}
				this.toggleFullscreen();
			}
			toggleRightPanel() {
				const frame = this.frame;
				if (frame === null) return;
				const explorerOpen = frame.classList.contains("dsh-mobile-explorer-open");
				const previewOpen = frame.classList.contains("dsh-mobile-preview-open");
				if (explorerOpen || previewOpen) {
					const selector = explorerOpen ? ".aionui-explorer-col" : ".aionui-preview-col";
					const chevron = frame.querySelector(`${selector} .aionui-collapse-chevron`);
					if (chevron !== null) chevron.click();
					frame.classList.remove("dsh-mobile-explorer-open", "dsh-mobile-preview-open");
					return;
				}
				this.suppressOpen = false;
				const floatBtn = document.querySelector(".aionui-floating-expand");
				if (floatBtn !== null && getComputedStyle(floatBtn).display !== "none") {
					floatBtn.click();
					return;
				}
				frame.classList.add("dsh-mobile-explorer-open");
			}
			toggleFullscreen() {
				if (document.fullscreenElement !== null) {
					document.exitFullscreen().catch(() => {});
					return;
				}
				if (typeof document.documentElement.requestFullscreen === "function") {
					document.documentElement.requestFullscreen().catch(() => {
						this.showToast("当前浏览器拒绝了全屏请求");
					});
					return;
				}
				this.showToast("建议：浏览器菜单 →「添加到主屏幕」，即可全屏使用");
			}
			onBackdropClick() {
				const frame = this.frame;
				if (frame === null || !this.active) return;
				if (!frame.hasAttribute("data-sidebar-collapsed")) {
					try {
						this.ctx.layout?.toggleSidebar();
					} catch {}
					return;
				}
				if (!frame.hasAttribute("data-details-collapsed")) {
					try {
						this.ctx.layout?.closeDetails();
					} catch {}
					return;
				}
				if (frame.classList.contains("dsh-mobile-explorer-open") || frame.classList.contains("dsh-mobile-preview-open")) this.toggleRightPanel();
			}
			onSessionsChange() {
				try {
					const current = ((this.ctx.sessions?.list)?.getSnapshot?.())?.current;
					if (current === this.lastSessionId) return;
					const first = this.lastSessionId === void 0 && !this.sessionsInitialized;
					this.sessionsInitialized = true;
					const changed = !first && current !== this.lastSessionId;
					this.lastSessionId = current;
					if (!changed || !this.active || this.frame === null) return;
					if (!this.frame.hasAttribute("data-sidebar-collapsed")) this.ctx.layout?.toggleSidebar();
				} catch {}
			}
			showToast(message) {
				if (this.toastEl === null) {
					const el = document.createElement("div");
					el.id = TOAST_ID;
					el.className = "dsh-mobile-toast";
					el.setAttribute("data-dsh-mobile-toast", "");
					document.body.appendChild(el);
					this.toastEl = el;
				}
				this.toastEl.textContent = message;
				this.toastEl.style.display = "";
				if (this.toastTimer !== void 0) clearTimeout(this.toastTimer);
				this.toastTimer = window.setTimeout(() => {
					if (this.toastEl !== null) this.toastEl.style.display = "none";
					this.toastTimer = void 0;
				}, 3200);
			}
		};
		//#endregion
		//#region ../../deepseek-harness/node_modules/.pnpm/react@18.3.1/node_modules/react/cjs/react-jsx-runtime.production.min.js
		/**
		* @license React
		* react-jsx-runtime.production.min.js
		*
		* Copyright (c) Facebook, Inc. and its affiliates.
		*
		* This source code is licensed under the MIT license found in the
		* LICENSE file in the root directory of this source tree.
		*/
		var require_react_jsx_runtime_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
			var f = require("react"), k = Symbol.for("react.element"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = {
				key: !0,
				ref: !0,
				__self: !0,
				__source: !0
			};
			function q(c, a, g) {
				var b, d = {}, e = null, h = null;
				void 0 !== g && (e = "" + g);
				void 0 !== a.key && (e = "" + a.key);
				void 0 !== a.ref && (h = a.ref);
				for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
				if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
				return {
					$$typeof: k,
					type: c,
					key: e,
					ref: h,
					props: d,
					_owner: n.current
				};
			}
			exports.jsx = q;
			exports.jsxs = q;
		}));
		//#endregion
		//#region src/client/PluginSettingsCard.tsx
		/**
		* Sysmon settings card: a disclosure card binding the `sysmon` settings
		* namespace — the enabled master switch and the collector cache interval.
		* All styles are inline (matching the widget's zero-dependency philosophy) so
		* the client bundle needs no css pipeline.
		*/
		var import_jsx_runtime = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
			module.exports = require_react_jsx_runtime_production_min();
		})))();
		/** Shared inline styles. */
		const S = {
			card: {
				listStyle: "none",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "8px",
				background: "var(--dsw-alias-bg-layer-3)",
				overflow: "hidden",
				minWidth: 0,
				transition: "border-color .16s, background .16s"
			},
			cardOpen: {
				background: "var(--dsw-alias-bg-layer-2)",
				borderColor: "var(--dsw-alias-label-dimmed)"
			},
			header: {
				display: "flex",
				alignItems: "center",
				gap: "8px",
				width: "100%",
				padding: "10px 14px",
				border: 0,
				background: "transparent",
				color: "inherit",
				cursor: "pointer",
				textAlign: "left",
				font: "inherit"
			},
			headText: {
				display: "flex",
				flexDirection: "column",
				gap: "2px",
				flex: 1,
				minWidth: 0,
				overflow: "hidden"
			},
			name: {
				fontWeight: 600,
				color: "var(--dsw-alias-label-primary)",
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			description: {
				fontSize: 12,
				color: "var(--dsw-alias-label-tertiary)",
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			pending: {
				fontSize: 12,
				color: "var(--dsw-alias-state-warn-primary)",
				flex: "none",
				whiteSpace: "nowrap"
			},
			chevron: {
				transition: "transform 120ms ease",
				color: "var(--dsw-alias-label-tertiary)",
				flex: "none",
				fontSize: 13
			},
			body: {
				padding: "0 14px 14px",
				display: "flex",
				flexDirection: "column",
				gap: "14px"
			},
			readOnly: {
				margin: 0,
				fontSize: 12,
				color: "var(--dsw-alias-label-tertiary)"
			},
			notExposed: {
				margin: 0,
				fontSize: 12,
				lineHeight: 1.5,
				color: "var(--dsw-alias-state-warn-primary)"
			},
			footer: {
				display: "flex",
				alignItems: "center",
				justifyContent: "flex-end",
				gap: "8px"
			},
			failed: {
				margin: "0 auto 0 0",
				fontSize: 12,
				color: "var(--dsw-alias-state-error-primary)"
			},
			discard: {
				borderRadius: "6px",
				padding: "5px 12px",
				font: "inherit",
				fontSize: 13,
				cursor: "pointer",
				background: "transparent",
				color: "var(--dsw-alias-label-primary)",
				border: "1px solid var(--dsw-alias-border-l2)"
			},
			save: {
				borderRadius: "6px",
				padding: "5px 12px",
				font: "inherit",
				fontSize: 13,
				cursor: "pointer",
				background: "var(--dsw-alias-button-info-fill)",
				color: "var(--dsw-alias-label-inverse)",
				border: 0
			},
			field: {
				display: "flex",
				flexDirection: "column",
				gap: "4px"
			},
			head: {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: "8px"
			},
			label: {
				fontSize: 13,
				color: "var(--dsw-alias-label-primary)"
			},
			badges: {
				display: "flex",
				alignItems: "center",
				gap: "6px"
			},
			badge: {
				fontSize: 11,
				color: "var(--dsw-alias-label-tertiary)"
			},
			reset: {
				border: 0,
				background: "transparent",
				color: "var(--dsw-alias-interactive-fg)",
				fontSize: 12,
				cursor: "pointer",
				padding: 0
			},
			select: {
				borderRadius: "6px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "var(--dsw-alias-label-primary)",
				padding: "5px 8px",
				font: "inherit",
				fontSize: 13
			},
			input: {
				borderRadius: "6px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "var(--dsw-alias-label-primary)",
				padding: "5px 8px",
				font: "inherit",
				fontSize: 13
			},
			hint: {
				margin: 0,
				fontSize: 12,
				color: "var(--dsw-alias-label-tertiary)"
			},
			invalid: {
				margin: 0,
				fontSize: 12,
				color: "var(--dsw-alias-state-error-primary)"
			}
		};
		/** Render one plugin settings card. */
		function PluginSettingsCard(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const { state } = props;
			if (!state.available) return null;
			const title = props.t(props.titleKey);
			const blocked = !state.dirty || state.invalid || state.saving;
			const cardStyle = open ? {
				...S.card,
				...S.cardOpen
			} : S.card;
			const description = props.t(props.descriptionKey);
			const header = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				style: S.header,
				"aria-expanded": open,
				onClick: () => {
					setOpen(!open);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: S.headText,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: S.name,
							title,
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: S.description,
							children: description
						})]
					}),
					state.dirty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: S.pending,
						title: props.t("settings.unsaved"),
						children: props.t("settings.unsaved")
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							...S.chevron,
							transform: open ? "rotate(180deg)" : void 0
						},
						children: "▾"
					})
				]
			});
			if (!state.exposed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				style: cardStyle,
				children: [header, open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: S.body,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: S.notExposed,
						role: "status",
						children: props.t("settings.notExposed")
					})
				}) : null]
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				style: cardStyle,
				children: [header, open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: S.body,
					children: [
						!state.writable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: S.readOnly,
							role: "status",
							children: props.t("settings.readOnly")
						}) : null,
						props.children,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: S.footer,
							children: [
								state.failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: S.failed,
									role: "status",
									children: props.t("settings.saveFailed")
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									style: S.discard,
									disabled: !state.dirty || state.saving,
									onClick: props.onDiscard,
									children: props.t("settings.discard")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									style: S.save,
									disabled: blocked,
									onClick: props.onSave,
									children: props.t(!state.saving ? "settings.save" : "settings.saving")
								})
							]
						})
					]
				}) : null]
			});
		}
		/** A staged boolean field: 继承 / 开 / 关. */
		function BooleanField(props) {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: S.field,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: S.head,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: S.label,
							htmlFor: props.id,
							children: props.label
						}), props.overridden ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: S.badges,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: S.badge,
								children: props.overriddenLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								style: S.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: props.id,
						style: S.select,
						value: props.text,
						disabled: props.disabled,
						onChange: (event) => {
							props.onEdit(event.target.value);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: props.inheritLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "true",
								children: props.onLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "false",
								children: props.offLabel
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: S.hint,
						children: props.hint
					})
				]
			});
		}
		/** A staged numeric value field. */
		function ValueField(props) {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: S.field,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: S.head,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: S.label,
							htmlFor: props.id,
							children: props.label
						}), props.overridden ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: S.badges,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: S.badge,
								children: props.overriddenLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								style: S.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: props.id,
						style: props.invalid ? {
							...S.input,
							borderColor: "var(--dsw-alias-state-error-primary)"
						} : S.input,
						type: "text",
						...props.numeric ? { inputMode: "numeric" } : {},
						...props.invalid ? { "aria-invalid": true } : {},
						value: props.text,
						placeholder: props.placeholder ?? "",
						disabled: props.disabled,
						onChange: (event) => {
							props.onEdit(event.target.value);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: props.invalid ? S.invalid : S.hint,
						children: props.invalid ? props.invalidLabel : props.hint
					})
				]
			});
		}
		//#endregion
		//#region src/client/settings-form.ts
		/** A boolean field, edited through true/false draft text. */
		function booleanField(field) {
			return {
				field,
				format: (value) => typeof value === "boolean" ? String(value) : "",
				parse: (text) => {
					const trimmed = text.trim();
					if (trimmed === "") return { kind: "clear" };
					if (trimmed === "true") return {
						kind: "set",
						value: true
					};
					if (trimmed === "false") return {
						kind: "set",
						value: false
					};
				}
			};
		}
		/** A whole- or decimal-number field. */
		function numberField(field, constraints = {}) {
			const { integer = false, min } = constraints;
			return {
				field,
				format: (value) => typeof value === "number" ? String(value) : "",
				parse: (text) => {
					const trimmed = text.trim();
					if (trimmed === "") return { kind: "clear" };
					const parsed = Number(trimmed);
					if (!Number.isFinite(parsed)) return void 0;
					if (integer && !Number.isInteger(parsed)) return void 0;
					if (min !== void 0 && parsed < min) return void 0;
					return {
						kind: "set",
						value: parsed
					};
				}
			};
		}
		/**
		* Stages one card's edits over one settings namespace and writes them on save.
		*/
		var CardForm = class {
			scope;
			specs;
			staged = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			saving = false;
			failed = false;
			constructor(scope, specs) {
				this.scope = scope;
				this.specs = new Map(specs.map((spec) => [spec.field, spec]));
				scope.subscribe(() => {
					this.publish();
				});
			}
			bind(project) {
				const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(project());
				this.listeners.add(() => {
					store.set(project());
				});
				return store;
			}
			shell() {
				const snapshot = this.scope.getSnapshot();
				const plan = this.plan();
				return {
					available: snapshot.status !== "loading",
					exposed: snapshot.status === "ready",
					writable: snapshot.writable,
					dirty: plan.length > 0,
					invalid: plan.some((item) => item.run === void 0),
					saving: this.saving,
					failed: this.failed
				};
			}
			field(field) {
				const spec = this.specOf(field);
				const staged = this.staged.get(field);
				if (staged === void 0) return {
					text: spec.format(this.sectionValue(field)),
					overridden: this.stored(field),
					invalid: false
				};
				const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
				return {
					text: staged.text,
					overridden: write?.kind === "set",
					invalid: write === void 0
				};
			}
			actions() {
				return {
					edit: (field, text) => {
						this.stage(field, {
							text,
							clear: false
						});
					},
					resetField: (field) => {
						this.stage(field, {
							text: this.specOf(field).format(this.baseValue(field)),
							clear: true
						});
					},
					save: () => {
						this.save();
					},
					discard: () => {
						if (this.staged.size === 0 && !this.failed) return;
						this.staged.clear();
						this.failed = false;
						this.publish();
					}
				};
			}
			async save() {
				const plan = this.plan();
				const writes = plan.flatMap((item) => item.run === void 0 ? [] : [item.run]);
				if (plan.length === 0 || this.saving || writes.length !== plan.length) return;
				const fields = new Set(plan.map((item) => item.field));
				this.saving = true;
				this.failed = false;
				this.publish();
				let landed = true;
				for (const write of writes) landed = await write() && landed;
				if (landed) for (const field of fields) this.staged.delete(field);
				this.saving = false;
				this.failed = !landed;
				this.publish();
			}
			plan() {
				const plan = [];
				for (const [field, staged] of this.staged) {
					const spec = this.specOf(field);
					if (staged.clear) {
						if (this.stored(field)) plan.push({
							field,
							run: () => this.clear(field)
						});
						continue;
					}
					if (staged.text === spec.format(this.sectionValue(field))) continue;
					const write = spec.parse(staged.text);
					if (write === void 0) plan.push({
						field,
						run: void 0
					});
					else if (write.kind === "clear") plan.push({
						field,
						run: () => this.clear(field)
					});
					else plan.push({
						field,
						run: () => this.store(field, write.value)
					});
				}
				return plan;
			}
			async clear(field) {
				await this.scope.unset(field);
				return !this.stored(field);
			}
			async store(field, value) {
				await this.scope.set(field, value);
				return this.userLayer()?.[field] === value;
			}
			stage(field, edit) {
				this.staged.set(field, edit);
				this.failed = false;
				this.publish();
			}
			specOf(field) {
				const spec = this.specs.get(field);
				if (spec === void 0) throw new Error(`settings card has no field ${field}`);
				return spec;
			}
			snapshotOf() {
				return this.scope.getSnapshot();
			}
			sectionValue(field) {
				return this.snapshotOf().value?.[field];
			}
			baseValue(field) {
				return this.snapshotOf().base?.[field];
			}
			userLayer() {
				return this.snapshotOf().user;
			}
			stored(field) {
				const user = this.userLayer();
				return user !== void 0 && Object.hasOwn(user, field);
			}
			publish() {
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region src/client/MobileUiSettingsCard.tsx
		/** Bridges the `mobile-ui` scope onto the card's staged form. */
		var MobileUiSettingsCardController = class {
			form;
			store;
			constructor(scope) {
				this.form = new CardForm(scope, [booleanField("enabled"), numberField("breakpoint", { min: 400 })]);
				this.store = this.form.bind(() => this.projection());
			}
			projection() {
				return {
					...this.form.shell(),
					enabled: this.form.field("enabled"),
					breakpoint: this.form.field("breakpoint")
				};
			}
			inject() {
				return {
					hooks: { mobileUiSettingsCard: this.store },
					...this.form.actions()
				};
			}
		};
		/** Render the mobile-ui settings card. */
		function MobileUiSettingsCard(props) {
			const { t } = props;
			const state = props.useMobileUiSettingsCard((snapshot) => snapshot);
			const disabled = !state.writable;
			const fieldProps = {
				overriddenLabel: t("settings.overridden"),
				resetLabel: t("settings.reset"),
				invalidLabel: t("settings.invalidNumber"),
				disabled
			};
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PluginSettingsCard, {
				t,
				titleKey: "settings.title",
				descriptionKey: "settings.description",
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BooleanField, {
					id: "settings-mobile-ui-enabled",
					label: t("settings.enabled"),
					hint: t("settings.enabledHint"),
					inheritLabel: t("settings.inherit"),
					onLabel: t("settings.on"),
					offLabel: t("settings.off"),
					...fieldProps,
					...state.enabled,
					onEdit: (text) => {
						props.edit("enabled", text);
					},
					onReset: () => {
						props.resetField("enabled");
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					id: "settings-mobile-ui-breakpoint",
					label: t("settings.breakpoint"),
					hint: t("settings.breakpointHint"),
					numeric: true,
					...fieldProps,
					...state.breakpoint,
					onEdit: (text) => {
						props.edit("breakpoint", text);
					},
					onReset: () => {
						props.resetField("breakpoint");
					}
				})]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** The `mobile-ui` namespace dictionaries: copy for the plugin settings card. */
		const zh = {
			"settings.title": "手机端 UI 适配",
			"settings.description": "窄屏下自动切换全屏聊天布局：侧栏/右侧面板变抽屉，顶部悬浮操作条 + 全屏按钮。",
			"settings.enabled": "启用手机端适配",
			"settings.enabledHint": "关闭后恢复桌面三栏布局，可在设置里重新启用。",
			"settings.breakpoint": "断点宽度（像素）",
			"settings.breakpointHint": "视口宽度小于等于该值时启用移动布局，范围 400–1280，默认 860。",
			"settings.inherit": "继承",
			"settings.on": "开",
			"settings.off": "关",
			"settings.overridden": "已覆盖",
			"settings.reset": "恢复默认",
			"settings.invalidNumber": "请输入数字，留空则使用默认值。",
			"settings.notExposed": "当前 DSH 版本未向设置页暴露本插件的配置命名空间，表单不可用。可编辑 ~/.dsh/settings.yaml 直接配置，或为 dsh-host-apiproxy 的 WEB_SETTINGS_NAMESPACES 白名单补充本命名空间后重启。",
			"settings.readOnly": "当前部署的设置只读。",
			"settings.expand": "展开设置",
			"settings.collapse": "收起设置",
			"settings.save": "保存",
			"settings.saving": "保存中…",
			"settings.discard": "放弃",
			"settings.unsaved": "未保存",
			"settings.saveFailed": "部署未接受这些值，已保留供你修改。"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"settings.title": "Mobile UI Adaptation",
			"settings.description": "Fullscreen chat layout on narrow screens: sidebar/right panels become drawers, floating top bar with a fullscreen button.",
			"settings.enabled": "Enable mobile adaptation",
			"settings.enabledHint": "Restores the desktop three-column layout when off; re-enable here.",
			"settings.breakpoint": "Breakpoint width (px)",
			"settings.breakpointHint": "Activates the mobile layout at or below this viewport width, 400–1280, default 860.",
			"settings.inherit": "Inherit",
			"settings.on": "On",
			"settings.off": "Off",
			"settings.overridden": "Overridden",
			"settings.reset": "Reset",
			"settings.invalidNumber": "Enter a number, or leave empty to use the default.",
			"settings.notExposed": "This DSH build does not expose this plugin's settings namespace; the form is unavailable. Edit ~/.dsh/settings.yaml directly, or add the namespace to the WEB_SETTINGS_NAMESPACES whitelist in dsh-host-apiproxy and restart.",
			"settings.readOnly": "Settings are read-only in this deployment.",
			"settings.expand": "Expand settings",
			"settings.collapse": "Collapse settings",
			"settings.save": "Save",
			"settings.saving": "Saving…",
			"settings.discard": "Discard",
			"settings.unsaved": "Unsaved",
			"settings.saveFailed": "The deployment did not accept these values; kept for your edits."
		};
		//#endregion
		//#region src/client/index.ts
		/** Settings namespace key (matches the host half). */
		const NS = "mobile-ui";
		/** Default breakpoint (px) used when neither settings nor config provide one. */
		const DEFAULT_BREAKPOINT = 860;
		/** Required client services (cordis fiber inject — the loader passes all
		*  module exports as an object plugin). */
		const inject = [
			"slots",
			"settingsScope",
			"locale",
			"layout",
			"sessions"
		];
		/**
		* Client plugin body: settings card + the mobile engine, both switched by the
		* settings `enabled` field.
		* @param ctx - client root context.
		* @param config - loader-provided composition config (patch row `config`).
		*/
		function apply(ctx, config = {}) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "mobile-ui: dictionaries");
			const settingsScope = ctx.settingsScope.bind({ namespace: NS });
			const enabled = () => {
				const snapshot = settingsScope.getSnapshot();
				return snapshot.status === "ready" ? snapshot.value?.enabled ?? config.enabled ?? true : snapshot.status === "unavailable" ? config.enabled ?? true : true;
			};
			const breakpoint = () => {
				const snapshot = settingsScope.getSnapshot();
				return (snapshot.status === "ready" ? snapshot.value?.breakpoint : void 0) ?? config.breakpoint ?? DEFAULT_BREAKPOINT;
			};
			const mobileUiSettings = new MobileUiSettingsCardController(settingsScope);
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				id: "mobile-ui",
				order: 190,
				locale: NS,
				inject: () => mobileUiSettings.inject()
			}, MobileUiSettingsCard));
			let engine;
			let lastBreakpoint = -1;
			const syncEngine = () => {
				if (enabled() && engine === void 0) {
					engine = new MobileUiEngine(ctx, breakpoint);
					ctx.effect(() => {
						engine.mount();
						return () => engine.dispose();
					}, "mobile-ui: engine");
					lastBreakpoint = breakpoint();
				} else if (engine !== void 0) {
					const bp = breakpoint();
					if (bp !== lastBreakpoint) {
						lastBreakpoint = bp;
						engine.applyBreakpoint();
					}
					if (!enabled()) {
						engine.dispose();
						engine = void 0;
					}
				}
			};
			settingsScope.subscribe(() => {
				syncEngine();
			});
			syncEngine();
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map