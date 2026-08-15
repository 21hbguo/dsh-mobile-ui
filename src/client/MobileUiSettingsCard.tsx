/**
 * The mobile-ui settings card: the enabled master switch and the breakpoint
 * width. Registers into the `settings.plugin.item` slot, bound to the
 * `mobile-ui` settings namespace.
 */

import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { MobileUiLocaleKey } from './locales.js'
import { PluginSettingsCard, BooleanField, ValueField } from './PluginSettingsCard.js'
import { CardForm, booleanField, numberField, type CardActions, type CardShell, type FieldState } from './settings-form.js'

/** The mobile-ui settings fields this card edits. */
export interface MobileUiSettings {
  enabled?: boolean
  breakpoint?: number
}

/** What the mobile-ui settings card renders. */
export interface MobileUiSettingsCardState extends CardShell {
  enabled: FieldState
  breakpoint: FieldState
}

/** The registration-side face the card's slot entry injects. */
export interface MobileUiSettingsCardFace extends CardActions {
  hooks: {
    mobileUiSettingsCard: SnapshotStore<MobileUiSettingsCardState>
  }
}

/** Bridges the `mobile-ui` scope onto the card's staged form. */
export class MobileUiSettingsCardController {
  private readonly form: CardForm<MobileUiSettings>
  private readonly store: SnapshotStore<MobileUiSettingsCardState>

  constructor(scope: SettingsScope<MobileUiSettings>) {
    this.form = new CardForm(scope, [
      booleanField('enabled'),
      numberField('breakpoint', { min: 400 }),
    ])
    this.store = this.form.bind(() => this.projection())
  }

  private projection(): MobileUiSettingsCardState {
    return {
      ...this.form.shell(),
      enabled: this.form.field('enabled'),
      breakpoint: this.form.field('breakpoint'),
    }
  }

  inject(): MobileUiSettingsCardFace {
    return { hooks: { mobileUiSettingsCard: this.store }, ...this.form.actions() }
  }
}

/** Props the renderer binds for the mobile-ui card. */
export type MobileUiSettingsCardProps =
  PropsRuntime<'settings.plugin.item'>
  & { t: (key: MobileUiLocaleKey & string) => string }
  & InjectFace<MobileUiSettingsCardFace>

/** Render the mobile-ui settings card. */
export function MobileUiSettingsCard(props: MobileUiSettingsCardProps) {
  const { t } = props
  const state = props.useMobileUiSettingsCard(snapshot => snapshot)
  const disabled = !state.writable
  const fieldProps = {
    overriddenLabel: t('settings.overridden'),
    resetLabel: t('settings.reset'),
    invalidLabel: t('settings.invalidNumber'),
    disabled,
  }
  return (
    <PluginSettingsCard
      t={t as (key: string) => string}
      titleKey="settings.title"
      descriptionKey="settings.description"
      state={state}
      onSave={props.save}
      onDiscard={props.discard}
    >
      <BooleanField
        id="settings-mobile-ui-enabled"
        label={t('settings.enabled')}
        hint={t('settings.enabledHint')}
        inheritLabel={t('settings.inherit')}
        onLabel={t('settings.on')}
        offLabel={t('settings.off')}
        {...fieldProps}
        {...state.enabled}
        onEdit={(text) => { props.edit('enabled', text) }}
        onReset={() => { props.resetField('enabled') }}
      />
      <ValueField
        id="settings-mobile-ui-breakpoint"
        label={t('settings.breakpoint')}
        hint={t('settings.breakpointHint')}
        numeric
        {...fieldProps}
        {...state.breakpoint}
        onEdit={(text) => { props.edit('breakpoint', text) }}
        onReset={() => { props.resetField('breakpoint') }}
      />
    </PluginSettingsCard>
  )
}
