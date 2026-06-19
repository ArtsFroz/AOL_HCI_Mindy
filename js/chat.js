// ===== CHAT.JS =====
// Logika AI Pip untuk chat.html

// Key asli TIDAK disimpan di repo. Diisi otomatis saat build Netlify
// (placeholder __GEMINI_API_KEY__ diganti dari Environment Variable GEMINI_API_KEY).
// Untuk testing lokal, ganti sementara placeholder di bawah dengan key asli (jangan di-commit).
const GEMINI_API_KEY = "__GEMINI_API_KEY__";
const GEMINI_MODEL   = "gemini-2.5-flash";

// const MOOD_THEME = {
//   netral:   { bg: "#F7F9FC", accent: "#6C9BCF", label: "Tenang"   },
//   sedih:    { bg: "#E3EDF7", accent: "#5B82B8", label: "Sedih"    },
//   cemas:    { bg: "#E2EFEE", accent: "#4F9D92", label: "Cemas"    },
//   senang:   { bg: "#FFF6E6", accent: "#E8975B", label: "Senang"   },
//   marah:    { bg: "#ECE7F1", accent: "#8A78A6", label: "Kesal"    },
//   lelah:    { bg: "#EEF0F4", accent: "#7E8AA3", label: "Lelah"    },
//   kesepian: { bg: "#E7EDF2", accent: "#6E8499", label: "Kesepian" },
//   kecewa:   { bg: "#F2ECE8", accent: "#A8836E", label: "Kecewa"   },
// };

const CRISIS_WORDS = [
  "bunuh diri","bundir","ingin mati","pengen mati","pengin mati","mau mati",
  "gak mau hidup","ga mau hidup","tidak ingin hidup","ngakhirin hidup",
  "mengakhiri hidup","akhiri hidup","menyakiti diri","nyakitin diri",
  "self harm","selfharm","lukai diri","melukai diri","gak sanggup hidup",
];

const SYSTEM_PROMPT = `KAMU ADALAH PIP — pinguin pendamping di aplikasi Mindy.
Perannya: teman yang hangat untuk bercerita soal perasaan, BUKAN terapis atau dokter.
Kamu pintu masuk yang ramah sebelum user siap cari bantuan profesional.

== ATURAN BICARA ==
- Pakai Bahasa Indonesia santai dan hangat. Sapa user dengan "kamu", sebut dirimu "aku".
- VALIDASI perasaan user DULU sebelum kasih saran. Akui perasaannya nyata dan wajar.
- Jawaban singkat, 2-4 kalimat. Jangan ceramah panjang.
- Saran hanya yang ringan & non-medis (tarik napas, journaling, istirahat, cerita ke orang terdekat).
- Sesekali tunjukkan kepribadian pinguin yang lucu & menenangkan, tapi tetap tulus.
- SELALU akhiri balasanmu dengan satu pertanyaan terbuka yang lembut.
- Lebih banyak BERTANYA daripada memberi solusi. Gali dulu perasaannya.
- Refleksikan balik apa yang user katakan supaya dia merasa didengar.
- Ingat dan referensikan hal penting yang user ceritakan sebelumnya dalam sesi ini.
- Kalau user sedang senang atau berbagi kabar baik, RAYAKAN bersama dia dengan tulus.
- Kalau user secara eksplisit MEMINTA solusi, barulah kasih 1-2 saran ringan & praktis.
- Kalau user marah besar atau marah ke Pip, jangan defensif. Akui kemarahannya, tetap tenang.
- Kalau user pamitan, tutup dengan hangat dan undang dia untuk kembali kapanpun.

== KEJUJURAN & BATASAN ==
- Jujur kalau kamu AI. Jangan pura-pura manusia atau terapis berlisensi.
- JANGAN mendiagnosis.
- JANGAN kasih saran obat.
- Untuk masalah berat berlarut-larut, sarankan konselor/psikolog dengan framing menguatkan.
- Tujuanmu memberdayakan user menemukan jalannya sendiri, bukan menggurui.

== YANG HARUS DIHINDARI ==
- JANGAN mengiyakan pikiran negatif.
- JANGAN over-afirmasi atau menjilat.
- JANGAN dorong user jadi tergantung sama kamu.
- Jaga konsistensi empati di obrolan panjang.

== PROTOKOL KRISIS ==
Pantau sinyal risiko termasuk yang halus. Kalau muncul:
- Tetap hangat, tanyakan apakah dia aman saat ini.
- Sampaikan nomor darurat: 119 ext. 8 (SEJIWA) dan LISA Helpline.
- Tetap dampingi, jangan tinggalkan sendirian.

== FORMAT OUTPUT (WAJIB) ==
"riskSignal" = "yes" kalau ada sinyal risiko, selain itu "no".
Balas HANYA dengan JSON valid:
{"emotion":"<sedih|cemas|marah|senang|lelah|kesepian|kecewa|netral>","reply":"<balasanmu>","suggestTool":"<breathing|journal|none>","riskSignal":"<yes|no>"}`;

// ===== STATE =====
let messages      = getMessages();
let moodHistory   = [];
let currentMood   = "netral";
let crisisAware   = false;
let loading       = false;
let showQuick     = true;
let breathInterval = null;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderMessages();
  updateMoodUI("netral");
  startBreathCycle();
});

// ===== RENDER MESSAGES =====
function renderMessages() {
  const container = document.getElementById("messages");
  const quickMoods = document.getElementById("quick-moods");

  // Hapus bubble lama (kecuali disclaimer dan quick moods)
  const existing = container.querySelectorAll(".msg-row");
  existing.forEach(el => el.remove());

  // Render semua messages
  messages.forEach(m => {
    const row = document.createElement("div");
    row.className = `msg-row ${m.role}`;
    row.innerHTML = `<div class="bubble ${m.role}">${m.text}</div>`;
    container.insertBefore(row, quickMoods);
  });

  // Quick moods hanya muncul kalau belum ada pesan user
  const hasUserMsg = messages.some(m => m.role === "user");
  if (hasUserMsg) {
    quickMoods.style.display = "none";
  }

  scrollToBottom();
}

function appendMessage(role, text) {
  const container = document.getElementById("messages");
  const quickMoods = document.getElementById("quick-moods");
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;
  row.innerHTML = `<div class="bubble ${role}">${text}</div>`;
  container.insertBefore(row, quickMoods);
  scrollToBottom();
}

function scrollToBottom() {
  const container = document.getElementById("messages");
  container.scrollTop = container.scrollHeight;
}

// ===== SEND MESSAGE =====
async function sendMsg(textArg) {
  if (loading) return;
  const input = document.getElementById("chat-input");
  const text = (textArg ?? input.value).trim();
  if (!text) return;

  input.value = "";
  document.getElementById("quick-moods").style.display = "none";

  // Tambah pesan user
  messages.push({ role: "user", text });
  Storage.set('mindyLastChat', Date.now());
  saveMessages(messages);
  appendMessage("user", text);

  // Cek krisis
  if (CRISIS_WORDS.some(w => text.toLowerCase().includes(w))) {
    showCrisis();
    crisisAware = true;
    return;
  }

  // Cek API key
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 30) {
    const errMsg = "API key belum dipasang nih 🐧 Ganti GEMINI_API_KEY di js/chat.js ya.";
    messages.push({ role: "assistant", text: errMsg });
    saveMessages(messages);
    appendMessage("assistant", errMsg);
    return;
  }

  setLoading(true);

  try {
    const history = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }));
    while (history.length && history[0].role === "model") history.shift();

    const careNote = crisisAware
      ? "\n\n== CATATAN SESI ==\nUser sempat menunjukkan sinyal tekanan berat. Ekstra lembut dan hati-hati."
      : "";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT + careNote }] },
          contents: history,
          generationConfig: { maxOutputTokens: 1000, responseMimeType: "application/json" },
        }),
      }
    );

    if (res.status === 429) throw new Error("429");

    const data = await res.json();
    const raw = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || "").join("").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { emotion: "netral", reply: raw || "Hmm, aku di sini kok. Cerita lagi ya?", suggestTool: "none", riskSignal: "no" };
    }

    // Update mood
    if (parsed.emotion && MOOD_THEME[parsed.emotion]) {
      currentMood = parsed.emotion;
      moodHistory.push(parsed.emotion);
      updateMoodUI(parsed.emotion);
      addMoodLog(parsed.emotion, text);
    }

    // Crisis aware
    if (parsed.riskSignal === "yes") {
      crisisAware = true;
      document.getElementById("pip-status").textContent = "🤍 Pip lagi ekstra perhatian";
    }

    // Tambah pesan assistant
    messages.push({ role: "assistant", text: parsed.reply });
    saveMessages(messages);
    appendMessage("assistant", parsed.reply);

    // Breathing tool
    if (parsed.suggestTool === "breathing") {
      document.getElementById("breathing-bubble").classList.add("show");
    }

  } catch (e) {
    const is429 = String(e).includes("429");
    const errMsg = is429
      ? "Pip butuh napas sebentar nih 🐧 Tunggu 10 detik ya, terus lanjut cerita!"
      : "Maaf, koneksi Pip terganggu 🐧 Coba lagi ya.";
    messages.push({ role: "assistant", text: errMsg });
    saveMessages(messages);
    appendMessage("assistant", errMsg);
  } finally {
    setLoading(false);
  }
}

// ===== MOOD UI =====
function updateMoodUI(mood) {
  const theme = MOOD_THEME[mood] || MOOD_THEME.netral;
  document.getElementById("chat-screen").style.background = theme.bg;
  document.getElementById("mood-dot").style.background = theme.accent;
  document.getElementById("mood-label").textContent = theme.label;
  document.getElementById("send-btn").style.background = theme.accent;
  document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.style.borderColor = theme.accent;
    btn.style.color = theme.accent;
  });
  updateMoodStats();
}

function updateMoodStats() {
  const theme = MOOD_THEME[currentMood] || MOOD_THEME.netral;
  document.getElementById("mood-now").innerHTML =
    `Sekarang: <b style="color:${theme.accent}">${theme.label}</b>`;

  const counts = moodHistory.reduce((a, e) => { a[e] = (a[e] || 0) + 1; return a; }, {});
  const total = moodHistory.length;
  const order = ["senang","netral","cemas","sedih","marah","lelah","kesepian","kecewa"];
  const bars = document.getElementById("mood-bars");

  if (total === 0) {
    bars.innerHTML = `<div style="font-size:12px;color:#9AA7B5;">Belum ada data. Cerita dulu ke Pip ya 🐧</div>`;
    return;
  }

  bars.innerHTML = order.filter(e => counts[e]).map(e => {
    const pct = Math.round((counts[e] / total) * 100);
    const t = MOOD_THEME[e];
    return `
      <div class="mood-bar-item">
        <div class="mood-bar-label"><span>${t.label}</span><span>${pct}%</span></div>
        <div class="mood-bar-track">
          <div class="mood-bar-fill" style="width:${pct}%;background:${t.accent};"></div>
        </div>
      </div>
    `;
  }).join("");
}

function toggleStats() {
  document.getElementById("mood-stats").classList.toggle("show");
  updateMoodStats();
}

// ===== LOADING =====
function setLoading(val) {
  loading = val;
  document.getElementById("loading-dots").classList.toggle("show", val);
  document.getElementById("send-btn").disabled = val;
  if (val) scrollToBottom();
}

// ===== BREATHING =====
const BREATH_SEQ = ["Tarik napas...", "Tahan...", "Hembuskan pelan..."];
let breathIdx = 0;

function startBreathCycle() {
  breathInterval = setInterval(() => {
    breathIdx = (breathIdx + 1) % BREATH_SEQ.length;
    const el = document.getElementById("breath-phase");
    if (el) el.textContent = BREATH_SEQ[breathIdx];
  }, 4000);
}

function closeBreath() {
  document.getElementById("breathing-bubble").classList.remove("show");
}

// ===== CRISIS =====
function showCrisis() {
  document.getElementById("crisis-screen").classList.add("show");
  document.getElementById("chat-screen").style.display = "none";
}

function hideCrisis() {
  document.getElementById("crisis-screen").classList.remove("show");
  document.getElementById("chat-screen").style.display = "flex";
  updateMoodUI("netral");
}

// ===== NEW CHAT =====
function newChat() {
  clearMessages();
  messages = [{ role: "assistant", text: "Hai, aku Pip 🐧 Aku di sini buat nemenin kamu cerita. Gimana perasaan kamu hari ini?" }];
  saveMessages(messages);
  moodHistory = [];
  crisisAware = false;
  currentMood = "netral";
  document.getElementById("pip-status").textContent = "Mindy · Teman cerita kamu";
  renderMessages();
  document.getElementById("quick-moods").style.display = "flex";
  updateMoodUI("netral");
}