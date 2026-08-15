/**
 * Invariant companion for @dsh-external/dsh-mobile-ui.
 *
 * No runtime invariant: the plugin owns no HTTP route and no service key —
 * the browser half is a pure DOM adapter over the frame layout, so there is
 * nothing to assert at load time.
 * @module @dsh-external/dsh-mobile-ui/invariant
 */
/** Provides no assertions: mobile-ui owns no cross-package runtime invariants. */
export declare function apply(): void;
