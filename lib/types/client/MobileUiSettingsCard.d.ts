/**
 * The mobile-ui settings card: the enabled master switch and the breakpoint
 * width. Registers into the `settings.plugin.item` slot, bound to the
 * `mobile-ui` settings namespace.
 */
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { MobileUiLocaleKey } from './locales.js';
import { type CardActions, type CardShell, type FieldState } from './settings-form.js';
/** The mobile-ui settings fields this card edits. */
export interface MobileUiSettings {
    enabled?: boolean;
    breakpoint?: number;
}
/** What the mobile-ui settings card renders. */
export interface MobileUiSettingsCardState extends CardShell {
    enabled: FieldState;
    breakpoint: FieldState;
}
/** The registration-side face the card's slot entry injects. */
export interface MobileUiSettingsCardFace extends CardActions {
    hooks: {
        mobileUiSettingsCard: SnapshotStore<MobileUiSettingsCardState>;
    };
}
/** Bridges the `mobile-ui` scope onto the card's staged form. */
export declare class MobileUiSettingsCardController {
    private readonly form;
    private readonly store;
    constructor(scope: SettingsScope<MobileUiSettings>);
    private projection;
    inject(): MobileUiSettingsCardFace;
}
/** Props the renderer binds for the mobile-ui card. */
export type MobileUiSettingsCardProps = PropsRuntime<'settings.plugin.item'> & {
    t: (key: MobileUiLocaleKey & string) => string;
} & InjectFace<MobileUiSettingsCardFace>;
/** Render the mobile-ui settings card. */
export declare function MobileUiSettingsCard(props: MobileUiSettingsCardProps): import("react").JSX.Element;
