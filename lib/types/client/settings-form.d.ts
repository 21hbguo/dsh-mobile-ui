/**
 * Staged form model behind the sysmon settings card — a self-contained slice
 * of the official plugin-config card-store pattern (same shape as the
 * dsh-web-ui family plugins use), so this package needs no sibling UI deps.
 */
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
/** The write one field's staged text performs when the card is saved. */
export type FieldWrite = {
    kind: 'set';
    value: unknown;
} | {
    kind: 'clear';
};
/** How one field converts between its stored value and its draft text. */
export interface FieldSpec {
    field: string;
    format: (value: unknown) => string;
    parse: (text: string) => FieldWrite | undefined;
}
/** One field as the card renders it. */
export interface FieldState {
    text: string;
    overridden: boolean;
    invalid: boolean;
}
/** Form state every plugin settings card shares. */
export interface CardShell {
    available: boolean;
    exposed: boolean;
    writable: boolean;
    dirty: boolean;
    invalid: boolean;
    saving: boolean;
    failed: boolean;
}
/** The write actions the card's slot entry injects. */
export interface CardActions {
    edit: (field: string, text: string) => void;
    resetField: (field: string) => void;
    save: () => void;
    discard: () => void;
}
/** A boolean field, edited through true/false draft text. */
export declare function booleanField(field: string): FieldSpec;
/** A whole- or decimal-number field. */
export declare function numberField(field: string, constraints?: {
    integer?: boolean;
    min?: number;
}): FieldSpec;
/**
 * Stages one card's edits over one settings namespace and writes them on save.
 */
export declare class CardForm<T> {
    private readonly scope;
    private readonly specs;
    private readonly staged;
    private readonly listeners;
    private saving;
    private failed;
    constructor(scope: SettingsScope<T>, specs: FieldSpec[]);
    bind<S>(project: () => S): SnapshotStore<S>;
    shell(): CardShell;
    field(field: string): FieldState;
    actions(): CardActions;
    save(): Promise<void>;
    private plan;
    private clear;
    private store;
    private stage;
    private specOf;
    private snapshotOf;
    private sectionValue;
    private baseValue;
    private userLayer;
    private stored;
    private publish;
}
