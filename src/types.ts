/**
 * Shared mobile-ui wire types — used by both halves. Pure types only, so the
 * browser bundle can import them without pulling node built-ins.
 * @module @dsh-external/dsh-mobile-ui/types
 */

/** The mobile-ui settings the settings card edits. */
export interface MobileUiSettings {
  /** Master switch: disables the whole mobile adaptation layer. */
  enabled?: boolean
  /** Viewport width (px) at or below which the mobile layout activates. */
  breakpoint?: number
}
