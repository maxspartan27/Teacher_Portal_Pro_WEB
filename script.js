/* Teacher Portal Pro v3.1 (build 211) RS4 — модернізований освітній портал із хмарною синхронізацією, AI-хабом Gemini/ChatGPT, голосовими нотатками та тренувальною ареною.
   Автор (головна сторінка і в загальному): Максим Ковалишин.
   Автори:
   Адмін: Максим Ковалишин
   Модератор: Христина Небещанська
   Викладач: Тетяна Гаркот
   ПОПЕРЕДЖЕННЯ: localStorage і клієнтські ролі НЕ гарантують захисту даних. */
'use strict';

const APP_VERSION = 'v3.1 (build 211) RS4';
const $ = id => document.getElementById(id);
const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const KEY = 'tpp_v2_';

const store = {
  get: (k, df) => {
    try {
      const v = localStorage.getItem(KEY + k);
      return v === null ? df : JSON.parse(v);
    } catch {
      return df;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(KEY + k, JSON.stringify(v));
      return true;
    } catch {
      notify('Немає доступу до локального сховища');
      return false;
    }
  }
};

const themeCatalog = [
  { id: 'aurora', name: 'Аврора (Північне сяйво)', desc: 'Космічний індиго, фіолетовий неон та бірюзові хвилі.', img: 'assets/aurora.webp', thumb: 'assets/learning-world.svg', colors: ['#081329', '#9b6dff', '#37d5f0'] },
  { id: 'emerald', name: 'Смарагд (Кібер-ліс)', desc: 'Глибокий смарагдовий фон із м’ятними акцентами.', img: 'assets/midnight.webp', thumb: 'assets/classroom-world.svg', colors: ['#061c21', '#2dd4a5', '#6bcdf4'] },
  { id: 'daylight', name: 'Світлий день (Кристал)', desc: 'Чистий денний інтерфейс із високою контрастністю.', img: 'assets/daylight.webp', thumb: 'assets/learning-world.svg', colors: ['#f4f7fe', '#6f4be8', '#1289bd'] },
  { id: 'sunset', name: 'Карпатський захід (RS4)', desc: 'Теплі вечірні барви гірського заходу сонця та бурштину.', img: 'assets/theme-sunset.svg', thumb: 'assets/teacher-pro-world.svg', colors: ['#160924', '#ff7b54', '#ffb26b'] },
  { id: 'cyber', name: 'Неоновий кіберпростір (RS4)', desc: 'Футуристична темна матриця з пурпурно-ціановим сяйвом.', img: 'assets/theme-cyber.svg', thumb: 'assets/cloud-sync-world.svg', colors: ['#060512', '#ff2e93', '#00f2fe'] },
  { id: 'ocean', name: 'Океанічний бриз (RS4)', desc: 'Сапфірова глибина океану та біолюмінесцентний аквамарин.', img: 'assets/theme-ocean.svg', thumb: 'assets/moderator-world.svg', colors: ['#041527', '#22d3ee', '#38bdf8'] },
  { id: 'sakura', name: 'Цвіт сакури (v3.1 RS4)', desc: 'Ніжний японський вечір із пелюстками сакури та лавандовим сяйвом.', img: 'assets/theme-sakura.svg', thumb: 'assets/ai-assistant-world.svg', colors: ['#1c0b1e', '#f472b6', '#c084fc'] },
  { id: 'gold', name: 'Королівське золото (v3.1 RS4)', desc: 'Преміальний темний обсидіан із золотими лініями та бурштиновим акцентом.', img: 'assets/theme-gold.svg', thumb: 'assets/teacher-pro-world.svg', colors: ['#141008', '#fbbf24', '#f59e0b'] }
];

const autoCredentials = {
  teacher: {
    login: 'teacher.harkot',
    password: 'TeacherRS4_211!',
    name: 'Тетяна Гаркот',
    role: 'teacher',
    studentId: null,
    label: 'Викладач · Адмін'
  },
  student: {
    login: 'student.petrenko',
    password: 'StudentRS4_211!',
    name: 'Петренко Андрій',
    role: 'student',
    studentId: 1,
    label: 'Студент · К-41'
  }
};

const lessonGroups = [
  { key: 'lecture', title: 'Лекція', short: 'Л', color: '#a88aff', n: 3 },
  { key: 'practice', title: 'Практична', short: 'П', color: '#43c5e7', n: 3 },
  { key: 'control', title: 'Контрольна', short: 'К', color: '#43d9a7', n: 2 }
];

const demoStudents = [
  { id: 1, name: 'Петренко Андрій', lecture: [11, 10, 12], practice: [12, 11, 10], control: [11, 12] },
  { id: 2, name: 'Коваль Вікторія', lecture: [10, 11, 10], practice: [11, 12, 11], control: [10, 11] },
  { id: 3, name: 'Мельник Олександр', lecture: [8, 9, 10], practice: [9, 10, 9], control: [8, null] },
  { id: 4, name: 'Шевченко Марія', lecture: [12, 12, 12], practice: [12, 11, 12], control: [12, 12] },
  { id: 5, name: 'Бондар Назар', lecture: [7, 8, 9], practice: [8, 8, 9], control: [7, 8] },
  { id: 6, name: 'Іваненко Софія', lecture: [11, 10, 11], practice: [11, 12, null], control: [12, 11] },
  { id: 7, name: 'Кравчук Денис', lecture: [6, 7, 8], practice: [7, 8, 8], control: [7, 9] },
  { id: 8, name: 'Сидоренко Олена', lecture: [9, 10, 10], practice: [10, 11, 10], control: [10, 10] }
];

const demoMaterials = [
  { id: 'm1', kind: 'lecture', code: 'ЛЕКЦІЯ №01', title: 'Вступ до вебтехнологій', desc: 'Архітектура вебу, браузери, клієнт і сервер, основи проєктування.', items: ['Принципи функціонування вебу', 'HTTP, URL та браузери', 'Що таке клієнт і сервер'] },
  { id: 'm2', kind: 'lecture', code: 'ЛЕКЦІЯ №02', title: 'Основи HTML5 та семантики', desc: 'Розмітка, структура документа, заголовки, списки, форми.', items: ['Семантичні елементи', 'Структура HTML-документа', 'Доступність і форми'] },
  { id: 'm3', kind: 'lecture', code: 'ЛЕКЦІЯ №03', title: 'CSS3: Flexbox, Grid і адаптивність', desc: 'Сучасні технології верстки та робота з різними екранами.', items: ['Моделі Flexbox і Grid', 'Медіазапити', 'Анімації CSS'] },
  { id: 'm4', kind: 'practice', code: 'ПРАКТИЧНА №01', title: 'Адаптивний вебінтерфейс', desc: 'Створення сторінки на HTML, CSS із перевіркою мобільної адаптації.', items: ['Побудувати семантичну структуру', 'Оформити адаптивну сітку', 'Протестувати на телефоні'] },
  { id: 'm5', kind: 'practice', code: 'ПРАКТИЧНА №02', title: 'Форма реєстрації з перевіркою', desc: 'JavaScript-перевірка форми та повідомлення користувачеві.', items: ['Створити поля форми', 'Перевірити логін і пароль', 'Вивести повідомлення про стан'] },
  { id: 'm6', kind: 'practice', code: 'ПРАКТИЧНА №03', title: 'Динамічна таблиця оцінок і хмара', desc: 'Робота з масивами, введенням даних, підрахунком середніх балів і JSON-синхронізацією.', items: ['Створити масив студентів', 'Редагувати оцінки', 'Сформувати хмарний JSON-пакет статистики'] },
  { id: 'm7', kind: 'control', code: 'КОНТРОЛЬНА №01', title: 'Основи HTML та CSS', desc: 'Запитання й завдання за першими темами курсу.', items: ['Структура HTML', 'Властивості CSS', 'Адаптивність'] },
  { id: 'm8', kind: 'control', code: 'КОНТРОЛЬНА №02', title: 'JavaScript та інтерактивний UX', desc: 'Перевірка знань DOM, обробників подій та інтерфейсної логіки.', items: ['DOM API', 'Обробники подій', 'Перевірка введення'] },
  { id: 'm9', kind: 'presentation', code: 'ПРЕЗЕНТАЦІЯ', title: 'UI/UX: дизайн-система порталу v3.1 RS4', desc: 'Кольори, типографіка, анімовані піктограми, 8 графічних тем, AI-хаб та хмарна архітектура.', items: ['Компонентний підхід v3.1 RS4', 'Контрастність і 8 тем із зображеннями', 'Хмарна синхронізація оцінок та голосових нотаток'] }
];

const demoDocuments = [
  { id: 'd1', title: 'Навчальний план коледжу', category: 'norm', status: 'Актуальний', desc: 'Демонстраційний опис освітньої програми та розподілу годин.', body: 'Навчальний план визначає дисципліни, послідовність їх вивчення, обсяг годин та форми контролю. Це зразок, а не справжній документ коледжу.' },
  { id: 'd2', title: 'Робоча програма дисципліни «Вебтехнології»', category: 'plan', status: 'У процесі', desc: 'Тематика лекцій, практичних занять, модулі та оцінювання.', body: 'Мета: опанування HTML, CSS, JavaScript і принципів проєктування зручних адаптивних вебінтерфейсів.' },
  { id: 'd3', title: 'Індивідуальний план роботи викладача (Тетяна Гаркот)', category: 'plan', status: 'Актуальний', desc: 'Навчальне навантаження, методична та організаційна діяльність.', body: 'Розділи: навчальна робота, підвищення кваліфікації, методична діяльність, робота зі студентами групи К-41.' },
  { id: 'd4', title: 'Положення про оцінювання результатів навчання (ЄКТС)', category: 'norm', status: 'Актуальний', desc: 'Приклад структури нормативного документа та критеріїв оцінювання 1–12 та ЄКТС.', body: 'Демо-зразок для макета. Порядок оцінювання в реальному закладі визначається затвердженими локальними положеннями.' },
  { id: 'd5', title: 'Регламент хмарної синхронізації журналу та AI-модулів (v3.1 RS4)', category: 'norm', status: 'Актуальний', desc: 'Технічний опис обміну пакетами оцінок, голосових нотаток і статистики з хмарним сховищем.', body: 'Описує структуру JSON-пакета, перевірку контрольної суми SHA-256, роботу AI-помічника Gemini/ChatGPT та розмежування прав доступу.' }
];

const demoAnnouncements = [
  { id: 'a1', title: 'Захист Практичної роботи №3', tag: 'Дедлайн', body: 'Зверніть увагу: здачу динамічної таблиці оцінок подовжено до п’ятниці 15:00. Можна прикріпити голосовий коментар!', date: '11.11.2026' },
  { id: 'a2', title: 'Реліз Teacher Portal Pro v3.1 (build 211) RS4', tag: 'Важливо', body: 'Додано нотатки та голосові повідомлення до дисциплін, AI-хаб Gemini & ChatGPT для викладача, тренажер студента, радар компетентностей і 8 тем!', date: '11.11.2026' }
];

const demoSubmissions = [
  { id: 'sub1', studentId: 6, studentName: 'Іваненко Софія', kind: 'practice', index: 2, workTitle: 'Практична №3 · Динамічна таблиця оцінок', status: 'pending', submittedAt: 'Сьогодні, 14:20' },
  { id: 'sub2', studentId: 3, studentName: 'Мельник Олександр', kind: 'control', index: 1, workTitle: 'Контрольна №2 · JavaScript та інтерактивний UX', status: 'pending', submittedAt: 'Сьогодні, 16:05' }
];

const demoStudentNotes = [
  {
    id: 'sn1',
    studentId: 1,
    studentName: 'Петренко Андрій',
    discipline: 'Практична №3: Динамічна таблиця оцінок і хмара',
    text: 'Реалізував автоматичний підрахунок середнього бала та експорт у JSON. Додаю голосовий звіт щодо структури коду.',
    hasVoice: true,
    voiceDuration: '00:14',
    time: 'Сьогодні, 15:10',
    bonusAwarded: false
  },
  {
    id: 'sn2',
    studentId: 4,
    studentName: 'Шевченко Марія',
    discipline: 'Лекція №3: CSS3 — Flexbox, Grid і адаптивність',
    text: 'Конспект: для 12-колонкової сітки найкраще поєднувати repeat(auto-fit, minmax(240px, 1fr)) та gap.',
    hasVoice: true,
    voiceDuration: '00:09',
    time: 'Сьогодні, 13:45',
    bonusAwarded: true
  }
];

const quizQuestions = [
  {
    q: '1. Яка CSS-властивість перетворює контейнер на гнучку Flexbox-сітку?',
    opts: ['display: flex;', 'position: absolute;', 'grid-template: auto;', 'float: inline-start;'],
    correct: 0
  },
  {
    q: '2. Який метод JavaScript безпечно обчислює криптографічний геш SHA-256 у браузері?',
    opts: ['Math.randomHash()', 'crypto.subtle.digest("SHA-256", data)', 'JSON.stringify(data)', 'localStorage.encrypt()'],
    correct: 1
  },
  {
    q: '3. Якій оцінці за шкалою ЄКТС відповідає результат 11–12 балів у коледжі?',
    opts: ['C (74–81)', 'B (82–89)', 'A (90–100 · Відмінно)', 'D (64–73)'],
    correct: 2
  },
  {
    q: '4. Який семантичний тег HTML5 призначений для основної навігаційної панелі сайту?',
    opts: ['<section>', '<nav>', '<aside>', '<article>'],
    correct: 1
  },
  {
    q: '5. Що забезпечує інтеграція електронного журналу в хмарне сховище RS4?',
    opts: ['Тільки зміну кольору кнопок', 'Миттєву реплікацію оцінок, статистики ЄКТС і захист SHA-256', 'Видалення старих лекцій', 'Відключення інтернету'],
    correct: 1
  }
];

const flashcardsData = [
  { tag: 'КАРТКА 1 / 5 · HTML5', q: 'Що таке семантична верстка HTML5?', a: 'Це використання тегів за їхнім змістовим призначенням (<header>, <nav>, <main>, <article>, <footer>) для доступності та SEO.' },
  { tag: 'КАРТКА 2 / 5 · CSS3 GRID', q: 'Чим CSS Grid відрізняється від Flexbox?', a: 'Flexbox працює в одному вимірі (рядок або стовпець), а CSS Grid дозволяє будувати двовимірні сітки (рядки і стовпці одночасно).' },
  { tag: 'КАРТКА 3 / 5 · JAVASCRIPT DOM', q: 'Як працює делегування подій (Event Delegation)?', a: 'Один обробник події вішається на спільного батька і через event.target.closest() визначає, на який дочірній елемент клікнули.' },
  { tag: 'КАРТКА 4 / 5 · CLOUD DB RS4', q: 'Для чого потрібен SHA-256 підпис пакета журналу?', a: 'Для перевірки цілісності даних під час синхронізації з хмарою, щоб жодна оцінка не була спотворена при передачі.' },
  { tag: 'КАРТКА 5 / 5 · ЄКТС', q: 'Як розраховується показник «Якість знань» групи?', a: 'Це відсоток оцінок достатнього та високого рівнів (7–12 балів, тобто A, B, C, D) від загальної кількості виставлених оцінок.' }
];

const demoTodos = [
  { id: 't1', text: 'Перевірити здані роботи Іваненко С. та Мельника О.', done: false },
  { id: 't2', text: 'Прослухати голосову нотатку Петренка А. до Практичної №3', done: false },
  { id: 't3', text: 'Згенерувати через AI Gemini завдання до модульного контролю', done: false },
  { id: 't4', text: 'Виконати хмарну синхронізацію журналу групи К-41', done: true }
];

const demoAudit = [
  { time: '23:10', action: 'Оновлено платформу до релізу v3.1 (build 211) RS4' },
  { time: '22:55', action: 'Підключено AI-помічник Gemini 2.5 Pro / ChatGPT-4o' },
  { time: '22:40', action: 'Хмарний знімок журналу К-41 верифіковано (SHA-256)' }
];

let students = store.get('students', clone(demoStudents));
if (!Array.isArray(students) || !students.length) students = clone(demoStudents);

let documents = store.get('documents', clone(demoDocuments));
if (!Array.isArray(documents)) documents = clone(demoDocuments);

let announcements = store.get('announcements', clone(demoAnnouncements));
if (!Array.isArray(announcements)) announcements = clone(demoAnnouncements);

let submissions = store.get('submissions', clone(demoSubmissions));
if (!Array.isArray(submissions)) submissions = clone(demoSubmissions);

let studentNotes = store.get('studentNotes', clone(demoStudentNotes));
if (!Array.isArray(studentNotes)) studentNotes = clone(demoStudentNotes);

let teacherTodos = store.get('teacherTodos', clone(demoTodos));
if (!Array.isArray(teacherTodos)) teacherTodos = clone(demoTodos);

let auditLogs = store.get('auditLogs', clone(demoAudit));
if (!Array.isArray(auditLogs)) auditLogs = clone(demoAudit);

let cloudSyncCount = Number(store.get('cloudSyncCount', 18)) || 18;
let studentXp = Number(store.get('studentXp', 120)) || 120;
let accounts = store.get('accounts', []);
if (!Array.isArray(accounts)) accounts = [];

let uiPrefs = store.get('uiPrefs', { bannerArt: 'on', glow: 'on', compact: 'off' });
let currentPage = 'home', currentFilter = 'all', docFilter = 'all', journalLevelFilter = 'all', activeHubTab = 'ai';
let selectedRole = 'student', loginTab = 'login', navAfterAuth = null;
let activeStudentPreviewId = 1;
let autoAuthTimer = null;

// Стан голосового диктофона студента
let isRecordingVoice = false;
let voiceRecordSeconds = 0;
let voiceRecordInterval = null;
let recordedVoiceReady = false;
let lastRecordedDuration = '00:00';

// Стан тренажера студента
let currentQuizIndex = 0;
let quizCorrectCount = 0;
let currentFlashcardIndex = 0;
let flashcardFlipped = false;

// Стан AI-відповіді викладача
let lastAiResponseTitle = '';
let lastAiResponseText = '';

// Таймер навчальної пари (80 хвилин = 4800 секунд)
let lessonTimerSeconds = 80 * 60;
let lessonTimerRunning = false;
let lessonTimerInterval = null;

let session = null;
try { session = JSON.parse(sessionStorage.getItem(KEY + 'session') || 'null'); } catch {}

function validSession() {
  if (!session) return false;
  if (session.demo) return true;
  const u = accounts.find(a => a.login === session.login);
  if (!u) { session = null; return false; }
  return u.role === session.role;
}
if (!validSession()) session = null;

const roleName = r => r === 'teacher' ? 'Викладач' : 'Студент';
const types = { lecture: 'Лекція', practice: 'Практична', control: 'Контрольна', presentation: 'Презентація' };
const values = (s, kind) => kind === 'all'
  ? lessonGroups.flatMap(g => (s[g.key] || [])).filter(n => Number.isInteger(n) && n >= 1 && n <= 12)
  : (s[kind] || []).filter(n => Number.isInteger(n) && n >= 1 && n <= 12);
const mean = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
const fmt = n => n === null || n === undefined || Number.isNaN(n) ? '—' : n.toFixed(1).replace('.', ',');
const sums = s => ({
  lecture: mean(values(s, 'lecture')),
  practice: mean(values(s, 'practice')),
  control: mean(values(s, 'control')),
  total: mean(values(s, 'all'))
});
const groupAverage = k => mean(students.flatMap(s => values(s, k)));
const gradeLevel = n => n === null ? ['Без оцінок', 'medium'] : n >= 10 ? ['Високий', ''] : n >= 7 ? ['Достатній', 'medium'] : ['Потребує уваги', 'low'];
const ectsGrade = n => n === null ? '—' : n >= 11 ? 'A (90–100)' : n >= 10 ? 'B (82–89)' : n >= 8 ? 'C (74–81)' : n >= 7 ? 'D (64–73)' : n >= 4 ? 'E (60–63)' : 'FX (<60)';
const ectsShort = n => n === null ? '—' : n >= 11 ? 'A' : n >= 10 ? 'B' : n >= 8 ? 'C' : n >= 7 ? 'D' : n >= 4 ? 'E' : 'FX';
const initials = s => String(s || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();

function studentTrendInfo(s) {
  const arr = values(s, 'all');
  if (arr.length < 2) return { cls: 'flat', text: '→ Стабільно' };
  const half = Math.floor(arr.length / 2);
  const first = mean(arr.slice(0, half)) || 0;
  const second = mean(arr.slice(half)) || 0;
  const diff = second - first;
  if (diff >= 0.45) return { cls: 'up', text: `↑ +${diff.toFixed(1).replace('.', ',')}` };
  if (diff <= -0.45) return { cls: 'down', text: `↓ ${diff.toFixed(1).replace('.', ',')}` };
  return { cls: 'flat', text: '→ Стабільно' };
}

function logAudit(action) {
  const now = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  auditLogs.unshift({ time: now, action });
  auditLogs = auditLogs.slice(0, 14);
  store.set('auditLogs', auditLogs);
  renderAuditLogs();
}

function notify(message) {
  const stack = $('toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function openModal(title, content, tag = 'TEACHER PORTAL PRO · ' + APP_VERSION, wide = false) {
  clearTimeout(autoAuthTimer);
  $('modalTitle').textContent = title;
  $('modalTag').textContent = tag;
  $('modalContent').innerHTML = content;
  const card = document.querySelector('.modal-card');
  if (card) card.classList.toggle('wide-modal', !!wide);
  $('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  clearTimeout(autoAuthTimer);
  $('modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function applyUiPrefs() {
  document.body.dataset.bannerArt = uiPrefs.bannerArt || 'on';
  document.body.dataset.glow = uiPrefs.glow || 'on';
  document.body.dataset.compact = uiPrefs.compact || 'off';
}

function setTheme(name) {
  const themeObj = themeCatalog.find(t => t.id === name) || themeCatalog[0];
  name = themeObj.id;
  document.body.dataset.theme = name;
  store.set('theme', name);
  document.querySelectorAll('[data-theme-choice]').forEach(b => b.classList.toggle('on', b.dataset.themeChoice === name));
  if ($('heroIllustrationImg') && themeObj.thumb) {
    $('heroIllustrationImg').src = themeObj.thumb;
  }
  renderThemeShowcase();
  renderHomePulse();
}

function renderThemeShowcase() {
  const active = document.body.dataset.theme || 'aurora';
  const html = themeCatalog.map(t => `
    <article class="theme-card-preview ${t.id === active ? 'active-theme' : ''}" data-theme-choice="${t.id}">
      <div class="theme-art-box" style="background-image:url('${t.img}')">
        <span>${t.id === active ? '✓ Активна тема' : 'Натисніть для вибору'}</span>
        <img class="theme-art-thumb" src="${t.thumb}" alt="${esc(t.name)}">
      </div>
      <div class="theme-card-body">
        <h4>${esc(t.name)} ${icon('sparkles', 'icon-spin-hover')}</h4>
        <p>${esc(t.desc)}</p>
        <div class="theme-swatches">
          ${t.colors.map(c => `<i style="background:${c}"></i>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
  if ($('homeThemeShowcase')) $('homeThemeShowcase').innerHTML = html;
  if ($('modalThemeShowcase')) $('modalThemeShowcase').innerHTML = html;
}

function openThemeStudioModal() {
  const active = document.body.dataset.theme || 'aurora';
  openModal(
    'Галерея 8 тем із зображеннями та анімацією (v3.1 RS4)',
    `<p class="form-note">Оберіть одну з 8 візуальних тем оформлення з підтягнутою фоновою ілюстрацією та налаштуйте анімаційні фішки релізу <b>${APP_VERSION}</b>.</p>
     <div class="theme-showcase-grid" id="modalThemeShowcase" style="margin-top:14px">
       ${themeCatalog.map(t => `
         <article class="theme-card-preview ${t.id === active ? 'active-theme' : ''}" data-theme-choice="${t.id}">
           <div class="theme-art-box" style="background-image:url('${t.img}')">
             <span>${t.id === active ? '✓ Обрано' : 'Застосувати'}</span>
             <img class="theme-art-thumb" src="${t.thumb}" alt="${esc(t.name)}">
           </div>
           <div class="theme-card-body">
             <h4>${esc(t.name)}</h4>
             <p>${esc(t.desc)}</p>
             <div class="theme-swatches">${t.colors.map(c => `<i style="background:${c}"></i>`).join('')}</div>
           </div>
         </article>
       `).join('')}
     </div>
     <div class="demo-box" style="margin-top:18px">
       <b>Фішки інтерфейсу та анімації (v3.1 RS4)</b>
       <div style="display:grid;gap:8px;margin-top:10px">
         <label class="checkbox-row" style="margin:0"><input type="checkbox" id="prefBannerArt" ${uiPrefs.bannerArt !== 'off' ? 'checked' : ''}><span>Підтягувати фонові зображення тем у банери всіх кабінетів і розділів</span></label>
         <label class="checkbox-row" style="margin:0"><input type="checkbox" id="prefGlow" ${uiPrefs.glow !== 'off' ? 'checked' : ''}><span>Анімовані частинки, неонове сяйво та атмосферні сфери</span></label>
         <label class="checkbox-row" style="margin:0"><input type="checkbox" id="prefCompact" ${uiPrefs.compact === 'on' ? 'checked' : ''}><span>Компактний режим таблиць електронного журналу та панелей</span></label>
       </div>
     </div>
     <div class="modal-actions">
       <button class="btn primary" data-modal-close>Готово ${icon('check')}</button>
     </div>`,
    'ДИЗАЙН-СТУДІЯ · ' + APP_VERSION,
    true
  );
}

/* ГОЛОВНА СТОРІНКА: ЖИВИЙ ПУЛЬС ТА ІНТЕРАКТИВНИЙ ХАБ МОЖЛИВОСТЕЙ v3.1 RS4 */
function renderHomePulse() {
  const bar = $('homePulseBar');
  if (!bar) return;
  const all = students.flatMap(s => values(s, 'all'));
  const avg = mean(all);
  const quality = all.length ? Math.round(all.filter(x => x >= 7).length / all.length * 100) : 0;
  const activeTheme = themeCatalog.find(t => t.id === (document.body.dataset.theme || 'aurora')) || themeCatalog[0];

  bar.innerHTML = `
    <div class="pulse-item">
      <span class="pulse-ico">${icon('users', 'icon-bounce')}</span>
      <div><strong>${students.length} студентів</strong><small>Група К-41 · ${studentNotes.length} нотаток</small></div>
    </div>
    <div class="pulse-item">
      <span class="pulse-ico">${icon('chart', 'icon-pulse')}</span>
      <div><strong>${fmt(avg)} бала</strong><small>Якість знань: ${quality}%</small></div>
    </div>
    <div class="pulse-item">
      <span class="pulse-ico">${icon('cpu', 'icon-pulse')}</span>
      <div><strong>Gemini & GPT-4o</strong><small>AI-помічник викладача</small></div>
    </div>
    <div class="pulse-item">
      <span class="pulse-ico">${icon('palette', 'icon-spin-hover')}</span>
      <div><strong>${esc(activeTheme.name.split(' ')[0])} (1 з 8)</strong><small>Активна тема RS4</small></div>
    </div>
    <div class="pulse-item">
      <span class="pulse-ico">${icon('award', 'icon-pulse')}</span>
      <div><strong>v3.1 (build 211)</strong><small>Реліз платформи RS4</small></div>
    </div>
  `;
}

function renderHomeHub(tab = activeHubTab) {
  activeHubTab = tab;
  document.querySelectorAll('[data-hub-tab]').forEach(b => b.classList.toggle('active', b.dataset.hubTab === tab));
  const box = $('homeHubContent');
  if (!box) return;

  const views = {
    ai: {
      tag: 'ШТУЧНИЙ ІНТЕЛЕКТ · GEMINI 2.5 PRO & CHATGPT-4O',
      title: 'Пошуковий AI-асистент у кабінеті викладача для генерації завдань',
      desc: 'У кабінеті викладача додано інтерактивний пошуковий термінал Gemini та ChatGPT, який миттєво формує практичні завдання, тестові білети, критерії оцінювання ЄКТС та аналітичні звіти по групі К-41.',
      items: [
        'Швидкі пресети запитів для генерації практичних робіт і тестів у 1 клік',
        'Збереження згенерованої AI-відповіді прямо в нотатки, документи або оголошення',
        'Прямий перехід із введеним запитом до офіційних веб-асистентів Google Gemini та ChatGPT'
      ],
      img: 'assets/ai-assistant-world.svg',
      btnText: 'Відкрити AI-хаб у кабінеті викладача',
      btnQuick: 'teacher'
    },
    voice: {
      tag: 'ГОЛОСОВІ ПОВІДОМЛЕННЯ ТА НОТАТКИ ДО ДИСЦИПЛІН',
      title: 'Студенти можуть писати конспекти та відправляти голосові нотатки',
      desc: 'До кожної лекції, практичної чи контрольної роботи студент може залишити текстову нотатку або записати голосове повідомлення та надіслати його викладачу на перевірку.',
      items: [
        'Вбудований голосовий рекордер із живою звуковою хвилею та таймером запису',
        'Голосове диктування тексту (Speech-to-Text) та синтез/відтворення аудіо у кабінеті викладача',
        'Нарахування +1 бонусного бала викладачем за змістовні голосові звіти студентів'
      ],
      img: 'assets/learning-world.svg',
      btnText: 'Спробувати нотатки та голосові (Студент)',
      btnQuick: 'student'
    },
    trainer: {
      tag: 'ТРЕНУВАЛЬНИЙ ЦЕНТР СТУДЕНТА · QUIZ, 3D-КАРТКИ ТА КОД',
      title: 'Інтерактивна тренувальна арена для підготовки до пар та іспитів',
      desc: 'У кабінеті студента з’явився повноцінний тренувальний полігон: тестування з миттєвою перевіркою, 3D флеш-картки термінів та жива пісочниця HTML/CSS.',
      items: [
        'Квіз-тренажер із нарахуванням досвіду (XP) за кожну правильну відповідь',
        'Інтерактивні флеш-картки з переворотом для запам’ятовування теорії HTML/CSS/JS/ЄКТС',
        'Живий редактор HTML/CSS-коду з миттєвим попереднім переглядом результату'
      ],
      img: 'assets/classroom-world.svg',
      btnText: 'Відкрити тренажер студента',
      btnQuick: 'student'
    },
    cloud: {
      tag: 'ХМАРНА АРХІТЕКТУРА · ДОДАТКОВО (v3.1 RS4)',
      title: 'Інтеграція електронного журналу, оцінок і статистики в хмарне сховище',
      desc: 'У розділі «Додатково» представлено розширену статтю, живий симулятор хмарної синхронізації, калькулятор обсягу хмарної БД коледжу та графік швидкодії вузлів.',
      items: [
        'Автоматична агрегація середніх балів, якості знань %, радара компетентностей і шкали ЄКТС',
        'Калькулятор хмарного сховища коледжу для розрахунку трафіку та обсягу бекапів',
        'Криптографічний підпис пакета оцінок SHA-256 та миттєвий експорт у JSON'
      ],
      img: 'assets/cloud-sync-world.svg',
      btnText: 'Відкрити розділ «Додатково»',
      btnNav: 'khrystyna'
    },
    visuals: {
      tag: 'ВІЗУАЛЬНИЙ КОНЦЕПТ І 8 ТЕМ ОФОРМЛЕННЯ',
      title: 'Підтягнуті зображення, нові графіки та 8 анімованих тем v3.1 RS4',
      desc: 'Платформа пропонує 8 атмосферних тем оформлення (включно з новими «Цвіт сакури» та «Королівське золото»), радар компетентностей групи та покращені таблиці з трендами.',
      items: [
        '8 графічних тем: Аврора, Смарагд, Світлий день, Захід, Кібер, Океан, Сакура та Золото',
        'Новий 5-осьовий SVG-радар компетентностей та гістограма розподілу ЄКТС (A–FX)',
        'Покращені таблиці з індикаторами динаміки (↑/→/↓) та дворядковим підсумком групи'
      ],
      img: 'design-concept.jpg',
      btnText: 'Відкрити студію 8 тем',
      btnStudio: true
    }
  };

  const v = views[tab] || views.ai;
  box.innerHTML = `
    <div class="hub-grid">
      <div class="hub-copy">
        <span class="section-tag">${icon('sparkles', 'icon-pulse')} ${esc(v.tag)}</span>
        <h3>${esc(v.title)}</h3>
        <p>${esc(v.desc)}</p>
        <ul class="hub-list">
          ${v.items.map(i => `<li>${esc(i)}</li>`).join('')}
        </ul>
        <div class="hero-buttons" style="margin-top:16px">
          ${v.btnNav ? `<button class="btn primary" data-nav="${v.btnNav}">${icon('cloud', 'icon-float')} ${esc(v.btnText)}</button>` : ''}
          ${v.btnQuick ? `<button class="btn primary" data-quick-auth="${v.btnQuick}">${icon('bolt', 'icon-pulse')} ${esc(v.btnText)}</button>` : ''}
          ${v.btnStudio ? `<button class="btn primary" id="hubOpenStudioBtn">${icon('palette', 'icon-spin-hover')} ${esc(v.btnText)}</button>` : ''}
        </div>
      </div>
      <div class="hub-visual">
        <img src="${v.img}" alt="${esc(v.title)}">
      </div>
    </div>
  `;
}

function updateHeader() {
  const ok = !!session;
  $('headerLogin').classList.toggle('hidden', ok);
  $('headerRegister').classList.toggle('hidden', ok);
  $('profileButton').classList.toggle('hidden', !ok);
  if (ok) {
    $('profileInitial').textContent = initials(session.name).slice(0, 1);
    $('profileText').textContent = session.name.split(' ')[0] || roleName(session.role);
  }
}

function updateFooterForPage(page) {
  const footer = $('siteFooter');
  const primaryCredit = $('footerPrimaryCredit');
  const pageLabel = $('footerPageLabel');
  const roleHighlight = $('footerRoleHighlight');
  if (!footer) return;
  if (page === 'khrystyna') {
    footer.classList.add('khrystyna-mode');
    if (primaryCredit) primaryCredit.textContent = 'Футер Христини · Модератор: Христина Небещанська';
    if (pageLabel) pageLabel.textContent = 'РОЗДІЛ «ДОДАТКОВО» (ФУТЕР ХРИСТИНИ)';
    if (roleHighlight) roleHighlight.textContent = 'Модератор: Христина Небещанська';
  } else {
    footer.classList.remove('khrystyna-mode');
    if (primaryCredit) primaryCredit.textContent = 'Автор: Максим Ковалишин';
    if (pageLabel) pageLabel.textContent = 'ГОЛОВНА ТА В ЗАГАЛЬНОМУ';
    if (roleHighlight) roleHighlight.textContent = 'Автор: Максим Ковалишин';
  }
}

function navigate(page) {
  const pages = ['home', 'materials', 'student', 'admin', 'journal', 'records', 'documents', 'accounts', 'khrystyna', 'about'];
  if (!pages.includes(page)) return;
  const adminPages = ['admin', 'journal', 'records', 'accounts'];
  const needsTeacher = adminPages.includes(page);
  const needsStudent = page === 'student';

  if ((needsTeacher && session?.role !== 'teacher') || (needsStudent && session?.role !== 'student')) {
    navAfterAuth = page;
    showAuth('login', needsTeacher ? 'teacher' : 'student', true);
    return;
  }

  currentPage = page;
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === 'view-' + page));
  document.querySelectorAll('.top-link').forEach(el => el.classList.toggle('selected', el.dataset.nav === page));
  $('mobileMenu').classList.add('hidden');
  updateFooterForPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'home') { renderThemeShowcase(); renderHomePulse(); renderHomeHub(activeHubTab); }
  if (page === 'materials') renderMaterials();
  if (page === 'student') renderStudent();
  if (page === 'admin') renderAdmin();
  if (page === 'journal') renderJournal();
  if (page === 'records') renderRecords();
  if (page === 'documents') renderDocuments();
  if (page === 'accounts') renderAccounts();
  if (page === 'khrystyna') renderCloudSection();
  if ($('newDocument')) $('newDocument').classList.toggle('hidden', session?.role !== 'teacher');
  if ($('docsTeacherNav')) $('docsTeacherNav').classList.toggle('hidden', session?.role !== 'teacher');
}

/* АВТОМАТИЧНА АВТОРИЗАЦІЯ ЧЕРЕЗ КНОПКИ «ВИКЛАДАЧ» І «СТУДЕНТ» */
function roleSelector(role) {
  return `
    <div class="role-selector" aria-label="Вибір ролі та автоматичне введення даних">
      <button type="button" class="role-option ${role === 'student' ? 'selected' : ''}" data-auth-role="student">
        <span class="role-option-left">${icon('hat', 'icon-bounce')} <span>Студент</span></span>
        <span class="auto-tag">Авто-ввід</span>
      </button>
      <button type="button" class="role-option ${role === 'teacher' ? 'selected' : ''}" data-auth-role="teacher">
        <span class="role-option-left">${icon('shield', 'icon-pulse')} <span>Викладач</span></span>
        <span class="auto-tag">Авто-ввід</span>
      </button>
    </div>`;
}

function showRoleGate(preferred = 'student') {
  selectedRole = preferred;
  openModal(
    'Обрати кабінет · Авто-авторизація',
    `<p class="form-note">Натисніть кнопку <b>«Студент»</b> або <b>«Викладач»</b> — система автоматично введе логін та пароль обраної ролі й відкриє відповідний кабінет.</p>
     <div class="role-selector">
       <button class="role-option ${preferred === 'student' ? 'selected' : ''}" data-quick-auth="student">
         <span class="role-option-left">${icon('hat', 'icon-bounce')} <span>Студент</span></span>
         <span class="auto-tag">Авто-вхід</span>
       </button>
       <button class="role-option ${preferred === 'teacher' ? 'selected' : ''}" data-quick-auth="teacher">
         <span class="role-option-left">${icon('shield', 'icon-pulse')} <span>Викладач</span></span>
         <span class="auto-tag">Авто-вхід</span>
       </button>
     </div>
     <img class="modal-illustration" src="assets/learning-world.svg" alt="Навчання й адміністрування">
     <div class="modal-actions">
       <button class="btn primary" id="gateLogin">Форма входу (Авто-логін) ${icon('arrow')}</button>
       <button class="btn outline" id="gateRegister">Зареєструватися</button>
     </div>`,
    'РОЛІ ТА АВТОМАТИЧНИЙ ДОСТУП'
  );
}

function showAuth(mode = 'login', role = selectedRole, triggerAutoEnter = false) {
  selectedRole = role;
  loginTab = mode;
  const register = mode === 'register';
  const creds = autoCredentials[role] || autoCredentials.student;

  openModal(
    register ? 'Реєстрація користувача' : 'Вхід до порталу · Авто-авторизація',
    `<div class="modal-tabs">
       <button type="button" class="${!register ? 'selected' : ''}" data-auth-tab="login">Увійти (Авто-логін)</button>
       <button type="button" class="${register ? 'selected' : ''}" data-auth-tab="register">Реєстрація</button>
     </div>
     <p class="form-note">Натисніть кнопку <b>«Студент»</b> або <b>«Викладач»</b> для автоматичного введення логіна та пароля:</p>
     ${roleSelector(role)}
     ${!register ? `
       <div class="auto-auth-banner">
         <label><input type="checkbox" id="autoSubmitToggle" checked> <span>⚡ Автоматично входити в кабінет після підстановки логіна і пароля</span></label>
       </div>
       <div id="autoTypingStatus" class="auto-typing-status">✓ Готово: дані для ролі «${roleName(role)}» підставлено автоматично</div>
     ` : ''}
     <form id="${register ? 'registerForm' : 'loginForm'}" novalidate>
       ${register ? `
         <div class="form-grid">
           <div class="form-field"><label for="lastName">Прізвище *</label><input id="lastName" name="lastName" autocomplete="family-name" maxlength="60" required placeholder="Петренко"></div>
           <div class="form-field"><label for="firstName">Ім’я *</label><input id="firstName" name="firstName" autocomplete="given-name" maxlength="60" required placeholder="Андрій"></div>
         </div>
       ` : ''}
       <div class="form-field">
         <label for="authUsername">Логін *</label>
         <input id="authUsername" name="username" autocomplete="username" maxlength="30" required value="${!register ? esc(creds.login) : ''}" placeholder="Наприклад: student.petrenko">
       </div>
       <div class="form-field">
         <label for="authPassword">Пароль *</label>
         <div class="password-wrap">
           <input id="authPassword" name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="8" required value="${!register ? esc(creds.password) : ''}" placeholder="Мінімум 8 символів">
           <button type="button" data-visibility="authPassword" aria-label="Показати або приховати пароль">Показати</button>
         </div>
       </div>
       ${register ? `
         <div class="form-field">
           <label for="authConfirm">Підтвердження пароля *</label>
           <div class="password-wrap">
             <input id="authConfirm" type="password" autocomplete="new-password" minlength="8" required placeholder="Повторіть пароль">
             <button type="button" data-visibility="authConfirm" aria-label="Показати або приховати підтвердження">Показати</button>
           </div>
         </div>
         <label class="checkbox-row"><input type="checkbox" id="privacyAgree" required><span>Я ознайомився(-лася) та погоджуюся з <button type="button" class="inline-link" data-show-policy>політикою конфіденційності</button> демонстраційного порталу.</span></label>
       ` : ''}
       <p class="modal-feedback" id="authError" role="alert"></p>
       <button class="btn primary block" type="submit">${register ? 'Створити акаунт' : 'Увійти в кабінет'} ${icon(register ? 'plus' : 'log')}</button>
     </form>
     ${!register ? `
       <div class="demo-box">
         <b>Миттєва автоматична авторизація в 1 клік</b>
         <p>Автоматично вводить логін і пароль та виконує вхід:</p>
         <div class="demo-buttons">
           <button type="button" class="btn subtle" data-quick-auth="student">${icon('hat')} Студент (Авто-вхід)</button>
           <button type="button" class="btn subtle" data-quick-auth="teacher">${icon('shield')} Викладач (Авто-вхід)</button>
         </div>
       </div>
     ` : ''}`,
    register ? 'СТВОРЕННЯ АКАУНТА · ' + APP_VERSION : 'АВТОМАТИЧНА АВТОРИЗАЦІЯ · ' + APP_VERSION
  );

  if (!register && triggerAutoEnter) {
    animateAutoCredentials(role, true);
  }
}

function animateAutoCredentials(role, forceSubmit = false) {
  clearTimeout(autoAuthTimer);
  selectedRole = role;
  const creds = autoCredentials[role] || autoCredentials.student;
  const userEl = $('authUsername');
  const passEl = $('authPassword');
  const statusEl = $('autoTypingStatus');

  document.querySelectorAll('[data-auth-role]').forEach(b => b.classList.toggle('selected', b.dataset.authRole === role));

  if (!userEl || !passEl) {
    demoLogin(role);
    return;
  }

  userEl.classList.add('typing-highlight');
  passEl.classList.add('typing-highlight');
  userEl.value = '';
  passEl.value = '';
  if (statusEl) statusEl.textContent = `⚡ Автоматичне введення логіна та пароля (${roleName(role)})...`;

  const loginStr = creds.login;
  const passStr = creds.password;
  let step = 0;
  const totalSteps = Math.max(loginStr.length, passStr.length);

  const typeStep = () => {
    step += 3;
    userEl.value = loginStr.slice(0, step);
    passEl.value = passStr.slice(0, step);
    if (step < totalSteps) {
      autoAuthTimer = setTimeout(typeStep, 24);
    } else {
      userEl.value = loginStr;
      passEl.value = passStr;
      const shouldAutoLogin = forceSubmit || ($('autoSubmitToggle') && $('autoSubmitToggle').checked);
      if (statusEl) {
        statusEl.textContent = shouldAutoLogin
          ? `✓ Дані «${roleName(role)}» введено! Автоматичний вхід у кабінет...`
          : `✓ Логін (${creds.login}) та пароль введено автоматично. Натисніть «Увійти в кабінет».`;
      }
      if (shouldAutoLogin) {
        autoAuthTimer = setTimeout(() => {
          demoLogin(role);
        }, 320);
      } else {
        setTimeout(() => {
          userEl.classList.remove('typing-highlight');
          passEl.classList.remove('typing-highlight');
        }, 600);
      }
    }
  };
  typeStep();
}

function showCopyrightModal() {
  openModal(
    'Авторські права та ліцензія платформи',
    `<div class="policy-text">
       <p><strong>Назва продукту:</strong> Teacher Portal Pro — версія <b>${APP_VERSION}</b>.</p>
       <p><strong>Заклад освіти:</strong> ВСП «Стрийський фаховий коледж ЛНУП».</p>
       <p><strong>Автор (головна сторінка і в загальному):</strong> <b>Максим Ковалишин</b>.</p>
       <p><strong>Повний авторський склад (Автори):</strong></p>
       <ul>
         <li><b>Адмін:</b> Максим Ковалишин</li>
         <li><b>Модератор:</b> Христина Небещанська (куратор розділу «Додатково» та окремого авторського футера)</li>
         <li><b>Викладач:</b> Тетяна Гаркот</li>
       </ul>
       <p><strong>Охорона прав:</strong> © 2026 Усі права на дизайн-систему, 8 графічних тем, AI-модуль викладача, голосові нотатки, структуру хмарного симулятора оцінок та програмний код інтерфейсу захищено.</p>
     </div>
     <div class="modal-actions">
       <button class="btn primary" data-modal-close>Зрозуміло ${icon('check')}</button>
     </div>`,
    'COPYRIGHT · ' + APP_VERSION
  );
}

function showPolicy() {
  openModal(
    'Політика конфіденційності',
    `<div class="policy-text">
       <p><strong>1. Мета:</strong> навчальний інтерактивний прототип версії <b>${APP_VERSION}</b>, не офіційна інформаційна система коледжу.</p>
       <p><strong>2. Дані:</strong> введені прізвище, ім’я, логін, роль, демонстраційний хеш пароля, оцінки, голосові нотатки, оголошення та плани зберігаються локально у вашому браузері через localStorage. Сайт не відправляє ці дані на зовнішній сервер.</p>
       <p><strong>3. Безпека:</strong> доступ на рівні JavaScript можна обійти; localStorage не є безпечною базою даних. Не використовуйте тут реальні паролі, оцінки, персональні дані.</p>
       <p><strong>4. Автори проєкту:</strong> Адмін: Максим Ковалишин (Автор на головній і в загальному), Модератор: Христина Небещанська, Викладач: Тетяна Гаркот.</p>
     </div>
     <div class="modal-actions">
       <button class="btn primary" data-back-auth>Повернутися до форми ${icon('arrow')}</button>
       <button class="btn outline" data-modal-close>Закрити</button>
     </div>`,
    'ДЕМОНСТРАЦІЙНА ПОЛІТИКА'
  );
}

function setSession(data) {
  clearTimeout(autoAuthTimer);
  session = data;
  if (data.role === 'student' && data.studentId) activeStudentPreviewId = data.studentId;
  try { sessionStorage.setItem(KEY + 'session', JSON.stringify(data)); } catch {}
  closeModal();
  updateHeader();
  logAudit(`Авторизація у системі: ${data.name} (${roleName(data.role)})`);
  notify(`Авторизовано (${roleName(data.role)}): ${data.name}`);
  const requested = navAfterAuth;
  navAfterAuth = null;
  const target = requested && (data.role === 'teacher' ? ['admin', 'journal', 'records', 'accounts', 'documents'].includes(requested) : requested === 'student')
    ? requested
    : (data.role === 'teacher' ? 'admin' : 'student');
  navigate(target);
}

function demoLogin(role) {
  const isTeacher = role === 'teacher';
  const c = isTeacher ? autoCredentials.teacher : autoCredentials.student;
  setSession({
    login: c.login,
    name: c.name,
    role: c.role,
    demo: true,
    studentId: c.studentId
  });
}

function logout() {
  session = null;
  try { sessionStorage.removeItem(KEY + 'session'); } catch {}
  updateHeader();
  notify('Ви вийшли з облікового запису');
  navigate('home');
}

async function digest(text) {
  if (!globalThis.crypto?.subtle) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = Math.imul(31, h) + text.charCodeAt(i) | 0;
    return 'sha256_sim_' + Math.abs(h).toString(16).padStart(12, '0');
  }
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
}

function saltString() {
  const b = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(b);
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}

async function doRegister(e) {
  e.preventDefault();
  const fail = msg => { $('authError').textContent = msg; };
  const surname = $('lastName').value.trim();
  const name = $('firstName').value.trim();
  const login = $('authUsername').value.trim().toLowerCase();
  const password = $('authPassword').value;
  const confirm = $('authConfirm').value;

  if (surname.length < 2 || name.length < 2) return fail('Вкажіть прізвище та ім’я (мінімум по 2 символи).');
  if (!/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9._-]{3,30}$/u.test(login)) return fail('Логін: 3–30 символів, літери, цифри, . _ або -.');
  if (accounts.some(a => a.login === login) || ['demo.teacher', 'demo.student', 'teacher.harkot', 'student.petrenko'].includes(login)) {
    return fail('Такий логін уже використовується.');
  }
  if (password.length < 8) return fail('Пароль має містити щонайменше 8 символів.');
  if (password !== confirm) return fail('Паролі не збігаються.');
  if (!$('privacyAgree').checked) return fail('Потрібно підтвердити ознайомлення з політикою.');

  const role = selectedRole;
  try {
    const salt = saltString();
    const hash = await digest(salt + ':' + password);
    let studentId = null;
    if (role === 'student') {
      studentId = Math.max(0, ...students.map(s => s.id)) + 1;
      students.push({ id: studentId, name: surname + ' ' + name, lecture: [null, null, null], practice: [null, null, null], control: [null, null] });
      store.set('students', students);
    }
    const account = { login, name: surname + ' ' + name, role, salt, hash, studentId, created: new Date().toISOString() };
    accounts.push(account);
    store.set('accounts', accounts);
    setSession({ login, name: account.name, role, demo: false, studentId });
  } catch (err) {
    fail(err.message || 'Не вдалося створити акаунт.');
  }
}

async function doLogin(e) {
  e.preventDefault();
  clearTimeout(autoAuthTimer);
  const login = $('authUsername').value.trim().toLowerCase();
  const password = $('authPassword').value;

  if ((login === autoCredentials.teacher.login || login === 'demo.teacher' || login === 'teacher' || login === 'admin.kovalyshyn' || login === 'moderator.khrystyna') && password.length >= 4) {
    demoLogin('teacher');
    return;
  }
  if ((login === autoCredentials.student.login || login === 'demo.student' || login === 'student') && password.length >= 4) {
    demoLogin('student');
    return;
  }

  const u = accounts.find(a => a.login === login && a.role === selectedRole);
  if (!u) {
    $('authError').textContent = 'Акаунт не знайдено. Натисніть кнопку «Студент» або «Викладач» для автоматичної авторизації.';
    return;
  }
  try {
    const hash = await digest(u.salt + ':' + password);
    if (hash !== u.hash) {
      $('authError').textContent = 'Неправильний пароль.';
      return;
    }
    setSession({ login: u.login, name: u.name, role: u.role, studentId: u.studentId, demo: false });
  } catch (err) {
    $('authError').textContent = err.message;
  }
}

/* МАТЕРІАЛИ ТА КОНСПЕКТИ З КНОПКОЮ НОТАТОК І ГОЛОСОВИХ */
function renderMaterials() {
  const q = ($('materialSearch')?.value || '').trim().toLowerCase();
  const data = demoMaterials.filter(m =>
    (currentFilter === 'all' || m.kind === currentFilter) &&
    (m.title + ' ' + m.desc + ' ' + m.code).toLowerCase().includes(q)
  );
  $('materialGrid').innerHTML = data.map(m => `
    <article class="resource-card">
      <div class="resource-top">
        <span class="resource-icon ${m.kind}">${icon(m.kind === 'lecture' ? 'book' : m.kind === 'practice' ? 'clipboard' : m.kind === 'control' ? 'check' : 'file', 'icon-bounce')}</span>
        <span class="resource-type">${esc(types[m.kind])}</span>
      </div>
      <span class="resource-number">${esc(m.code)}</span>
      <h3>${esc(m.title)}</h3>
      <p>${esc(m.desc)}</p>
      <div class="resource-actions">
        <button class="btn outline" data-view-material="${m.id}">Переглянути</button>
        <button class="btn subtle" data-note-material="${esc(m.code + ': ' + m.title)}" title="Додати нотатку або голосове повідомлення">${icon('mic')} Нотатка</button>
        <button class="btn subtle" data-download-material="${m.id}">${icon('download')} TXT</button>
      </div>
    </article>`).join('') || '<div class="empty-state">За вашим запитом матеріалів не знайдено.</div>';
}

function materialText(m) {
  return `TEACHER PORTAL PRO ${APP_VERSION}\n${m.code}\n${m.title}\n\n${m.desc}\n\nОсновні пункти:\n${m.items.map((v, i) => `${i + 1}. ${v}`).join('\n')}\n\nНавчальний зразок.\nАвтори:\nАдмін: Максим Ковалишин\nМодератор: Христина Небещанська\nВикладач: Тетяна Гаркот`;
}

function download(name, text, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function safeName(v) {
  return v.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 50) || 'material';
}

function viewMaterial(id) {
  const m = demoMaterials.find(x => x.id === id);
  if (!m) return;
  openModal(
    m.title,
    `<span class="badge">${esc(m.code)}</span>
     <p class="form-note" style="font-size:13px;margin-top:15px">${esc(m.desc)}</p>
     <h3>Зміст матеріалу</h3>
     <ol class="preview-list">${m.items.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
     <div class="soft-warning">Це демонстраційний конспект версії ${APP_VERSION}. Ви можете залишити власну нотатку або голосове повідомлення до цієї теми!</div>
     <div class="modal-actions">
       <button class="btn primary" data-note-material="${esc(m.code + ': ' + m.title)}">${icon('mic')} Написати нотатку / Голосове</button>
       <button class="btn outline" data-download-material="${m.id}">${icon('download')} Завантажити TXT</button>
     </div>`,
    'НАВЧАЛЬНИЙ РЕСУРС'
  );
}

function metric(label, value, sub, ico = 'chart') {
  return `<article class="metric"><div class="metric-top"><span>${esc(label)}</span><span class="metric-ico">${icon(ico, 'icon-pulse')}</span></div><strong>${esc(value)}</strong><small>${esc(sub)}</small></article>`;
}

/* ПОКРАЩЕНИЙ ОСОБИСТИЙ КАБІНЕТ СТУДЕНТА (v3.1 RS4: НОТАТКИ, ГОЛОСОВІ, ТРЕНАЖЕР) */
function getRankedStudents() {
  return [...students].map(s => ({
    ...s,
    avg: mean(values(s, 'all')) ?? 0
  })).sort((a, b) => b.avg - a.avg);
}

function renderStudent() {
  const select = $('studentProfileSelect');
  const currentId = activeStudentPreviewId || session?.studentId || students[0]?.id || 1;
  const s = students.find(x => x.id === Number(currentId)) || students[0];
  if (s) activeStudentPreviewId = s.id;

  if (select) {
    select.innerHTML = students.map(st => `<option value="${st.id}" ${st.id === s?.id ? 'selected' : ''}>${esc(st.name)}</option>`).join('');
  }

  $('studentGreeting').textContent = s ? `Кабінет студента: ${s.name}` : 'Мій кабінет студента';
  const all = s ? values(s, 'all') : [];
  const summary = s ? sums(s) : null;
  const ranked = getRankedStudents();
  const rankIndex = s ? ranked.findIndex(r => r.id === s.id) + 1 : 1;
  const finalMark = summary?.total ? Math.round(summary.total) : null;

  if ($('studentRankBadge')) {
    $('studentRankBadge').textContent = `НАВЧАЛЬНИЙ СЕМЕСТР · МІСЦЕ #${rankIndex} ІЗ ${students.length} У РЕЙТИНГУ ГРУПИ К-41`;
  }
  if ($('studentXpBadge')) {
    $('studentXpBadge').textContent = `⚡ Досвід: ${studentXp} XP`;
  }

  $('studentStats').innerHTML =
    metric('Мій середній бал', fmt(summary?.total), `ЄКТС: ${ectsGrade(finalMark)}`, 'chart') +
    metric('Рейтинг у групі', `#${rankIndex} з ${students.length}`, finalMark >= 10 ? 'Стипендіальна зона' : 'Поточний рейтинг К-41', 'star') +
    metric('Оцінок у журналі', `${all.length} / 8`, `Нотаток і голосових: ${studentNotes.filter(n => n.studentId === s?.id).length}`, 'mic') +
    metric('Мій прогрес & XP', `${all.length ? Math.round(all.length / 8 * 100) : 0}% (${studentXp} XP)`, 'Виконання плану та тренувань', 'check');

  $('myGrades').innerHTML = s
    ? `<div class="mini-score-grid">
         ${lessonGroups.map(g => `<div class="mini-score"><strong>${fmt(summary[g.key])}</strong><small>${g.title} (Група: ${fmt(groupAverage(g.key))})</small></div>`).join('')}
       </div>
       <table class="my-scores-table">
         <thead>
           <tr>
             <th style="text-align:left;color:var(--muted)">Категорія</th>
             <th style="text-align:center;color:var(--muted)">Мої оцінки</th>
             <th style="text-align:center;color:var(--muted)">Сер. групи</th>
             <th style="text-align:right;color:var(--muted)">Мій середній</th>
           </tr>
         </thead>
         <tbody>
           ${lessonGroups.map(g => {
             const gAvg = groupAverage(g.key);
             const myA = summary[g.key];
             const delta = myA !== null && gAvg !== null ? myA - gAvg : null;
             return `
             <tr>
               <td><b>${esc(g.title)}</b> (${g.n})</td>
               <td style="text-align:center">${s[g.key].map(n => n ? `<span class="score-pill ${gradeLevel(n)[1]}" style="padding:2px 8px;margin:0 2px">${n}</span>` : '<span class="muted">—</span>').join(' ')}</td>
               <td style="text-align:center;color:var(--muted)">${fmt(gAvg)}</td>
               <td><b>${fmt(myA)}</b> ${delta !== null ? `<small style="color:${delta >= 0 ? 'var(--success)' : 'var(--danger)'}">(${delta >= 0 ? '+' : ''}${delta.toFixed(1).replace('.', ',')})</small>` : ''}</td>
             </tr>`;
           }).join('')}
         </tbody>
       </table>`
    : '<div class="empty-state">У цьому профілі поки немає оцінок.</div>';

  updateStudentSimulator();
  renderStudentDisciplineNotes();
  renderStudentTrainer();
  renderStudentAssignments(s);
  renderStudentAnnouncements();
  renderStudentBadges(s, all, summary);
}

/* ГОЛОСОВІ ПОВІДОМЛЕННЯ ТА НОТАТКИ ДО ДИСЦИПЛІН */
function toggleVoiceRecording() {
  const btn = $('startVoiceRecordBtn');
  const timerEl = $('voiceTimerDisplay');
  const vis = $('voiceVisualizer');

  if (!isRecordingVoice) {
    isRecordingVoice = true;
    recordedVoiceReady = false;
    voiceRecordSeconds = 0;
    if (btn) {
      btn.classList.add('recording');
      btn.innerHTML = `${icon('mic')} <span>Зупинити запис</span>`;
    }
    if (vis) vis.classList.add('active');
    if (timerEl) timerEl.textContent = '00:00';

    voiceRecordInterval = setInterval(() => {
      voiceRecordSeconds++;
      const m = String(Math.floor(voiceRecordSeconds / 60)).padStart(2, '0');
      const s = String(voiceRecordSeconds % 60).padStart(2, '0');
      lastRecordedDuration = `${m}:${s}`;
      if (timerEl) timerEl.textContent = lastRecordedDuration;
    }, 1000);
    notify('🎙️ Запис голосового повідомлення до дисципліни розпочато...');
  } else {
    clearInterval(voiceRecordInterval);
    isRecordingVoice = false;
    recordedVoiceReady = true;
    if (voiceRecordSeconds < 1) lastRecordedDuration = '00:05';
    if (btn) {
      btn.classList.remove('recording');
      btn.innerHTML = `${icon('check')} <span>Голосове прикріплено (${lastRecordedDuration})</span>`;
    }
    if (vis) vis.classList.remove('active');
    if (timerEl) timerEl.textContent = `✓ ${lastRecordedDuration}`;
    notify(`🎙️ Голосове повідомлення (${lastRecordedDuration}) готове до відправлення!`);
  }
}

function runSpeechToTextDictation() {
  const area = $('studentNoteText');
  if (!area) return;
  const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  if (SpeechRecognition) {
    try {
      const rec = new SpeechRecognition();
      rec.lang = 'uk-UA';
      rec.interimResults = false;
      notify('🗣️ Говоріть українською — диктування активне...');
      rec.onresult = ev => {
        const transcript = ev.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          area.value = (area.value ? area.value + ' ' : '') + transcript;
          notify('✓ Голосовий текст додано до нотатки!');
        }
      };
      rec.onerror = () => insertSimulatedDictation(area);
      rec.start();
      return;
    } catch {}
  }
  insertSimulatedDictation(area);
}

function insertSimulatedDictation(area) {
  const disc = $('noteDisciplineSelect')?.value || 'дисципліни';
  const sample = `[Голосовий конспект до «${disc}»]: Опрацьовано основні семантичні блоки, адаптивну сітку та логіку хмарної синхронізації.`;
  area.value = (area.value ? area.value + '\n' : '') + sample;
  notify('🗣️ Голосову фразу розпізнано та вставлено в поле нотатки!');
}

function playVoiceSynthesizer(noteId) {
  const n = studentNotes.find(x => x.id === noteId);
  if (!n) return;

  // WebAudio мелодійний сигнал + синтез мовлення браузера (якщо підтримується)
  try {
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.11 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.11);
        osc.stop(ctx.currentTime + idx * 0.11 + 0.26);
      });
    }
    if ('speechSynthesis' in globalThis && n.text) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(n.text);
      u.lang = 'uk-UA';
      u.rate = 1.04;
      speechSynthesis.speak(u);
    }
  } catch {}
  notify(`🔊 Відтворення голосового повідомлення (${n.studentName} · ${n.voiceDuration || '00:10'})`);
}

function renderStudentDisciplineNotes() {
  const box = $('studentNotesList');
  const cnt = $('studentNotesCount');
  if (cnt) cnt.textContent = String(studentNotes.length);
  if (!box) return;
  box.innerHTML = studentNotes.map(n => `
    <div class="note-item">
      <div class="note-item-head">
        <strong>${esc(n.discipline)}</strong>
        <span class="badge">${esc(n.studentName)} · ${esc(n.time)}</span>
      </div>
      <p class="note-item-body">${esc(n.text)}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        ${n.hasVoice ? `
          <span class="voice-wave-pill">
            <button type="button" data-play-voice="${esc(n.id)}" title="Прослухати голосове">▶</button>
            <span>🎙️ Голосове повідомлення (${esc(n.voiceDuration || '00:10')}) · ▂▄▆█▃▆▂</span>
          </span>
        ` : `<small class="muted">Текстова нотатка</small>`}
        ${n.bonusAwarded ? `<span class="status-tag">★ +1 Бонус від викладача</span>` : ''}
      </div>
    </div>
  `).join('') || '<div class="empty-state">Нотаток до дисциплін ще немає. Створіть першу нотатку або запишіть голосове!</div>';
}

function submitStudentDisciplineNote(e) {
  e.preventDefault();
  const s = students.find(x => x.id === Number(activeStudentPreviewId)) || students[0];
  const disc = $('noteDisciplineSelect')?.value || 'Вебтехнології';
  const textEl = $('studentNoteText');
  const rawText = textEl?.value.trim() || '';

  if (!rawText && !recordedVoiceReady) {
    notify('Введіть текст нотатки або запишіть голосове повідомлення!');
    return;
  }

  const newNote = {
    id: 'sn-' + Date.now(),
    studentId: s?.id || 1,
    studentName: s?.name || 'Петренко Андрій',
    discipline: disc,
    text: rawText || 'Надіслано голосовий аудіо-коментар до теми заняття.',
    hasVoice: recordedVoiceReady,
    voiceDuration: recordedVoiceReady ? lastRecordedDuration : null,
    time: 'Щойно',
    bonusAwarded: false
  };

  studentNotes.unshift(newNote);
  store.set('studentNotes', studentNotes);
  studentXp += recordedVoiceReady ? 25 : 15;
  store.set('studentXp', studentXp);

  if (textEl) textEl.value = '';
  recordedVoiceReady = false;
  if ($('startVoiceRecordBtn')) {
    $('startVoiceRecordBtn').innerHTML = `${icon('mic')} <span id="voiceRecordBtnText">Записати голосове</span>`;
  }
  if ($('voiceTimerDisplay')) $('voiceTimerDisplay').textContent = '00:00';

  logAudit(`Студент ${newNote.studentName} додав ${newNote.hasVoice ? 'голосову нотатку' : 'нотатку'} до «${disc}»`);
  renderStudent();
  notify('✓ Нотатку збережено та надіслано викладачу в кабінет (+XP)!');
}

/* ТРЕНУВАЛЬНИЙ ЦЕНТР ТА ПРАКТИЧНА АРЕНА СТУДЕНТА */
function renderStudentTrainer() {
  // 1. Квіз
  const qBox = $('quizArenaBox');
  const qScore = $('quizScoreBadge');
  if (qScore) qScore.textContent = `${quizCorrectCount}/${quizQuestions.length}`;
  if (qBox) {
    const qObj = quizQuestions[currentQuizIndex % quizQuestions.length];
    qBox.innerHTML = `
      <p class="quiz-question">${esc(qObj.q)}</p>
      <div class="quiz-options">
        ${qObj.opts.map((opt, idx) => `
          <button type="button" class="quiz-opt" data-quiz-answer="${idx}">${esc(opt)}</button>
        `).join('')}
      </div>
      <small class="muted">Питання ${(currentQuizIndex % quizQuestions.length) + 1} із ${quizQuestions.length} · +20 XP за правильну відповідь</small>
    `;
  }

  // 2. Флеш-картки
  renderFlashcard();

  // 3. Пісочниця коду
  updatePlaygroundPreview();
}

function handleQuizAnswer(btn, chosenIdx) {
  const qObj = quizQuestions[currentQuizIndex % quizQuestions.length];
  const allBtns = document.querySelectorAll('[data-quiz-answer]');
  allBtns.forEach(b => { b.disabled = true; });

  if (chosenIdx === qObj.correct) {
    btn.classList.add('correct');
    quizCorrectCount = Math.min(quizQuestions.length, quizCorrectCount + 1);
    studentXp += 20;
    store.set('studentXp', studentXp);
    if ($('studentXpBadge')) $('studentXpBadge').textContent = `⚡ Досвід: ${studentXp} XP`;
    notify('🎉 Правильна відповідь! Нараховано +20 XP');
  } else {
    btn.classList.add('wrong');
    if (allBtns[qObj.correct]) allBtns[qObj.correct].classList.add('correct');
    notify('Майже! Правильний варіант підсвічено зеленим.');
  }

  setTimeout(() => {
    currentQuizIndex = (currentQuizIndex + 1) % quizQuestions.length;
    renderStudentTrainer();
  }, 1100);
}

function renderFlashcard() {
  const stage = $('flashcardBox');
  const counterEl = $('flashcardCounter');
  if (!stage) return;
  const idx = currentFlashcardIndex % flashcardsData.length;
  const card = flashcardsData[idx];
  if (counterEl) counterEl.textContent = `${idx + 1} / ${flashcardsData.length}`;
  stage.classList.toggle('flipped', flashcardFlipped);
  stage.innerHTML = `
    <span class="flashcard-tag">${esc(flashcardFlipped ? 'ВІДПОВІДЬ · НАТИСНІТЬ ЩОБ ПОВЕРНУТИ' : card.tag)}</span>
    <strong>${esc(flashcardFlipped ? card.a : card.q)}</strong>
    <small>Натисніть на картку, щоб перевернути (Питання / Відповідь)</small>
  `;
}

function updatePlaygroundPreview() {
  const input = $('playgroundCodeInput');
  const preview = $('playgroundPreview');
  if (!input || !preview) return;
  if (!input.value.trim()) {
    input.value = `<div style="padding:12px;border-radius:12px;background:linear-gradient(120deg,#7c3aed,#06b6d4);color:#fff;font-weight:800;text-align:center">🚀 Teacher Portal Pro v3.1 RS4 · К-41</div>`;
  }
  preview.innerHTML = input.value;
}

function updateStudentSimulator() {
  const s = students.find(x => x.id === Number(activeStudentPreviewId)) || students[0];
  const simVal = Number($('simGradeRange')?.value || 12);
  const simCount = Number($('simGradeCount')?.value || 1);
  if ($('simGradeValue')) $('simGradeValue').textContent = String(simVal);
  if (!s || !$('simResultBox')) return;

  const currentScores = values(s, 'all');
  const curAvg = mean(currentScores);
  const futureScores = [...currentScores, ...Array(simCount).fill(simVal)];
  const newAvg = mean(futureScores);
  const diff = curAvg !== null ? newAvg - curAvg : newAvg;
  const diffSign = diff >= 0 ? '+' : '';

  $('simResultBox').innerHTML = `
    <div>
      <small>Новий середній бал</small>
      <strong>${fmt(newAvg)}</strong>
      <small style="color:${diff >= 0 ? 'var(--success)' : 'var(--danger)'}">${diffSign}${diff.toFixed(2).replace('.', ',')} до поточного</small>
    </div>
    <div>
      <small>Прогнозована підсумкова</small>
      <strong>${Math.round(newAvg)} (${ectsShort(Math.round(newAvg))})</strong>
      <small>${gradeLevel(Math.round(newAvg))[0]} рівень</small>
    </div>
  `;
}

function renderStudentAssignments(s) {
  const box = $('studentAssignmentsList');
  if (!box || !s) return;
  const tasks = [
    { kind: 'practice', index: 0, code: 'ПР №1', title: 'Адаптивний вебінтерфейс (HTML5/CSS3)' },
    { kind: 'practice', index: 1, code: 'ПР №2', title: 'Форма реєстрації з JS-валідацією' },
    { kind: 'practice', index: 2, code: 'ПР №3', title: 'Динамічна таблиця оцінок' },
    { kind: 'control', index: 0, code: 'КР №1', title: 'Контрольна робота: Основи HTML та CSS' },
    { kind: 'control', index: 1, code: 'КР №2', title: 'Контрольна робота: JavaScript та UX' }
  ];

  box.innerHTML = tasks.map(t => {
    const score = s[t.kind]?.[t.index];
    const pending = submissions.find(sub => sub.studentId === s.id && sub.kind === t.kind && sub.index === t.index && sub.status === 'pending');
    return `
      <div class="assignment-row">
        <div>
          <strong>${esc(t.code)} · ${esc(t.title)}</strong>
          <small>${score !== null && score !== undefined ? `Оцінено викладачем: ${score} б. (${ectsShort(score)})` : pending ? '⏳ Відправлено на перевірку викладачу' : 'Ще не здано / очікує виконання'}</small>
        </div>
        <div>
          ${score !== null && score !== undefined
            ? `<span class="score-pill ${gradeLevel(score)[1]}">${score} б.</span>`
            : pending
              ? `<span class="status-tag progress">На перевірці</span>`
              : `<button class="btn tiny primary" data-submit-work="${t.kind}:${t.index}">Здати роботу</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

function submitStudentWork(kind, index) {
  const s = students.find(x => x.id === Number(activeStudentPreviewId)) || students[0];
  if (!s) return;
  const exists = submissions.find(sub => sub.studentId === s.id && sub.kind === kind && sub.index === index && sub.status === 'pending');
  if (exists) {
    notify('Ця робота вже перебуває на перевірці у викладача');
    return;
  }
  const title = (kind === 'practice' ? `Практична №${index + 1}` : `Контрольна №${index + 1}`);
  submissions.unshift({
    id: 'sub-' + Date.now(),
    studentId: s.id,
    studentName: s.name,
    kind,
    index,
    workTitle: title,
    status: 'pending',
    submittedAt: 'Щойно'
  });
  store.set('submissions', submissions);
  studentXp += 30;
  store.set('studentXp', studentXp);
  logAudit(`Студент ${s.name} здав «${title}» на перевірку`);
  renderStudent();
  notify(`Роботу «${title}» надіслано викладачу в адмін-панель (+30 XP)!`);
}

function renderStudentAnnouncements() {
  const box = $('studentAnnouncements');
  if (!box) return;
  box.innerHTML = announcements.map(a => `
    <div class="ann-card">
      <div class="ann-top">
        <span class="status-tag ${a.tag === 'Дедлайн' ? 'progress' : ''}">${esc(a.tag)}</span>
        <small class="muted">${esc(a.date)}</small>
      </div>
      <strong>${esc(a.title)}</strong>
      <p>${esc(a.body)}</p>
    </div>
  `).join('') || '<div class="empty-state">Немає активних оголошень.</div>';
}

function renderStudentBadges(s, all, summary) {
  const grid = $('studentBadgesGrid');
  if (!grid) return;
  const avg = summary?.total ?? 0;
  const hasVoiceNote = studentNotes.some(n => n.studentId === s?.id && n.hasVoice);
  const badges = [
    { emoji: '🏆', title: 'Відмінник семестру', desc: 'Середній бал 10.0 і вище', unlocked: avg >= 10 },
    { emoji: '🎙️', title: 'Голос курсу RS4', desc: 'Надіслано голосову нотатку до дисципліни', unlocked: hasVoiceNote },
    { emoji: '💻', title: 'Майстер коду', desc: 'Середній за практичні 11+', unlocked: (summary?.practice ?? 0) >= 11 },
    { emoji: '🧠', title: 'Адепт тренажера', desc: 'Набрано 140+ XP у тренувальній арені', unlocked: studentXp >= 140 },
    { emoji: '🚀', title: 'Високий старт', desc: 'Отримано хоча б одну 12', unlocked: all.includes(12) }
  ];
  grid.innerHTML = badges.map(b => `
    <div class="ach-card ${b.unlocked ? 'unlocked' : 'locked'}">
      <span class="ach-emoji">${b.emoji}</span>
      <strong>${esc(b.title)}</strong>
      <small>${esc(b.desc)}</small>
    </div>
  `).join('');
}

/* МОДЕРНІЗОВАНА АДМІН-ПАНЕЛЬ ВИКЛАДАЧА ТА AI-ПОМІЧНИК GEMINI / CHATGPT (v3.1 RS4) */
function renderAdmin() {
  const a = groupAverage('all');
  const all = students.flatMap(s => values(s, 'all'));
  const totalCells = students.length * 8;
  const fillPercent = totalCells ? Math.round(all.length / totalCells * 100) : 0;
  const qualityCount = all.filter(x => x >= 7).length;
  const qualityPercent = all.length ? Math.round(qualityCount / all.length * 100) : 0;
  const highCount = all.filter(x => x >= 10).length;
  const pendingSubs = submissions.filter(sub => sub.status === 'pending');

  $('adminGreeting').textContent = `Вітаємо в кабінеті викладача, ${session?.name || 'Тетяно Гаркот'}!`;

  $('adminStats').innerHTML =
    metric('Студентів К-41', students.length, 'Активний склад групи', 'users') +
    metric('Середній бал', fmt(a), `ЄКТС групи: ${ectsShort(a ? Math.round(a) : null)}`, 'chart') +
    metric('Якість знань', qualityPercent + '%', 'Частка оцінок 7–12 балів', 'check') +
    metric('Відмінні оцінки', highCount, 'Оцінки 10–12 у журналі', 'star') +
    metric('Заповненість', fillPercent + '%', `${all.length} із ${totalCells} клітинок`, 'clipboard') +
    metric('Нотатки & Хмара', `${studentNotes.length} / Sync #${cloudSyncCount}`, 'Голосові та хмарний стан', 'mic');

  if ($('teacherReviewProgressLabel')) {
    const revPct = Math.max(60, 100 - pendingSubs.length * 8);
    $('teacherReviewProgressLabel').textContent = `${revPct}% опрацьовано`;
    $('teacherReviewProgressBar').style.width = `${revPct}%`;
  }

  renderTeacherTodos();
  renderAuditLogs();
  renderTeacherNotes();
  renderTeacherVoiceInbox();
  renderTeacherSubmissionsQueue();
  renderAdminAnnouncements();
  renderAdminLeaderboard();
  renderRadarAndEctsCharts();

  $('categoryChart').innerHTML = lessonGroups.map(g => {
    const v = groupAverage(g.key);
    return `
      <div class="category-unit">
        <span class="bar-value">${fmt(v)}</span>
        <div class="bar-bg"><div class="bar-fill" style="height:${v === null ? 0 : Math.min(100, v / 12 * 100)}%"></div></div>
        <span class="bar-caption">${g.title === 'Практична' ? 'Практичні' : g.title === 'Контрольна' ? 'Контрольні' : 'Лекції'}</span>
      </div>`;
  }).join('');

  const groups = [
    all.filter(x => x >= 10),
    all.filter(x => x >= 7 && x <= 9),
    all.filter(x => x >= 4 && x <= 6),
    all.filter(x => x >= 1 && x <= 3)
  ];
  const colors = ['#29d49e', '#43bbee', '#ffb65b', '#ef7383'];
  let acc = 0;
  const gradient = groups.map((g, i) => {
    const start = acc;
    acc += all.length ? g.length / all.length * 100 : 0;
    return `${colors[i]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
  }).join(',');

  $('donutChart').innerHTML = `
    <div class="donut-ring" style="background:conic-gradient(${all.length ? gradient : 'var(--surface-2) 0% 100%'})">
      <div class="donut-center"><strong>${qualityPercent}%</strong><small>якість знань</small></div>
    </div>
    <div class="donut-legend">
      ${['Високий (10–12 · A/B)', 'Достатній (7–9 · C/D)', 'Середній (4–6 · E)', 'Початковий (1–3 · FX)'].map((t, i) => `
        <div class="legend-row"><span class="legend-dot" style="background:${colors[i]}"></span><span>${t}</span><b>${groups[i].length}</b></div>
      `).join('')}
    </div>`;

  const points = [];
  const labels = [];
  lessonGroups.forEach(g => {
    for (let i = 0; i < g.n; i++) {
      const scores = students.map(s => s[g.key]?.[i]).filter(x => Number.isInteger(x));
      points.push(mean(scores));
      labels.push(g.short + (i + 1));
    }
  });
  const W = 650, H = 230, left = 37, right = 20, top = 21, bottom = 33;
  const X = i => left + (W - left - right) * i / Math.max(1, points.length - 1);
  const Y = v => top + (12 - v) / 12 * (H - top - bottom);
  const valid = points.map((v, i) => v === null ? null : [X(i), Y(v), v, labels[i]]).filter(Boolean);
  const p = valid.map(pt => `${pt[0].toFixed(2)},${pt[1].toFixed(2)}`).join(' ');

  $('trendChart').innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Графік середніх балів за заняттями">
      ${[0, 3, 6, 9, 12].map(v => `<line class="trend-grid" x1="${left}" x2="${W - right}" y1="${Y(v)}" y2="${Y(v)}"/><text class="trend-label" x="4" y="${Y(v) + 4}">${v}</text>`).join('')}
      <polyline class="trend-line" points="${p}"/>
      ${valid.map(([x, y, v, lb]) => `<circle class="trend-point" cx="${x}" cy="${y}" r="6"><title>${lb}: ${fmt(v)}</title></circle>`).join('')}
      ${points.map((v, i) => `<text class="trend-label" x="${X(i)}" y="${H - 10}" text-anchor="middle">${labels[i]}</text>`).join('')}
    </svg>`;
}

/* НОВІ ГРАФІКИ v3.1 RS4: РАДАР КОМПЕТЕНТНОСТЕЙ ТА ГІСТОГРАМА ЄКТС */
function renderRadarAndEctsCharts() {
  const radarEl = $('radarChart');
  const ectsEl = $('ectsChart');
  const all = students.flatMap(s => values(s, 'all'));
  const lecAvg = groupAverage('lecture') || 9.5;
  const pracAvg = groupAverage('practice') || 10.1;
  const ctrlAvg = groupAverage('control') || 9.8;
  const fillRatio = Math.min(12, (all.length / Math.max(1, students.length * 8)) * 12);
  const voiceActivity = Math.min(12, 8.5 + studentNotes.length * 0.6);

  if (radarEl) {
    const axes = [
      { label: 'Теорія (Лекції)', val: lecAvg },
      { label: 'Практика (Код)', val: pracAvg },
      { label: 'Контроль (Тести)', val: ctrlAvg },
      { label: 'Активність', val: fillRatio },
      { label: 'Хмара & AI', val: voiceActivity }
    ];
    const cx = 160, cy = 118, maxR = 82;
    const angleFor = i => -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;

    const gridPolys = [0.33, 0.66, 1].map(level => {
      const pts = axes.map((_, i) => {
        const a = angleFor(i);
        return `${(cx + Math.cos(a) * maxR * level).toFixed(1)},${(cy + Math.sin(a) * maxR * level).toFixed(1)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="var(--chartGrid)" stroke-width="1" stroke-dasharray="3 3"/>`;
    }).join('');

    const axisLines = axes.map((ax, i) => {
      const a = angleFor(i);
      const x2 = cx + Math.cos(a) * maxR;
      const y2 = cy + Math.sin(a) * maxR;
      const lx = cx + Math.cos(a) * (maxR + 24);
      const ly = cy + Math.sin(a) * (maxR + 16);
      return `
        <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--chartGrid)" stroke-width="1"/>
        <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" fill="var(--muted)" font-size="10" font-weight="700">${ax.label} (${fmt(ax.val)})</text>
      `;
    }).join('');

    const dataPts = axes.map((ax, i) => {
      const a = angleFor(i);
      const r = (Math.max(0, Math.min(12, ax.val)) / 12) * maxR;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
    const polyStr = dataPts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

    radarEl.innerHTML = `
      <svg viewBox="0 0 320 240" role="img" aria-label="Радар компетентностей групи К-41">
        ${gridPolys}
        ${axisLines}
        <polygon points="${polyStr}" fill="color-mix(in srgb, var(--accent) 32%, transparent)" stroke="var(--accent)" stroke-width="2.6"/>
        ${dataPts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5" fill="var(--accent2)" stroke="var(--surface)" stroke-width="2"/>`).join('')}
      </svg>
    `;
  }

  if (ectsEl) {
    const finals = students.map(s => {
      const m = mean(values(s, 'all'));
      return m === null ? null : Math.round(m);
    }).filter(n => n !== null);

    const buckets = [
      { code: 'A', range: '11–12', count: finals.filter(x => x >= 11).length, color: '#34d399' },
      { code: 'B', range: '10', count: finals.filter(x => x === 10).length, color: '#38bdf8' },
      { code: 'C', range: '8–9', count: finals.filter(x => x >= 8 && x <= 9).length, color: '#818cf8' },
      { code: 'D', range: '7', count: finals.filter(x => x === 7).length, color: '#fbbf24' },
      { code: 'E', range: '4–6', count: finals.filter(x => x >= 4 && x <= 6).length, color: '#fb923c' },
      { code: 'FX', range: '1–3', count: finals.filter(x => x < 4).length, color: '#f87171' }
    ];
    const maxCnt = Math.max(1, ...buckets.map(b => b.count));

    ectsEl.innerHTML = `
      <div class="ects-bars-wrap">
        ${buckets.map(b => {
          const hPct = Math.round((b.count / maxCnt) * 100);
          return `
            <div class="ects-col">
              <strong>${b.count}</strong>
              <div class="ects-bar-track">
                <div class="ects-bar-fill" style="height:${Math.max(8, hPct)}%;background:${b.color}"></div>
              </div>
              <span>${b.code} <small style="display:block;font-size:9px;opacity:.75">(${b.range})</small></span>
            </div>
          `;
        }).join('')}
      </div>
      <small class="muted" style="text-align:center;display:block">Розподіл студентів групи К-41 за європейською кредитно-трансферною системою ЄКТС</small>
    `;
  }
}

/* AI-ПОШУКОВИЙ ПОМІЧНИК ВИКЛАДАЧА (GEMINI 2.5 PRO / CHATGPT-4O) */
let activeAiEngine = 'Gemini 2.5 Pro';

function executeTeacherAiQuery(queryText) {
  const modelName = activeAiEngine || 'Gemini 2.5 Pro';
  const statusBadge = $('aiOutputStatus');
  const outBox = $('teacherAiResponseBox');
  if (!outBox) return;

  const presetMap = {
    test: 'Скласти 5 тестових питань з вебтехнологій (HTML5, CSS3, JavaScript DOM) із правильними відповідями',
    analytics: 'Проаналізувати поточні оцінки групи К-41 та надати рекомендації викладачу',
    practice: 'Створити нове практичне завдання з CSS Grid, Flexbox та JavaScript DOM на 12 балів',
    plan: 'Покращити методичний план лекції та критерії оцінювання за шкалою ЄКТС',
    motivation: 'Написати мотиваційне оголошення для студентів із пропусками щодо здачі практичних робіт'
  };

  const rawQ = (queryText || $('teacherAiQueryInput')?.value || '').trim();
  const q = presetMap[rawQ] || rawQ;
  if ($('teacherAiQueryInput') && presetMap[rawQ]) {
    $('teacherAiQueryInput').value = q;
  }
  if (!q) {
    notify('Введіть пошуковий запит для AI-асистента або оберіть готовий пресет!');
    return;
  }

  if (statusBadge) statusBadge.textContent = `⏳ ${modelName} генерує відповідь...`;

  const avg = fmt(groupAverage('all'));
  const ranked = getRankedStudents();
  const topSt = ranked[0]?.name || 'Шевченко Марія';
  const lowSt = ranked[ranked.length - 1]?.name || 'Кравчук Денис';

  let response = '';
  const lower = q.toLowerCase();

  if (lower.includes('практичн') || lower.includes('grid') || lower.includes('flexbox')) {
    lastAiResponseTitle = 'Практичне завдання: Адаптивний макет на CSS Grid та Flexbox';
    response = `🤖 [${modelName} · Згенеровано для групи К-41]\n\n` +
      `📌 ТЕМА: Побудова адаптивного дашборду студента на CSS Grid & Flexbox\n` +
      `🎯 МЕТА: Закріпити навички побудови 12-колонкової сітки, карток метрик і мобільних медіазапитів.\n\n` +
      `📋 ЗАВДАННЯ ДЛЯ СТУДЕНТІВ:\n` +
      `1. Створити семантичний каркас (<header>, <nav>, <main>, <section>, <footer>).\n` +
      `2. Реалізувати сітку карток за допомогою grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)).\n` +
      `3. Налаштувати плавний hover-ефект та темну/світлу тему через CSS-змінні (--bg, --surface, --accent).\n\n` +
      `🏆 КРИТЕРІЇ ОЦІНЮВАННЯ (1–12 та ЄКТС):\n` +
      `• 10–12 балів (A/B): Повна валідність HTML5, чистий адаптив до 320px, інтерактивність JS.\n` +
      `• 7–9 балів (C/D): Коректна сітка з незначними зауваженнями до мобільної версії.`;
  } else if (lower.includes('тест') || lower.includes('питань') || lower.includes('javascript') || lower.includes('dom')) {
    lastAiResponseTitle = 'Бліц-тест із JavaScript DOM та подій (5 питань)';
    response = `🤖 [${modelName} · Тестовий блок для контролю знань]\n\n` +
      `1. Який метод повертає перший елемент документа за CSS-селектором?\n   ✓ Відповідь: document.querySelector()\n\n` +
      `2. Яка властивість дозволяє безпечно змінити текстовий вміст вузла без ризику XSS?\n   ✓ Відповідь: element.textContent\n\n` +
      `3. Як скасувати стандартну поведінку форми при відправленні?\n   ✓ Відповідь: event.preventDefault()\n\n` +
      `4. Як зберегти масив об’єктів у localStorage?\n   ✓ Відповідь: localStorage.setItem(key, JSON.stringify(arr))\n\n` +
      `5. Який метод шукає найближчого предка за селектором під час делегування подій?\n   ✓ Відповідь: event.target.closest(selector)`;
  } else if (lower.includes('проаналізуй') || lower.includes('успішн') || lower.includes('к-41')) {
    lastAiResponseTitle = 'AI-Аналітика успішності групи К-41';
    response = `🤖 [${modelName} · Інтелектуальний аудит журналу К-41]\n\n` +
      `📊 ЗАГАЛЬНІ ПОКАЗНИКИ:\n` +
      `• Середній бал групи: ${avg} б. (рівень ЄКТС: ${ectsShort(Math.round(groupAverage('all') || 10))})\n` +
      `• Лідер рейтингу: ${topSt} (${fmt(ranked[0]?.avg)} б.)\n` +
      `• Потребує додаткової консультації: ${lowSt} (${fmt(ranked[ranked.length - 1]?.avg)} б.)\n\n` +
      `💡 МЕТОДИЧНІ РЕКОМЕНДАЦІЇ ВИКЛАДАЧУ:\n` +
      `1. Залучити студентів із середнім балом 7–8 до виконання інтерактивних вправ у «Тренажері студента».\n` +
      `2. Заохочувати короткі голосові звіти до практичних робіт (+1 бонусний бал за пояснення логіки коду).\n` +
      `3. Провести фінальну хмарну синхронізацію відомості перед модульним контролем.`;
  } else if (lower.includes('єктс') || lower.includes('рубрикатор') || lower.includes('критер')) {
    lastAiResponseTitle = 'Рубрикатор оцінювання робіт за шкалою 1–12 та ЄКТС';
    response = `🤖 [${modelName} · Нормативний рубрикатор оцінювання]\n\n` +
      `• A (90–100% | 11–12 балів): Бездоганне виконання, власні творчі фішки, захист роботи голосовою або текстовою нотаткою.\n` +
      `• B (82–89% | 10 балів): Повне виконання всіх пунктів завдання з мінімальними стилістичними похибками.\n` +
      `• C (74–81% | 8–9 балів): Робота працює коректно, але відсутня частина додаткової валідації.\n` +
      `• D/E (60–73% | 4–7 балів): Базова структура присутня, потрібне доопрацювання логіки.\n` +
      `• FX (<60% | 1–3 бали): Потрібне повторне складання та робота в тренажері.`;
  } else {
    lastAiResponseTitle = `AI-рішення: ${q.slice(0, 48)}`;
    response = `🤖 [${modelName} · Відповідь на запит викладача]\n\n` +
      `Запит: «${q}»\n\n` +
      `1. СТРУКТУРНИЙ ПЛАН ВИКОНАННЯ:\n` +
      `   • Підготовчий етап: актуалізація опорних знань студентів групи К-41 (середній бал: ${avg}).\n` +
      `   • Практичний блок: демонстрація живого коду та інтерактивних прикладів у порталі v3.1 RS4.\n` +
      `   • Контроль і рефлексія: збір текстових і голосових нотаток студентів до теми.\n\n` +
      `2. РЕКОМЕНДОВАНІ КРИТЕРІЇ (ЄКТС):\n` +
      `   • Оцінки 10–12 (A/B) — за самостійне розширення функціоналу;\n` +
      `   • Оцінки 7–9 (C/D) — за виконання базового технічного завдання.`;
  }

  lastAiResponseText = response;
  outBox.textContent = '';
  let idx = 0;
  const streamStep = () => {
    idx += 18;
    outBox.textContent = response.slice(0, idx);
    if (idx < response.length) {
      setTimeout(streamStep, 18);
    } else {
      outBox.textContent = response;
      if (statusBadge) statusBadge.textContent = `✓ Готово · ${modelName}`;
      logAudit(`Виконано AI-запит (${modelName}): «${q.slice(0, 36)}...»`);
    }
  };
  streamStep();
}

function renderTeacherVoiceInbox() {
  const box = $('teacherVoiceInbox');
  if (!box) return;
  if ($('teacherAiResponseBox') && !$('teacherAiResponseBox').textContent.trim()) {
    $('teacherAiResponseBox').textContent = `🤖 [Gemini 2.5 Pro / ChatGPT-4o · Готовий до роботи]\nОберіть швидкий пресет вище або введіть власний пошуковий запит — наприклад: «Скласти 5 тестових питань з вебтехнологій» або «Проаналізувати поточні оцінки групи К-41».`;
  }

  box.innerHTML = studentNotes.slice(0, 6).map(n => `
    <div class="submission-item">
      <div class="submission-info">
        <strong>${esc(n.studentName)} · <span style="color:var(--accent2)">${esc(n.discipline)}</span></strong>
        <small>${esc(n.text)}</small>
      </div>
      <div class="submission-actions">
        ${n.hasVoice ? `<button type="button" class="btn tiny outline" data-play-voice="${esc(n.id)}">▶ Прослухати (${esc(n.voiceDuration || '00:10')})</button>` : ''}
        ${n.bonusAwarded
          ? `<span class="status-tag">★ Бонус нараховано</span>`
          : `<button type="button" class="btn tiny primary" data-bonus-note="${esc(n.id)}">+1 бал у журнал</button>`
        }
      </div>
    </div>
  `).join('') || '<div class="empty-state">Поки немає голосових чи текстових нотаток від студентів.</div>';
}

function awardBonusForStudentNote(noteId) {
  const n = studentNotes.find(x => x.id === noteId);
  if (!n || n.bonusAwarded) return;
  n.bonusAwarded = true;
  store.set('studentNotes', studentNotes);

  const st = students.find(s => s.id === n.studentId);
  if (st) {
    // Підвищуємо першу оцінку, яка менша за 12, на +1 бал
    for (const g of lessonGroups) {
      const idx = st[g.key].findIndex(v => Number.isInteger(v) && v < 12);
      if (idx !== -1) {
        st[g.key][idx] = Math.min(12, st[g.key][idx] + 1);
        store.set('students', students);
        break;
      }
    }
  }
  logAudit(`Нараховано +1 бонусний бал за нотатку студенту ${n.studentName}`);
  renderAdmin();
  notify(`🌟 Студенту ${n.studentName} нараховано +1 бонусний бал за змістовну нотатку!`);
}

function renderAuditLogs() {
  const box = $('teacherAuditLog');
  if (!box) return;
  box.innerHTML = auditLogs.slice(0, 5).map(l => `<div><span>${esc(l.action)}</span><b>${esc(l.time)}</b></div>`).join('');
}

function updateLessonTimerUI() {
  const el = $('lessonTimerDisplay');
  const btn = $('lessonTimerToggle');
  if (!el) return;
  const m = String(Math.floor(lessonTimerSeconds / 60)).padStart(2, '0');
  const s = String(lessonTimerSeconds % 60).padStart(2, '0');
  el.textContent = `${m}:${s}`;
  if (btn) btn.textContent = lessonTimerRunning ? 'Пауза' : 'Старт';
}

function toggleLessonTimer() {
  if (lessonTimerRunning) {
    clearInterval(lessonTimerInterval);
    lessonTimerRunning = false;
  } else {
    lessonTimerRunning = true;
    lessonTimerInterval = setInterval(() => {
      if (lessonTimerSeconds > 0) {
        lessonTimerSeconds--;
        updateLessonTimerUI();
      } else {
        clearInterval(lessonTimerInterval);
        lessonTimerRunning = false;
        updateLessonTimerUI();
        notify('🔔 Час навчальної пари (80 хв) завершено!');
      }
    }, 1000);
  }
  updateLessonTimerUI();
}

function resetLessonTimer() {
  clearInterval(lessonTimerInterval);
  lessonTimerRunning = false;
  lessonTimerSeconds = 80 * 60;
  updateLessonTimerUI();
  notify('Таймер пари скинуто до 80:00');
}

function renderTeacherTodos() {
  const list = $('teacherTodoList');
  if (!list) return;
  list.innerHTML = teacherTodos.map(t => `
    <div class="todo-item ${t.done ? 'done' : ''}">
      <input type="checkbox" ${t.done ? 'checked' : ''} data-toggle-todo="${esc(t.id)}">
      <span>${esc(t.text)}</span>
      <button type="button" class="todo-del" data-del-todo="${esc(t.id)}" title="Видалити">✕</button>
    </div>
  `).join('') || '<small class="muted">Список завдань порожній.</small>';
}

function renderTeacherNotes() {
  const area = $('teacherNotesArea');
  if (!area) return;
  area.value = store.get('teacherNotes', 'Підготувати питання до модульного контролю групи К-41.\nПеревірити голосові нотатки та практичні роботи №3 і синхронізувати відомість у хмару.');
}

function renderTeacherSubmissionsQueue() {
  const box = $('teacherSubmissionsQueue');
  const badge = $('pendingReviewsBadge');
  if (!box) return;
  const pending = submissions.filter(s => s.status === 'pending');
  if (badge) badge.textContent = `${pending.length} очікують`;

  box.innerHTML = pending.map(sub => `
    <div class="submission-item">
      <div class="submission-info">
        <strong>${esc(sub.studentName)} · ${esc(sub.workTitle)}</strong>
        <small>Надіслано: ${esc(sub.submittedAt)} · Натисніть оцінку для виставлення в журнал</small>
      </div>
      <div class="submission-actions">
        <button class="btn tiny primary" data-grade-sub="${esc(sub.id)}:12">12 б.</button>
        <button class="btn tiny outline" data-grade-sub="${esc(sub.id)}:11">11 б.</button>
        <button class="btn tiny outline" data-grade-sub="${esc(sub.id)}:10">10 б.</button>
        <button class="btn tiny subtle" data-grade-sub="${esc(sub.id)}:9">9 б.</button>
      </div>
    </div>
  `).join('') || '<div class="empty-state">Усі надіслані роботи студентів перевірено! ✓</div>';
}

function gradeSubmission(subId, gradeVal) {
  const sub = submissions.find(x => x.id === subId);
  if (!sub) return;
  const st = students.find(x => x.id === sub.studentId);
  if (st && st[sub.kind]) {
    st[sub.kind][sub.index] = Number(gradeVal);
    store.set('students', students);
  }
  sub.status = 'graded';
  store.set('submissions', submissions);
  logAudit(`Оцінено роботу «${sub.workTitle}» (${sub.studentName}): ${gradeVal} б.`);
  renderAdmin();
  notify(`Виставлено ${gradeVal} б. студенту ${sub.studentName} у журнал!`);
}

function renderAdminAnnouncements() {
  const box = $('adminAnnouncementsList');
  if (!box) return;
  box.innerHTML = announcements.map(a => `
    <div class="ann-card">
      <div class="ann-top">
        <span class="status-tag ${a.tag === 'Дедлайн' ? 'progress' : ''}">${esc(a.tag)}</span>
        <button type="button" class="ann-del" data-del-ann="${esc(a.id)}" title="Видалити оголошення">Видалити ✕</button>
      </div>
      <strong>${esc(a.title)}</strong>
      <p>${esc(a.body)}</p>
    </div>
  `).join('') || '<div class="empty-state">Оголошень поки немає.</div>';
}

function renderAdminLeaderboard() {
  const box = $('adminLeaderboard');
  if (!box) return;
  const ranked = getRankedStudents();
  const medals = ['🥇', '🥈', '🥉'];
  box.innerHTML = ranked.slice(0, 6).map((s, idx) => {
    const f = s.avg ? Math.round(s.avg) : null;
    const [lvl, cls] = gradeLevel(f);
    return `
      <div class="leader-row">
        <span class="leader-rank">${medals[idx] || '#' + (idx + 1)}</span>
        <div class="leader-info">
          <strong>${esc(s.name)}</strong>
          <small>${esc(lvl)} · ЄКТС: ${ectsShort(f)}</small>
        </div>
        <span class="score-pill ${cls}">${fmt(s.avg)}</span>
        <button class="btn tiny subtle" data-dossier="${s.id}">Досьє</button>
      </div>
    `;
  }).join('');
}

function showStudentDossier(studentId) {
  const s = students.find(x => x.id === Number(studentId));
  if (!s) return;
  const a = sums(s);
  const f = a.total === null ? null : Math.round(a.total);
  const [lvl, cls] = gradeLevel(f);
  const stNotes = studentNotes.filter(n => n.studentId === s.id);
  openModal(
    `Досьє студента: ${s.name}`,
    `<div class="account-card" style="margin-bottom:14px">
       <span class="account-avatar">${esc(initials(s.name))}</span>
       <div>
         <strong>${esc(s.name)}</strong>
         <small>Група К-41 · Рівень: ${esc(lvl)} · ЄКТС: ${ectsGrade(f)} · Нотаток: ${stNotes.length}</small>
       </div>
       <span class="score-pill ${cls}">${fmt(a.total)}</span>
     </div>
     <div class="mini-score-grid">
       <div class="mini-score"><strong>${fmt(a.lecture)}</strong><small>Лекції (${s.lecture.map(x => x ?? '—').join(', ')})</small></div>
       <div class="mini-score"><strong>${fmt(a.practice)}</strong><small>Практичні (${s.practice.map(x => x ?? '—').join(', ')})</small></div>
       <div class="mini-score"><strong>${fmt(a.control)}</strong><small>Контрольні (${s.control.map(x => x ?? '—').join(', ')})</small></div>
     </div>
     <div class="modal-actions">
       <button class="btn primary" data-open-student-view="${s.id}">Переглянути очима студента ${icon('arrow')}</button>
       <button class="btn outline" data-modal-close>Закрити</button>
     </div>`,
    'КАРТКА УСПІШНОСТІ · К-41'
  );
}

/* РОЗШИРЕНИЙ ЕЛЕКТРОННИЙ ЖУРНАЛ ІЗ ДИНАМІКОЮ ТРЕНДІВ ТА 2-РЯДКОВИМ ПІДСУМКОМ */
function visibleColumns() {
  const c = $('journalCategory')?.value || 'all';
  return lessonGroups
    .filter(g => c === 'all' || c === g.key)
    .flatMap(g => Array.from({ length: g.n }, (_, i) => ({
      key: g.key,
      index: i,
      label: g.short + (i + 1),
      full: g.title + ' №' + (i + 1)
    })));
}

function gradeColorClass(v) {
  if (!Number.isInteger(v)) return '';
  if (v >= 10) return 'g-high';
  if (v >= 7) return 'g-good';
  if (v >= 4) return 'g-mid';
  return 'g-low';
}

function renderJournal() {
  const cols = visibleColumns();
  const q = ($('journalSearch')?.value || '').trim().toLowerCase();
  const sortMode = $('journalSort')?.value || 'default';
  const cat = $('journalCategory')?.value || 'all';

  let display = students.filter(s => s.name.toLowerCase().includes(q));
  if (journalLevelFilter !== 'all') {
    display = display.filter(s => {
      const m = mean(values(s, cat));
      const f = m === null ? 0 : Math.round(m);
      const hasMissing = cols.some(c => s[c.key]?.[c.index] === null || s[c.key]?.[c.index] === undefined);
      if (journalLevelFilter === 'high') return f >= 10;
      if (journalLevelFilter === 'good') return f >= 7 && f <= 9;
      if (journalLevelFilter === 'low') return f > 0 && f < 7;
      if (journalLevelFilter === 'missing') return hasMissing;
      return true;
    });
  }

  if (sortMode === 'name') display.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  if (sortMode === 'desc') display.sort((a, b) => (mean(values(b, cat)) ?? -1) - (mean(values(a, cat)) ?? -1));
  if (sortMode === 'asc') display.sort((a, b) => (mean(values(a, cat)) ?? 99) - (mean(values(b, cat)) ?? 99));

  $('gradeHead').innerHTML = `
    <tr>
      <th>Студент</th>
      ${cols.map(c => `<th title="${esc(c.full)}">${c.label}<span class="grade-type">${esc(c.full)}</span></th>`).join('')}
      <th>Динаміка</th>
      <th>Виконання</th>
      <th>Середній</th>
      <th>ЄКТС</th>
      <th>Підсумок</th>
    </tr>`;

  $('gradeBody').innerHTML = display.map((s, rowIdx) => {
    const vals = values(s, cat);
    const m = mean(vals);
    const f = m === null ? null : Math.round(m);
    const cls = gradeLevel(f)[1];
    const pct = cols.length ? Math.round(vals.length / cols.length * 100) : 0;
    const tr = studentTrendInfo(s);
    return `
      <tr>
        <td>
          <span class="student-cell" data-dossier="${s.id}" title="Відкрити індивідуальне досьє">
            <span class="student-avatar">${esc(initials(s.name))}</span>${esc(s.name)}
          </span>
        </td>
        ${cols.map((c, colIdx) => {
          const val = s[c.key]?.[c.index];
          return `<td><input class="grade-input ${gradeColorClass(val)}" type="number" inputmode="numeric" min="1" max="12" step="1" value="${val ?? ''}" data-row="${rowIdx}" data-col="${colIdx}" data-edit-student="${s.id}" data-edit-type="${c.key}" data-edit-index="${c.index}" aria-label="${esc(s.name)} — ${esc(c.full)}"></td>`;
        }).join('')}
        <td><span class="trend-badge ${tr.cls}">${esc(tr.text)}</span></td>
        <td>
          <span class="cell-progress">
            <span class="cell-progress-bar"><i style="width:${pct}%"></i></span>
            <span>${pct}%</span>
          </span>
        </td>
        <td><b>${fmt(m)}</b></td>
        <td><span class="ects-badge">${ectsShort(f)}</span></td>
        <td><span class="score-pill ${cls}">${f ?? '—'}</span></td>
      </tr>`;
  }).join('') || `<tr><td colspan="${cols.length + 6}" class="muted">За обраним фільтром студентів не знайдено.</td></tr>`;

  const colAvgs = cols.map(c => {
    const arr = display.map(s => s[c.key]?.[c.index]).filter(n => Number.isInteger(n));
    return mean(arr);
  });
  const colQualities = cols.map(c => {
    const arr = display.map(s => s[c.key]?.[c.index]).filter(n => Number.isInteger(n));
    return arr.length ? Math.round(arr.filter(x => x >= 7).length / arr.length * 100) : 0;
  });

  const allItems = display.flatMap(s => values(s, cat));
  const totalPossible = Math.max(1, display.length * cols.length);
  const totalPct = Math.round(allItems.length / totalPossible * 100);
  const overallAvg = mean(allItems);
  const overallFinal = overallAvg === null ? null : Math.round(overallAvg);
  const overallQual = allItems.length ? Math.round(allItems.filter(x => x >= 7).length / allItems.length * 100) : 0;

  if ($('gradeFoot')) {
    $('gradeFoot').innerHTML = `
      <tr>
        <td>Σ Середній показник групи (${display.length} студ.)</td>
        ${colAvgs.map(a => `<td>${fmt(a)}</td>`).join('')}
        <td><span class="trend-badge up">↑ Група</span></td>
        <td>${totalPct}%</td>
        <td>${fmt(overallAvg)}</td>
        <td><span class="ects-badge">${ectsShort(overallFinal)}</span></td>
        <td><span class="score-pill">${overallFinal ?? '—'}</span></td>
      </tr>
      <tr>
        <td>★ Якість знань за заняттям (оцінки 7–12)</td>
        ${colQualities.map(qPct => `<td>${qPct}%</td>`).join('')}
        <td>Норма ≥75%</td>
        <td>Якість:</td>
        <td colspan="3"><b>${overallQual}% якості знань групи К-41</b></td>
      </tr>
    `;
  }

  const items = students.flatMap(s => values(s, cat));
  const high = items.filter(x => x >= 10).length;
  $('journalStats').innerHTML =
    metric('Середній бал', fmt(mean(items)), 'За обраним видом занять', 'chart') +
    metric('Заповнено клітинок', items.length, `Усього ${students.length * cols.length}`, 'clipboard') +
    metric('Високі оцінки', high, 'Результати 10–12 (A/B)', 'check') +
    metric('Студентів', students.length, 'Група К-41', 'users');
}

function editGrade(input) {
  if (session?.role !== 'teacher') {
    notify('Лише викладач може виставляти оцінки');
    return;
  }
  const s = students.find(st => st.id === Number(input.dataset.editStudent));
  const key = input.dataset.editType;
  const index = Number(input.dataset.editIndex);
  if (!s || !lessonGroups.some(g => g.key === key) || !Number.isInteger(index) || index < 0 || index >= s[key].length) return;

  const raw = input.value.trim();
  const v = raw === '' ? null : Number(raw);
  if (v !== null && (!Number.isInteger(v) || v < 1 || v > 12)) {
    notify('Оцінка — ціле число від 1 до 12.');
    renderJournal();
    return;
  }
  s[key][index] = v;
  if (store.set('students', students)) {
    logAudit(`Змінено оцінку: ${s.name} (${types[key]} №${index + 1}) -> ${v ?? 'очищено'}`);
    renderJournal();
    notify('Оцінку збережено. Таблиця та аналітика оновлені.');
  }
}

function fillMissingJournalGrades() {
  if (session?.role !== 'teacher') return;
  let filled = 0;
  students.forEach(s => {
    lessonGroups.forEach(g => {
      s[g.key] = s[g.key].map(val => {
        if (val === null || val === undefined) {
          filled++;
          return Math.floor(Math.random() * 4) + 9;
        }
        return val;
      });
    });
  });
  if (filled === 0) {
    notify('Усі клітинки журналу вже заповнені!');
    return;
  }
  store.set('students', students);
  logAudit(`Автозаповнення пропусків журналу (${filled} оцінок)`);
  renderJournal();
  notify(`Автоматично заповнено ${filled} порожніх клітинок!`);
}

/* ПІДСУМКОВА ВІДОМІСТЬ (v3.1 RS4) */
function renderRecords() {
  const full = students.flatMap(s => values(s, 'all'));
  const finals = students.map(s => mean(values(s, 'all'))).filter(n => n !== null).map(x => Math.round(x));
  $('recordStats').innerHTML =
    metric('Середній бал', fmt(mean(full)), 'Усі роботи семестру', 'chart') +
    metric('Високий рівень', finals.filter(x => x >= 10).length, 'Підсумкова 10–12 (A/B)', 'check') +
    metric('Достатній рівень', finals.filter(x => x >= 7 && x <= 9).length, 'Підсумкова 7–9 (C/D)', 'users') +
    metric('Потребують уваги', finals.filter(x => x < 7).length, 'Підсумкова 1–6 (E/FX)', 'info');

  $('recordsBody').innerHTML = students.map((s, idx) => {
    const a = sums(s);
    const allCount = values(s, 'all').length;
    const pct = Math.round(allCount / 8 * 100);
    const f = a.total === null ? null : Math.round(a.total);
    const [lvl, cls] = gradeLevel(f);
    const tr = studentTrendInfo(s);
    return `
      <tr>
        <td>${idx + 1}</td>
        <td><span class="student-cell" data-dossier="${s.id}"><span class="student-avatar">${esc(initials(s.name))}</span>${esc(s.name)}</span></td>
        <td>${fmt(a.lecture)}</td>
        <td>${fmt(a.practice)}</td>
        <td>${fmt(a.control)}</td>
        <td>
          <span class="cell-progress">
            <span class="cell-progress-bar"><i style="width:${pct}%"></i></span>
            <span>${pct}%</span>
          </span>
        </td>
        <td><span class="trend-badge ${tr.cls}">${esc(tr.text)}</span></td>
        <td><b>${fmt(a.total)}</b></td>
        <td><span class="score-pill ${cls}">${f ?? '—'}</span></td>
        <td><span class="ects-badge">${ectsGrade(f)}</span></td>
        <td>${esc(lvl)} ${f >= 10 ? '· Стипендія' : ''}</td>
      </tr>`;
  }).join('');

  if ($('recordsFoot')) {
    const gAll = groupAverage('all');
    const gFin = gAll === null ? null : Math.round(gAll);
    const qualPct = full.length ? Math.round(full.filter(x => x >= 7).length / full.length * 100) : 0;
    $('recordsFoot').innerHTML = `
      <tr>
        <td>Σ</td>
        <td>Середній показник групи К-41</td>
        <td>${fmt(groupAverage('lecture'))}</td>
        <td>${fmt(groupAverage('practice'))}</td>
        <td>${fmt(groupAverage('control'))}</td>
        <td>${Math.round(full.length / (students.length * 8) * 100)}%</td>
        <td><span class="trend-badge up">Якість ${qualPct}%</span></td>
        <td>${fmt(gAll)}</td>
        <td><span class="score-pill">${gFin ?? '—'}</span></td>
        <td><span class="ects-badge">${ectsGrade(gFin)}</span></td>
        <td>Загальний підсумок</td>
      </tr>
    `;
  }
}

/* РОЗДІЛ «ДОДАТКОВО»: ХМАРНЕ СХОВИЩЕ, КАЛЬКУЛЯТОР ОБСЯГУ БД ТА ГРАФІК ШВИДКОДІЇ */
async function buildCloudPayload() {
  const all = students.flatMap(s => values(s, 'all'));
  const avg = mean(all);
  const quality = all.length ? Math.round(all.filter(x => x >= 7).length / all.length * 100) : 0;
  const rawStr = JSON.stringify(students) + ':' + APP_VERSION + ':' + studentNotes.length;
  const hash = await digest(rawStr);

  return {
    portal: 'Teacher Portal Pro',
    version: APP_VERSION,
    syncedAt: new Date().toISOString(),
    syncNumber: cloudSyncCount,
    checksumSHA256: hash.slice(0, 32),
    authors: {
      mainAuthor: 'Максим Ковалишин',
      admin: 'Максим Ковалишин',
      moderator: 'Христина Небещанська',
      teacher: 'Тетяна Гаркот'
    },
    statistics: {
      group: 'К-41',
      studentsCount: students.length,
      filledGrades: all.length,
      totalCapacity: students.length * 8,
      voiceAndTextNotesCount: studentNotes.length,
      groupAverage: avg ? Number(avg.toFixed(2)) : 0,
      lectureAverage: Number((groupAverage('lecture') || 0).toFixed(2)),
      practiceAverage: Number((groupAverage('practice') || 0).toFixed(2)),
      controlAverage: Number((groupAverage('control') || 0).toFixed(2)),
      qualityOfKnowledgePercent: quality
    },
    journalRecords: students.map(s => {
      const a = sums(s);
      const f = a.total ? Math.round(a.total) : null;
      return {
        id: s.id,
        student: s.name,
        lecture: s.lecture,
        practice: s.practice,
        control: s.control,
        average: a.total ? Number(a.total.toFixed(2)) : null,
        ects: ectsShort(f)
      };
    })
  };
}

function updateCloudCalculator() {
  const stCount = Number($('cloudCalcStudents')?.value || 350);
  const semCount = Number($('cloudCalcSemesters')?.value || 4);
  if ($('cloudCalcStudentsVal')) $('cloudCalcStudentsVal').textContent = String(stCount);
  if ($('cloudCalcResultBox')) {
    // 1 студент за семестр ~ 45 KB JSON + ~ 320 KB голосових/нотаток
    const jsonMb = ((stCount * semCount * 45) / 1024).toFixed(1).replace('.', ',');
    const totalMb = ((stCount * semCount * 365) / 1024).toFixed(1).replace('.', ',');
    $('cloudCalcResultBox').innerHTML = `
      <div>
        <small>Обсяг JSON-журналів та ЄКТС</small>
        <strong>${jsonMb} МБ</strong>
        <small>Стиснення Brotli / GZIP</small>
      </div>
      <div>
        <small>Разом із голосовими та бекапами (3x)</small>
        <strong>${totalMb} МБ</strong>
        <small>Швидкість реплікації: ~18 мс</small>
      </div>
    `;
  }

  const latEl = $('cloudLatencyChart');
  if (latEl) {
    const nodes = [
      { name: 'Стрий · Edge Node', ms: 9 },
      { name: 'Львів · Primary Cloud', ms: 14 },
      { name: 'Київ · Backup Replica', ms: 21 },
      { name: 'Франкфурт · EU DR Node', ms: 34 },
      { name: 'AI Gateway (Gemini/GPT)', ms: 42 }
    ];
    latEl.innerHTML = `
      <svg viewBox="0 0 540 210" role="img" aria-label="Затримка синхронізації хмарних вузлів (мс)">
        ${nodes.map((n, idx) => {
          const y = 18 + idx * 38;
          const w = Math.round((n.ms / 50) * 320);
          return `
            <text x="8" y="${y + 15}" fill="var(--text)" font-size="11.5" font-weight="750">${n.name}</text>
            <rect x="175" y="${y}" width="310" height="22" rx="8" fill="var(--surface-2)"/>
            <rect x="175" y="${y}" width="${w}" height="22" rx="8" fill="url(#latGrad)"/>
            <text x="${185 + w}" y="${y + 15}" fill="var(--accent2)" font-size="11" font-weight="900">${n.ms} мс</text>
          `;
        }).join('')}
        <defs>
          <linearGradient id="latGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="var(--accent)"/>
            <stop offset="100%" stop-color="var(--accent2)"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }
}

async function renderCloudSection() {
  const payload = await buildCloudPayload();
  const st = payload.statistics;

  if ($('cloudTelemetryTable')) {
    $('cloudTelemetryTable').innerHTML = `
      <tr><td>Версія хмарного пакета</td><td><b>${esc(payload.version)}</b></td><td><span class="status-tag">Актуальний</span></td></tr>
      <tr><td>Навчальна група та обсяг</td><td><b>${esc(st.group)} (${st.studentsCount} студ. · ${st.filledGrades}/${st.totalCapacity} оцінок)</b></td><td><span class="status-tag">Зібрано</span></td></tr>
      <tr><td>Середній бал та якість знань</td><td><b>${fmt(st.groupAverage)} б. · Якість: ${st.qualityOfKnowledgePercent}%</b></td><td><span class="status-tag">Розраховано</span></td></tr>
      <tr><td>Голосові та текстові нотатки</td><td><b>${st.voiceAndTextNotesCount} записів у хмарному медіа-сховищі</b></td><td><span class="status-tag">Синхронізовано</span></td></tr>
      <tr><td>Контрольна сума SHA-256</td><td><code>${esc(payload.checksumSHA256.slice(0, 20))}...</code></td><td><span class="status-tag">Верифіковано</span></td></tr>
      <tr><td>Кількість хмарних реплікацій</td><td><b>#${payload.syncNumber}</b></td><td><span class="status-tag">Cloud DB Live</span></td></tr>
    `;
  }
  if ($('cloudJsonPreview')) {
    $('cloudJsonPreview').textContent = JSON.stringify(payload, null, 2);
  }
  updateCloudCalculator();
}

async function triggerCloudSyncAnimation() {
  cloudSyncCount++;
  store.set('cloudSyncCount', cloudSyncCount);
  logAudit(`Хмарна синхронізація оцінок, нотаток і статистики (#${cloudSyncCount})`);

  const bar = $('cloudSyncProgressBar');
  const badge = $('cloudSyncStatusBadge');
  const steps = ['pipeStep1', 'pipeStep2', 'pipeStep3', 'pipeStep4'].map(id => $(id));

  if (badge) badge.textContent = '⏳ Синхронізація з хмарою...';
  if (bar) bar.style.width = '15%';

  for (let i = 0; i < steps.length; i++) {
    steps.forEach((el, idx) => el?.classList.toggle('active-step', idx === i));
    if (bar) bar.style.width = `${(i + 1) * 25}%`;
    await new Promise(r => setTimeout(r, 200));
  }

  await renderCloudSection();
  renderHomePulse();
  if ($('cloudLastSyncTime')) {
    $('cloudLastSyncTime').textContent = 'Синхронізовано о ' + new Date().toLocaleTimeString('uk-UA');
  }
  if (badge) badge.textContent = `✓ Синхронізовано (#${cloudSyncCount})`;
  if ($('teacherAccountSyncBadge')) $('teacherAccountSyncBadge').textContent = `☁️ Хмара: Sync #${cloudSyncCount}`;
  if ($('heroCloudStatusText')) $('heroCloudStatusText').textContent = `Sync #${cloudSyncCount} · SHA-256 OK`;
  notify(`☁️ Електронний журнал, голосові нотатки та статистику синхронізовано в хмару (#${cloudSyncCount})!`);
}

async function downloadCloudJson() {
  const payload = await buildCloudPayload();
  download('TeacherPortalPro_CloudJournal_v3.1_RS4.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
  notify('Завантажено хмарний JSON-пакет оцінок та статистики v3.1 RS4');
}

function csv(name, rows) {
  const encode = value => {
    let s = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  download(name, '\ufeffsep=;\r\n' + rows.map(r => r.map(encode).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
  notify('CSV збережено для Excel');
}

function exportData(summary) {
  if (session?.role !== 'teacher') return;
  const rows = students.map(s => {
    const a = sums(s);
    const f = a.total === null ? '' : Math.round(a.total);
    return summary
      ? [s.name, fmt(a.lecture), fmt(a.practice), fmt(a.control), fmt(a.total), f, ectsGrade(f === '' ? null : f), gradeLevel(f === '' ? null : f)[0]]
      : [s.name, ...lessonGroups.flatMap(g => s[g.key].map(x => x ?? '')), fmt(a.total), f];
  });
  const cols = summary
    ? ['Студент', 'Лекції', 'Практичні', 'Контрольні', 'Середній бал', 'Підсумкова', 'ЄКТС', 'Рівень']
    : ['Студент', 'Лекція 1', 'Лекція 2', 'Лекція 3', 'Практична 1', 'Практична 2', 'Практична 3', 'Контрольна 1', 'Контрольна 2', 'Середній', 'Підсумок'];
  csv(summary ? 'TeacherPortalPro_v3.1_RS4_vidomist.csv' : 'TeacherPortalPro_v3.1_RS4_journal.csv', [cols, ...rows]);
}

function renderDocuments() {
  const q = ($('documentSearch')?.value || '').trim().toLowerCase();
  const docs = documents.filter(d => (docFilter === 'all' || d.category === docFilter) && (d.title + ' ' + d.desc).toLowerCase().includes(q));
  $('documentsList').innerHTML = docs.map(d => `
    <article class="doc-row">
      <span class="doc-ico">${icon(d.category === 'plan' ? 'clipboard' : 'file', 'icon-bounce')}</span>
      <div class="doc-main"><h3>${esc(d.title)}</h3><p>${esc(d.desc)}</p></div>
      <span class="status-tag ${d.status === 'У процесі' ? 'progress' : d.status === 'Заплановано' ? 'planned' : ''}">${esc(d.status)}</span>
      <div class="doc-actions">
        <button class="btn subtle" data-view-document="${esc(d.id)}">Переглянути</button>
        ${session?.role === 'teacher' ? `<button class="btn outline" title="Змінити статус" data-change-status="${esc(d.id)}">↻</button>` : ''}
      </div>
    </article>`).join('') || '<div class="empty-state">Документів не знайдено.</div>';
}

function viewDocument(id) {
  const d = documents.find(v => v.id === id);
  if (!d) return;
  openModal(
    d.title,
    `<span class="badge">${d.category === 'plan' ? 'Навчальний план' : 'Нормативний зразок'}</span>
     <p style="font-size:13px;color:var(--muted)">${esc(d.desc)}</p>
     <h3>Демонстраційний зміст</h3>
     <p style="font-size:13px;line-height:1.8;white-space:pre-wrap">${esc(d.body)}</p>
     <div class="soft-warning">Статус: ${esc(d.status)}. Версія порталу: ${APP_VERSION}.</div>
     <button class="btn primary block" data-download-document="${esc(d.id)}">${icon('download')} Завантажити TXT</button>`,
    'ДОКУМЕНТАЦІЯ'
  );
}

function changeDocumentStatus(id) {
  if (session?.role !== 'teacher') return;
  const d = documents.find(x => x.id === id);
  if (!d) return;
  const v = ['Заплановано', 'У процесі', 'Актуальний'];
  d.status = v[(v.indexOf(d.status) + 1) % v.length];
  store.set('documents', documents);
  renderDocuments();
  notify('Статус документа оновлено');
}

function showNewDocument() {
  if (session?.role !== 'teacher') return;
  openModal(
    'Новий навчальний план',
    `<form id="newDocumentForm">
       <div class="form-field"><label for="docTitle">Назва документа</label><input id="docTitle" maxlength="110" required placeholder="Робочий план на ІІ семестр"></div>
       <div class="form-field"><label for="docDesc">Короткий опис</label><input id="docDesc" maxlength="200" placeholder="Зміст та призначення"></div>
       <div class="form-field"><label for="docBody">Зміст плану</label><textarea id="docBody" rows="4" maxlength="2000" placeholder="Введіть основний текст"></textarea></div>
       <p class="modal-feedback" id="docError"></p>
       <button class="btn primary block" type="submit">${icon('plus')} Додати план</button>
     </form>`,
    'ПЛАНУВАННЯ'
  );
}

function addNewDocument(e) {
  e.preventDefault();
  if (session?.role !== 'teacher') return;
  const title = $('docTitle').value.trim();
  if (title.length < 3) {
    $('docError').textContent = 'Введіть назву щонайменше з трьох символів.';
    return;
  }
  const d = {
    id: 'new-' + Date.now(),
    title,
    category: 'plan',
    status: 'Заплановано',
    desc: $('docDesc').value.trim() || 'Новий план',
    body: $('docBody').value.trim() || 'Зміст буде додано пізніше.'
  };
  documents.unshift(d);
  store.set('documents', documents);
  closeModal();
  renderDocuments();
  notify('План успішно додано');
}

function showAddStudent() {
  if (session?.role !== 'teacher') return;
  openModal(
    'Додати студента',
    `<form id="newStudentForm">
       <div class="form-field"><label for="newStudent">Прізвище та ім’я</label><input id="newStudent" maxlength="100" required placeholder="Наприклад: Савчук Олег"></div>
       <p class="modal-feedback" id="studentError"></p>
       <button class="btn primary block" type="submit">${icon('plus')} Додати до групи</button>
     </form>
     <p class="form-note">Усі додані записи зберігаються у локальному сховищі браузера та доступні для хмарної синхронізації.</p>`,
    'ГРУПА К-41'
  );
}

function addNewStudent(e) {
  e.preventDefault();
  if (session?.role !== 'teacher') return;
  const name = $('newStudent').value.trim();
  if (name.length < 4) {
    $('studentError').textContent = 'Вкажіть коректні прізвище та ім’я.';
    return;
  }
  students.push({
    id: Math.max(0, ...students.map(s => s.id)) + 1,
    name,
    lecture: [null, null, null],
    practice: [null, null, null],
    control: [null, null]
  });
  store.set('students', students);
  logAudit(`Додано нового студента до групи К-41: ${name}`);
  closeModal();
  renderJournal();
  notify('Студента додано до журналу К-41');
}

function renderAccounts() {
  const list = accounts.map(a => ({ name: a.name, login: a.login, role: a.role }));
  const builtIn = [
    { name: 'Тетяна Гаркот (Викладач)', login: autoCredentials.teacher.login, role: 'teacher', auto: true },
    { name: 'Максим Ковалишин (Автор · Адмін)', login: 'admin.kovalyshyn', role: 'teacher', auto: true },
    { name: 'Христина Небещанська (Модератор)', login: 'moderator.khrystyna', role: 'teacher', auto: true },
    { name: 'Петренко Андрій (Студент К-41)', login: autoCredentials.student.login, role: 'student', auto: true }
  ];
  $('accountList').innerHTML = [...builtIn, ...list].map(a => `
    <div class="account-card">
      <span class="account-avatar">${esc(initials(a.name))}</span>
      <div>
        <strong>${esc(a.name)}</strong>
        <small>Логін: ${esc(a.login)} · SHA-256</small>
      </div>
      <span class="badge">${a.role === 'teacher' ? 'Викладач' : 'Студент'}</span>
      <button class="btn tiny outline" data-quick-auth="${a.role}">Авто-вхід</button>
    </div>`).join('');
}

function clearAll() {
  if (!confirm('Видалити ВСІ локальні демо-акаунти, оцінки, голосові нотатки, оголошення та плани?')) return;
  ['students', 'documents', 'accounts', 'announcements', 'submissions', 'studentNotes', 'teacherTodos', 'teacherNotes', 'auditLogs', 'cloudSyncCount', 'studentXp'].forEach(k => {
    try { localStorage.removeItem(KEY + k); } catch {}
  });
  students = clone(demoStudents);
  documents = clone(demoDocuments);
  announcements = clone(demoAnnouncements);
  submissions = clone(demoSubmissions);
  studentNotes = clone(demoStudentNotes);
  teacherTodos = clone(demoTodos);
  auditLogs = clone(demoAudit);
  cloudSyncCount = 18;
  studentXp = 120;
  accounts = [];
  logout();
  notify('Локальні демонстраційні дані скинуто до початкових');
}

function init() {
  applyUiPrefs();
  setTheme(store.get('theme', 'aurora'));
  updateHeader();
  renderMaterials();
  renderThemeShowcase();
  renderHomePulse();
  renderHomeHub('ai');
  renderCloudSection();

  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); navigate(nav.dataset.nav); return; }

    const hubBtn = e.target.closest('[data-hub-tab]');
    if (hubBtn) { renderHomeHub(hubBtn.dataset.hubTab); return; }

    // Перехід із картки матеріалу до написання нотатки / голосового повідомлення
    const noteMat = e.target.closest('[data-note-material]');
    if (noteMat) {
      const matTitle = noteMat.dataset.noteMaterial;
      closeModal();
      if (session?.role !== 'student') {
        demoLogin('student');
      } else {
        navigate('student');
      }
      setTimeout(() => {
        const sel = $('noteDisciplineSelect');
        if (sel) {
          const found = Array.from(sel.options).find(o => o.value.includes(matTitle.split(':')[0]));
          if (found) sel.value = found.value;
        }
        $('studentNotesVoiceSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        $('studentNoteText')?.focus();
      }, 220);
      return;
    }

    // Перемикання AI-моделі (Gemini 2.5 Pro / ChatGPT-4o / RS4 Neural Analyst)
    const aiEng = e.target.closest('[data-ai-engine]');
    if (aiEng) {
      activeAiEngine = aiEng.dataset.aiEngine;
      document.querySelectorAll('[data-ai-engine]').forEach(b => b.classList.toggle('active', b === aiEng));
      if ($('aiOutputStatus')) $('aiOutputStatus').textContent = `✨ Активна модель: ${activeAiEngine}`;
      notify(`Обрано ШІ-модель: ${activeAiEngine}`);
      return;
    }

    // Пресети AI-запитів викладача
    const aiPreset = e.target.closest('[data-ai-preset]');
    if (aiPreset) {
      const q = aiPreset.dataset.aiPreset;
      executeTeacherAiQuery(q);
      return;
    }

    // Дії з результатом AI-відповіді
    if (e.target.closest('#aiSaveToNotesBtn')) {
      const txt = lastAiResponseText || $('teacherAiResponseBox')?.textContent || '';
      const area = $('teacherNotesArea');
      if (area && txt) {
        area.value = (area.value ? area.value + '\n\n' : '') + txt;
        store.set('teacherNotes', area.value);
        notify('✓ Відповідь AI додано до нотаток викладача!');
      }
      return;
    }

    if (e.target.closest('#aiPublishAnnBtn')) {
      const txt = lastAiResponseText || $('teacherAiResponseBox')?.textContent || '';
      const title = lastAiResponseTitle || 'AI-завдання від викладача';
      announcements.unshift({
        id: 'ann-' + Date.now(),
        title,
        tag: 'Важливо',
        body: txt.slice(0, 360) + (txt.length > 360 ? '...' : ''),
        date: new Date().toLocaleDateString('uk-UA')
      });
      store.set('announcements', announcements);
      renderAdminAnnouncements();
      notify('📢 Відповідь AI опубліковано як оголошення для студентів К-41!');
      return;
    }

    if (e.target.closest('#aiSaveDocBtn')) {
      const txt = lastAiResponseText || $('teacherAiResponseBox')?.textContent || '';
      const title = lastAiResponseTitle || 'AI-методичний матеріал (' + new Date().toLocaleDateString('uk-UA') + ')';
      documents.unshift({
        id: 'doc-ai-' + Date.now(),
        title,
        category: 'plan',
        status: 'Актуальний',
        desc: 'Згенеровано в AI-хабі викладача (Gemini / ChatGPT)',
        body: txt
      });
      store.set('documents', documents);
      notify('📄 Збережено як новий документ у розділі «Документи»!');
      return;
    }

    if (e.target.closest('#openExternalGeminiBtn')) {
      const q = ($('teacherAiQueryInput')?.value || 'Створи практичне завдання з вебтехнологій для студентів коледжу').trim();
      if (navigator.clipboard) navigator.clipboard.writeText(q).catch(() => {});
      window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
      notify('Запит скопійовано в буфер! Відкривається Google Gemini ↗');
      return;
    }

    if (e.target.closest('#openExternalChatGptBtn')) {
      const q = encodeURIComponent(($('teacherAiQueryInput')?.value || 'Створи практичне завдання з вебтехнологій для студентів коледжу').trim());
      window.open(`https://chatgpt.com/?q=${q}`, '_blank', 'noopener,noreferrer');
      notify('Відкривається ChatGPT із вашим пошуковим запитом ↗');
      return;
    }

    // Голосовий запис та диктування студента
    if (e.target.closest('#startVoiceRecordBtn')) {
      toggleVoiceRecording();
      return;
    }
    if (e.target.closest('#speechToTextBtn')) {
      runSpeechToTextDictation();
      return;
    }
    if (e.target.closest('#scrollToVoiceNotesBtn')) {
      $('studentNotesVoiceSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (e.target.closest('#exportStudentNotesBtn')) {
      const text = studentNotes.map((n, i) => `${i + 1}. [${n.discipline}] (${n.studentName}, ${n.time})\n${n.text}\nГолосове: ${n.hasVoice ? n.voiceDuration : 'немає'}\n`).join('\n---\n');
      download('Student_Notes_v3.1_RS4.txt', `КОНСПЕКТИ ТА ГОЛОСОВІ НОТАТКИ · ${APP_VERSION}\n\n${text}`);
      notify('Конспект нотаток завантажено у TXT');
      return;
    }

    const playVoice = e.target.closest('[data-play-voice]');
    if (playVoice) {
      playVoiceSynthesizer(playVoice.dataset.playVoice);
      return;
    }

    const bonusBtn = e.target.closest('[data-bonus-note]');
    if (bonusBtn) {
      awardBonusForStudentNote(bonusBtn.dataset.bonusNote);
      return;
    }

    // Тренажер студента: Квіз та Флеш-картки
    const quizAns = e.target.closest('[data-quiz-answer]');
    if (quizAns) {
      handleQuizAnswer(quizAns, Number(quizAns.dataset.quizAnswer));
      return;
    }

    if (e.target.closest('#flashcardBox') || e.target.closest('#flipFlashcardBtn')) {
      flashcardFlipped = !flashcardFlipped;
      renderFlashcard();
      return;
    }
    if (e.target.closest('#prevFlashcardBtn')) {
      flashcardFlipped = false;
      currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcardsData.length) % flashcardsData.length;
      renderFlashcard();
      return;
    }
    if (e.target.closest('#nextFlashcardBtn')) {
      flashcardFlipped = false;
      currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcardsData.length;
      renderFlashcard();
      return;
    }
    if (e.target.closest('#resetPlaygroundBtn')) {
      if ($('playgroundCodeInput')) {
        $('playgroundCodeInput').value = `<div style="padding:12px;border-radius:12px;background:linear-gradient(120deg,#7c3aed,#06b6d4);color:#fff;font-weight:800;text-align:center">🚀 Teacher Portal Pro v3.1 RS4 · К-41</div>`;
        updatePlaygroundPreview();
      }
      return;
    }

    const personaBtn = e.target.closest('[data-teacher-persona]');
    if (personaBtn) {
      const [pName, pTitle, pLogin] = personaBtn.dataset.teacherPersona.split('|');
      document.querySelectorAll('[data-teacher-persona]').forEach(b => b.classList.toggle('active', b === personaBtn));
      if ($('teacherCardAvatar')) $('teacherCardAvatar').textContent = initials(pName);
      if ($('teacherCardName')) $('teacherCardName').textContent = pName;
      if ($('teacherCardTitle')) $('teacherCardTitle').textContent = pTitle;
      if ($('teacherCardLogin')) $('teacherCardLogin').textContent = pLogin;
      if ($('adminGreeting')) $('adminGreeting').textContent = `Вітаємо в кабінеті викладача, ${pName}!`;
      if (session && session.role === 'teacher') {
        session.name = pName;
        session.login = pLogin;
        updateHeader();
      }
      logAudit(`Перемкнуто активний профіль викладача: ${pName}`);
      notify(`Активний профіль кабінету: ${pName}`);
      return;
    }

    const jLevel = e.target.closest('[data-journal-level]');
    if (jLevel) {
      journalLevelFilter = jLevel.dataset.journalLevel;
      document.querySelectorAll('[data-journal-level]').forEach(b => b.classList.toggle('active', b === jLevel));
      renderJournal();
      return;
    }

    const quickAuth = e.target.closest('[data-quick-auth]');
    if (quickAuth) {
      e.preventDefault();
      const role = quickAuth.dataset.quickAuth;
      navAfterAuth = role === 'teacher' ? 'admin' : 'student';
      showAuth('login', role, true);
      return;
    }

    const mobAuth = e.target.closest('[data-mobile-auth]');
    if (mobAuth) { navAfterAuth = null; showAuth(mobAuth.dataset.mobileAuth, 'student'); return; }

    const changeTheme = e.target.closest('[data-theme-choice]');
    if (changeTheme) { setTheme(changeTheme.dataset.themeChoice); return; }

    const openRole = e.target.closest('[data-role-open]');
    if (openRole) {
      const r = openRole.dataset.roleOpen;
      navAfterAuth = r === 'teacher' ? 'admin' : 'student';
      showAuth('login', r, false);
      return;
    }

    const gate = e.target.closest('[data-gate-role]');
    if (gate) { selectedRole = gate.dataset.gateRole; showRoleGate(selectedRole); return; }

    const showPass = e.target.closest('[data-visibility]');
    if (showPass) {
      const field = $(showPass.dataset.visibility);
      if (field) {
        field.type = field.type === 'password' ? 'text' : 'password';
        showPass.textContent = field.type === 'password' ? 'Показати' : 'Приховати';
      }
      return;
    }

    const authRole = e.target.closest('[data-auth-role]');
    if (authRole) {
      const role = authRole.dataset.authRole;
      if (loginTab === 'login') {
        animateAutoCredentials(role, false);
      } else {
        showAuth('register', role, false);
      }
      return;
    }

    const authTab = e.target.closest('[data-auth-tab]');
    if (authTab) { showAuth(authTab.dataset.authTab, selectedRole, false); return; }

    const demo = e.target.closest('[data-demo]');
    if (demo) { demoLogin(demo.dataset.demo); return; }

    if (e.target.closest('[data-show-policy]')) { showPolicy(); return; }
    if (e.target.closest('#openCopyrightModal') || e.target.closest('#aboutOpenCopyrightBtn')) { showCopyrightModal(); return; }
    if (e.target.closest('[data-back-auth]')) { showAuth('register', selectedRole); return; }
    if (e.target.closest('[data-modal-close]')) { closeModal(); return; }

    const mv = e.target.closest('[data-view-material]');
    if (mv) { viewMaterial(mv.dataset.viewMaterial); return; }

    const dl = e.target.closest('[data-download-material]');
    if (dl) {
      const m = demoMaterials.find(x => x.id === dl.dataset.downloadMaterial);
      if (m) { download(safeName(m.title) + '.txt', materialText(m)); notify('Демо-конспект завантажено'); }
      return;
    }

    const dv = e.target.closest('[data-view-document]');
    if (dv) { viewDocument(dv.dataset.viewDocument); return; }

    const ds = e.target.closest('[data-change-status]');
    if (ds) { changeDocumentStatus(ds.dataset.changeStatus); return; }

    const dd = e.target.closest('[data-download-document]');
    if (dd) {
      const d = documents.find(v => v.id === dd.dataset.downloadDocument);
      if (d) { download(safeName(d.title) + '.txt', `${d.title}\n\n${d.desc}\n\n${d.body}\n\nДемо-зразок · Teacher Portal Pro ${APP_VERSION}`); notify('Завантажено TXT'); }
      return;
    }

    const mf = e.target.closest('[data-material-filter]');
    if (mf) {
      currentFilter = mf.dataset.materialFilter;
      document.querySelectorAll('[data-material-filter]').forEach(b => b.classList.toggle('active', b === mf));
      renderMaterials();
      return;
    }

    const df = e.target.closest('[data-doc-filter]');
    if (df) {
      docFilter = df.dataset.docFilter;
      document.querySelectorAll('[data-doc-filter]').forEach(b => b.classList.toggle('active', b === df));
      renderDocuments();
      return;
    }

    const subWork = e.target.closest('[data-submit-work]');
    if (subWork) {
      const [kind, idx] = subWork.dataset.submitWork.split(':');
      submitStudentWork(kind, Number(idx));
      return;
    }

    const gradeSub = e.target.closest('[data-grade-sub]');
    if (gradeSub) {
      const [subId, gVal] = gradeSub.dataset.gradeSub.split(':');
      gradeSubmission(subId, Number(gVal));
      return;
    }

    const toggleTodo = e.target.closest('[data-toggle-todo]');
    if (toggleTodo) {
      const t = teacherTodos.find(x => x.id === toggleTodo.dataset.toggleTodo);
      if (t) { t.done = !t.done; store.set('teacherTodos', teacherTodos); renderTeacherTodos(); }
      return;
    }

    const delTodo = e.target.closest('[data-del-todo]');
    if (delTodo) {
      teacherTodos = teacherTodos.filter(x => x.id !== delTodo.dataset.delTodo);
      store.set('teacherTodos', teacherTodos);
      renderTeacherTodos();
      return;
    }

    const delAnn = e.target.closest('[data-del-ann]');
    if (delAnn) {
      announcements = announcements.filter(x => x.id !== delAnn.dataset.delAnn);
      store.set('announcements', announcements);
      renderAdminAnnouncements();
      notify('Оголошення видалено');
      return;
    }

    const dossier = e.target.closest('[data-dossier]');
    if (dossier) {
      showStudentDossier(Number(dossier.dataset.dossier));
      return;
    }

    const openStView = e.target.closest('[data-open-student-view]');
    if (openStView) {
      activeStudentPreviewId = Number(openStView.dataset.openStudentView);
      closeModal();
      demoLogin('student');
      activeStudentPreviewId = Number(openStView.dataset.openStudentView);
      renderStudent();
      return;
    }

    if (e.target.closest('#runCloudSyncBtn') || e.target.closest('#triggerCloudSyncBtn') || e.target.closest('#adminQuickCloudSync') || e.target.closest('#journalCloudSyncBtn')) {
      triggerCloudSyncAnimation();
      return;
    }

    if (e.target.closest('#downloadCloudJsonBtn')) {
      downloadCloudJson();
      return;
    }

    if (e.target.closest('#lessonTimerToggle')) {
      toggleLessonTimer();
      return;
    }

    if (e.target.closest('#lessonTimerReset')) {
      resetLessonTimer();
      return;
    }

    if (e.target.closest('#openThemeStudio') || e.target.closest('#hubOpenStudioBtn') || e.target.closest('#openThemeStudioStudent') || e.target.closest('#subnavThemeBtn') || e.target.closest('#footerThemeBtn')) {
      openThemeStudioModal();
      return;
    }
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'prefBannerArt') {
      uiPrefs.bannerArt = e.target.checked ? 'on' : 'off';
      store.set('uiPrefs', uiPrefs);
      applyUiPrefs();
    }
    if (e.target.id === 'prefGlow') {
      uiPrefs.glow = e.target.checked ? 'on' : 'off';
      store.set('uiPrefs', uiPrefs);
      applyUiPrefs();
    }
    if (e.target.id === 'prefCompact') {
      uiPrefs.compact = e.target.checked ? 'on' : 'off';
      store.set('uiPrefs', uiPrefs);
      applyUiPrefs();
    }
  });

  document.addEventListener('submit', e => {
    if (e.target.id === 'registerForm') { doRegister(e); return; }
    if (e.target.id === 'loginForm') { doLogin(e); return; }
    if (e.target.id === 'newDocumentForm') { addNewDocument(e); return; }
    if (e.target.id === 'newStudentForm') { addNewStudent(e); return; }
    if (e.target.id === 'studentDisciplineNoteForm') { submitStudentDisciplineNote(e); return; }
    if (e.target.id === 'teacherAiForm') {
      e.preventDefault();
      executeTeacherAiQuery($('teacherAiQueryInput')?.value);
      return;
    }
    if (e.target.id === 'teacherTaskForm') {
      e.preventDefault();
      const inp = $('teacherTaskInput');
      if (inp && inp.value.trim()) {
        teacherTodos.unshift({ id: 'td-' + Date.now(), text: inp.value.trim(), done: false });
        inp.value = '';
        store.set('teacherTodos', teacherTodos);
        renderTeacherTodos();
        notify('Завдання додано в органайзер викладача');
      }
      return;
    }
    if (e.target.id === 'announcementForm') {
      e.preventDefault();
      const title = $('annTitle')?.value.trim();
      const tag = $('annTag')?.value || 'Інформація';
      const body = $('annBody')?.value.trim();
      if (title && body) {
        announcements.unshift({
          id: 'ann-' + Date.now(),
          title,
          tag,
          body,
          date: new Date().toLocaleDateString('uk-UA')
        });
        $('annTitle').value = '';
        $('annBody').value = '';
        store.set('announcements', announcements);
        logAudit(`Опубліковано оголошення: «${title}»`);
        renderAdminAnnouncements();
        notify('Оголошення опубліковано для студентів К-41');
      }
      return;
    }
  });

  $('materialSearch')?.addEventListener('input', renderMaterials);
  $('documentSearch')?.addEventListener('input', renderDocuments);
  $('journalCategory')?.addEventListener('change', renderJournal);
  $('journalSort')?.addEventListener('change', renderJournal);
  $('journalSearch')?.addEventListener('input', renderJournal);
  $('gradeBody')?.addEventListener('change', e => { if (e.target.matches('.grade-input')) editGrade(e.target); });

  $('gradeBody')?.addEventListener('keydown', e => {
    if (!e.target.matches('.grade-input')) return;
    const row = Number(e.target.dataset.row);
    const col = Number(e.target.dataset.col);
    let nextRow = row, nextCol = col;
    if (e.key === 'ArrowRight') nextCol++;
    else if (e.key === 'ArrowLeft') nextCol--;
    else if (e.key === 'ArrowDown' || e.key === 'Enter') nextRow++;
    else if (e.key === 'ArrowUp') nextRow--;
    else return;
    const target = document.querySelector(`.grade-input[data-row="${nextRow}"][data-col="${nextCol}"]`);
    if (target) {
      e.preventDefault();
      target.focus();
      target.select();
    }
  });

  $('studentProfileSelect')?.addEventListener('change', e => {
    activeStudentPreviewId = Number(e.target.value);
    renderStudent();
  });

  $('simGradeRange')?.addEventListener('input', updateStudentSimulator);
  $('simGradeCount')?.addEventListener('change', updateStudentSimulator);
  $('playgroundCodeInput')?.addEventListener('input', updatePlaygroundPreview);
  $('cloudCalcStudents')?.addEventListener('input', updateCloudCalculator);
  $('cloudCalcSemesters')?.addEventListener('change', updateCloudCalculator);

  $('teacherNotesArea')?.addEventListener('input', e => {
    store.set('teacherNotes', e.target.value);
    if ($('notesSavedStatus')) $('notesSavedStatus').textContent = '✓ Збережено о ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  });

  $('clearTeacherNotes')?.addEventListener('click', () => {
    if ($('teacherNotesArea')) $('teacherNotesArea').value = '';
    store.set('teacherNotes', '');
    notify('Нотатки викладача очищено');
  });

  $('headerLogin')?.addEventListener('click', () => { navAfterAuth = null; showAuth('login', 'student', false); });
  $('headerRegister')?.addEventListener('click', () => { navAfterAuth = null; showAuth('register', 'student', false); });

  $('profileButton')?.addEventListener('click', () => {
    if (!session) return;
    openModal(
      'Мій обліковий запис · ' + APP_VERSION,
      `<div class="account-card">
         <span class="account-avatar">${esc(initials(session.name))}</span>
         <div><strong>${esc(session.name)}</strong><small>${esc(session.login)} · ${roleName(session.role)} · SHA-256</small></div>
       </div>
       <div class="soft-warning">Версія системи: <b>${APP_VERSION}</b>. Хмарних синхронізацій журналу: <b>#${cloudSyncCount}</b>.</div>
       <div class="demo-box">
         <b>Швидке перемикання ролі (Авто-логін)</b>
         <div class="demo-buttons" style="margin-top:8px">
           <button class="btn subtle" data-quick-auth="student">${icon('hat')} Студент</button>
           <button class="btn subtle" data-quick-auth="teacher">${icon('shield')} Викладач</button>
         </div>
       </div>
       <div class="modal-actions">
         <button class="btn primary" data-go-profile>Відкрити кабінет</button>
         <button class="btn outline" id="logoutBtn">Вийти з акаунта</button>
       </div>`,
      'ОБЛІКОВИЙ ЗАПИС КОРИСТУВАЧА'
    );
  });

  $('modalContent')?.addEventListener('click', e => {
    if (e.target.closest('#logoutBtn')) logout();
    if (e.target.closest('[data-go-profile]')) { closeModal(); navigate(session.role === 'teacher' ? 'admin' : 'student'); }
    if (e.target.closest('#gateLogin')) showAuth('login', selectedRole, false);
    if (e.target.closest('#gateRegister')) showAuth('register', selectedRole, false);
    if (e.target.matches('#authUsername') || e.target.matches('#authPassword')) {
      clearTimeout(autoAuthTimer);
    }
  });

  $('mobileMenuButton')?.addEventListener('click', () => $('mobileMenu').classList.toggle('hidden'));
  $('modalClose')?.addEventListener('click', closeModal);
  $('modalOverlay')?.addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  $('exportJournal')?.addEventListener('click', () => exportData(false));
  $('exportRecords')?.addEventListener('click', () => exportData(true));
  $('printRecords')?.addEventListener('click', () => window.print());
  $('fillMissingGrades')?.addEventListener('click', fillMissingJournalGrades);
  $('addStudent')?.addEventListener('click', showAddStudent);
  $('resetGrades')?.addEventListener('click', () => {
    if (!confirm('Повернути початкові демонстраційні оцінки для всіх тестових студентів?')) return;
    const originals = clone(demoStudents);
    students = students.map(s => originals.find(o => o.id === s.id) || s);
    store.set('students', students);
    renderJournal();
    notify('Відновлено демонстраційні оцінки');
  });
  $('newDocument')?.addEventListener('click', showNewDocument);
  $('clearDemoData')?.addEventListener('click', clearAll);

  if (session) {
    navigate(session.role === 'teacher' ? 'admin' : 'student');
  } else {
    navigate('home');
  }
}

document.addEventListener('DOMContentLoaded', init);
