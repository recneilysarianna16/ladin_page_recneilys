// BASE DE DATOS LOCAL (MODO OFFLINE / RESPALDO)

const MASCOTAS_LOCALES = [
  { nombre: "PASTOR ALEMAN", img: "https://images.dog.ceo/breeds/germanshepherd/n02106662_16147.jpg" },
  { nombre: "HUSKY SIBERIANO", img: "https://images.dog.ceo/breeds/husky/n02110185_10047.jpg" },
  { nombre: "GOLDEN RETRIEVER", img: "https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg" },
  { nombre: "PUG GUERRERO", img: "https://images.dog.ceo/breeds/pug/n02110958_13430.jpg" }
];

const CHISTES_LOCALES = [
  "Hay 10 tipos de personas en el mundo: las que entienden binario y las que no.",
  "Un bucle infinito intentóoromper la memoria, pero el desarrollador ya se habia ido a almorzar!",
  "¿Que le dice un bit a otro? Nos vemos en el bus.",
  "JavaScript no tiene errores, solo sorpresas de tiempo de ejecucion no documentadas.",
  "Un programador va al supermercado y le dicen: 'Trae una barra de pan, y si hay huevos, trae una docena'. Volvió con 12 barras de pan.",
  "El código limpio no existe, solo existe código que aún no ha fallado en producción.",
  "Hardware: La parte de la computadora que puedes golpear cuando falla el software.",
  "Hay dos cosas difíciles en la informatica: invalidar la cache y nombrar variables."
];

// MÓDULO DE VALIDACIONES Y DOM

const regexNickname = /^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ\s-]+$/;

function validarNombre(nombre) {
  const contenedor = document.getElementById('contenedor-stats');

  if (!nombre || nombre.trim() === "") {
    contenedor.innerHTML = '<p style="color: #ff6b6b;"> Ingresa un Nickname valido.</p>';
    return false;
  }

  if (nombre.length < 2 || nombre.length > 20) {
    contenedor.innerHTML = '<p style="color: #ff6b6b;"> El nickname debe tener entre 2 y 20 caracteres.</p>';
    return false;
  }

  if (!regexNickname.test(nombre)) {
    contenedor.innerHTML = '<p style="color: #ff6b6b;"> Solo se permiten letras, numeros y guiones.</p>';
    return false;
  }

  return true;
}

function manejarInputTiempoReal(e) {
  const input = e.target;
  const valor = input.value;
  const msgValidacion = document.getElementById('mensaje-validacion');
  const contador = document.getElementById('contador-caracteres');

  contador.textContent = `${valor.length}/20`;

  if (valor.length === 0) {
    msgValidacion.textContent = "Esperando entrada";
    msgValidacion.style.color = "var(--text-secondary)";
    input.classList.remove('invalid-input');
  } else if (valor.length >= 2 && regexNickname.test(valor)) {
    msgValidacion.textContent = "Nickname valido";
    msgValidacion.style.color = "var(--neon-green)";
    input.classList.remove('invalid-input');
  } else {
    msgValidacion.textContent = "Nickname invalido";
    msgValidacion.style.color = "var(--neon-red)";
    input.classList.add('invalid-input');
  }
}

function mostrarResultado(contenedor, nick, nivel, esLegendario = false, coincidencias = 0) {
  let rangoTexto = "";
  let lvlTexto = "";

  if (esLegendario) {
    lvlTexto = "LVL 99";
    rangoTexto = "MITICO / LEGENDARIO";
    contenedor.innerHTML = `
      <p>Nickname: <strong>${nick}</strong></p>
      <div class="stat-val">${lvlTexto}</div>
      <small style="color: var(--neon-green)">Rango: ${rangoTexto}</small>
    `;
  } else {
    rangoTexto = nivel > 40 ? "Veterano Elite" : "Jugador Promesa";
    lvlTexto = `LVL ${nivel}`;
    contenedor.innerHTML = `
      <p>Nickname: <strong>${nick}</strong></p>
      <div class="stat-val">${lvlTexto}</div>
      <small style="color: var(--text-secondary)">Rango: ${rangoTexto} (${coincidencias} registros)</small>
    `;
  }
}

// MÓDULO DE PETICIONES CON RESPALDO OFFLINE

// 1. Agify API
async function obtenerStatsGamer(nick) {
  if (!validarNombre(nick)) return;

  const contenedor = document.getElementById('contenedor-stats');
  contenedor.innerHTML = '<p>Escaneando red de servidores...</p>';

  try {
    const res = await fetch(`https://api.agify.io/?name=${encodeURIComponent(nick)}`);
    if (!res.ok) throw new Error("Sin conexion o error de API");

    const data = await res.json();

    if (!data.age) {
      mostrarResultado(contenedor, nick, 99, true);
    } else {
      mostrarResultado(contenedor, data.name, data.age, false, data.count);
    }
  } catch (error) {
    const nivelLocal = Math.floor(Math.random() * 80) + 10;
    mostrarResultado(contenedor, nick, nivelLocal, false, 1);
  }
}

// 2. Dog CEO API 
async function obtenerMascota() {
  const contenedor = document.getElementById('contenedor-mascota');
  contenedor.innerHTML = '<p>Invocando criatura...</p>';

  try {
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    if (!res.ok) throw new Error("Sin conexion a la API");

    const data = await res.json();
    const partesUrl = data.message.split('/');
    const raza = partesUrl[partesUrl.length - 2].replace('-', ' ').toUpperCase();

    contenedor.innerHTML = `
      <img class="dog-img" src="${data.message}" alt="Montura">
      <p style="margin-top: 8px; font-weight: bold; color: var(--neon-green);">${raza}</p>
    `;
  } catch (error) {
    const aleatorio = MASCOTAS_LOCALES[Math.floor(Math.random() * MASCOTAS_LOCALES.length)];
    
    contenedor.innerHTML = `
      <img class="dog-img" src="${aleatorio.img}" alt="Montura">
      <p style="margin-top: 8px; font-weight: bold; color: var(--neon-green);">${aleatorio.nombre} (Offline)</p>
    `;
  }
}

// Helper traducción
async function traducir(texto) {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|es`);
    const data = await res.json();
    return data.responseData?.translatedText || texto;
  } catch (error) {
    return texto;
  }
}

// 3. Geek Jokes API + Traducción (Chistes de Informática Infinitos)
async function obtenerChisteDev() {
  const contenedor = document.getElementById('contenedor-poder');
  contenedor.innerHTML = '<p>Compilando chiste dev...</p>';
  
  try {
    // Petición a Geek Jokes API (Devuelve un objeto JSON con un chiste técnico aleatorio)
    const res = await fetch('https://geek-jokes.sameerkumar.website/api?format=json');
    if (!res.ok) throw new Error("Sin conexion a la API");

    const data = await res.json();
    
    // Traducimos el chiste al español dinámicamente
    const chisteTraducido = await traducir(data.joke);

    contenedor.innerHTML = `<p>"${chisteTraducido}"</p>`;
  } catch (error) {
    // MODO OFFLINE: Selecciona un chiste aleatorio de la lista local
    const chisteAleatorio = CHISTES_LOCALES[Math.floor(Math.random() * CHISTES_LOCALES.length)];
    
    contenedor.innerHTML = `<p>"${chisteAleatorio}"</p>`;
  }
}


// INICIALIZACIÓN Y EVENTOS

document.addEventListener('DOMContentLoaded', () => {
  const btnStats = document.getElementById('btn-stats');
  const inputNick = document.getElementById('input-nick');
  const btnMascota = document.getElementById('btn-nueva-mascota');
  const btnChiste = document.getElementById('btn-nuevo-poder');

  btnStats.addEventListener('click', () => obtenerStatsGamer(inputNick.value.trim()));
  
  inputNick.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') obtenerStatsGamer(inputNick.value.trim());
  });

  inputNick.addEventListener('input', manejarInputTiempoReal);
  btnMascota.addEventListener('click', obtenerMascota);
  btnChiste.addEventListener('click', obtenerChisteDev);

  // Carga inicial al abrir la página
  obtenerStatsGamer(inputNick.value.trim());
  obtenerMascota();
  obtenerChisteDev();
});