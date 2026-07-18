const TOKEN_KEY = 'cafe-cms:token';

export const auth = {
  saveToken(token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  getToken() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  clearToken() {
    window.localStorage.removeItem(TOKEN_KEY);
  },
};
