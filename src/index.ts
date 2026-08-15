/**
 * @dsh-external/dsh-mobile-ui — host 半区：插件配置（settings 命名空间）。
 *
 * 浏览器半区（`./client` 入口）负责全部 UI 适配，host 只声明配置命名空间
 * `mobile-ui`（enabled 总开关 + breakpoint 断点像素），供设置页卡片读写。
 * @module @dsh-external/dsh-mobile-ui
 */

import type { Context } from 'cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from 'schemastery'

/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
export const name = 'mobile-ui'

/** Services required before the settings surface can mount. */
export const inject = ['settings']

/** Plugin configuration. */
export interface Config {
  /** Master switch: disables the whole mobile adaptation layer. */
  enabled?: boolean
  /** Viewport width (px) at or below which the mobile layout activates. */
  breakpoint?: number
}

/** Runtime schema for {@link Config}. */
export const Config = z.object({
  enabled: z.boolean().default(true),
  breakpoint: z.number().min(400).max(1280).step(20).default(860),
})

/** Settings namespace the mobile-ui settings card edits. */
export const MOBILE_UI_SETTINGS_NAMESPACE = settingsNamespace('mobile-ui')

/** Register the settings namespace; the browser half reads it back. */
export function apply(ctx: Context, config: Config = {}): void {
  let current: () => Config = () => config ?? {}

  const sync = (): void => {
    // host 侧无路由/无副作用：设置仅被浏览器半区消费，这里只做日志确认。
    const { enabled = true, breakpoint = 860 } = current()
    ctx.logger?.info?.(`[mobile-ui] 手机端适配${enabled ? '已启用' : '已停用'}（断点 ${breakpoint}px）`)
  }

  installSettingsSection(ctx, MOBILE_UI_SETTINGS_NAMESPACE, Config, config ?? {}, {
    setSource: (source) => { current = source },
    onChange: sync,
  }, {
    // 显式声明 web 暴露：设置页卡片可真正读写（无需改 dsh-host-apiproxy 白名单）
    web: true,
  })
  sync()
}
