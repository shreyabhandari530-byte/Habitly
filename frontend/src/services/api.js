import axios from 'axios';
import toast from 'react-hot-toast';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', timeout: 10000 });
const status = s => window.dispatchEvent(new CustomEvent('api:status', { detail: s }));
// Every failed request gets: err.kind (network | timeout | server | validation | conflict | notfound | client),
// err.status, err.message (user-friendly) and err.fieldErrors ({field: message}) for 400/422 responses.
api.interceptors.response.use(r => { status('online'); return r; }, err => {
  const res = err.response;
  if (!res) {
    err.kind = err.code === 'ECONNABORTED' ? 'timeout' : 'network';
    err.message = err.kind === 'timeout' ? 'The server took too long to respond. Please try again.' : 'Cannot reach the server. Check that the backend is running on port 5000.';
    status('offline');
  } else {
    status('online'); const d = res.data || {}; err.status = res.status;
    err.message = d.message || d.error || `Request failed (${res.status}).`;
    if (res.status >= 500) { err.kind = 'server'; err.message = d.message || 'Server error. Please try again in a moment.'; }
    else if (res.status === 400 || res.status === 422) { err.kind = 'validation'; err.fieldErrors = d.errors && typeof d.errors === 'object' && !Array.isArray(d.errors) ? d.errors : null; }
    else if (res.status === 409) err.kind = 'conflict';
    else if (res.status === 404) err.kind = 'notfound';
    else err.kind = 'client';
  }
  if (!err.config?.silent && ['network', 'timeout', 'server'].includes(err.kind)) toast.error(err.message, { id: err.kind });
  return Promise.reject(err);
});
export default api;
