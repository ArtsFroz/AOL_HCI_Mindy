// ===== ROUTER =====
// Navigasi antar halaman tanpa reload

const PAGES = {
  '/':        'index.html',
  '/home':    'home.html',
  '/chat':    'chat.html',
  '/mood':    'mood.html',
  '/boost':   'boost.html',
  '/wisdom':  'wisdom.html',
  '/stats':   'stats.html',
  '/profile': 'profile.html',
};

function navigate(path) {
  const page = PAGES[path];
  if (page) {
    window.location.href = page;
  }
}

// Tandai nav item yang aktif
function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    const href = item.getAttribute('href') || '';
    const page = href.split('/').pop();
    if (page === current) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNav);