// All dates are "YYYY-MM-DD" strings in the server's local calendar.
const pad = n => String(n).padStart(2, '0');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let clock = () => new Date();
const setClock = fn => { clock = fn || (() => new Date()); }; // tests inject a fixed "now"

const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const isISODate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(parse(s)) === s;
const today = () => toISO(clock());
const nowLocal = () => { const d = clock(); return `${toISO(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return toISO(d); };
const weekdayOf = s => parse(s).getDay();
const shortDay = s => DAYS[weekdayOf(s)];
const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const eachDay = (from, to) => { const out = []; for (let d = from; d <= to; d = addDays(d, 1)) out.push(d); return out; };
module.exports = { setClock, toISO, parse, isISODate, today, nowLocal, addDays, weekdayOf, shortDay, daysBetween, eachDay };
