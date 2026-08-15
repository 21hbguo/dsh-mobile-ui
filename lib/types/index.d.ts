/**
 * @dsh-external/dsh-mobile-ui — host 半区：插件配置（settings 命名空间）。
 *
 * 浏览器半区（`./client` 入口）负责全部 UI 适配，host 只声明配置命名空间
 * `mobile-ui`（enabled 总开关 + breakpoint 断点像素），供设置页卡片读写。
 * @module @dsh-external/dsh-mobile-ui
 */
import type { Context } from 'cordis';
import z from 'schemastery';
/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
export declare const name = "mobile-ui";
/** Services required before the settings surface can mount. */
export declare const inject: string[];
/** Plugin configuration. */
export interface Config {
    /** Master switch: disables the whole mobile adaptation layer. */
    enabled?: boolean;
    /** Viewport width (px) at or below which the mobile layout activates. */
    breakpoint?: number;
}
/** Runtime schema for {@link Config}. */
export declare const Config: z<Schemastery.ObjectS<{
    enabled: z<boolean, boolean>;
    breakpoint: z<number, number>;
}>, Schemastery.ObjectT<{
    enabled: z<boolean, boolean>;
    breakpoint: z<number, number>;
}>>;
/** Settings namespace the mobile-ui settings card edits. */
export declare const MOBILE_UI_SETTINGS_NAMESPACE: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/** Register the settings namespace; the browser half reads it back. */
export declare function apply(ctx: Context, config?: Config): void;
