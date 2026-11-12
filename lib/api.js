const DEFAULT_API_URL = 'https://sachin-dev-59j2.onrender.com/api';

export const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : DEFAULT_API_URL;
export const BASE_URL = API_URL.replace('/api', '');

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${BASE_URL}${url}`;
  if (url.startsWith('http://sachin-dev-59j2.onrender.com')) return url.replace('http://', 'https://');
  return url;
};

// Normalises any image URL stored by the backend so it loads on the public site:
// relative "/uploads/..." paths, URLs saved while developing on localhost, and
// plain http:// URLs (which browsers block on an https page).
export const resolveImage = (url) => {
  if (!url || typeof url !== 'string') return '';
  const value = url.trim();
  if (!value || value === 'null' || value === 'undefined') return '';
  if (value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${BASE_URL}${value}`;
  const local = value.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/.*)$/);
  if (local) return `${BASE_URL}${local[1]}`;
  if (value.startsWith('http://')) return `https://${value.slice(7)}`;
  return value;
};

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return headers;
};

const readResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return res.json();
  }

  const text = await res.text();
  return {
    success: false,
    message: text || `Request failed with status ${res.status}`,
  };
};

const checkResponse = async (res) => {
  const data = await readResponse(res);
  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.response = { data, status: res.status };
    throw error;
  }
  return { data };
};

const api = {
  get: async (url, config = {}) => {
    const headers = getAuthHeaders();
    if (config.headers) Object.assign(headers, config.headers);

    const res = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers,
    });
    return checkResponse(res);
  },

  post: async (url, body = {}, config = {}) => {
    const headers = getAuthHeaders();
    if (config.headers) Object.assign(headers, config.headers);

    // If body is FormData, don't stringify it and don't set JSON content-type
    const isFormData = body instanceof FormData;
    if (isFormData) {
       delete headers['Content-Type'];
    }

    const res = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return checkResponse(res);
  },

  put: async (url, body = {}, config = {}) => {
    const headers = getAuthHeaders();
    if (config.headers) Object.assign(headers, config.headers);

    const isFormData = body instanceof FormData;
    if (isFormData) {
       delete headers['Content-Type'];
    }

    const res = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return checkResponse(res);
  },

  delete: async (url, config = {}) => {
    const headers = getAuthHeaders();
    if (config.headers) Object.assign(headers, config.headers);

    const res = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers,
    });
    return checkResponse(res);
  },
};

export default api;
