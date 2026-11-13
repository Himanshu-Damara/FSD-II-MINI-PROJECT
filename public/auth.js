(function () {
  document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="auth.css">');
  const publicPage = window.location.pathname.endsWith('/login.html') || window.location.pathname === '/login.html';
  const isLoggedIn = sessionStorage.getItem('studentApiLoggedIn') === 'true';
  if (!publicPage && !isLoggedIn) { window.location.replace('/login.html'); return; }
  if (publicPage && isLoggedIn) window.location.replace('/index.html');
  window.logout = function () { sessionStorage.removeItem('studentApiLoggedIn'); sessionStorage.removeItem('studentApiUser'); window.location.replace('/login.html'); };
  window.addEventListener('DOMContentLoaded', () => { const header = document.querySelector('header'); if (header && !publicPage) { const logout = document.createElement('button'); logout.className = 'logout-button'; logout.textContent = 'Logout'; logout.onclick = window.logout; header.appendChild(logout); } });
}());
