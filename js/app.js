// ===== APP.JS =====
// Utilitas global yang dipakai semua halaman

// ===== LOCAL STORAGE HELPERS =====
const Storage = {
  get: (key, fallback = null) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { console.error('Storage error'); }
  },
  remove: (key) => localStorage.removeItem(key),
};

// ===== USER PROFILE =====
const DEFAULT_PROFILE = {
  name: 'Mindy',
  joined: 'February 2024',
  avatar: '🐧',
};

function getProfile() {
  return Storage.get('mindyProfile', DEFAULT_PROFILE);
}

function saveProfile(data) {
  Storage.set('mindyProfile', data);
}

// ===== MOOD LOG =====
function getMoodLog() {
  return Storage.get('mindyMoodLog', []);
}

function addMoodLog(emotion, note = '') {
  const log = getMoodLog();
  log.push({
    emotion,
    note,
    date: new Date().toLocaleDateString('id-ID'),
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
  });
  Storage.set('mindyMoodLog', log);
}

// ===== MESSAGES =====
function getMessages() {
  return Storage.get('mindyMessages', [
    { role: 'assistant', text: 'Hai, aku Pip 🐧 Aku di sini buat nemenin kamu cerita. Gimana perasaan kamu hari ini?' }
  ]);
}

function saveMessages(messages) {
  Storage.set('mindyMessages', messages);
}

function clearMessages() {
  Storage.remove('mindyMessages');
}

// ===== MOOD THEMES =====
const MOOD_THEME = {
  netral:   { bg: '#F7F9FC', accent: '#6C9BCF', label: 'Tenang'   },
  sedih:    { bg: '#E3EDF7', accent: '#5B82B8', label: 'Sedih'    },
  cemas:    { bg: '#E2EFEE', accent: '#4F9D92', label: 'Cemas'    },
  senang:   { bg: '#FFF6E6', accent: '#E8975B', label: 'Senang'   },
  marah:    { bg: '#ECE7F1', accent: '#8A78A6', label: 'Kesal'    },
  lelah:    { bg: '#EEF0F4', accent: '#7E8AA3', label: 'Lelah'    },
  kesepian: { bg: '#E7EDF2', accent: '#6E8499', label: 'Kesepian' },
  kecewa:   { bg: '#F2ECE8', accent: '#A8836E', label: 'Kecewa'   },
};

// ===== BOTTOM NAV HTML =====
// Dipanggil di tiap halaman untuk render nav bawah
function renderBottomNav(activePage) {
  const items = [
    { label: 'Home',    icon: 'assets/icons/icon-home.svg',    href: 'home.html'    },
    { label: 'Affirm', icon: 'assets/icons/icon-affirm.svg', href: 'boost.html' },
    { label: 'Pip', icon: 'assets/icons/icon-wind.svg', href: 'chat.html', center: true },
    { label: 'Stats',   icon: 'assets/icons/icon-stats.svg',   href: 'stats.html'   },
    { label: 'Profile', icon: 'assets/icons/icon-profile.svg', href: 'profile.html' },
  ];

  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  nav.innerHTML = items.map((item) => {
    const isActive = item.href === activePage;

    if (item.center) {
      return `
        <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}" style="position:relative;top:-16px;">
          <span style="
            width: 56px; height: 56px;
            border-radius: 18px;
            background: #4461A7;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 20px rgba(68,97,167,0.4);
          ">
            <img src="${item.icon}" alt="${item.label}"
              style="width:28px;height:28px;object-fit:contain;filter:brightness(0) invert(1);" />
          </span>
          <span style="font-size:10px;font-weight:700;color:${isActive ? '#4461A7' : '#9AA7B5'};margin-top:4px;">${item.label}</span>
        </a>
      `;
    }

    return `
      <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
        <span class="icon" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;">
          <img src="${item.icon}" alt="${item.label}"
            style="width:100%;height:100%;object-fit:contain;
            ${isActive
              ? 'filter:invert(35%) sepia(60%) saturate(400%) hue-rotate(170deg) brightness(90%);'
              : 'filter:invert(65%) sepia(0%) saturate(0%) brightness(85%);'}" />
        </span>
        <span class="label" style="font-size:10px;font-weight:600;color:${isActive ? '#5B8FA8' : '#9AA7B5'};">${item.label}</span>
        ${isActive ? '<span class="dot"></span>' : ''}
      </a>
    `;
  }).join('');
}
// ===== GREETING =====
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}