const API = import.meta.env.VITE_BACK_URL ?? 'http://localhost:8090';

function buildHeaders(extra = {}, multipart = false) {
  const token = localStorage.getItem('jwt');
  return {
    ...(multipart ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiFetch(path, options = {}) {
  const { headers: extraHeaders, multipart, ...rest } = options;
  return fetch(`${API}${path}`, {
    headers: buildHeaders(extraHeaders, multipart),
    ...rest,
  });
}

export { API };
