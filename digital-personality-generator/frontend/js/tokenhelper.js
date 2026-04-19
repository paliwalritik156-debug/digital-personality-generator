// Read token from URL if present
(function() {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    if (token && userStr) {
      window._appToken = token;
      window._appUser = JSON.parse(decodeURIComponent(userStr));
      // Clean URL
      window.history.replaceState({}, '', '/');
    }
  } catch(e) { console.log('token helper err:', e); }
})();
