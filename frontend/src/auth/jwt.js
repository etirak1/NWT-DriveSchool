// Dekodira payload JWT tokena (samo čitanje, ne verifikacija — verifikaciju radi gateway)
export function decodeJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (e) {
    return null;
  }
}

// Provjera je li token istekao
export function isTokenValid() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload) return false;
  if (!payload.exp) return false;
  return payload.exp * 1000 > Date.now();
}

// Vraća rolu trenutno ulogovanog korisnika
export function getCurrentRole() {
  const token = localStorage.getItem('token');
  const payload = decodeJwt(token);
  return payload?.role || null;
}

// Vraća userId trenutno ulogovanog korisnika
export function getCurrentUserId() {
  const token = localStorage.getItem('token');
  const payload = decodeJwt(token);
  return payload?.userId || null;
}

// Vraća email iz tokena
export function getCurrentEmail() {
  const token = localStorage.getItem('token');
  const payload = decodeJwt(token);
  return payload?.sub || null;
}

// Provjera da li je korisnik admin
export function isAdmin() {
  return getCurrentRole() === 'ADMIN';
}