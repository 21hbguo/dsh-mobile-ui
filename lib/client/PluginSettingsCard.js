import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Sysmon settings card: a disclosure card binding the `sysmon` settings
 * namespace — the enabled master switch and the collector cache interval.
 * All styles are inline (matching the widget's zero-dependency philosophy) so
 * the client bundle needs no css pipeline.
 */
import { useState } from 'react';
/** Shared inline styles. */
const S = {
    card: {
        listStyle: 'none',
        border: '1px solid var(--dsw-alias-border-l2)',
        borderRadius: '8px',
        background: 'var(--dsw-alias-bg-layer-3)',
        overflow: 'hidden',
        minWidth: 0,
        transition: 'border-color .16s, background .16s',
    },
    cardOpen: {
        background: 'var(--dsw-alias-bg-layer-2)',
        borderColor: 'var(--dsw-alias-label-dimmed)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '10px 14px',
        border: 0,
        background: 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit',
    },
    headText: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0, overflow: 'hidden' },
    name: { fontWeight: 600, color: 'var(--dsw-alias-label-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    description: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    pending: { fontSize: 12, color: 'var(--dsw-alias-state-warn-primary)', flex: 'none', whiteSpace: 'nowrap' },
    chevron: { transition: 'transform 120ms ease', color: 'var(--dsw-alias-label-tertiary)', flex: 'none', fontSize: 13 },
    body: { padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '14px' },
    readOnly: { margin: 0, fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' },
    notExposed: { margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--dsw-alias-state-warn-primary)' },
    footer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' },
    failed: { margin: '0 auto 0 0', fontSize: 12, color: 'var(--dsw-alias-state-error-primary)' },
    discard: { borderRadius: '6px', padding: '5px 12px', font: 'inherit', fontSize: 13, cursor: 'pointer', background: 'transparent', color: 'var(--dsw-alias-label-primary)', border: '1px solid var(--dsw-alias-border-l2)' },
    save: { borderRadius: '6px', padding: '5px 12px', font: 'inherit', fontSize: 13, cursor: 'pointer', background: 'var(--dsw-alias-button-info-fill)', color: 'var(--dsw-alias-label-inverse)', border: 0 },
    field: { display: 'flex', flexDirection: 'column', gap: '4px' },
    head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
    label: { fontSize: 13, color: 'var(--dsw-alias-label-primary)' },
    badges: { display: 'flex', alignItems: 'center', gap: '6px' },
    badge: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' },
    reset: { border: 0, background: 'transparent', color: 'var(--dsw-alias-interactive-fg)', fontSize: 12, cursor: 'pointer', padding: 0 },
    select: { borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', padding: '5px 8px', font: 'inherit', fontSize: 13 },
    input: { borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', padding: '5px 8px', font: 'inherit', fontSize: 13 },
    hint: { margin: 0, fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' },
    invalid: { margin: 0, fontSize: 12, color: 'var(--dsw-alias-state-error-primary)' },
};
/** Render one plugin settings card. */
export function PluginSettingsCard(props) {
    const [open, setOpen] = useState(false);
    const { state } = props;
    if (!state.available)
        return null;
    const title = props.t(props.titleKey);
    const blocked = !state.dirty || state.invalid || state.saving;
    const cardStyle = open ? { ...S.card, ...S.cardOpen } : S.card;
    const description = props.t(props.descriptionKey);
    const header = (_jsxs("button", { type: "button", style: S.header, "aria-expanded": open, onClick: () => { setOpen(!open); }, children: [_jsxs("span", { style: S.headText, children: [_jsx("span", { style: S.name, title: title, children: title }), _jsx("span", { style: S.description, children: description })] }), state.dirty ? _jsx("span", { style: S.pending, title: props.t('settings.unsaved'), children: props.t('settings.unsaved') }) : null, _jsx("span", { style: { ...S.chevron, transform: open ? 'rotate(180deg)' : undefined }, children: "\u25BE" })] }));
    if (!state.exposed) {
        return (_jsxs("li", { style: cardStyle, children: [header, open ? _jsx("div", { style: S.body, children: _jsx("p", { style: S.notExposed, role: "status", children: props.t('settings.notExposed') }) }) : null] }));
    }
    return (_jsxs("li", { style: cardStyle, children: [header, open ? (_jsxs("div", { style: S.body, children: [!state.writable ? _jsx("p", { style: S.readOnly, role: "status", children: props.t('settings.readOnly') }) : null, props.children, _jsxs("div", { style: S.footer, children: [state.failed ? _jsx("p", { style: S.failed, role: "status", children: props.t('settings.saveFailed') }) : null, _jsx("button", { type: "button", style: S.discard, disabled: !state.dirty || state.saving, onClick: props.onDiscard, children: props.t('settings.discard') }), _jsx("button", { type: "button", style: S.save, disabled: blocked, onClick: props.onSave, children: props.t(!state.saving ? 'settings.save' : 'settings.saving') })] })] })) : null] }));
}
/** A staged boolean field: 继承 / 开 / 关. */
export function BooleanField(props) {
    return (_jsxs("div", { style: S.field, children: [_jsxs("div", { style: S.head, children: [_jsx("label", { style: S.label, htmlFor: props.id, children: props.label }), props.overridden ? (_jsxs("span", { style: S.badges, children: [_jsx("span", { style: S.badge, children: props.overriddenLabel }), _jsx("button", { type: "button", style: S.reset, disabled: props.disabled, onClick: props.onReset, children: props.resetLabel })] })) : null] }), _jsxs("select", { id: props.id, style: S.select, value: props.text, disabled: props.disabled, onChange: (event) => { props.onEdit(event.target.value); }, children: [_jsx("option", { value: "", children: props.inheritLabel }), _jsx("option", { value: "true", children: props.onLabel }), _jsx("option", { value: "false", children: props.offLabel })] }), _jsx("p", { style: S.hint, children: props.hint })] }));
}
/** A staged numeric value field. */
export function ValueField(props) {
    return (_jsxs("div", { style: S.field, children: [_jsxs("div", { style: S.head, children: [_jsx("label", { style: S.label, htmlFor: props.id, children: props.label }), props.overridden ? (_jsxs("span", { style: S.badges, children: [_jsx("span", { style: S.badge, children: props.overriddenLabel }), _jsx("button", { type: "button", style: S.reset, disabled: props.disabled, onClick: props.onReset, children: props.resetLabel })] })) : null] }), _jsx("input", { id: props.id, style: props.invalid ? { ...S.input, borderColor: 'var(--dsw-alias-state-error-primary)' } : S.input, type: "text", ...props.numeric ? { inputMode: 'numeric' } : {}, ...props.invalid ? { 'aria-invalid': true } : {}, value: props.text, placeholder: props.placeholder ?? '', disabled: props.disabled, onChange: (event) => { props.onEdit(event.target.value); } }), _jsx("p", { style: props.invalid ? S.invalid : S.hint, children: props.invalid ? props.invalidLabel : props.hint })] }));
}
//# sourceMappingURL=PluginSettingsCard.js.map