"use strict";

const salas = [
  { id: "vestibulo", archivo: "vestibulo.json", nombre: "Vestíbulo", corto: "Inicio" },
  { id: "sala-41", archivo: "sala-41.json", nombre: "La más antigua de las religiones", corto: "Origen y textos" },
  { id: "sala-42", archivo: "sala-42.json", nombre: "Visión del más allá y más acá", corto: "Ideas y vida" },
  { id: "fiestas", archivo: "fiestas.json", nombre: "Fiestas y celebraciones", corto: "Fiestas" },
  { id: "actualidad", archivo: "actualidad.json", nombre: "El mundo actual", corto: "Actualidad" },
  { id: "comparacion", archivo: "comparacion.json", nombre: "Hinduismo y catolicismo", corto: "Comparación" },
  { id: "final", archivo: "final.json", nombre: "Conclusiones y bibliografía", corto: "Cierre" }
];

const app = document.getElementById("app");
const nav = document.getElementById("room-nav");
const menu = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const cache = new Map();
let visited = new Set();
try { visited = new Set(JSON.parse(localStorage.getItem("museo-hinduismo-visitadas") || "[]")); } catch { visited = new Set(); }

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function safeUrl(value) {
  try { const u = new URL(value, location.href); return ["http:", "https:"].includes(u.protocol) ? esc(u.href) : "#"; } catch { return "#"; }
}
function imageSource(path) {
  return location.protocol === "file:" ? (window.MUSEO_OFFLINE?.images?.[path] || path) : path;
}
function navMarkup(active) {
  return salas.map((s, i) => `<a class="nav-item ${s.id === active ? "active" : ""}" href="#${s.id}" ${s.id === active ? 'aria-current="page"' : ""}><span class="nav-number">${String(i).padStart(2,"0")}</span><span class="nav-title">${esc(s.nombre)}</span></a>`).join("");
}
function updateProgress() {
  const count = salas.filter(s => visited.has(s.id)).length;
  document.getElementById("progress-text").textContent = `${count} de ${salas.length} salas`;
  const bar = document.getElementById("progress-bar");
  bar.setAttribute("aria-valuenow", count);
  bar.querySelector("span").style.width = `${count / salas.length * 100}%`;
}
function exhibitMarkup(item) {
  return `<article class="exhibit"><details><summary><span class="exhibit-head"><span class="tag">${esc(item.etiqueta)}</span>${item.numero ? `<span class="exhibit-number">${String(item.numero).padStart(2,"0")}</span>` : ""}</span><strong>${esc(item.titulo)}</strong><span class="summary-text">${esc(item.resumen)}</span><span class="more">Abrir exhibición +</span></summary><div class="exhibit-detail"><p>${esc(item.detalle)}</p>${item.fuente ? `<div class="source-note"><strong>Fuente:</strong> ${esc(item.fuente)}</div>` : ""}</div></details></article>`;
}
function microCards(items, className = "") {
  return `<div class="micro-grid ${className}">${items.map(x => `<details class="micro-card"><summary>${esc(x.nombre)} <span aria-hidden="true">+</span></summary><p>${esc(x.dato)}</p></details>`).join("")}</div>`;
}
function panel(title, content, note = "") {
  return `<section class="interactive"><h3>${esc(title)}</h3>${content}${note ? `<p class="diagram-note">${esc(note)}</p>` : ""}</section>`;
}
function specialMarkup(data) {
  let html = "";
  if (data.lineaTiempo) html += panel("Línea de tiempo", `<div class="timeline">${data.lineaTiempo.map(x => `<details class="timeline-item"><summary>${esc(x.fecha)} <span aria-hidden="true">+</span></summary><p>${esc(x.texto)}</p></details>`).join("")}</div>`, "Abre cada fecha para conocerla. Las fechas son aproximadas; esta tradición se formó gradualmente.");
  if (data.vedas) html += panel("Explora los cuatro Vedas", microCards(data.vedas));
  if (data.varnas) html += panel("Esquema histórico de varnas", microCards(data.varnas, "five"), "Las jātis y las experiencias reales son más complejas que este esquema. La discriminación es injusta y está prohibida legalmente en India.");
  if (data.trimurti) html += panel("La Trimūrti", microCards(data.trimurti, "three"), "Una representación presente en algunas explicaciones; la diversidad hinduista va más allá de estas tres formas.");
  if (data.ashramas) html += panel("Cuatro etapas ideales de la vida", microCards(data.ashramas), "Modelo clásico vinculado sobre todo a varones de ciertos grupos sociales.");
  if (data.ciclo) html += panel("Del ciclo a la liberación", `<div class="cycle">${data.ciclo.map((x,i) => `${i ? '<span class="cycle-arrow" aria-hidden="true">›</span>' : ""}<div class="cycle-step" style="animation-delay:${i * 2}s">${esc(x)}</div>`).join("")}</div>`, "El diagrama simplifica distintas interpretaciones religiosas.");
  if (data.fiestas) html += panel("Calendario de celebraciones", `<div class="festival-grid">${data.fiestas.map(x => `<div class="festival"><strong>${esc(x.nombre)}</strong><em>${esc(x.simbolo)}</em><p>${esc(x.dato)}</p><a href="${safeUrl(x.fuente)}" target="_blank" rel="noopener noreferrer">Consultar fuente</a></div>`).join("")}</div>`);
  if (data.ambitos) html += panel("Cuatro ámbitos de la vida actual", microCards(data.ambitos));
  if (data.comparaciones) html += panel("Comparador", `<div class="compare"><div class="compare-row compare-header"><div>Tema</div><div>Hinduismo</div><div>Catolicismo</div></div>${data.comparaciones.map(x => `<div class="compare-row"><strong>${esc(x.tema)}</strong><div>${esc(x.hinduismo)}</div><div>${esc(x.catolicismo)}</div></div>`).join("")}</div>`, "Resumen general para estudiar; dentro de cada tradición existen matices.");
  return html;
}
function mapMarkup() {
  return `<section class="section"><div class="section-head"><div><span class="kicker">MAPA DEL MUSEO</span><h2>Elige una sala</h2><p>Puedes seguir el recorrido en orden o entrar directamente a un tema.</p></div></div><div class="room-map">${salas.slice(1).map((s,i) => `<a class="map-card" href="#${s.id}"><span class="number">${String(i+1).padStart(2,"0")}</span><strong>${esc(s.nombre)}</strong><span>Entrar a la sala</span></a>`).join("")}</div></section>`;
}
function photoMarkup(id) {
  if (id === "fiestas") return `<div class="photo-row"><figure><img src="${esc(imageSource("assets/img/diwali.jpg"))}" alt="Conjunto de lámparas tradicionales encendidas para Diwali" loading="lazy"><figcaption>Diwali · dhondusaxena / Wikimedia Commons, CC BY-SA 2.0</figcaption></figure><figure><img src="${esc(imageSource("assets/img/holi.jpg"))}" alt="Celebración de Holi con polvos de colores" loading="lazy"><figcaption>Holi · Shraddhasinghuikey / Wikimedia Commons, CC BY-SA 4.0</figcaption></figure></div>`;
  return "";
}
function quizMarkup(quiz) {
  if (!quiz) return "";
  return `<section class="quiz" aria-labelledby="quiz-title"><span class="kicker">COMPRUEBA LO APRENDIDO</span><h3 id="quiz-title">${esc(quiz.pregunta)}</h3><div class="quiz-options">${quiz.opciones.map((x,i) => `<button type="button" data-answer="${i}">${esc(x)}</button>`).join("")}</div><p class="quiz-result" role="status" aria-live="polite"></p></section>`;
}
function bibliographyMarkup(bib, credits) {
  const book = bib.principal.map(x => `<li>${esc(x.autor)} (${esc(x.anio)}). <em>${esc(x.titulo)}</em>. ${esc(x.editorial)} (${esc(x.paginas)}).</li>`).join("");
  const cited = bib.citadasEnLibro.map(x => `<li>${esc(x.autor)}. <em>${esc(x.titulo)}</em>. ${esc(x.nota)}</li>`).join("");
  const extra = bib.adicionales.map(x => `<li>${esc(x.autor)}. <a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.titulo)}</a>.</li>`).join("");
  const images = credits.imagenes.map(x => `<li><a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.titulo)}</a> — ${esc(x.autor)}, <a href="${safeUrl(x.licenciaUrl)}" target="_blank" rel="noopener noreferrer">${esc(x.licencia)}</a>. ${esc(x.modificaciones)}</li>`).join("")
    +(credits.texturas||[]).map(x=>`<li>${esc(x.titulo)} — ${esc(x.autor)}. ${esc(x.uso)}</li>`).join("");
  return `<section class="section"><span class="kicker">FUENTES CONSULTADAS</span><h2>Bibliografía y créditos</h2><div class="bibliography"><div class="bib-group"><h3>Fuente principal</h3><ul>${book}</ul></div><div class="bib-group"><h3>Obras citadas en el libro</h3><ul>${cited}</ul></div><div class="bib-group"><h3>Fuentes adicionales</h3><ul>${extra}</ul></div><div class="bib-group"><h3>Créditos de imágenes</h3><ul>${images}</ul></div></div><div class="callout"><strong>Antes de entregar</strong><p>${esc(bib.nota)}</p></div></section>`;
}
async function getJSON(file) {
  if (cache.has(file)) return cache.get(file);
  await window.museoOfflineReady;
  if (location.protocol === "file:") {
    const data = window.MUSEO_OFFLINE?.content?.[file];
    if (!data) throw new Error(`Faltan datos para ${file}. Ejecuta actualizar-offline.py.`);
    cache.set(file, data);
    return data;
  }
  const response = await fetch(`content/${file}`);
  if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
  const data = await response.json();
  cache.set(file, data);
  return data;
}
async function render() {
  const id = decodeURIComponent(location.hash.slice(1)) || "vestibulo";
  const roomIndex = Math.max(0, salas.findIndex(s => s.id === id));
  const room = salas[roomIndex];
  nav.innerHTML = navMarkup(room.id);
  menu.setAttribute("aria-expanded", "false");
  sidebar.classList.remove("open");
  try {
    const data = await getJSON(room.archivo);
    const [bib, credits] = room.id === "final" ? await Promise.all([getJSON("bibliografia.json"), getJSON("creditos.json")]) : [null,null];
    const heroImage = room.id === "vestibulo" || room.id === "sala-41" ? `<img class="hero-image" src="${esc(imageSource("assets/img/varanasi.jpg"))}" alt="Vista nocturna de los ghats de Varanasi, India">` : "";
    const hero = `<section class="hero">${heroImage}<div class="hero-content"><span class="eyebrow">SALA ${esc(data.numeroSala)} · EQUIPO 4</span><h1>${esc(data.titulo)}</h1><p>${esc(data.subtitulo)}</p><div class="hero-meta"><span>FORMACIÓN HUMANA</span><span>HINDUISMO</span></div></div></section>`;
    const pager = `<nav class="room-pager" aria-label="Cambiar de sala">${roomIndex ? `<a href="#${salas[roomIndex-1].id}">‹ Sala anterior</a>` : ""}${roomIndex < salas.length-1 ? `<a class="next" href="#${salas[roomIndex+1].id}">Siguiente sala ›</a>` : `<a class="next" href="#vestibulo">Volver al inicio</a>`}</nav>`;
    app.innerHTML = `${hero}<div class="room-body"><p class="room-intro">${esc(data.introduccion)}</p>${room.id === "vestibulo" ? mapMarkup() : ""}<section class="section"><span class="kicker">${room.id === "vestibulo" ? "ANTES DE EMPEZAR" : "PREGUNTAS GUÍA"}</span><h2>Exhibiciones</h2><div class="exhibit-grid">${data.exhibiciones.map(exhibitMarkup).join("")}</div></section>${specialMarkup(data)}${photoMarkup(room.id)}${data.reflexion ? `<div class="callout"><strong>Pregunta para conversar</strong><p>${esc(data.reflexion)}</p></div>` : ""}${bib ? bibliographyMarkup(bib,credits) : ""}${quizMarkup(data.quiz)}${pager}</div>`;
    document.title = `${data.titulo} · Museo del hinduismo`;
    visited.add(room.id);
    try { localStorage.setItem("museo-hinduismo-visitadas", JSON.stringify([...visited])); } catch { /* El recorrido funciona sin almacenamiento. */ }
    updateProgress();
    app.querySelectorAll(".quiz button").forEach(button => button.addEventListener("click", () => {
      const quiz = data.quiz;
      const correct = Number(button.dataset.answer) === quiz.correcta;
      app.querySelectorAll(".quiz button").forEach(b => { b.disabled = true; b.classList.add(Number(b.dataset.answer) === quiz.correcta ? "correct" : b === button ? "incorrect" : ""); });
      app.querySelector(".quiz-result").textContent = `${correct ? "¡Correcto!" : "Puedes volver a revisar la exhibición."} ${quiz.explicacion}`;
    }));
    window.scrollTo({top:0,behavior:"instant"});
  } catch (error) {
    app.innerHTML = `<div class="error"><h1>No se pudo abrir el museo</h1><p>Revisa que la carpeta del museo conserve todos sus archivos. Si editaste los textos, ejecuta actualizar-offline.py. También puedes probarlo con un servidor local.</p><p>${esc(error.message)}</p></div>`;
  }
}
menu.addEventListener("click", () => { const expanded = menu.getAttribute("aria-expanded") === "true"; menu.setAttribute("aria-expanded", String(!expanded)); sidebar.classList.toggle("open", !expanded); });
window.addEventListener("hashchange", render);
render();
