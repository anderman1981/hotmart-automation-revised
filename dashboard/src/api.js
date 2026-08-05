// Dynamic API URL detection
// Works both locally and via Cloudflare tunnel
const getApiBase = () => {
  const host = window.location.hostname;
  const port = window.location.port;
  
  // If accessed via Cloudflare (no port or 443/80), use the API subdomain
  if (!port || port === '443' || port === '80') {
    return `https://${host.replace('hotmart.', 'hotmart-api.')}`;
  }
  
  // If accessed locally (any port), use same host with port 4200
  return `http://${host}:4200`;
};

export const API_BASE = getApiBase();
export default API_BASE;
