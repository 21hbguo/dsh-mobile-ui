/**
 * Staged form model behind the sysmon settings card — a self-contained slice
 * of the official plugin-config card-store pattern (same shape as the
 * dsh-web-ui family plugins use), so this package needs no sibling UI deps.
 */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
/** A boolean field, edited through true/false draft text. */
export function booleanField(field) {
    return {
        field,
        format: value => typeof value === 'boolean' ? String(value) : '',
        parse: (text) => {
            const trimmed = text.trim();
            if (trimmed === '')
                return { kind: 'clear' };
            if (trimmed === 'true')
                return { kind: 'set', value: true };
            if (trimmed === 'false')
                return { kind: 'set', value: false };
            return undefined;
        },
    };
}
/** A whole- or decimal-number field. */
export function numberField(field, constraints = {}) {
    const { integer = false, min } = constraints;
    return {
        field,
        format: value => typeof value === 'number' ? String(value) : '',
        parse: (text) => {
            const trimmed = text.trim();
            if (trimmed === '')
                return { kind: 'clear' };
            const parsed = Number(trimmed);
            if (!Number.isFinite(parsed))
                return undefined;
            if (integer && !Number.isInteger(parsed))
                return undefined;
            if (min !== undefined && parsed < min)
                return undefined;
            return { kind: 'set', value: parsed };
        },
    };
}
/**
 * Stages one card's edits over one settings namespace and writes them on save.
 */
export class CardForm {
    scope;
    specs;
    staged = new Map();
    listeners = new Set();
    saving = false;
    failed = false;
    constructor(scope, specs) {
        this.scope = scope;
        this.specs = new Map(specs.map(spec => [spec.field, spec]));
        scope.subscribe(() => { this.publish(); });
    }
    bind(project) {
        const store = createSnapshotStore(project());
        this.listeners.add(() => { store.set(project()); });
        return store;
    }
    shell() {
        const snapshot = this.scope.getSnapshot();
        const plan = this.plan();
        return {
            available: snapshot.status !== 'loading',
            exposed: snapshot.status === 'ready',
            writable: snapshot.writable,
            dirty: plan.length > 0,
            invalid: plan.some(item => item.run === undefined),
            saving: this.saving,
            failed: this.failed,
        };
    }
    field(field) {
        const spec = this.specOf(field);
        const staged = this.staged.get(field);
        if (staged === undefined) {
            return { text: spec.format(this.sectionValue(field)), overridden: this.stored(field), invalid: false };
        }
        const write = staged.clear ? { kind: 'clear' } : spec.parse(staged.text);
        return {
            text: staged.text,
            overridden: write?.kind === 'set',
            invalid: write === undefined,
        };
    }
    actions() {
        return {
            edit: (field, text) => { this.stage(field, { text, clear: false }); },
            resetField: (field) => {
                this.stage(field, { text: this.specOf(field).format(this.baseValue(field)), clear: true });
            },
            save: () => { void this.save(); },
            discard: () => {
                if (this.staged.size === 0 && !this.failed)
                    return;
                this.staged.clear();
                this.failed = false;
                this.publish();
            },
        };
    }
    async save() {
        const plan = this.plan();
        const writes = plan.flatMap(item => item.run === undefined ? [] : [item.run]);
        if (plan.length === 0 || this.saving || writes.length !== plan.length)
            return;
        const fields = new Set(plan.map(item => item.field));
        this.saving = true;
        this.failed = false;
        this.publish();
        let landed = true;
        for (const write of writes) {
            landed = await write() && landed;
        }
        if (landed) {
            for (const field of fields)
                this.staged.delete(field);
        }
        this.saving = false;
        this.failed = !landed;
        this.publish();
    }
    plan() {
        const plan = [];
        for (const [field, staged] of this.staged) {
            const spec = this.specOf(field);
            if (staged.clear) {
                if (this.stored(field))
                    plan.push({ field, run: () => this.clear(field) });
                continue;
            }
            if (staged.text === spec.format(this.sectionValue(field)))
                continue;
            const write = spec.parse(staged.text);
            if (write === undefined)
                plan.push({ field, run: undefined });
            else if (write.kind === 'clear')
                plan.push({ field, run: () => this.clear(field) });
            else
                plan.push({ field, run: () => this.store(field, write.value) });
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
        if (spec === undefined)
            throw new Error(`settings card has no field ${field}`);
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
        return user !== undefined && Object.hasOwn(user, field);
    }
    publish() {
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=settings-form.js.map