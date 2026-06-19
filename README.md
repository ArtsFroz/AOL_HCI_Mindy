# Mindy — Because Your Mind Matters 🐧

Mindy adalah aplikasi web **mental wellness** mobile-first yang menjadi ruang aman bagi pengguna untuk *check-in* suasana hati, bernapas, dan mengobrol dengan **Pip** — maskot pinguin yang menemani perjalanan kesehatan mental mereka.

Proyek ini dikembangkan untuk mata kuliah **Human and Computer Interaction (HCI)** — Kelompok 7.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🙂 **Mood Check-In** | Catat suasana hati harian beserta catatan singkat. |
| 🐧 **Chat dengan Pip** | Teman ngobrol AI yang empatik, didukung Google Gemini. |
| 🌬️ **Breathe** | Latihan pernapasan untuk menenangkan diri. |
| ✨ **Daily Boost** | Afirmasi & dorongan positif setiap hari. |
| 📖 **Wisdom of the Day** | Kutipan inspiratif yang bisa difilter per kategori. |
| 📊 **Stats / MindMap** | Visualisasi tren suasana hati dari waktu ke waktu. |
| 👤 **Profile & Privacy** | Kelola profil, notifikasi, dan privasi pengguna. |

---

## 🛠️ Teknologi

- **HTML, CSS, JavaScript** (vanilla, tanpa framework)
- **Progressive Web App (PWA)** — `manifest.json` + service worker
- **Google Gemini 2.5 Flash** untuk fitur Chat Pip
- **localStorage** untuk penyimpanan data di sisi klien (mood, chat, profil)
- Desain **mobile-first** (lebar acuan 375px)

---

## 🚀 Menjalankan Secara Lokal

Karena ini situs statis, cukup buka `index.html` di browser, atau jalankan server lokal sederhana:

```bash
# Python
python -m http.server 8000

# atau Node
npx serve .
```

Lalu buka `http://localhost:8000`.

> **Catatan fitur Chat Pip:** key API tidak disimpan di repo (alasan keamanan). Di code, key berupa placeholder `__GEMINI_API_KEY__`. Untuk testing lokal, ganti sementara placeholder tersebut di `js/chat.js` dengan API key Gemini Anda (**jangan di-commit**).

---

## ☁️ Deployment (Netlify)

Situs di-deploy via Netlify yang terhubung langsung ke repo ini.

- File `netlify.toml` menjalankan build yang mengganti placeholder `__GEMINI_API_KEY__` dengan nilai **Environment Variable** `GEMINI_API_KEY` yang di-set di dashboard Netlify.
- Dengan begitu, key asli hanya ada di lingkungan deploy — **tidak pernah masuk ke repo GitHub**.

---

## 📁 Struktur Folder

```
.
├── index.html          # Splash / entry point
├── welcome.html        # Onboarding
├── signup.html / login.html
├── home.html           # Beranda
├── mood.html           # Mood check-in
├── chat.html           # Chat dengan Pip
├── boost.html          # Daily Boost
├── wisdom.html         # Wisdom of the Day
├── stats.html          # Statistik mood
├── profile.html        # Profil & pengaturan
├── css/style.css
├── js/
│   ├── app.js          # Helper storage, navigasi, dll.
│   ├── chat.js         # Logika AI Pip (Gemini)
│   └── router.js
├── assets/             # Ikon & gambar
├── manifest.json       # Konfigurasi PWA
└── netlify.toml        # Konfigurasi deploy
```

---

## 👥 Tim

Kelompok 7 — Human and Computer Interaction.
