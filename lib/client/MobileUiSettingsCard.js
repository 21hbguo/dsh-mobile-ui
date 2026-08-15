import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PluginSettingsCard, BooleanField, ValueField } from './PluginSettingsCard.js';
import { CardForm, booleanField, numberField } from './settings-form.js';
/** Bridges the `mobile-ui` scope onto the card's staged form. */
export class MobileUiSettingsCardController {
    form;
    store;
    constructor(scope) {
        this.form = new CardForm(scope, [
            booleanField('enabled'),
            numberField('breakpoint', { min: 400 }),
        ]);
        this.store = this.form.bind(() => this.projection());
    }
    projection() {
        return {
            ...this.form.shell(),
            enabled: this.form.field('enabled'),
            breakpoint: this.form.field('breakpoint'),
        };
    }
    inject() {
        return { hooks: { mobileUiSettingsCard: this.store }, ...this.form.actions() };
    }
}
/** Render the mobile-ui settings card. */
export function MobileUiSettingsCard(props) {
    const { t } = props;
    const state = props.useMobileUiSettingsCard(snapshot => snapshot);
    const disabled = !state.writable;
    const fieldProps = {
        overriddenLabel: t('settings.overridden'),
        resetLabel: t('settings.reset'),
        invalidLabel: t('settings.invalidNumber'),
        disabled,
    };
    return (_jsxs(PluginSettingsCard, { t: t, titleKey: "settings.title", descriptionKey: "settings.description", state: state, onSave: props.save, onDiscard: props.discard, children: [_jsx(BooleanField, { id: "settings-mobile-ui-enabled", label: t('settings.enabled'), hint: t('settings.enabledHint'), inheritLabel: t('settings.inherit'), onLabel: t('settings.on'), offLabel: t('settings.off'), ...fieldProps, ...state.enabled, onEdit: (text) => { props.edit('enabled', text); }, onReset: () => { props.resetField('enabled'); } }), _jsx(ValueField, { id: "settings-mobile-ui-breakpoint", label: t('settings.breakpoint'), hint: t('settings.breakpointHint'), numeric: true, ...fieldProps, ...state.breakpoint, onEdit: (text) => { props.edit('breakpoint', text); }, onReset: () => { props.resetField('breakpoint'); } })] }));
}
//# sourceMappingURL=MobileUiSettingsCard.js.map