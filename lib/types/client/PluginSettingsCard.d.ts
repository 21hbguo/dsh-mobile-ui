/**
 * Sysmon settings card: a disclosure card binding the `sysmon` settings
 * namespace — the enabled master switch and the collector cache interval.
 * All styles are inline (matching the widget's zero-dependency philosophy) so
 * the client bundle needs no css pipeline.
 */
import { type ReactNode } from 'react';
import type { CardShell } from './settings-form.js';
/** Card chrome shared by every plugin settings card. */
export interface PluginSettingsCardProps {
    t: (key: string) => string;
    titleKey: string;
    descriptionKey: string;
    state: CardShell;
    onSave: () => void;
    onDiscard: () => void;
    children: ReactNode;
}
/** Render one plugin settings card. */
export declare function PluginSettingsCard(props: PluginSettingsCardProps): import("react").JSX.Element | null;
/** Field props shared by every control. */
export interface FieldProps {
    id: string;
    label: string;
    hint: string;
    text: string;
    overridden: boolean;
    invalid: boolean;
    overriddenLabel: string;
    resetLabel: string;
    invalidLabel: string;
    disabled: boolean;
    onEdit: (text: string) => void;
    onReset: () => void;
}
/** A staged boolean field: 继承 / 开 / 关. */
export declare function BooleanField(props: FieldProps & {
    inheritLabel: string;
    onLabel: string;
    offLabel: string;
}): import("react").JSX.Element;
/** A staged numeric value field. */
export declare function ValueField(props: FieldProps & {
    numeric?: boolean;
    placeholder?: string;
}): import("react").JSX.Element;
