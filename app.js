// Planning MythAAk — Station Shell
// 2 shifts: Matin / Soir + Repos / Congé / Absence / Maladie
window.addEventListener("error", function (e) {
  try {
    var msg = "⛔ Erreur: " + (e.message || (e.error && e.error.message) || "?");
    var box = document.getElementById("fatalBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "fatalBox";
      box.style.cssText = "background:#fee2e2;color:#991b1b;padding:12px 16px;margin:10px 18px;border-radius:12px;font-weight:800;font-size:14px";
      var top = document.querySelector(".topbar");
      if (top && top.parentNode) top.parentNode.insertBefore(box, top.nextSibling);
      else document.body.insertBefore(box, document.body.firstChild);
    }
    box.textContent = msg + " — صورو ليا هاد الرسالة";
  } catch (_) {}
});
function reportFatal(e) {
  try {
    var msg = "⛔ Erreur: " + ((e && e.message) || e);
    if (e && e.stack) msg += " | " + String(e.stack).split("\n").slice(0, 3).join(" / ");
    var box = document.getElementById("fatalBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "fatalBox";
      box.style.cssText = "background:#fee2e2;color:#991b1b;padding:12px 16px;margin:10px 18px;border-radius:12px;font-weight:800;font-size:13px;word-break:break-all";
      var top = document.querySelector(".topbar");
      if (top && top.parentNode) top.parentNode.insertBefore(box, top.nextSibling);
      else document.body.insertBefore(box, document.body.firstChild);
    }
    box.textContent = msg + " — صورو ليا هاد الرسالة";
  } catch (_) {}
}

const SHIFTS = {
  vide:    { fr: "— Vide —", ar: "— فارغ —", sub: "", color: "#94a3b8" },
  matin:   { fr: "☀️ Matin", ar: "☀️ صباح", sub: "06h–14h", color: "#2563eb" },
  soir:    { fr: "🌤️ Soir", ar: "🌤️ مساء", sub: "14h–22h", color: "#d946ef" },
  nuit:    { fr: "🌙 NUIT", ar: "🌙 ليل", sub: "22h–06h", color: "#1e1b4b" },
  p12:       { fr: "⛽ P1/2", ar: "⛽ P1/2", sub: "Pompes 1-2", color: "#eab308" },
  p34:       { fr: "⛽ P3/4", ar: "⛽ P3/4", sub: "Pompes 3-4", color: "#8b5cf6" },
  p56:       { fr: "⛽ P5/6", ar: "⛽ P5/6", sub: "Pompes 5-6", color: "#10b981" },
  melange:   { fr: "🛢️ MELANGE", ar: "🛢️ MELANGE", sub: "Mélange", color: "#f59e0b" },
  service:   { fr: "🧰 SERVICE", ar: "🧰 SERVICE", sub: "Service", color: "#60a5fa" },
  service12: { fr: "🧰 SERVICE 12", ar: "🧰 SERVICE 12", sub: "Service 12h", color: "#84cc16" },
  service8:  { fr: "🧰 SERVICE 8", ar: "🧰 SERVICE 8", sub: "Service 8h", color: "#f97316" },
  repos:   { fr: "🌙 Repos", ar: "🌙 راحة", sub: "Repos hebdo", color: "#22c55e" },
  conge:   { fr: "🏖️ Congé", ar: "🏖️ عطلة", sub: "Congé payé", color: "#14b8a6" },
  absence: { fr: "⛔ Absence", ar: "⛔ غياب", sub: "Non justifiée", color: "#ef4444" },
  maladie: { fr: "🤒 Maladie", ar: "🤒 مرض", sub: "Arrêt maladie", color: "#6b7280" },
};
const WORK_SHIFTS = ["matin","soir","nuit","p12","p34","p56","melange","service","service12","service8"];
const DAY_POSTS = ["p12","p34","p56","melange","service12","service8","service"];
// fixed post-night return sequence: MELANGE -> SERVICE 8 -> pump -> SERVICE 12.
// pump follows personal rotation p12 -> p34 -> p56 (verified in Excel history + semaine 26/10).
const SEQ_RETURN = ['melange','service8','PUMP','service12'];
const PUMP_CYCLE = ['p12','p34','p56'];

const DAYS_FR = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const DAYS_AR = ["الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"];

const AVATAR_COLORS = ["#dd1c2a","#2563eb","#16a34a","#f59e0b","#7c3aed","#0891b2","#db2777","#059669"];

const REAL_WORKERS = [
  { id: "w-yassine", name: "YASSINE", role: "Pompiste", phone: "" },
  { id: "w-khalid", name: "KHALID", role: "Pompiste", phone: "" },
  { id: "w-jamal", name: "JAMAL", role: "Pompiste", phone: "" },
  { id: "w-fetah", name: "FETAH", role: "Pompiste", phone: "" },
  { id: "w-issam", name: "ISSAM", role: "Pompiste", phone: "" },
  { id: "w-hassan", name: "HASSAN", role: "Pompiste", phone: "" },
  { id: "w-youssef", name: "YOUSSEF", role: "Pompiste", phone: "" },
  { id: "w-kamal", name: "KAMAL", role: "Pompiste", phone: "" },
  { id: "w-ahmed", name: "AHMED", role: "Pompiste", phone: "" },
  { id: "w-rida", name: "RIDA", role: "Pompiste", phone: "" },
];
// Night rotation cycle (from LISTE NUIT + confirmed in Excel Aug-Oct 2026):
// week32: YASSINE-JAMAL, week33: FETAH-KAMAL, week34: YOUSSEF-RIDA,
// week35: AHMED-KHALID, week36: ISSAM-HASSAN, then repeats every 5 weeks.
const NIGHT_PAIRS = [
  ["YASSINE", "JAMAL"],
  ["FETAH", "KAMAL"],
  ["YOUSSEF", "RIDA"],
  ["AHMED", "KHALID"],
  ["ISSAM", "HASSAN"],
];
const NIGHT_ANCHOR_MONDAY = new Date(2026, 7, 3); // Monday Aug 3 2026 = pair index 0
function nightPairFor(monday) {
  const diffDays = Math.round((monday - NIGHT_ANCHOR_MONDAY) / (24*3600*1000));
  const w = Math.floor(diffDays / 7);
  return NIGHT_PAIRS[((w % 5) + 5) % 5];
}
// Congé rotation order (LISTE CONGÉ as given)
const CONGE_ORDER = ["ISSAM","YASSINE","RIDA","KAMAL","KHALID","HASSAN","JAMAL","YOUSSEF","FETAH","AHMED"];
function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return (v === null || v === undefined) ? fallback : v;
  } catch (e) { return fallback; }
}
let congeOverride = loadJSON("mythaak_conge", {});
function getCongeWeek(vis) {
  const saved = congeOverride[weekKey()];
  if (saved === "NONE") return new Set();
  if (saved) {
    const w = vis.find(x => x.id === saved);
    if (w) return new Set([saved]);
  }
  return null; // auto from history
}
function setCongeWeek(val) {
  congeOverride[weekKey()] = val;
  localStorage.setItem("mythaak_conge", JSON.stringify(congeOverride));
}
function nextCongeInList(currentId) {
  const ids = CONGE_ORDER.map(nm => {
    const w = workers.find(x => x.name.toUpperCase() === nm);
    return w ? w.id : null;
  }).filter(Boolean);
  if (!ids.length) return null;
  const i = ids.indexOf(currentId);
  return ids[(i + 1) % ids.length];
}
let lang = localStorage.getItem("mythaak_lang") || "fr";
let workers = loadJSON("mythaak_workers", null) || REAL_WORKERS.slice();
// corrupted storage (not an array) -> reset to real team instead of crashing blank
if (!Array.isArray(workers)) workers = REAL_WORKERS.slice();
workers = workers.filter(w => w && typeof w === "object" && w.id && w.name);
// migration: replace demo workers with real ones from Excel
if (workers.length === 6 && workers[0] && workers[0].name === "Yassine El Fassi") {
  workers = REAL_WORKERS.slice();
}
// delete KHADIJA (requested) + hide OBAMA (requested) + add HASSAN if missing
workers = workers.filter(w => !String(w.name||"").toUpperCase().includes("KHADIJA"));
workers.forEach(w => { if (String(w.name||"").toUpperCase().includes("OBAMA")) w.hidden = true; });
if (!workers.some(w => String(w.name||"").toUpperCase() === "HASSAN")) {
  workers.push({ id: "w-hassan", name: "HASSAN", role: "Pompiste", phone: "" });
}
function visibleWorkers() { return workers.filter(w => !w.hidden); }
try { localStorage.setItem("mythaak_workers", JSON.stringify(workers)); } catch(e) {}
// night team override per week (manual fix, priority over auto-detection)
let nightOverride = loadJSON("mythaak_night", {});
function getNightTeam(vis) {
  const saved = nightOverride[weekKey()];
  if (saved && saved.length === 2) {
    const ids = saved.filter(id => vis.some(w => w.id === id));
    if (ids.length === 2) return ids;
  }
  return null;
}
function setNightTeam(id1, id2) {
  nightOverride[weekKey()] = [id1, id2];
  localStorage.setItem("mythaak_night", JSON.stringify(nightOverride));
}
let planning = loadJSON("mythaak_planning", {});
if (!planning || typeof planning !== "object" || Array.isArray(planning)) planning = {};
if (!congeOverride || typeof congeOverride !== "object" || Array.isArray(congeOverride)) congeOverride = {};
if (!nightOverride || typeof nightOverride !== "object" || Array.isArray(nightOverride)) nightOverride = {};
function resetTeam() {
  workers = REAL_WORKERS.map(w => ({ id: w.id, name: w.name, role: w.role, phone: w.phone || "" }));
  save();
  render();
}
let currentMonday = getMonday(new Date());
let editingWorkerId = null;
let shiftTarget = null;

const $ = (id) => document.getElementById(id);

// ---------- Dates ----------
function getMonday(d) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0,0,0,0);
  return x;
}
function weekKey() {
  return currentMonday.toISOString().slice(0,10);
}
function weekDays() {
  return Array.from({length:7}, (_,i) => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate()+i);
    return d;
  });
}
function save() {
  localStorage.setItem("mythaak_workers", JSON.stringify(workers));
  localStorage.setItem("mythaak_planning", JSON.stringify(planning));
  localStorage.setItem("mythaak_lang", lang);
}
function getCell(workerId, dayIdx) {
  const k = weekKey() + "|" + workerId + "|" + dayIdx;
  return planning[k] || "vide";
}
function setCell(workerId, dayIdx, val) {
  const k = weekKey() + "|" + workerId + "|" + dayIdx;
  planning[k] = val;
  save(); render();
}

// ---------- Language ----------
function applyLang() {
  document.body.classList.toggle("rtl", lang === "ar");
  document.documentElement.lang = lang === "ar" ? "ar" : "fr";
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-fr]").forEach(el => {
    el.textContent = lang === "ar" ? el.getAttribute("data-ar") : el.getAttribute("data-fr");
  });
  document.querySelectorAll("[data-fr-ph]").forEach(el => {
    el.placeholder = lang === "ar" ? el.getAttribute("data-ar-ph") : el.getAttribute("data-fr-ph");
  });
  $("btnFR").classList.toggle("active", lang === "fr");
  $("btnAR").classList.toggle("active", lang === "ar");
  render();
}

// ---------- Render (TRANSPOSED: days in rows, workers in columns) ----------
function render() {
  const days = weekDays();
  const todayStr = new Date().toDateString();
  const query = ($("searchInput").value || "").toLowerCase();

  const dayNames = lang === "ar" ? DAYS_AR : DAYS_FR;
  const hiddenCount = workers.filter(w => w.hidden).length;
  const list = workers.filter(w => !w.hidden && w.name.toLowerCase().includes(query));
  // hidden banner
  let banner = $("hiddenBanner");
  if (hiddenCount > 0) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "hiddenBanner";
      banner.className = "hidden-banner";
      var twrap = document.querySelector("#viewPlanning .table-wrap") || document.querySelector(".table-wrap");
      if (twrap && twrap.parentNode) twrap.parentNode.insertBefore(banner, twrap);
      else { var cont = document.querySelector(".container"); if (cont) cont.appendChild(banner); }
    }
    banner.style.display = "flex";
    banner.innerHTML = "<span>🙈 " + hiddenCount + " " + (lang==="ar"?"مخفي (منهم OBAMA)":"caché(s) dont OBAMA") + "</span>";
    const btn = document.createElement("button");
    btn.className = "btn soft";
    btn.style.padding = "6px 12px";
    btn.textContent = lang==="ar" ? "إظهار الكل" : "Tout afficher";
    btn.onclick = () => { workers.forEach(w => w.hidden = false); save(); render(); };
    banner.appendChild(btn);
  } else if (banner) banner.style.display = "none";

  // Week label
  const fmt = (d) => d.toLocaleDateString(lang==="ar"?"ar-MA":"fr-FR",{day:"numeric",month:"long",year:"numeric"});
  $("weekLabel").textContent = (lang==="ar"?"أسبوع ":"Semaine du ") + fmt(days[0]);
  $("weekRange").textContent = fmt(days[0]) + "  →  " + fmt(days[6]);

  // Header: first col = days, then one column per worker
  const headRow = $("headRow");
  headRow.innerHTML = "";
  const th0 = document.createElement("th");
  th0.className = "corner-col";
  th0.textContent = lang === "ar" ? "📅 أيام الأسبوع" : "📅 Jours";
  headRow.appendChild(th0);
  list.forEach((w, wi) => {
    const th = document.createElement("th");
    th.className = "worker-col";
    const initials = w.name.trim().split(/\s+/).map(s=>s[0]).slice(0,2).join("").toUpperCase();
    const col = AVATAR_COLORS[workers.indexOf(w) % AVATAR_COLORS.length];
    th.innerHTML =
      "<div class='worker-head'><span class='avatar' style='background:"+col+"'>"+initials+"</span>" +
      "<strong>"+escapeHtml(w.name)+"</strong>" +
      "<small>"+escapeHtml(w.role)+"</small>" +
      "<div class='worker-actions'><button data-edit='"+w.id+"' title='Modifier'>✏️</button>" +
      "<button data-hide='"+w.id+"' title='Masquer'>🙈</button>" +
      "<button data-congeweek='"+w.id+"' title='Congé toute la semaine'>🏖️</button>" +
      "<button data-del='"+w.id+"' title='Supprimer'>❌</button></div></div>";
    headRow.appendChild(th);
  });

  // Body: 7 rows (one per day)
  const tbody = $("bodyRows");
  tbody.innerHTML = "";
  $("emptyState").classList.toggle("hidden", list.length > 0);

  days.forEach((dateObj, d) => {
    const tr = document.createElement("tr");
    const isToday = dateObj.toDateString() === todayStr;
    if (isToday) tr.classList.add("today-row");
    // day cell (first column)
    const tdD = document.createElement("td");
    tdD.className = "day-cell" + (isToday ? " today" : "");
    tdD.innerHTML = "<strong>" + dayNames[d] + "</strong><small>" +
      dateObj.toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {day:"2-digit",month:"2-digit"}) +
      (isToday ? (lang==="ar"?" • اليوم":" • Auj.") : "") + "</small>";
    tr.appendChild(tdD);
    // one cell per worker
    list.forEach((w) => {
      const v = getCell(w.id, d);
      const td = document.createElement("td");
      const b = document.createElement("button");
      b.className = "cell-btn " + v;
      b.innerHTML = (SHIFTS[v][lang] || v) + (SHIFTS[v].sub ? "<small>"+SHIFTS[v].sub+"</small>" : "");
      b.onclick = () => openShiftModal(w.id, d);
      td.appendChild(b);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  // Buttons edit/hide/del (now in header)
  headRow.querySelectorAll("[data-edit]").forEach(b => b.onclick = (e) => { e.stopPropagation(); openWorkerModal(b.getAttribute("data-edit")); });
  headRow.querySelectorAll("[data-hide]").forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    const w = workers.find(x=>x.id===b.getAttribute("data-hide"));
    w.hidden = true; save(); render();
  });
  headRow.querySelectorAll("[data-congeweek]").forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    const w = workers.find(x=>x.id===b.getAttribute("data-congeweek"));
    if (confirm((lang==="ar"?"كونجي سيمانة كاملة لـ "+w.name+" ؟":"Congé toute la semaine pour "+w.name+" ?"))) {
      for (let d = 0; d < 7; d++) planning[weekKey()+"|"+w.id+"|"+d] = "conge";
      save(); render();
    }
  });
  // congé select (LISTE CONGÉ order)
  const vis = visibleWorkers();
  const cs = $("congeSel");
  if (cs) {
    const saved = congeOverride[weekKey()];
    cs.innerHTML = "";
    const auto = document.createElement("option");
    auto.value = ""; auto.textContent = lang==="ar" ? "تلقائي" : "Auto";
    cs.appendChild(auto);
    const none = document.createElement("option");
    none.value = "NONE"; none.textContent = "—";
    cs.appendChild(none);
    CONGE_ORDER.forEach(nm => {
      const w = workers.find(x => x.name.toUpperCase() === nm && !x.hidden);
      if (!w) return;
      const o = document.createElement("option");
      o.value = w.id; o.textContent = w.name;
      cs.appendChild(o);
    });
    cs.value = (saved !== undefined && saved !== null) ? saved : "";
    if (![...cs.options].some(o => o.value === cs.value)) cs.value = "";
  }
  // night team selects
  const s1 = $("nuitSel1"), s2 = $("nuitSel2");
  if (s1 && s2) {
    const cur = getNightTeam(vis) || [];
    [s1, s2].forEach((s, idx) => {
      const oldVal = s.value;
      s.innerHTML = "";
      vis.forEach(w => {
        const o = document.createElement("option");
        o.value = w.id; o.textContent = w.name;
        s.appendChild(o);
      });
      // default: current override, else official pair cycle for this week
      const byN = {};
      vis.forEach(w => byN[w.name.toUpperCase()] = w.id);
      const cyc = nightPairFor(currentMonday).map(nm => byN[nm]).filter(Boolean);
      const want = cur[idx] || cyc[idx] || (idx === 0 ? "w-yassine" : "w-jamal");
      s.value = vis.some(w => w.id === want) ? want : (vis[idx] ? vis[idx].id : "");
      if (!s.value && oldVal && vis.some(w => w.id === oldVal)) s.value = oldVal;
    });
  }
  headRow.querySelectorAll("[data-del]").forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    const id = b.getAttribute("data-del");
    const w = workers.find(x=>x.id===id);
    if (confirm((lang==="ar"?"حذف "+w.name+" ؟":"Supprimer "+w.name+" ?"))) {
      workers = workers.filter(x=>x.id!==id);
      save(); render();
    }
  });

  updateStats(list);
}

function updateStats(list) {
  $("statTotal").textContent = visibleWorkers().length;
  const todayIdx = (new Date().getDay()+6)%7;
  const isThisWeek = weekKey() === getMonday(new Date()).toISOString().slice(0,10);
  let present=0, repos=0, abs=0;
  if (isThisWeek) {
    list.forEach(w => {
      const v = getCell(w.id, todayIdx);
      if (WORK_SHIFTS.includes(v)) present++;
      if (v==="repos") repos++;
      if (v==="absence"||v==="conge"||v==="maladie") abs++;
    });
  } else {
    // stats for whole week
    list.forEach(w => {
      for (let d=0;d<7;d++){
        const v=getCell(w.id,d);
        if(v==="repos") repos++;
        if(v==="absence"||v==="conge"||v==="maladie") abs++;
        if(WORK_SHIFTS.includes(v)) present++;
      }
    });
  }
  $("statPresent").textContent = present;
  $("statRepos").textContent = repos;
  $("statAbs").textContent = abs;
  if ($("viewNouba") && $("viewNouba").style.display !== "none") renderNouba();
}

// ---------- Nouba page v2: under each post, the names day by day (rotation log) ----------
// Columns = posts, rows = days (most recent first). Built from Excel + planning history.
// Date range (from-to) lets you look back before 15 days.
const NOUBA_POSTS = ['melange','p12','p34','p56','service12','service8','service','nuit'];
const NOUBA_LABEL = { p12:'P1/2', p34:'P3/4', p56:'P5/6', melange:'MELANGE', service12:'SERV 12', service8:'SERV 8', service:'SERVICE', nuit:'NUIT' };
let noubaFrom = null, noubaTo = null; // Date objects (local midnight)
function isoDate(d) {
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}
function noubaDefRange() {
  const to = new Date(); to.setHours(0,0,0,0);
  const from = new Date(to); from.setDate(from.getDate() - 14); // 15 days
  return { from: from, to: to };
}
function renderNouba() {
  const head = $("noubaHead"), body = $("noubaBody");
  if (!head || !body) return;
  if (!noubaFrom || !noubaTo) {
    const r = noubaDefRange();
    noubaFrom = r.from; noubaTo = r.to;
  }
  if (noubaFrom > noubaTo) { const t = noubaFrom; noubaFrom = noubaTo; noubaTo = t; }
  if ((noubaTo - noubaFrom) / 86400000 > 62) {
    noubaTo = new Date(noubaFrom); noubaTo.setDate(noubaTo.getDate() + 61); // cap 62 days
  }
  const fIn = $("noubaFrom"), tIn = $("noubaTo");
  if (fIn) fIn.value = isoDate(noubaFrom);
  if (tIn) tIn.value = isoDate(noubaTo);
  const byName = {};
  workers.forEach(w => byName[w.id] = w.name);
  // dateISO -> post -> [names]
  const grid = {};
  const fT = noubaFrom.getTime(), tT = noubaTo.getTime();
  Object.keys(planning).forEach(k => {
    const parts = String(k).split('|');
    if (parts.length !== 3) return;
    const v = planning[k];
    if (!NOUBA_POSTS.includes(v)) return;
    const m = new Date(parts[0] + 'T12:00:00');
    if (isNaN(m)) return;
    if (m.getDay() === 0) m.setDate(m.getDate() + 1); // Sunday-shifted week keys -> Monday
    m.setDate(m.getDate() + (parseInt(parts[2], 10) || 0));
    m.setHours(0,0,0,0);
    const t = m.getTime();
    if (t < fT || t > tT) return;
    const dk = isoDate(m);
    if (!grid[dk]) grid[dk] = {};
    if (!grid[dk][v]) grid[dk][v] = [];
    const nm = byName[parts[1]] || "?";
    if (!grid[dk][v].includes(nm)) grid[dk][v].push(nm);
  });
  const dayNames = lang === "ar"
    ? ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"]
    : ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  head.innerHTML = "<th>" + (lang === "ar" ? "📅 اليوم" : "📅 Jour") + "</th>" +
    NOUBA_POSTS.map(p => "<th>" + NOUBA_LABEL[p] + "</th>").join("");
  body.innerHTML = "";
  const todayS = isoDate(new Date());
  for (let d = new Date(noubaTo); d >= noubaFrom; d.setDate(d.getDate() - 1)) {
    const dk = isoDate(d);
    const tr = document.createElement("tr");
    if (dk === todayS) tr.classList.add("today-row");
    let html = "<td class='nw-day'><strong>" + dayNames[d.getDay()] + "</strong><small>" +
      d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + "</small></td>";
    NOUBA_POSTS.forEach(p => {
      const arr = (grid[dk] && grid[dk][p]) || [];
      if (!arr.length) html += "<td class='nw-empty'>—</td>";
      else html += "<td class='nw-cell'>" + arr.map(escapeHtml).join("<br>") + "</td>";
    });
    tr.innerHTML = html;
    body.appendChild(tr);
  }
}
function showView(v) {
  $("viewPlanning").style.display = v === "planning" ? "" : "none";
  $("viewNouba").style.display = v === "nouba" ? "" : "none";
  $("tabPlanning").classList.toggle("active", v === "planning");
  $("tabNouba").classList.toggle("active", v === "nouba");
  if (v === "nouba") renderNouba();
}

function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }

// ---------- Worker modal ----------
function openWorkerModal(id=null) {
  editingWorkerId = id;
  $("workerModal").classList.remove("hidden");
  if (id) {
    const w = workers.find(x=>x.id===id);
    $("wName").value = w.name; $("wRole").value = w.role; $("wPhone").value = w.phone||"";
    $("workerModalTitle").textContent = lang==="ar"?"تعديل عامل":"Modifier l'ouvrier";
  } else {
    $("wName").value=""; $("wPhone").value=""; $("wRole").value="Pompiste";
    $("workerModalTitle").textContent = lang==="ar"?"زيادة عامل":"Ajouter un ouvrier";
  }
  setTimeout(()=>$("wName").focus(),50);
}

// ---------- Shift modal ----------
function openShiftModal(workerId, dayIdx) {
  shiftTarget = { workerId, dayIdx };
  const w = workers.find(x=>x.id===workerId);
  const dayNames = lang==="ar"?DAYS_AR:DAYS_FR;
  $("shiftTitle").textContent = w.name + " — " + dayNames[dayIdx];
  const g = $("shiftGrid");
  g.innerHTML = "";
  Object.keys(SHIFTS).forEach(k => {
    if (k==="vide") return;
    const b = document.createElement("button");
    b.className = "shift-opt";
    b.style.background = SHIFTS[k].color;
    b.innerHTML = SHIFTS[k][lang] + "<small>"+SHIFTS[k].sub+"</small>";
    b.onclick = () => { setCell(workerId, dayIdx, k); $("shiftModal").classList.add("hidden"); };
    g.appendChild(b);
  });
  // clear button
  const c = document.createElement("button");
  c.className = "shift-opt"; c.style.background = "#94a3b8";
  c.style.gridColumn = "1 / -1";
  c.textContent = lang==="ar"?"🗑️ مسح الخانة":"🗑️ Effacer la case";
  c.onclick = () => { setCell(workerId, dayIdx, "vide"); $("shiftModal").classList.add("hidden"); };
  g.appendChild(c);
  $("shiftModal").classList.remove("hidden");
}

// ---------- Auto distribution SMART v8 (coverage rules = FIXED law, Excel-verified) ----------
//  - Whoever exits night duty restarts days with: MELANGE -> SERVICE 8 -> pump -> SERVICE 12
//    (pump = personal rotation p12 -> p34 -> p56). Rest days pause it. Congé = exception.
//  - Coverage: pumps P1/2+P3/4+P5/6 ALWAYS filled; + MELANGE Mon-Sat (empty Sunday,
//    dropped first if short staff). SERVICE 8 never Sat/Sun.
//  - Fill priority: pumps+S12, then Mon-Fri [S8,M,S] / Sat [M,S] / Sun [S].
//    SERVICE dropped entirely on days with anyone on congé. 2nd daily repos slot
//    reserved so no one misses repos all week (e.g. ISSAM).
//  - Night pair (5-week cycle): Mon-Fri BOTH nuit.
//    Sat: pair both + NEXT w1 (3 nuits); NEXT w2 repos.
//    Sun: old w2 + NEXT pair both (3 nuits); old w1 repos.
//    NEXT w1 repos Friday. First day back = repos Monday (unless Sunday was repos).
//  - Night + next teams + returners excluded from staggered repos; day workers max 1 repos/week.
//  - Congé override/streak + dated leaves respected. Posts never repeat yesterday
//    (3rd-day repeat OK); order: repos -> MELANGE -> SERV12 -> pumps -> SERV8 -> SERVICE.
function cellAt(date, workerId) {
  const m = getMonday(date);
  const k = m.toISOString().slice(0,10) + "|" + workerId + "|" + ((date.getDay()+6)%7);
  return planning[k] || "vide";
}
function autoDistribute() {
  const vis = visibleWorkers();
  if (vis.length === 0) { alert(lang==="ar"?"زيد العمال أولا":"Ajoutez des ouvriers d'abord"); return; }
  if (!confirm(lang==="ar"?"توزيع تلقائي ذكي مثل نظام الإكسل؟ غادي يعمر الخانات الفارغة فقط.":"Distribution auto intelligente (style Excel) ? Seules les cases vides seront remplies.")) return;
  const n = vis.length;
  const weekIdx = Math.floor(currentMonday.getTime() / (7*24*3600*1000));
  const rot = weekIdx % DAY_POSTS.length;
  const sundayBefore = new Date(currentMonday); sundayBefore.setDate(sundayBefore.getDate()-1);
  const saturdayBefore = new Date(currentMonday); saturdayBefore.setDate(saturdayBefore.getDate()-2);

  // dated leaves (10-day conge rotation, Excel Aug-Oct + user: JAMAL back 3/11):
  // HASSAN Oct 13-22, JAMAL Oct 23-Nov 1, YOUSSEF Nov 2-11, FETAH Nov 12-21, AHMED Nov 22-Dec 1
  const LEAVES = [
    { name: "HASSAN", from: [2026,9,13], to: [2026,9,22], type: "conge" },
    { name: "JAMAL", from: [2026,9,23], to: [2026,9,25], type: "conge" },
    { name: "JAMAL", from: [2026,9,26], to: [2026,10,1], type: "conge" },
    { name: "YOUSSEF", from: [2026,10,2], to: [2026,10,11], type: "conge" },
    { name: "FETAH", from: [2026,10,12], to: [2026,10,21], type: "conge" },
    { name: "AHMED", from: [2026,10,22], to: [2026,11,1], type: "conge" },
  ];
  // dated one-off assignments (explicit user instructions, applied first on vide cells):
  // ISSAM: SERVICE Tue Oct 27, repos Wed Oct 28 + Thu Oct 29.
  // MELANGE turns (nuba): Wed Oct 28 = YASSINE, Thu Oct 29 = AHMED,
  // Fri Oct 30 = HASSAN, Sat Oct 31 = ISSAM.
  // SERVICE 12 turn: Mon Oct 26 = KHALID (before YASSINE).
  const DATED = [
    { name: "KHALID", date: [2026,9,26], type: "service12" },
    { name: "ISSAM", date: [2026,9,27], type: "service" },
    { name: "ISSAM", date: [2026,9,28], type: "repos" },
    { name: "ISSAM", date: [2026,9,29], type: "repos" },
    { name: "YASSINE", date: [2026,9,28], type: "melange" },
    { name: "AHMED", date: [2026,9,29], type: "melange" },
    { name: "HASSAN", date: [2026,9,30], type: "melange" },
    { name: "ISSAM", date: [2026,9,31], type: "melange" },
  ];
  const datedFor = (workerName, dayDate) => {
    for (const x of DATED) {
      if (String(workerName||"").toUpperCase() !== x.name) continue;
      const dd = new Date(x.date[0], x.date[1], x.date[2]);
      if (dd.getFullYear() === dayDate.getFullYear() &&
          dd.getMonth() === dayDate.getMonth() &&
          dd.getDate() === dayDate.getDate()) return x.type;
    }
    return null;
  };
  const leaveFor = (workerName, dayDate) => {
    const t = dayDate.getTime();
    for (const L of LEAVES) {
      if (String(workerName||"").toUpperCase() !== L.name) continue;
      const f = new Date(L.from[0], L.from[1], L.from[2]).getTime();
      const e = new Date(L.to[0], L.to[1], L.to[2], 23, 59).getTime();
      if (t >= f && t <= e) return L.type;
    }
    return null;
  };
  // 0) congé: manual override first, else continuation (worker on congé Sat+Sun stays congé)
  let congeWeek = getCongeWeek(vis);
  if (!congeWeek) {
    congeWeek = new Set();
    vis.forEach(w => {
      const a = cellAt(saturdayBefore, w.id), b = cellAt(sundayBefore, w.id);
      if ((a === "conge" && b === "conge") || (b === "conge" && a === "vide" && daysSince(w.id, "conge", currentMonday) >= 6)) congeWeek.add(w.id);
    });
  }
  // days between refDate and last <val> (first hit scanning back counts)
  function daysSince(workerId, val, refDate) {
    const ref = refDate || currentMonday;
    for (let back = 1; back <= 14; back++) {
      const dt = new Date(ref); dt.setDate(dt.getDate()-back);
      if (cellAt(dt, workerId) === val) return back;
    }
    return 99;
  }
  // night team = manual override first, else official 5-week pair cycle (LISTE NUIT)
  const pairNames = nightPairFor(currentMonday);
  const byName = {};
  vis.forEach(w => byName[w.name.toUpperCase()] = w.id);
  let nightTeam = getNightTeam(vis) || pairNames.map(nm => byName[nm]).filter(Boolean);
  if (nightTeam.length !== 2) {
    const fb = vis.filter(w => cellAt(sundayBefore, w.id) === "nuit").map(w => w.id);
    if (fb.length === 2) nightTeam = fb;
  }
  if (nightTeam.length !== 2) {
    // fallback: 2 workers with most NUIT last week continue, else epoch rotation
    const counts = vis.map(w => {
      let c = 0;
      for (let back = 1; back <= 7; back++) {
        const dt = new Date(currentMonday); dt.setDate(dt.getDate()-back);
        if (cellAt(dt, w.id) === "nuit") c++;
      }
      return {id: w.id, c};
    }).sort((a,b) => b.c - a.c);
    if (counts[0].c > 0 && counts[1].c > 0) nightTeam = [counts[0].id, counts[1].id];
    else nightTeam = [ vis[weekIdx % n].id, vis[(weekIdx + 3) % n].id ];
  }
  // NIGHT TRANSITION SYSTEM (proven by user's filled Excel Oct 12-18 + Aug history):
  // Mon-Fri: pair both nuit. Sat: pair both + NEXT w1 (3 nuits); NEXT w2 repos.
  // Sun: old w2 + NEXT pair both (3 nuits); old w1 repos. NEXT w1 repos Friday.
  // Only fills vide cells, never overwrites manual.
  const nightSet = new Set(nightTeam);
  const w1 = nightTeam[0], w2 = nightTeam[1];
  // next week's night pair (transition overlap Sat/Sun).
  // e.g. FETAH+KAMAL join Sat Oct 17 + Sun Oct 18, start nights Mon Oct 19.
  const nextMondayD = new Date(currentMonday); nextMondayD.setDate(nextMondayD.getDate() + 7);
  const nextKey = nextMondayD.toISOString().slice(0,10);
  let nextTeam = [];
  {
    const sn = nightOverride[nextKey];
    let t = (sn && sn.length === 2) ? sn.filter(id => vis.some(w => w.id === id)) : null;
    if (!t || t.length !== 2) {
      const byN3 = {};
      vis.forEach(w => byN3[w.name.toUpperCase()] = w.id);
      t = nightPairFor(nextMondayD).map(nm => byN3[nm]).filter(Boolean);
    }
    if (t.length === 2) nextTeam = t;
  }
  const nextSet = new Set(nextTeam);
  const hasReposThisWeek = (id) => {
    for (let dd = 0; dd < 7; dd++) { if (getCell(id, dd) === "repos") return true; }
    return false;
  };
  // preferred fixed rest weekday (observed: YASSINE rests Sundays Oct 4/18/25, except on night duty)
  const PREF_REST = { YASSINE: 6 };
  Object.keys(PREF_REST).forEach(nm => {
    const w = vis.find(x => x.name.toUpperCase() === nm);
    if (!w) return;
    const dd = PREF_REST[nm];
    if (nightSet.has(w.id) || nextSet.has(w.id) || congeWeek.has(w.id)) return;
    if (getCell(w.id, dd) === "vide") setCellSilent(w.id, dd, "repos");
  });
  // returners: last decisive event was NUIT (post-night sequence) or a CONGÉ block
  // of 2+ days (post-congé restart, e.g. KHALID Oct 13, HASSAN Oct 23 after 10d leave).
  // Both restart days with MELANGE -> SERVICE 8 -> pump -> SERVICE 12.
  // Rest days don't break the chain. LEAVE blocks count even if not generated yet.
  const seqPos = {};
  const seqKind = {}; // 'night' outranks 'conge' when both want the same post (e.g. KAMAL vs HASSAN Tue Oct 27)
  vis.forEach(w => {
    seqPos[w.id] = null;
    if (nightSet.has(w.id) || nextSet.has(w.id)) return;
    let conge_n = 0;
    for (let back = 1; back <= 14; back++) {
      const dt = new Date(currentMonday); dt.setDate(dt.getDate() - back);
      let v = cellAt(dt, w.id);
      if (v === 'vide' && leaveFor(w.name, dt) === 'conge') v = 'conge';
      if (v === 'vide') continue;
      if (v === 'repos' || v === 'maladie') continue;
      if (v === 'conge' || v === 'absence') { conge_n++; continue; }
      if (v === 'nuit') { seqPos[w.id] = 0; seqKind[w.id] = 'night'; return; }
      if (conge_n >= 2) { seqPos[w.id] = 0; seqKind[w.id] = 'conge'; }
      return;
    }
    if (conge_n >= 2) { seqPos[w.id] = 0; seqKind[w.id] = 'conge'; }
  });
  function nextPump(workerId) {
    for (let back = 1; back <= 150; back++) {
      const dt = new Date(currentMonday); dt.setDate(dt.getDate() - back);
      const v = cellAt(dt, workerId);
      if (PUMP_CYCLE.includes(v)) return PUMP_CYCLE[(PUMP_CYCLE.indexOf(v)+1) % 3];
    }
    return 'p12';
  }

  for (let d = 0; d < 7; d++) {
    // dated leaves + one-off dated assignments first (e.g. HASSAN from Tue Oct 13)
    const dayDate = new Date(currentMonday); dayDate.setDate(dayDate.getDate() + d);
    vis.forEach(w => {
      const lv = leaveFor(w.name, dayDate);
      if (lv && getCell(w.id, d) === "vide") setCellSilent(w.id, d, lv);
      // NOTE: never add leaves to congeWeek (it poisoned the rest of the week,
      // e.g. HASSAN stayed congé after Oct 22). Day guards use congeT below.
      const dv = datedFor(w.name, dayDate);
      if (dv && getCell(w.id, d) === "vide") setCellSilent(w.id, d, dv);
    });
    // congé first
    congeWeek.forEach(id => { if (getCell(id, d) === "vide") setCellSilent(id, d, "conge"); });
    // today's congé snapshot (week-level + leaves + dated/manual cells) for all day guards
    const congeT = new Set(vis.filter(w => getCell(w.id, d) === 'conge').map(w => w.id));
    // first day back = repos Monday, unless Sunday was repos (then work).
    // e.g. KHALID Mon Oct 12, JAMAL Mon Oct 19, KAMAL Mon Oct 26.
    if (d === 0) {
      vis.forEach(w => {
        if (seqPos[w.id] !== 0) return;
        if (nightSet.has(w.id) || nextSet.has(w.id) || congeT.has(w.id)) return;
        if (getCell(w.id, 0) !== 'vide') return;
        if (cellAt(sundayBefore, w.id) === 'repos') return;
        setCellSilent(w.id, 0, 'repos');
      });
    }
    // 1) NUIT transition system (only fills vide cells, never overwrites manual entries)
    const nightFill = (id, val) => {
      if (!id || congeT.has(id)) return;
      if (getCell(id, d) === "vide") setCellSilent(id, d, val);
    };
    if (d <= 4) { // Mon-Fri: pair both nuit; NEXT w1 repos Friday
      nightFill(w1, "nuit"); nightFill(w2, "nuit");
      if (d === 4 && nextTeam[0] && !nightSet.has(nextTeam[0])) nightFill(nextTeam[0], "repos");
    } else if (d === 5) { // Sat: pair both + NEXT w1 (3 nuits); NEXT w2 repos
      nightFill(w1, "nuit"); nightFill(w2, "nuit");
      if (nextTeam[0] && !nightSet.has(nextTeam[0])) nightFill(nextTeam[0], "nuit");
      if (nextTeam[1] && !nightSet.has(nextTeam[1])) nightFill(nextTeam[1], "repos");
    } else { // Sun: old w2 + NEXT pair both (3 nuits); old w1 repos
      nightFill(w1, "repos");
      nightFill(w2, "nuit");
      nextTeam.forEach(id => { if (!nightSet.has(id)) nightFill(id, "nuit"); });
    }
    let nuitAssigned = vis.filter(w => getCell(w.id, d) === "nuit").map(w=>w.id);
    const need = (d <= 4) ? 2 : 3;
    if (nuitAssigned.length < need) {
      const prevNuit = d > 0 ? vis.filter(w => getCell(w.id, d-1) === "nuit").map(w=>w.id)
                             : vis.filter(w => cellAt(sundayBefore, w.id) === "nuit").map(w=>w.id);
      const candidates = vis.filter(w => getCell(w.id, d) === "vide" && !congeT.has(w.id));
      candidates.sort((a,b) => {
        const sa = (nightSet.has(a.id)||nextSet.has(a.id)?0:1) + (prevNuit.includes(a.id)?1:0);
        const sb = (nightSet.has(b.id)||nextSet.has(b.id)?0:1) + (prevNuit.includes(b.id)?1:0);
        return sb - sa;
      });
      for (const c of candidates) {
        if (nuitAssigned.length >= need) break;
        setCellSilent(c.id, d, "nuit"); nuitAssigned.push(c.id);
      }
    }
    // 2) repos staggered for DAY workers only (night + next teams + returners excluded).
    // A worker rests their stagger day only if 5+ days since last repos (kills stray
    // repos like AHMED-Thu). 2nd daily slot reserved so no one misses repos all week.
    const refD = new Date(currentMonday); refD.setDate(refD.getDate() + d);
    let reposToday = vis.filter(w => getCell(w.id, d) === "repos").length;
    vis.forEach((w, wi) => {
      if (getCell(w.id, d) !== "vide") return;
      if (congeT.has(w.id)) return;
      if (nightSet.has(w.id)) return;
      if (nextSet.has(w.id)) return; // fixed rests: w1 Friday, w2 Saturday
      if (seqPos[w.id] !== null && seqPos[w.id] < 4) return; // returner week is scripted
      if (reposToday >= 2) return;
      if (hasReposThisWeek(w.id)) return;
      if (d !== ((wi + weekIdx) % 7)) return;
      if (daysSince(w.id, 'repos', refD) < 5) return;
      setCellSilent(w.id, d, "repos"); reposToday++;
    });
    if (reposToday === 0) {
      // nobody rests today: longest-resting worker takes it (needs real imported history)
      let best = null, bestGap = -1;
      vis.forEach(w => {
        if (getCell(w.id, d) !== "vide") return;
        if (congeT.has(w.id) || nightSet.has(w.id) || nextSet.has(w.id)) return;
        if (hasReposThisWeek(w.id)) return;
        const g = daysSince(w.id, "repos", refD);
        if (g >= 7 && g < 99 && g > bestGap) { best = w; bestGap = g; }
      });
      if (best) { setCellSilent(best.id, d, "repos"); reposToday++; }
    }
    // 3) Day posts with coverage rules (user's system, verified in Excel):
    // - MANDATORY every day: P1/2, P3/4, P5/6 + SERVICE 12 (like pumps, never dropped).
    // - MELANGE Mon-Sat (empty Sunday, dropped first if short staff).
    // - SERVICE 8 never Sat/Sun. SERVICE last.
    // Fill priority: pumps+S12, then Mon-Fri [S8,M,S] / Sat [M,S] / Sun [S].
    const FILL_BASE = (d <= 4)
      ? ['p12','p34','p56','service12','service8','melange','service']
      : (d === 5 ? ['p12','p34','p56','service12','melange','service']
                 : ['p12','p34','p56','service12','service']);
    // no SERVICE at all when someone is on congé that day (user rule)
    const anyCongeToday = vis.some(w => getCell(w.id, d) === 'conge');
    const FILL = anyCongeToday ? FILL_BASE.filter(p => p !== 'service') : FILL_BASE;
    const used = new Set();
    vis.forEach(w => { const v = getCell(w.id, d); if (DAY_POSTS.includes(v)) used.add(v); });
    const yesterdayOf = (w) => (d > 0 ? getCell(w.id, d-1) : cellAt(sundayBefore, w.id));
    // returners first (fixed post-night sequence, respecting day rules).
    // Night-returners before congé-returners on conflicts.
    vis.filter(w => getCell(w.id, d) === "vide" && seqPos[w.id] !== null && seqPos[w.id] < 4)
       .sort((a, b) => ((seqKind[a.id] === 'night') ? 0 : 1) - ((seqKind[b.id] === 'night') ? 0 : 1))
       .forEach(w => {
      let want = SEQ_RETURN[seqPos[w.id]];
      if (want === 'PUMP') want = nextPump(w.id);
      if (!FILL.includes(want) || used.has(want) || yesterdayOf(w) === want) return;
      setCellSilent(w.id, d, want);
      used.add(want);
    });
    // fair fill over MISSING posts in FILL priority (rotation offset for fairness).
    // User rule: a worker never repeats YESTERDAY's post, but repeating on the
    // 3rd day is fine. Extra free workers duplicate a post (no worker stays empty);
    // shortage drops from the end (MELANGE first, pumps never).
    const missing = FILL.filter(p => !used.has(p));
    const free = vis.filter(w => getCell(w.id, d) === "vide");
    free.forEach((w, k) => {
      const yesterday = yesterdayOf(w);
      let alt = null;
      for (let t = 0; t < missing.length; t++) {
        const c = missing[(k + d + rot + t) % missing.length];
        if (used.has(c) || c === yesterday) continue;
        alt = c; break;
      }
      if (!alt && missing.length) {
        // last resort: any free post even if repeated yesterday
        for (let t = 0; t < missing.length; t++) {
          const c = missing[(k + d + rot + t) % missing.length];
          if (!used.has(c)) { alt = c; break; }
        }
      }
      if (alt) { setCellSilent(w.id, d, alt); used.add(alt); }
      else {
        const dup = FILL.find(p => p !== yesterday) || FILL[0];
        if (dup) { setCellSilent(w.id, d, dup); used.add(dup); }
      }
    });
    // advance returner sequence on worked days (rest days pause it)
    vis.forEach(w => {
      if (seqPos[w.id] === null || seqPos[w.id] >= 4) return;
      const v = getCell(w.id, d);
      if (v !== 'vide' && v !== 'repos' && v !== 'conge' && v !== 'absence' && v !== 'maladie' && v !== 'nuit') seqPos[w.id]++;
    });
  }
  save(); render();
}

// ---------- Import Excel (PLANNINGE.xlsx + nos propres exports modifiables) ----------
function normExcel(v) {
  if (v === null || v === undefined) return "vide";
  let t = String(v).trim().toLowerCase();
  if (!t || t === "-" || t === "—" || t === "–" || t === "vide" || t === "فارغ" || t === "▫️") return "vide";
  // ordre important : service12 / service8 avant service
  if (t.includes("service 12") || t.includes("service12") || t.includes("serv12") || t.includes("serv 12")) return "service12";
  if (t.includes("service 8") || t.includes("service8") || t.includes("serv8") || t.includes("serv 8")) return "service8";
  if (t.includes("p1") || t.includes("1/2")) return "p12";
  if (t.includes("p3") || t.includes("3/4")) return "p34";
  if (t.includes("p5") || t.includes("5/6")) return "p56";
  if (t.includes("melang") || t.includes("melange")) return "melange";
  if (t.includes("nuit") || t.includes("ليل")) return "nuit";
  if (t.includes("matin") || t.includes("صباح") || t.includes("06")) return "matin";
  if (t.includes("soir") || t.includes("مساء") || t.includes("14")) return "soir";
  if (t.includes("service") || t.includes("serv")) return "service";
  if (t.includes("repos") || t.includes("raha") || t.includes("راحة") || t.includes("ropo")) return "repos";
  if (t.includes("cong") || t.includes("otla") || t.includes("عطلة") || t === "co" || t === "c") return "conge";
  if (t.includes("abs") || t.includes("غياب") || t === "ab") return "absence";
  if (t.includes("malad") || t.includes("مرض")) return "maladie";
  const s = t.replace(/\s+/g, "");
  const m = {
    "ropo": "repos", "repos": "repos", "nuit": "nuit",
    "co": "conge", "congé": "conge", "conge": "conge",
    "p1/2": "p12", "p3/4": "p34", "p5/6": "p56", "p12": "p12", "p34": "p34", "p56": "p56",
    "melang": "melange", "melange": "melange",
    "serv12": "service12", "service12": "service12",
    "serv8": "service8", "serv": "service", "service": "service", "service8": "service8",
    "ab": "absence", "abs": "absence", "absence": "absence",
    "maladie": "maladie", "": "vide"
  };
  return m[s] !== undefined ? m[s] : "vide";
}
function mondayKey(dt) {
  const x = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day); x.setHours(0,0,0,0);
  return x.toISOString().slice(0,10);
}
async function importExcelFile(file) {
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, {type:"array", cellDates:true});
    let imported = 0, foundWorkers = [];
    const nameToId = {};
    workers.forEach(w => nameToId[w.name.toUpperCase()] = w.id);
    for (const sname of wb.SheetNames) {
      const low = sname.toLowerCase();
      if (low === "nouba" || low === "_meta") continue; // Nouba = calculée, pas à importer
      const ws = wb.Sheets[sname];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
      if (!rows.length) continue;
      // --- Format A : nos exports (Planning semaine / Mois) avec colonne _date cachée ---
      // En-tête : col A = Jour, col B = _date (ISO), col C+ = ouvriers. Blocs semaine répétés pour le mois.
      let isOurs = false;
      for (let r = 0; r < Math.min(rows.length, 6); r++) {
        const a = String((rows[r] || [])[0] || "").toLowerCase();
        const b = String((rows[r] || [])[1] || "").toLowerCase();
        if ((a.includes("jour") || a.includes("اليوم") || a.includes("أيام")) && b.includes("_date")) { isOurs = true; break; }
      }
      if (isOurs) {
        let colWorker = [];
        const cleanName = (h) => String(h || "").split("\n")[0].replace(/\s*\(.*\)\s*$/, "").trim().toUpperCase();
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r]; if (!row) continue;
          const a = String(row[0] || "").toLowerCase();
          const b = String(row[1] || "").toLowerCase();
          if ((a.includes("jour") || a.includes("اليوم") || a.includes("أيام")) && b.includes("_date")) {
            // ligne d'en-tête -> (re)mappe les ouvriers (chaque bloc semaine du mois)
            colWorker = [];
            for (let c = 2; c < row.length; c++) {
              const nm = cleanName(row[c]);
              if (!nm || nm === "UNDEFINED") { colWorker.push(null); continue; }
              if (!nameToId[nm]) {
                const id = "w-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
                workers.push({ id, name: nm, role: "Pompiste", phone: "", hidden: nm.includes("OBAMA") });
                nameToId[nm] = id;
              }
              if (!foundWorkers.includes(nm)) foundWorkers.push(nm);
              colWorker.push(nameToId[nm]);
            }
            continue;
          }
          const iso = String(row[1] || "").trim();
          const mIso = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (!mIso || !colWorker.length) continue;
          const dt = new Date(parseInt(mIso[1], 10), parseInt(mIso[2], 10) - 1, parseInt(mIso[3], 10));
          if (isNaN(dt)) continue;
          const mk = mondayKey(dt);
          const dayIdx = (dt.getDay() + 6) % 7;
          for (let c = 0; c < colWorker.length; c++) {
            const wid = colWorker[c]; if (!wid) continue;
            const raw = row[2 + c];
            if (raw === undefined || raw === null || String(raw).trim() === "") continue; // vide = on ne touche pas
            const v = normExcel(raw);
            if (v === "vide") { delete planning[mk + "|" + wid + "|" + dayIdx]; }
            else { planning[mk + "|" + wid + "|" + dayIdx] = v; imported++; }
          }
        }
        continue;
      }
      if (!low.includes("planning") && !low.includes("mois") && !low.includes("month")) continue;
      if (rows.length < 5) continue;
      const header = rows[2];
      // header row has worker names starting col index 3
      let colWorker = [];
      for (let c = 3; c < header.length; c++) {
        const nm = String(header[c] || "").trim().toUpperCase();
        if (!nm || nm === "UNDEFINED") { colWorker.push(null); continue; }
        if (!nameToId[nm]) {
          const id = "w-" + Date.now() + "-" + nm;
          workers.push({id, name: nm, role: "Pompiste", phone: "", hidden: nm.includes("OBAMA")});
          nameToId[nm] = id;
        }
        if (!foundWorkers.includes(nm)) foundWorkers.push(nm);
        colWorker.push(nameToId[nm]);
      }
      // sheet month guard: filenames like 082026/092026/102026 -> skip rows from another month (date bugs like 2026-01-10)
      const mm = (sname.match(/(0[1-9]|1[0-2])\s*20\d\d/) || [])[1];
      const sheetMonth = mm ? parseInt(mm, 10) : null;
      for (let r = 3; r < rows.length; r += 1) {
        const row = rows[r]; if (!row) continue;
        let dt = row[2];
        if (typeof dt === "string" && /^2026/.test(dt)) dt = new Date(dt);
        if (!(dt instanceof Date) || isNaN(dt)) continue;
        if (dt.getFullYear() !== 2026) continue;
        if (sheetMonth && (dt.getMonth()+1) !== sheetMonth) continue;
        const mk = mondayKey(dt);
        const dayIdx = (dt.getDay() + 6) % 7;
        for (let c = 0; c < colWorker.length; c++) {
          const wid = colWorker[c]; if (!wid) continue;
          const v = normExcel(row[3 + c]);
          if (v && v !== "vide") { planning[mk + "|" + wid + "|" + dayIdx] = v; imported++; }
        }
      }
    }
    save(); render();
    alert((lang==="ar" ? "تم استيراد " + imported + " خانة بنجاح ✅\nالعمال: " + foundWorkers.join(", ") : "Import réussi : " + imported + " cases ✅\nOuvriers : " + foundWorkers.join(", ")));
  } catch(e) { console.error(e); alert("Erreur import: " + e.message); }
}
function setCellSilent(workerId, dayIdx, val) {
  planning[weekKey()+"|"+workerId+"|"+dayIdx] = val;
}

// ---------- Export Excel (.xlsx, cadre + couleurs comme l'app + feuille Nouba) ----------
function hexToArgb(hex) {
  let h = String(hex || "#999999").replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  return "FF" + h.toUpperCase();
}
function fontForBg(hex) {
  const h = String(hex || "#999999").replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16), g = parseInt(full.slice(2, 4), 16), b = parseInt(full.slice(4, 6), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 150 ? "FFFFFFFF" : "FF111827";
}
function thinBorder() {
  const s = { style: "thin", color: { argb: "FF9CA3AF" } };
  return { top: s, left: s, bottom: s, right: s };
}
function buildNoubaGridForExport(from, to) {
  const byName = {};
  workers.forEach(w => byName[w.id] = w.name);
  const grid = {};
  const fT = new Date(from); fT.setHours(0, 0, 0, 0);
  const tT = new Date(to); tT.setHours(0, 0, 0, 0);
  const fMs = fT.getTime(), tMs = tT.getTime();
  Object.keys(planning).forEach(k => {
    const parts = String(k).split("|");
    if (parts.length !== 3) return;
    const v = planning[k];
    if (!NOUBA_POSTS.includes(v)) return;
    const m = new Date(parts[0] + "T12:00:00");
    if (isNaN(m)) return;
    if (m.getDay() === 0) m.setDate(m.getDate() + 1);
    m.setDate(m.getDate() + (parseInt(parts[2], 10) || 0));
    m.setHours(0, 0, 0, 0);
    const t = m.getTime();
    if (t < fMs || t > tMs) return;
    const dk = isoDate(m);
    if (!grid[dk]) grid[dk] = {};
    if (!grid[dk][v]) grid[dk][v] = [];
    const nm = byName[parts[1]] || "?";
    if (!grid[dk][v].includes(nm)) grid[dk][v].push(nm);
  });
  return grid;
}
async function exportExcel() {
  const vis = visibleWorkers();
  if (!vis.length) { alert(lang === "ar" ? "زيد العمال أولا" : "Ajoutez des ouvriers d'abord"); return; }
  const dayNames = lang === "ar" ? DAYS_AR : DAYS_FR;
  const days = weekDays();
  const fmtD = (d) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  const fname = "planning-mythaak-" + weekKey() + ".xlsx";

  // --- Fallback 1: SheetJS sans style (2 feuilles) si ExcelJS non chargé ---
  if (typeof ExcelJS === "undefined") {
    if (typeof XLSX !== "undefined") {
      const wb = XLSX.utils.book_new();
      const head = [(lang === "ar" ? "اليوم / التاريخ" : "Jour / Date"), "_date"].concat(vis.map(w => w.name + " (" + w.role + ")"));
      const aoa1 = [head];
      for (let d = 0; d < 7; d++) {
        const row = [dayNames[d] + " " + fmtD(days[d]), isoDate(days[d])];
        vis.forEach(w => row.push(PLAIN_LABEL[getCell(w.id, d)] || getCell(w.id, d)));
        aoa1.push(row);
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa1), "Planning");
      if (!noubaFrom || !noubaTo) { const r = noubaDefRange(); noubaFrom = r.from; noubaTo = r.to; }
      const grid = buildNoubaGridForExport(noubaFrom, noubaTo);
      const aoa2 = [["Jour"].concat(NOUBA_POSTS.map(p => NOUBA_LABEL[p]))];
      for (let d = new Date(noubaTo); d >= noubaFrom; d.setDate(d.getDate() - 1)) {
        const dk = isoDate(d);
        const row = [d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })];
        NOUBA_POSTS.forEach(p => row.push(((grid[dk] && grid[dk][p]) || []).join(", ") || "—"));
        aoa2.push(row);
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa2), "Nouba");
      XLSX.writeFile(wb, fname);
      return;
    }
    exportCSVFallback();
    return;
  }

  // --- Chemin principal : ExcelJS avec cadre + couleurs ---
  try {
    const btn = $("btnExcel");
    const old = btn ? btn.innerHTML : "";
    if (btn) btn.innerHTML = "⏳...";
    const wb = new ExcelJS.Workbook();
    wb.creator = "Planning MythAAk";
    wb.created = new Date();

    // ===== Feuille 1 : Planning (comme le tableau de l'app) =====
    const ws = wb.addWorksheet("Planning", {
      views: [{ state: "frozen", xSplit: 2, ySplit: 2 }],
      properties: { defaultRowHeight: 26 }
    });
    const nCols = vis.length + 2; // A = Jour, B = _date cachée (retour Excel->app), C+ = ouvriers
    ws.columns = [{ width: 18 }, { width: 12 }].concat(vis.map(() => ({ width: 15 })));
    ws.getColumn(2).hidden = true;
    // Titre fusionné
    ws.mergeCells(1, 1, 1, nCols);
    const title = ws.getCell(1, 1);
    title.value = "⛽ Planning MythAAk — Station Shell  " + fmtD(days[0]) + " → " + fmtD(days[6]);
    title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB91C1C" } };
    title.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(1).height = 32;
    // En-tête : Jour + ouvriers
    const hr = ws.getRow(2);
    hr.height = 30;
    const h0 = hr.getCell(1);
    h0.value = lang === "ar" ? "📅 أيام الأسبوع" : "📅 Jours";
    h0.font = { bold: true, color: { argb: "FFFFFFFF" } };
    h0.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
    h0.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    h0.border = thinBorder();
    const hDate = hr.getCell(2);
    hDate.value = "_date";
    hDate.font = { color: { argb: "FF9CA3AF" }, size: 8 };
    hDate.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
    hDate.alignment = { vertical: "middle", horizontal: "center" };
    hDate.border = thinBorder();
    vis.forEach((w, i) => {
      const c = hr.getCell(i + 3);
      c.value = w.name + "\n(" + w.role + ")";
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
      c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      c.border = thinBorder();
    });
    // 7 lignes jours
    for (let d = 0; d < 7; d++) {
      const r = ws.getRow(3 + d);
      r.height = 30;
      const dc = r.getCell(1);
      dc.value = dayNames[d] + " " + fmtD(days[d]);
      dc.font = { bold: true, color: { argb: "FF111827" } };
      dc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
      dc.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      dc.border = thinBorder();
      const isoC = r.getCell(2);
      isoC.value = isoDate(days[d]);
      isoC.font = { color: { argb: "FF9CA3AF" }, size: 8 };
      isoC.alignment = { vertical: "middle", horizontal: "center" };
      isoC.border = thinBorder();
      vis.forEach((w, i) => {
        const v = getCell(w.id, d);
        const c = r.getCell(i + 3);
        c.value = PLAIN_LABEL[v] || v;
        const bg = (SHIFTS[v] && SHIFTS[v].color) || "#ffffff";
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hexToArgb(bg) } };
        c.font = v === "vide"
          ? { color: { argb: "FF9CA3AF" } }
          : { bold: true, color: { argb: fontForBg(bg) } };
        c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        c.border = thinBorder();
      });
    }
    // Légende en bas
    const legRow = ws.getRow(11);
    legRow.height = 22;
    const leg = legRow.getCell(1);
    leg.value = "P1/2=Pompes 1-2 • P3/4=Pompes 3-4 • P5/6=Pompes 5-6 • NUIT 22h–06h • Repos=Raha • Congé=Otla";
    ws.mergeCells(11, 1, 11, nCols);
    leg.font = { italic: true, size: 9, color: { argb: "FF6B7280" } };
    leg.alignment = { vertical: "middle", horizontal: "center" };
    ws.pageSetup = { orientation: "landscape", fitToWidth: 1, fitToHeight: 1, paperSize: 9, fitToPage: true };

    // ===== Feuille 2 : Nouba (même période que l'onglet Nouba) =====
    if (!noubaFrom || !noubaTo) { const r0 = noubaDefRange(); noubaFrom = r0.from; noubaTo = r0.to; }
    let nFrom = new Date(noubaFrom), nTo = new Date(noubaTo);
    if (nFrom > nTo) { const t = nFrom; nFrom = nTo; nTo = t; }
    const grid = buildNoubaGridForExport(nFrom, nTo);
    const ws2 = wb.addWorksheet("Nouba", {
      views: [{ state: "frozen", xSplit: 1, ySplit: 2 }],
      properties: { defaultRowHeight: 24 }
    });
    const nCols2 = NOUBA_POSTS.length + 1;
    ws2.columns = [{ width: 18 }].concat(NOUBA_POSTS.map(() => ({ width: 15 })));
    ws2.mergeCells(1, 1, 1, nCols2);
    const t2 = ws2.getCell(1, 1);
    t2.value = "📊 Nouba (rotations)  " + fmtD(nFrom) + " → " + fmtD(nTo);
    t2.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    t2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
    t2.alignment = { vertical: "middle", horizontal: "center" };
    ws2.getRow(1).height = 32;
    const hr2 = ws2.getRow(2);
    hr2.height = 30;
    const jh = hr2.getCell(1);
    jh.value = lang === "ar" ? "📅 اليوم" : "📅 Jour";
    jh.font = { bold: true, color: { argb: "FFFFFFFF" } };
    jh.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
    jh.alignment = { vertical: "middle", horizontal: "center" };
    jh.border = thinBorder();
    NOUBA_POSTS.forEach((p, i) => {
      const c = hr2.getCell(i + 2);
      c.value = NOUBA_LABEL[p];
      const bg = (SHIFTS[p] && SHIFTS[p].color) || "#111827";
      c.font = { bold: true, color: { argb: fontForBg(bg) } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hexToArgb(bg) } };
      c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      c.border = thinBorder();
    });
    let rr = 3;
    const dayShort = lang === "ar"
      ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    for (let d = new Date(nTo); d >= nFrom; d.setDate(d.getDate() - 1)) {
      const row = ws2.getRow(rr);
      row.height = 26;
      const dk = isoDate(d);
      const dc2 = row.getCell(1);
      dc2.value = dayShort[d.getDay()] + " " + fmtD(d);
      dc2.font = { bold: true, color: { argb: "FF111827" } };
      dc2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rr % 2 ? "FFF3F4F6" : "FFFFFFFF" } };
      dc2.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      dc2.border = thinBorder();
      NOUBA_POSTS.forEach((p, i) => {
        const arr = (grid[dk] && grid[dk][p]) || [];
        const c = row.getCell(i + 2);
        c.value = arr.length ? arr.join(", ") : "—";
        c.font = arr.length ? { bold: true, color: { argb: "FF111827" } } : { color: { argb: "FF9CA3AF" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rr % 2 ? "FFF9FAFB" : "FFFFFFFF" } };
        c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        c.border = thinBorder();
      });
      rr++;
    }
    ws2.pageSetup = { orientation: "landscape", fitToWidth: 1, fitToHeight: 0, paperSize: 9, fitToPage: true };

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    if (btn) btn.innerHTML = old;
  } catch (e) {
    console.error(e);
    const btn = $("btnExcel");
    if (btn) btn.innerHTML = "📥 <span>Excel</span>";
    alert("Erreur Excel: " + (e && e.message ? e.message : e));
  }
}
// ---------- Export MOIS (.xlsx : mois complet + Nouba du mois, modifiable + réimportable) ----------
function cellForDate(dt, workerId) {
  const mk = mondayKey(dt);
  const dayIdx = (dt.getDay() + 6) % 7;
  return planning[mk + "|" + workerId + "|" + dayIdx] || "vide";
}
async function exportMonthExcel() {
  const vis = visibleWorkers();
  if (!vis.length) { alert(lang === "ar" ? "زيد العمال أولا" : "Ajoutez des ouvriers d'abord"); return; }
  const y = currentMonday.getFullYear(), m = currentMonday.getMonth();
  const first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
  const monthTag = y + "-" + String(m + 1).padStart(2, "0");
  const fname = "planning-mythaak-" + monthTag + ".xlsx";
  const monthName = first.toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", { month: "long", year: "numeric" });
  const fmtD = (d) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  const dayNames = lang === "ar" ? DAYS_AR : DAYS_FR;
  if (typeof ExcelJS === "undefined") { alert(lang === "ar" ? "خاص الإنترنت أول مرة باش تحمل مكتبة Excel" : "Internet requis la 1ère fois pour charger ExcelJS"); return; }
  const btn = $("btnMonth");
  const old = btn ? btn.innerHTML : "";
  try {
    if (btn) btn.innerHTML = "⏳...";
    const wb = new ExcelJS.Workbook();
    wb.creator = "Planning MythAAk";
    wb.created = new Date();
    const nCols = vis.length + 2;
    // ===== Feuille Mois =====
    const ws = wb.addWorksheet("Mois " + monthTag, {
      views: [{ state: "frozen", xSplit: 2, ySplit: 3 }],
      properties: { defaultRowHeight: 26 }
    });
    ws.columns = [{ width: 18 }, { width: 12 }].concat(vis.map(() => ({ width: 14 })));
    ws.getColumn(2).hidden = true;
    ws.mergeCells(1, 1, 1, nCols);
    const title = ws.getCell(1, 1);
    title.value = "⛽ Planning MythAAk — " + monthName + "  (" + fmtD(first) + " → " + fmtD(last) + ")";
    title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB91C1C" } };
    title.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(1).height = 32;
    let r = 2;
    const mondayOfFirst = getMonday(first);
    for (let wStart = new Date(mondayOfFirst); wStart <= last; wStart.setDate(wStart.getDate() + 7)) {
      const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 6);
      // titre semaine
      ws.mergeCells(r, 1, r, nCols);
      const wt = ws.getCell(r, 1);
      const inMonth = (d) => d >= first && d <= last;
      const wDays = [];
      for (let i = 0; i < 7; i++) { const d = new Date(wStart); d.setDate(d.getDate() + i); if (inMonth(d)) wDays.push(d); }
      if (!wDays.length) continue;
      wt.value = "Semaine " + fmtD(wDays[0]) + " → " + fmtD(wDays[wDays.length - 1]);
      wt.font = { bold: true, color: { argb: "FFFFFFFF" } };
      wt.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
      wt.alignment = { vertical: "middle", horizontal: "center" };
      ws.getRow(r).height = 26;
      r++;
      // en-tête bloc
      const hr = ws.getRow(r);
      hr.height = 28;
      const h0 = hr.getCell(1);
      h0.value = lang === "ar" ? "📅 اليوم" : "📅 Jour";
      h0.font = { bold: true, color: { argb: "FFFFFFFF" } };
      h0.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
      h0.alignment = { vertical: "middle", horizontal: "center" };
      h0.border = thinBorder();
      const hd = hr.getCell(2);
      hd.value = "_date";
      hd.font = { color: { argb: "FF9CA3AF" }, size: 8 };
      hd.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
      hd.alignment = { vertical: "middle", horizontal: "center" };
      hd.border = thinBorder();
      vis.forEach((w, i) => {
        const c = hr.getCell(i + 3);
        c.value = w.name + "\n(" + w.role + ")";
        c.font = { bold: true, color: { argb: "FFFFFFFF" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
        c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        c.border = thinBorder();
      });
      r++;
      wDays.forEach((d) => {
        const row = ws.getRow(r);
        row.height = 28;
        const di = (d.getDay() + 6) % 7;
        const dc = row.getCell(1);
        dc.value = dayNames[di] + " " + fmtD(d);
        dc.font = { bold: true, color: { argb: "FF111827" } };
        dc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
        dc.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        dc.border = thinBorder();
        const ic = row.getCell(2);
        ic.value = isoDate(d);
        ic.font = { color: { argb: "FF9CA3AF" }, size: 8 };
        ic.alignment = { vertical: "middle", horizontal: "center" };
        ic.border = thinBorder();
        vis.forEach((w, i) => {
          const v = cellForDate(d, w.id);
          const c = row.getCell(i + 3);
          c.value = PLAIN_LABEL[v] || v;
          const bg = (SHIFTS[v] && SHIFTS[v].color) || "#ffffff";
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hexToArgb(bg) } };
          c.font = v === "vide" ? { color: { argb: "FF9CA3AF" } } : { bold: true, color: { argb: fontForBg(bg) } };
          c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          c.border = thinBorder();
          // liste Excel : guide la saisie dans le fichier
          if (v !== "vide") c.dataValidation = undefined;
        });
        r++;
      });
      // ligne de séparation
      ws.getRow(r).height = 8;
      r++;
    }
    // aide de saisie : rappel des valeurs acceptées (modifiables, réimportables via Importer Excel)
    ws.mergeCells(r, 1, r, nCols);
    const help = ws.getCell(r, 1);
    help.value = "✏️ بدّل الخلايا مباشرة من Excel (P1/2 • P3/4 • P5/6 • MELANGE • SERVICE • SERVICE 12 • SERVICE 8 • NUIT • Repos • Congé • Absence • Maladie • —) ثم Importer Excel باش ترجع للموقع. عمود _date ما تمسحوش.";
    help.font = { italic: true, size: 9, color: { argb: "FF6B7280" } };
    help.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    ws.getRow(r).height = 30;
    ws.pageSetup = { orientation: "landscape", fitToWidth: 1, fitToHeight: 0, paperSize: 9, fitToPage: true };
    // ===== Feuille Nouba du mois (1 -> 31, croissant) =====
    const grid = buildNoubaGridForExport(first, last);
    const ws2 = wb.addWorksheet("Nouba " + monthTag, {
      views: [{ state: "frozen", xSplit: 1, ySplit: 2 }],
      properties: { defaultRowHeight: 24 }
    });
    const nCols2 = NOUBA_POSTS.length + 1;
    ws2.columns = [{ width: 18 }].concat(NOUBA_POSTS.map(() => ({ width: 15 })));
    ws2.mergeCells(1, 1, 1, nCols2);
    const t2 = ws2.getCell(1, 1);
    t2.value = "📊 Nouba — " + monthName;
    t2.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    t2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
    t2.alignment = { vertical: "middle", horizontal: "center" };
    ws2.getRow(1).height = 32;
    const hr2 = ws2.getRow(2);
    hr2.height = 30;
    const jh = hr2.getCell(1);
    jh.value = lang === "ar" ? "📅 اليوم" : "📅 Jour";
    jh.font = { bold: true, color: { argb: "FFFFFFFF" } };
    jh.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
    jh.alignment = { vertical: "middle", horizontal: "center" };
    jh.border = thinBorder();
    NOUBA_POSTS.forEach((p, i) => {
      const c = hr2.getCell(i + 2);
      c.value = NOUBA_LABEL[p];
      const bg = (SHIFTS[p] && SHIFTS[p].color) || "#111827";
      c.font = { bold: true, color: { argb: fontForBg(bg) } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hexToArgb(bg) } };
      c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      c.border = thinBorder();
    });
    let rr = 3;
    const dayShort = lang === "ar"
      ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      const row = ws2.getRow(rr);
      row.height = 26;
      const dk = isoDate(d);
      const dc2 = row.getCell(1);
      dc2.value = dayShort[d.getDay()] + " " + fmtD(d);
      dc2.font = { bold: true, color: { argb: "FF111827" } };
      dc2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rr % 2 ? "FFF3F4F6" : "FFFFFFFF" } };
      dc2.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      dc2.border = thinBorder();
      NOUBA_POSTS.forEach((p, i) => {
        const arr = (grid[dk] && grid[dk][p]) || [];
        const c = row.getCell(i + 2);
        c.value = arr.length ? arr.join(", ") : "—";
        c.font = arr.length ? { bold: true, color: { argb: "FF111827" } } : { color: { argb: "FF9CA3AF" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rr % 2 ? "FFF9FAFB" : "FFFFFFFF" } };
        c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        c.border = thinBorder();
      });
      rr++;
    }
    ws2.pageSetup = { orientation: "landscape", fitToWidth: 1, fitToHeight: 0, paperSize: 9, fitToPage: true };
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    if (btn) btn.innerHTML = old;
  } catch (e) {
    console.error(e);
    if (btn) btn.innerHTML = old;
    alert("Erreur Excel mois: " + (e && e.message ? e.message : e));
  }
}
// Fallback CSV si aucune librairie chargée (séparateur ; pour Excel FR)
function exportCSVFallback() {
  const vis = visibleWorkers();
  const dayNames = lang === "ar" ? DAYS_AR : DAYS_FR;
  const days = weekDays();
  let csv = (lang === "ar" ? "اليوم/التاريخ;" : "Jour/Date;") + vis.map(w => '"' + w.name + ' (' + w.role + ')"').join(";") + "\n";
  for (let d = 0; d < 7; d++) {
    const dateStr = days[d].toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", { day: "2-digit", month: "2-digit" });
    const row = ['"' + dayNames[d] + ' ' + dateStr + '"'];
    vis.forEach(w => {
      const v = getCell(w.id, d);
      row.push('"' + (PLAIN_LABEL[v] || v) + '"');
    });
    csv += row.join(";") + "\n";
  }
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "planning-mythaak-" + weekKey() + ".csv";
  a.click();
}

// ---------- WhatsApp share ----------
const PLAIN_LABEL = {
  vide:"-", matin:"Matin 06-14", soir:"Soir 14-22", nuit:"NUIT 22-06",
  p12:"P1/2", p34:"P3/4", p56:"P5/6",
  melange:"MELANGE", service:"SERVICE", service12:"SERVICE 12", service8:"SERVICE 8",
  repos:"Repos", conge:"Conge", absence:"Absence", maladie:"Maladie"
};
const WA_EMOJI = {
  vide:"▫️", matin:"☀️", soir:"🌤️", nuit:"🌃",
  p12:"⛽", p34:"⛽", p56:"⛽",
  melange:"🛢️", service:"🧰", service12:"🧰", service8:"🧰",
  repos:"🌙", conge:"🏖️", absence:"⛔", maladie:"🤒"
};
function waLabel(v) {
  const m = { vide:"—", matin:"Matin 06-14", soir:"Soir 14-22", nuit:"NUIT 22-06",
    p12:"P1/2", p34:"P3/4", p56:"P5/6", melange:"MELANGE", service:"SERVICE",
    service12:"SERVICE 12", service8:"SERVICE 8", repos:"Repos", conge:"Conge",
    absence:"Absence", maladie:"Maladie" };
  return m[v] || v;
}
// WhatsApp format (day by day, like the team's habit):
// *Mardi 13/10*
//  YASSINE : NUIT 22-06
//  KHALID : MELANGE
//  ...
function buildWhatsMessage() {
  const days = weekDays();
  const dayNames = lang === "ar" ? DAYS_AR : DAYS_FR;
  const fmt = (d) => d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});
  let msg = "⛽ *" + (lang === "ar" ? "استعمال الزمان" : "Planning") + " " + fmt(days[0]) + " → " + fmt(days[6]) + "*";
  for (let d = 0; d < 7; d++) {
    msg += "\n\n*" + dayNames[d] + " " + fmt(days[d]) + "*\n";
    const lines = [];
    visibleWorkers().forEach(w => {
      lines.push(" " + w.name + " : " + waLabel(getCell(w.id, d)));
    });
    msg += lines.join("\n");
  }
  msg += "\n\n✅ " + (lang === "ar" ? "بالتوفيق للجميع" : "Bon courage à tous") + " ⛽";
  return msg;
}
// ---------- Table screenshot shared on WhatsApp (image, not text) ----------
async function captureTableBlob() {
  if (typeof html2canvas === "undefined") return null;
  const el = document.querySelector(".table-wrap");
  if (!el) return null;
  await document.fonts.ready;
  const canvas = await html2canvas(el, {
    scale: 2, backgroundColor: "#ffffff", useCORS: true,
    onclone: (doc) => {
      // clean shot: hide edit buttons, keep the planning only
      doc.querySelectorAll(".worker-actions").forEach(x => x.style.display = "none");
      const hb = doc.getElementById("hiddenBanner");
      if (hb) hb.style.display = "none";
    }
  });
  return await new Promise(res => canvas.toBlob(res, "image/png"));
}
function downloadBlob(blob, fname) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
async function shareTableShot() {
  const btn = $("btnShot");
  const old = btn ? btn.innerHTML : "";
  try {
    if (typeof html2canvas === "undefined") {
      alert(lang==="ar" ? "خاص الإنترنت أول مرة باش تحمل مكتبة الصور" : "Internet requis la 1ère fois pour charger la librairie image");
      return;
    }
    if (btn) btn.innerHTML = "⏳...";
    const blob = await captureTableBlob();
    if (!blob) throw new Error("capture vide");
    const fname = "planning-mythaak-" + weekKey() + ".png";
    const file = new File([blob], fname, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      // mobile: opens share sheet -> choose WhatsApp directly
      await navigator.share({ files: [file], title: "Planning MythAAk " + weekKey() });
    } else {
      // PC: downloads the PNG -> drag it into WhatsApp Web
      downloadBlob(blob, fname);
      alert(lang==="ar"
        ? "تحمّلات الصورة ✅ حل واتساب وصيفطها (glisser-déposer)"
        : "Photo téléchargée ✅ : glissez-la dans WhatsApp pour l'envoyer");
    }
  } catch (e) {
    if (e && e.name === "AbortError") return; // user closed share sheet
    console.error(e);
    alert("Erreur photo: " + (e && e.message ? e.message : e));
  } finally {
    if (btn) btn.innerHTML = old;
  }
}
// WhatsApp button = the TABLE SCREENSHOT (click -> the screenshot appears in WhatsApp)
async function shareWhatsApp() {
  if (visibleWorkers().length === 0) { alert(lang==="ar"?"زيد العمال أولا":"Ajoutez des ouvriers d'abord"); return; }
  const btn = $("btnWhats");
  const old = btn ? btn.innerHTML : "";
  try {
    if (btn) btn.innerHTML = "⏳...";
    const blob = await captureTableBlob();
    if (btn) btn.innerHTML = old;
    if (blob) {
      const file = new File([blob], "planning-mythaak-" + weekKey() + ".png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // mobile: share sheet -> WhatsApp -> the screenshot shows, ready to send
        await navigator.share({ files: [file], title: "Planning MythAAk " + weekKey() });
        return;
      }
      // PC: download it, drop it in WhatsApp Web -> preview shows before sending
      downloadBlob(blob, file.name);
      alert(lang==="ar"
        ? "تحمّلات صورة الجدول ✅ حطها في واتساب وغادي تبان قبل ما تصيفط"
        : "Capture téléchargée ✅ : déposez-la dans WhatsApp, elle s'affichera avant l'envoi");
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") { if (btn) btn.innerHTML = old; return; }
    console.error(e);
    if (btn) btn.innerHTML = old;
  }
  // last resort (no capture lib): send as text
  window.open("https://wa.me/?text=" + encodeURIComponent(buildWhatsMessage()), "_blank");
}

// ---------- Events ----------
try {
$("btnFR").onclick = () => { lang="fr"; save(); applyLang(); };
$("btnAR").onclick = () => { lang="ar"; save(); applyLang(); };
$("prevWeek").onclick = () => { currentMonday.setDate(currentMonday.getDate()-7); render(); };
$("nextWeek").onclick = () => { currentMonday.setDate(currentMonday.getDate()+7); render(); };
$("todayBtn").onclick = () => { currentMonday = getMonday(new Date()); render(); };
$("weekPicker").onchange = (e) => { if(e.target.value){ currentMonday = getMonday(new Date(e.target.value)); render(); } };
$("searchInput").oninput = render;
$("btnAuto").onclick = autoDistribute;
$("btnPrint").onclick = () => window.print();
$("btnExcel").onclick = exportExcel;
$("btnMonth").onclick = exportMonthExcel;
$("btnWhats").onclick = shareWhatsApp;
$("btnShot").onclick = shareTableShot;
$("btnImport").onclick = () => $("excelFile").click();
$("excelFile").onchange = (e) => { if (e.target.files[0]) importExcelFile(e.target.files[0]); e.target.value = ""; };
// ---------- Backup / restore (transfer phone <-> PC, never lose data) ----------
$("btnBackup").onclick = () => {
  const data = {
    app: "planning-mythaak", version: 1, savedAt: new Date().toISOString(),
    workers: workers, planning: planning,
    night: nightOverride, conge: congeOverride, lang: lang
  };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mythaak-backup-" + weekKey() + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};
$("btnRestore").onclick = () => $("jsonFile").click();
$("jsonFile").onchange = (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (!data || !Array.isArray(data.workers)) throw new Error("bad file");
      workers = data.workers.filter(w => w && w.id && w.name);
      if (data.planning && typeof data.planning === "object") planning = data.planning;
      if (data.night && typeof data.night === "object") nightOverride = data.night;
      if (data.conge && typeof data.conge === "object") congeOverride = data.conge;
      if (data.lang === "ar" || data.lang === "fr") lang = data.lang;
      save();
      try { localStorage.setItem("mythaak_night", JSON.stringify(nightOverride)); } catch (err) {}
      try { localStorage.setItem("mythaak_conge", JSON.stringify(congeOverride)); } catch (err) {}
      applyLang();
      alert(lang === "ar" ? "تم الاسترجاع بنجاح ✅" : "Restauration réussie ✅");
    } catch (err) { console.error(err); alert("Fichier invalide"); }
  };
  r.readAsText(f);
};
$("nuitSel1").onchange = () => setNightTeam($("nuitSel1").value, $("nuitSel2").value);
$("nuitSel2").onchange = () => setNightTeam($("nuitSel1").value, $("nuitSel2").value);
$("congeSel").onchange = () => { setCongeWeek($("congeSel").value); };
$("congeNext").onclick = () => {
  // advance to next person in LISTE CONGÉ (based on last week or current selection)
  const prevMonday = new Date(currentMonday); prevMonday.setDate(prevMonday.getDate()-7);
  const pk = prevMonday.toISOString().slice(0,10);
  const prevId = congeOverride[pk] && congeOverride[pk] !== "NONE" ? congeOverride[pk] : null;
  const cur = ($("congeSel") && $("congeSel").value) ? $("congeSel").value : prevId;
  const nxt = nextCongeInList(cur);
  if (nxt) { setCongeWeek(nxt); render(); }
  else alert(lang==="ar" ? "حدد الكونجي الحالي أولا" : "Sélectionnez d'abord le congé actuel");
};
$("btnReset").onclick = () => {
  if (confirm(lang==="ar"?"مسح تخطيط هذا الأسبوع؟":"Effacer le planning de cette semaine ?")) {
    workers.forEach(w => { for(let d=0;d<7;d++) delete planning[weekKey()+"|"+w.id+"|"+d]; });
    save(); render();
  }
};
$("tabPlanning").onclick = () => showView("planning");
$("tabNouba").onclick = () => showView("nouba");
$("noubaGo").onclick = () => {
  const f = $("noubaFrom").value, t = $("noubaTo").value;
  if (f) { const d = new Date(f + "T12:00:00"); if (!isNaN(d)) { d.setHours(0,0,0,0); noubaFrom = d; } }
  if (t) { const d = new Date(t + "T12:00:00"); if (!isNaN(d)) { d.setHours(0,0,0,0); noubaTo = d; } }
  renderNouba();
};
$("noubaReset").onclick = () => {
  const r = noubaDefRange();
  noubaFrom = r.from; noubaTo = r.to;
  renderNouba();
};
$("btnResetTeam").onclick = () => {
  if (confirm(lang === "ar" ? "استرجاع الفريق الأصلي (10 عمال)؟" : "Restaurer l'équipe d'origine (10 ouvriers) ?")) resetTeam();
};
$("btnAddWorker").onclick = () => openWorkerModal();
$("cancelWorker").onclick = () => $("workerModal").classList.add("hidden");
$("cancelShift").onclick = () => $("shiftModal").classList.add("hidden");
$("workerModal").onclick = (e) => { if(e.target.id==="workerModal") $("workerModal").classList.add("hidden"); };
$("shiftModal").onclick = (e) => { if(e.target.id==="shiftModal") $("shiftModal").classList.add("hidden"); };
$("saveWorker").onclick = () => {
  const name = $("wName").value.trim();
  if (!name) { alert(lang==="ar"?"كتب اسم العامل":"Entrez le nom"); return; }
  const role = $("wRole").value, phone = $("wPhone").value.trim();
  if (editingWorkerId) {
    const w = workers.find(x=>x.id===editingWorkerId);
    w.name=name; w.role=role; w.phone=phone;
    if (String(name).toUpperCase().includes("OBAMA")) w.hidden = true;
    if (String(name).toUpperCase().includes("KHADIJA")) workers = workers.filter(x=>x.id!==w.id);
  } else {
    if (String(name).toUpperCase().includes("KHADIJA")) { alert("KHADIJA محبوسة - ما تتزادش"); return; }
    workers.push({ id:"w"+Date.now(), name, role, phone, hidden: String(name).toUpperCase().includes("OBAMA") });
  }
  $("workerModal").classList.add("hidden");
  save(); render();
};
document.addEventListener("keydown", e => { if(e.key==="Escape"){ $("workerModal").classList.add("hidden"); $("shiftModal").classList.add("hidden"); } });

// init: default night team for week Oct 12-18 2026 = YASSINE + JAMAL (continuity from Oct 11)
try {
  const d = new Date(2026, 9, 12);
  const m = getMonday(d);
  const k = m.toISOString().slice(0,10);
  if (!nightOverride[k]) {
    const ids = {};
    workers.forEach(w => ids[w.name.toUpperCase()] = w.id);
    if (ids["YASSINE"] && ids["JAMAL"]) {
      nightOverride[k] = [ids["YASSINE"], ids["JAMAL"]];
      localStorage.setItem("mythaak_night", JSON.stringify(nightOverride));
    }
    // KHALID works Oct 12-18 per user's filled Excel (old wrong seed removed)
    if (ids["KHALID"] && congeOverride[k] === ids["KHALID"]) {
      delete congeOverride[k];
      localStorage.setItem("mythaak_conge", JSON.stringify(congeOverride));
    }
  }
} catch(e) {}
// preset CORRIGE v2: semaine 26/10 -> 01/11 = la capture utilisateur (JAMAL conge).
// ordre: repos -> melange -> service8 -> pompe -> service12.
// applique une seule fois (flag), apres ca respecte les modifs manuelles.
try {
  if (!localStorage.getItem("mythaak_preset26_v2")) {
    const d26 = new Date(2026, 9, 26);
    const m26 = getMonday(d26);
    const k26 = m26.toISOString().slice(0,10);
    const ids26 = {};
    workers.forEach(w => ids26[w.name.toUpperCase()] = w.id);
    const PRESET_26 = {
      YASSINE: ['p34','p56','melange','p12','p56','service12','p12'],
      KHALID:  ['service12','p12','p56','p34','service8','repos','nuit'],
      JAMAL:   ['conge','conge','conge','conge','conge','conge','conge'],
      FETAH:   ['melange','service8','p34','service12','p34','p12','repos'],
      ISSAM:   ['p56','service12','repos','service8','p12','melange','p34'],
      KAMAL:   ['repos','melange','service8','p56','service12','p34','p56'],
      AHMED:   ['p12','p34','service12','melange','repos','nuit','nuit'],
      RIDA:    ['nuit','nuit','nuit','nuit','nuit','nuit','nuit'],
      YOUSSEF: ['nuit','nuit','nuit','nuit','nuit','nuit','repos'],
      HASSAN:  ['service8','repos','p12','service','melange','p56','service12'],
    };
    if (ids26["YOUSSEF"] && ids26["RIDA"]) {
      Object.keys(PRESET_26).forEach(nm => {
        const id = ids26[nm];
        if (!id) return;
        PRESET_26[nm].forEach((v, d) => { planning[k26 + "|" + id + "|" + d] = v; });
      });
      nightOverride[k26] = [ids26["YOUSSEF"], ids26["RIDA"]];
      if (ids26["JAMAL"]) congeOverride[k26] = ids26["JAMAL"];
      localStorage.setItem("mythaak_night", JSON.stringify(nightOverride));
      localStorage.setItem("mythaak_conge", JSON.stringify(congeOverride));
      save();
    }
    localStorage.setItem("mythaak_preset26_v2", "1");
  }
} catch(e) {}
// presets NOVEMBRE (conges 10j: YOUSSEF 2-11, FETAH 12-21, AHMED 22-1/12; JAMAL repos 2/11 puis entre 3/11)
// remplit seulement les semaines vides, ne touche jamais au manuel
try {
  const NOV = [
    { mon: [2026,10,2], night: ["AHMED","KHALID"], conge: null, P: {
      YASSINE: ['p34','p56','service12','service8','melange','p12','p56'],
      KHALID:  ['nuit','nuit','nuit','nuit','nuit','nuit','nuit'],
      JAMAL:   ['repos','service12','melange','p34','p12','p34','service12'],
      FETAH:   ['melange','service8','p12','p56','p34','p56','p12'],
      ISSAM:   ['service12','p12','p34','service12','repos','nuit','nuit'],
      KAMAL:   ['service8','p34','p56','melange','p56','service12','p34'],
      AHMED:   ['nuit','nuit','nuit','nuit','nuit','nuit','repos'],
      RIDA:    ['repos','melange','service8','p12','service12','melange','p12'],
      YOUSSEF: ['conge','conge','conge','conge','conge','conge','conge'],
      HASSAN:  ['p12','p56','p34','p12','service8','repos','nuit'],
    }},
    { mon: [2026,10,9], night: ["ISSAM","HASSAN"], conge: null, P: {
      YASSINE: ['service12','p12','p34','service8','repos','nuit','nuit'],
      KHALID:  ['repos','melange','service8','p56','service12','p34','p56'],
      JAMAL:   ['service8','p34','service12','p12','melange','repos','nuit'],
      FETAH:   ['p34','p56','melange','conge','conge','conge','conge'],
      ISSAM:   ['nuit','nuit','nuit','nuit','nuit','nuit','repos'],
      KAMAL:   ['p12','service12','p12','p34','p12','p56','p12'],
      AHMED:   ['melange','service8','p56','service12','p34','service12','p34'],
      RIDA:    ['p56','p12','p34','p12','p56','melange','p12'],
      YOUSSEF: ['conge','conge','conge','melange','service8','p12','service12'],
      HASSAN:  ['nuit','nuit','nuit','nuit','nuit','nuit','nuit'],
    }},
    { mon: [2026,10,16], night: ["YASSINE","JAMAL"], conge: null, P: {
      YASSINE: ['nuit','nuit','nuit','nuit','nuit','nuit','repos'],
      KHALID:  ['service8','service12','p12','p56','service8','nuit','p12'],
      JAMAL:   ['nuit','nuit','nuit','nuit','nuit','nuit','nuit'],
      FETAH:   ['conge','conge','conge','conge','conge','conge','nuit'],
      ISSAM:   ['melange','service8','p56','service12','melange','p12','p34'],
      KAMAL:   ['p34','p56','melange','p12','p34','repos','nuit'],
      AHMED:   ['p56','p12','p34','melange','p56','service12','conge'],
      RIDA:    ['service12','p12','p34','p12','p34','p56','service12'],
      YOUSSEF: ['p12','p34','service12','service8','p12','p34','p56'],
      HASSAN:  ['repos','melange','service8','p34','service12','melange','p12'],
    }},
    { mon: [2026,10,23], night: ["FETAH","KAMAL"], conge: null, P: {
      YASSINE: ['melange','service8','p56','service12','p34','p56','service12'],
      KHALID:  ['p34','p56','service8','melange','p56','service12','p12'],
      JAMAL:   ['p56','service12','melange','p12','service12','melange','p34'],
      FETAH:   ['nuit','nuit','nuit','nuit','nuit','nuit','repos'],
      ISSAM:   ['service12','melange','p12','p34','service8','p12','p56'],
      KAMAL:   ['nuit','nuit','nuit','nuit','nuit','nuit','nuit'],
      AHMED:   ['conge','conge','conge','conge','conge','conge','conge'],
      RIDA:    ['p12','p34','service12','service8','melange','repos','nuit'],
      YOUSSEF: ['service8','p12','p34','p56','repos','nuit','nuit'],
      HASSAN:  ['p34','p12','p34','p12','p12','p34','p12'],
    }},
    { mon: [2026,10,30], night: ["YOUSSEF","RIDA"], conge: null, P: {
      YASSINE: ['service8','p34','p56','p34','p56','service12','service'],
      KHALID:  ['p34','p56','service12','service8','melange','repos','nuit'],
      JAMAL:   ['p12','service12','melange','service','p12','melange','p12'],
      FETAH:   ['melange','service8','p12','service12','service','p12','p34'],
      ISSAM:   ['service12','p12','service','p12','p34','p56','service12'],
      KAMAL:   ['repos','melange','service8','p56','service12','p34','p56'],
      AHMED:   ['conge','conge','p34','melange','repos','nuit','nuit'],
      RIDA:    ['nuit','nuit','nuit','nuit','nuit','nuit','nuit'],
      YOUSSEF: ['nuit','nuit','nuit','nuit','nuit','nuit','repos'],
      HASSAN:  ['p56','p12','p34','p12','service8','service','p12'],
    }},
  ];
  const idsN = {};
  workers.forEach(w => idsN[w.name.toUpperCase()] = w.id);
  const novForce = !localStorage.getItem("mythaak_nov_v5");
  NOV.forEach(W => {
    const m = getMonday(new Date(W.mon[0], W.mon[1], W.mon[2]));
    const k = m.toISOString().slice(0,10);
    let empty = true;
    workers.forEach(w => {
      for (let d = 0; d < 7; d++) {
        const v = planning[k + "|" + w.id + "|" + d];
        if (v && v !== "vide") { empty = false; }
      }
    });
    if (!empty && !novForce) return;
    let ok = true;
    Object.keys(W.P).forEach(nm => { if (!idsN[nm]) ok = false; });
    if (!ok) return;
    Object.keys(W.P).forEach(nm => {
      W.P[nm].forEach((v, d) => { planning[k + "|" + idsN[nm] + "|" + d] = v; });
    });
    if (idsN[W.night[0]] && idsN[W.night[1]]) {
      if (!nightOverride[k]) nightOverride[k] = [idsN[W.night[0]], idsN[W.night[1]]];
    }
  });
  localStorage.setItem("mythaak_night", JSON.stringify(nightOverride));
  localStorage.setItem("mythaak_nov_v5", "1");
  save();
} catch(e) {}
// init
applyLang();
} catch (e) { reportFatal(e); }
