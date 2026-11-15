// Show "–" when the backend did not supply a value, never a made-up number.
export const fmt = (v, suffix = '') => (v === null || v === undefined ? '–' : `${v}${suffix}`);
