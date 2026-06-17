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
  const hadToken = !!localStorage.getItem('jwt');
  const res = await fetch(`${API}${path}`, {
    headers: buildHeaders(extraHeaders, multipart),
    ...rest,
  });

  // Kui meil oli JWT, aga backend vastab 401/403, on token aegunud või kehtetu
  // (nt 24h möödas või sisselogimisel jäi token salvestamata). Puhasta vana token
  // ja suuna kasutaja uuesti sisse logima, et saada värske token.
  if (hadToken && (res.status === 401 || res.status === 403)) {
    localStorage.removeItem('jwt');
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  }

  return res;
}

export { API };
