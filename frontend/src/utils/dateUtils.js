export const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
export const today = () => iso(new Date());
export const isScheduled = (h, date) => date >= (h.start_date || '0000-00-00') && (!h.weekdays?.length || h.weekdays.includes(new Date(date + 'T00:00:00').getDay()));
export const longDate = d => new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
// All dates exchanged with the API and stored in state are "YYYY-MM-DD" strings (local calendar day).
export const isISODate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(new Date(s + 'T00:00:00')) === s;
export const normalizeDate = v => {
  if (!v) return '';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const d = new Date(v); return isNaN(d) ? '' : iso(d);
};
