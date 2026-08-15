/**
 * @dsh-external/dsh-mobile-ui — 浏览器半区：手机端 UI 适配引擎 + 设置卡片。
 *
 * apply() 里挂两样东西：
 *  1. MobileUiEngine：窄屏布局适配（见 mobile.ts），随设置开关启停；
 *  2. `settings.plugin.item` 设置卡片：enabled 总开关 + breakpoint 断点。
 * 引擎的断点取值优先级：settingsScope 就绪 → 其 breakpoint；否则退回
 * composition entry 的 config（patch 行 config 会随 loader 传入）。
 * @module @dsh-external/dsh-mobile-ui/client
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the slots SlotMap merge table for the settings card seat.
import type {} from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the settings-surface Context merge (ctx.settingsScope).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { MobileUiSettings } from '../types.js'
import { MobileUiEngine } from './mobile.js'
import { MobileUiSettingsCard, MobileUiSettingsCardController, type MobileUiSettingsCardState } from './MobileUiSettingsCard.js'
import { zh, en, type MobileUiLocaleKey } from './locales.js'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** mobile-ui settings-card copy. */
    'mobile-ui': MobileUiLocaleKey
  }

  interface SlotMap {
    /** The official plugin-card seat this package registers into. */
    'settings.plugin.item': { kind: 'list'; scope: 'root'; owner: MobileUiCardOwnerProps }
  }
}

/** Owner share of the mobile-ui card (the section supplies nothing). */
export interface MobileUiCardOwnerProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}

/** Settings namespace key (matches the host half). */
const NS = 'mobile-ui'
/** Default breakpoint (px) used when neither settings nor config provide one. */
const DEFAULT_BREAKPOINT = 860

/** Required client services (cordis fiber inject — the loader passes all
 *  module exports as an object plugin). */
export const inject = ['slots', 'settingsScope', 'locale', 'layout', 'sessions']

/**
 * Client plugin body: settings card + the mobile engine, both switched by the
 * settings `enabled` field.
 * @param ctx - client root context.
 * @param config - loader-provided composition config (patch row `config`).
 */
export function apply(ctx: ClientContext, config: MobileUiSettings = {}): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'mobile-ui: dictionaries')

  const settingsScope = ctx.settingsScope.bind<MobileUiSettings>({ namespace: NS })
  const enabled = (): boolean => {
    const snapshot = settingsScope.getSnapshot()
    return snapshot.status === 'ready'
      ? snapshot.value?.enabled ?? config.enabled ?? true
      : snapshot.status === 'unavailable'
        ? config.enabled ?? true
        : true
  }
  const breakpoint = (): number => {
    const snapshot = settingsScope.getSnapshot()
    const bp = snapshot.status === 'ready'
      ? snapshot.value?.breakpoint
      : undefined
    return bp ?? config.breakpoint ?? DEFAULT_BREAKPOINT
  }

  // 设置卡片（可编辑 enabled / breakpoint）。
  const mobileUiSettings = new MobileUiSettingsCardController(settingsScope)
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'mobile-ui',
    order: 190,
    locale: NS,
    inject: () => mobileUiSettings.inject(),
  }, MobileUiSettingsCard))

  // 引擎随开关启停；断点变更时重建 matchMedia。
  let engine: MobileUiEngine | undefined
  let lastBreakpoint = -1
  const syncEngine = (): void => {
    if (enabled() && engine === undefined) {
      engine = new MobileUiEngine(ctx, breakpoint)
      ctx.effect(() => {
        engine!.mount()
        return () => engine!.dispose()
      }, 'mobile-ui: engine')
      lastBreakpoint = breakpoint()
    } else if (engine !== undefined) {
      const bp = breakpoint()
      if (bp !== lastBreakpoint) {
        lastBreakpoint = bp
        engine.applyBreakpoint()
      }
      if (!enabled()) {
        engine.dispose()
        engine = undefined
      }
    }
  }
  settingsScope.subscribe(() => { syncEngine() })
  syncEngine()
}
