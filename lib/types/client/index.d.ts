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
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { MobileUiSettings } from '../types.js';
import { type MobileUiLocaleKey } from './locales.js';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** mobile-ui settings-card copy. */
        'mobile-ui': MobileUiLocaleKey;
    }
    interface SlotMap {
        /** The official plugin-card seat this package registers into. */
        'settings.plugin.item': {
            kind: 'list';
            scope: 'root';
            owner: MobileUiCardOwnerProps;
        };
    }
}
/** Owner share of the mobile-ui card (the section supplies nothing). */
export interface MobileUiCardOwnerProps {
    /** Marker field: card owner props are intentionally empty. */
    children?: never;
}
/** Required client services (cordis fiber inject — the loader passes all
 *  module exports as an object plugin). */
export declare const inject: string[];
/**
 * Client plugin body: settings card + the mobile engine, both switched by the
 * settings `enabled` field.
 * @param ctx - client root context.
 * @param config - loader-provided composition config (patch row `config`).
 */
export declare function apply(ctx: ClientContext, config?: MobileUiSettings): void;
