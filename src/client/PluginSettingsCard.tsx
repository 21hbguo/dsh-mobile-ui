/**
 * Sysmon settings card: a disclosure card binding the `sysmon` settings
 * namespace — the enabled master switch and the collector cache interval.
 * All styles are inline (matching the widget's zero-dependency philosophy) so
 * the client bundle needs no css pipeline.
 */

import { useState, type ReactNode } from 'react'
import type { CardShell } from './settings-form.js'

/** Card chrome shared by every plugin settings card. */
export interface PluginSettingsCardProps {
  t: (key: string) => string
  titleKey: string
  descriptionKey: string
  state: CardShell
  onSave: () => void
  onDiscard: () => void
  children: ReactNode
}

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
  } as const,
  cardOpen: {
    background: 'var(--dsw-alias-bg-layer-2)',
    borderColor: 'var(--dsw-alias-label-dimmed)',
  } as const,
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
  } as const,
  headText: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0, overflow: 'hidden' } as const,
  name: { fontWeight: 600, color: 'var(--dsw-alias-label-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as const,
  description: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as const,
  pending: { fontSize: 12, color: 'var(--dsw-alias-state-warn-primary)', flex: 'none', whiteSpace: 'nowrap' } as const,
  chevron: { transition: 'transform 120ms ease', color: 'var(--dsw-alias-label-tertiary)', flex: 'none', fontSize: 13 } as const,
  body: { padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '14px' } as const,
  readOnly: { margin: 0, fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' } as const,
  notExposed: { margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--dsw-alias-state-warn-primary)' } as const,
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' } as const,
  failed: { margin: '0 auto 0 0', fontSize: 12, color: 'var(--dsw-alias-state-error-primary)' } as const,
  discard: { borderRadius: '6px', padding: '5px 12px', font: 'inherit', fontSize: 13, cursor: 'pointer', background: 'transparent', color: 'var(--dsw-alias-label-primary)', border: '1px solid var(--dsw-alias-border-l2)' } as const,
  save: { borderRadius: '6px', padding: '5px 12px', font: 'inherit', fontSize: 13, cursor: 'pointer', background: 'var(--dsw-alias-button-info-fill)', color: 'var(--dsw-alias-label-inverse)', border: 0 } as const,
  field: { display: 'flex', flexDirection: 'column', gap: '4px' } as const,
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } as const,
  label: { fontSize: 13, color: 'var(--dsw-alias-label-primary)' } as const,
  badges: { display: 'flex', alignItems: 'center', gap: '6px' } as const,
  badge: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' } as const,
  reset: { border: 0, background: 'transparent', color: 'var(--dsw-alias-interactive-fg)', fontSize: 12, cursor: 'pointer', padding: 0 } as const,
  select: { borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', padding: '5px 8px', font: 'inherit', fontSize: 13 } as const,
  input: { borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', padding: '5px 8px', font: 'inherit', fontSize: 13 } as const,
  hint: { margin: 0, fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' } as const,
  invalid: { margin: 0, fontSize: 12, color: 'var(--dsw-alias-state-error-primary)' } as const,
} as const

/** Render one plugin settings card. */
export function PluginSettingsCard(props: PluginSettingsCardProps) {
  const [open, setOpen] = useState(false)
  const { state } = props
  if (!state.available) return null
  const title = props.t(props.titleKey)
  const blocked = !state.dirty || state.invalid || state.saving
  const cardStyle = open ? { ...S.card, ...S.cardOpen } : S.card
  const description = props.t(props.descriptionKey)
  const header = (
    <button
      type="button"
      style={S.header}
      aria-expanded={open}
      onClick={() => { setOpen(!open) }}
    >
      <span style={S.headText}>
        <span style={S.name} title={title}>{title}</span>
        <span style={S.description}>{description}</span>
      </span>
      {state.dirty ? <span style={S.pending} title={props.t('settings.unsaved')}>{props.t('settings.unsaved')}</span> : null}
      <span style={{ ...S.chevron, transform: open ? 'rotate(180deg)' : undefined }}>▾</span>
    </button>
  )
  if (!state.exposed) {
    return (
      <li style={cardStyle}>
        {header}
        {open ? <div style={S.body}><p style={S.notExposed} role="status">{props.t('settings.notExposed')}</p></div> : null}
      </li>
    )
  }
  return (
    <li style={cardStyle}>
      {header}
      {open ? (
        <div style={S.body}>
          {!state.writable ? <p style={S.readOnly} role="status">{props.t('settings.readOnly')}</p> : null}
          {props.children}
          <div style={S.footer}>
            {state.failed ? <p style={S.failed} role="status">{props.t('settings.saveFailed')}</p> : null}
            <button type="button" style={S.discard} disabled={!state.dirty || state.saving} onClick={props.onDiscard}>{props.t('settings.discard')}</button>
            <button type="button" style={S.save} disabled={blocked} onClick={props.onSave}>{props.t(!state.saving ? 'settings.save' : 'settings.saving')}</button>
          </div>
        </div>
      ) : null}
    </li>
  )
}

/** Field props shared by every control. */
export interface FieldProps {
  id: string
  label: string
  hint: string
  text: string
  overridden: boolean
  invalid: boolean
  overriddenLabel: string
  resetLabel: string
  invalidLabel: string
  disabled: boolean
  onEdit: (text: string) => void
  onReset: () => void
}

/** A staged boolean field: 继承 / 开 / 关. */
export function BooleanField(props: FieldProps & { inheritLabel: string; onLabel: string; offLabel: string }) {
  return (
    <div style={S.field}>
      <div style={S.head}>
        <label style={S.label} htmlFor={props.id}>{props.label}</label>
        {props.overridden ? (
          <span style={S.badges}>
            <span style={S.badge}>{props.overriddenLabel}</span>
            <button type="button" style={S.reset} disabled={props.disabled} onClick={props.onReset}>{props.resetLabel}</button>
          </span>
        ) : null}
      </div>
      <select id={props.id} style={S.select} value={props.text} disabled={props.disabled} onChange={(event) => { props.onEdit(event.target.value) }}>
        <option value="">{props.inheritLabel}</option>
        <option value="true">{props.onLabel}</option>
        <option value="false">{props.offLabel}</option>
      </select>
      <p style={S.hint}>{props.hint}</p>
    </div>
  )
}

/** A staged numeric value field. */
export function ValueField(props: FieldProps & { numeric?: boolean; placeholder?: string }) {
  return (
    <div style={S.field}>
      <div style={S.head}>
        <label style={S.label} htmlFor={props.id}>{props.label}</label>
        {props.overridden ? (
          <span style={S.badges}>
            <span style={S.badge}>{props.overriddenLabel}</span>
            <button type="button" style={S.reset} disabled={props.disabled} onClick={props.onReset}>{props.resetLabel}</button>
          </span>
        ) : null}
      </div>
      <input id={props.id} style={props.invalid ? { ...S.input, borderColor: 'var(--dsw-alias-state-error-primary)' } : S.input} type="text" {...props.numeric ? { inputMode: 'numeric' as const } : {}} {...props.invalid ? { 'aria-invalid': true } : {}} value={props.text} placeholder={props.placeholder ?? ''} disabled={props.disabled} onChange={(event) => { props.onEdit(event.target.value) }} />
      <p style={props.invalid ? S.invalid : S.hint}>{props.invalid ? props.invalidLabel : props.hint}</p>
    </div>
  )
}
