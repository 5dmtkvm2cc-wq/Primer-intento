// ============================================================
// AGENDA ESTÉTICA LÓPEZ
// Guarda las citas en el navegador (localStorage) para que no
// se pierdan al recargar la página.
// ============================================================

// ---------- 1. DATOS ----------
// Cada cita es un objeto: { nombre: "Ana", fecha: "2026-11-02T10:30" }
// "fecha" viene del input datetime-local, en ese mismo formato de texto.

let citas = cargarCitas();

function cargarCitas() {
    const guardado = localStorage.getItem("citas");
    // Si no hay nada guardado todavía, empezamos con una lista vacía
    return guardado ? JSON.parse(guardado) : [];
}

function guardarCitas() {
    // localStorage solo guarda texto, por eso convertimos con JSON.stringify
    localStorage.setItem("citas", JSON.stringify(citas));
}

// ---------- 2. ELEMENTOS DEL HTML ----------
// Los buscamos por su id (los mismos ids de tu HTML)
const fechaActual = document.getElementById("current-date");
const listaHoy = document.getElementById("appointments-list");
const listaProximas = document.getElementById("upcoming-appointments-list");
const listaBusqueda = document.getElementById("search-results-list");

const formAgregar = document.getElementById("appointment-form");
const formEliminar = document.getElementById("delete-appointment-form");
const formEditar = document.getElementById("edit-appointment-form");
const formBuscar = document.getElementById("search-appointment-form");

// ---------- 3. FUNCIONES AUXILIARES ----------

// Convierte "2026-11-02T10:30" en algo legible: "lunes, 2 de noviembre, 10:30"
function formatearFecha(textoFecha) {
    return new Date(textoFecha).toLocaleString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Compara sin importar mayúsculas ni espacios: "  ANA " == "ana"
function normalizar(texto) {
    return texto.trim().toLowerCase();
}

// Devuelve true si la fecha de la cita es hoy
function esHoy(textoFecha) {
    const cita = new Date(textoFecha);
    const hoy = new Date();
    return cita.toDateString() === hoy.toDateString();
}

// Pinta una lista (ul) con las citas que le pases
function pintarLista(ul, lista, mensajeVacio) {
    ul.innerHTML = ""; // vaciamos la lista

    if (lista.length === 0) {
        const li = document.createElement("li");
        li.textContent = mensajeVacio;
        ul.appendChild(li);
        return;
    }

    lista.forEach(function (cita) {
        const li = document.createElement("li");
        // textContent (y no innerHTML) evita que alguien meta código raro en el nombre
        li.textContent = cita.nombre + " — " + formatearFecha(cita.fecha);
        ul.appendChild(li);
    });
}

// ---------- 4. MOSTRAR TODO ----------
function actualizarPantalla() {
    const ahora = new Date();

    // Ordenamos de la más cercana a la más lejana
    const ordenadas = citas.slice().sort(function (a, b) {
        return new Date(a.fecha) - new Date(b.fecha);
    });

    const deHoy = ordenadas.filter(function (c) {
        return esHoy(c.fecha);
    });

    // Próximas = futuras y que NO son de hoy
    const proximas = ordenadas.filter(function (c) {
        return new Date(c.fecha) > ahora && !esHoy(c.fecha);
    });

    pintarLista(listaHoy, deHoy, "No hay citas para hoy.");
    pintarLista(listaProximas, proximas, "No hay próximas citas.");
}

// ---------- 5. FECHA Y SALUDO ----------
function mostrarFechaYSaludo() {
    const ahora = new Date();

    fechaActual.textContent = ahora.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Cambia el saludo según la hora
    const hora = ahora.getHours();
    let saludo = "Buenas noches";
    if (hora < 12) saludo = "Buenos días";
    else if (hora < 19) saludo = "Buenas tardes";

    document.getElementById("saludo").textContent = saludo;
}

// ---------- 6. FORMULARIOS ----------
// Cada formulario escucha el evento "submit" (cuando pulsas el botón).
// event.preventDefault() evita que la página se recargue.

// AGREGAR
formAgregar.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("client-name").value.trim();
    const fecha = document.getElementById("appointment-date").value;

    citas.push({ nombre: nombre, fecha: fecha });
    guardarCitas();
    actualizarPantalla();
    formAgregar.reset(); // limpia los campos
});

// ELIMINAR (elimina TODAS las citas con ese nombre)
formEliminar.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = normalizar(document.getElementById("delete-client-name").value);
    const antes = citas.length;

    citas = citas.filter(function (c) {
        return normalizar(c.nombre) !== nombre;
    });

    if (citas.length === antes) {
        alert("No se encontró ninguna cita con ese nombre.");
        return;
    }

    guardarCitas();
    actualizarPantalla();
    formEliminar.reset();
});

// EDITAR (cambia la fecha de la cita de ese cliente)
formEditar.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = normalizar(document.getElementById("edit-client-name").value);
    const nuevaFecha = document.getElementById("edit-appointment-date").value;

    const coincidencias = citas.filter(function (c) {
        return normalizar(c.nombre) === nombre;
    });

    if (coincidencias.length === 0) {
        alert("No se encontró ninguna cita con ese nombre.");
        return;
    }
    if (coincidencias.length > 1) {
        alert("Hay varias citas con ese nombre. Elimina las que sobren y vuelve a intentarlo.");
        return;
    }

    coincidencias[0].fecha = nuevaFecha;
    guardarCitas();
    actualizarPantalla();
    formEditar.reset();
});

// BUSCAR
formBuscar.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = normalizar(document.getElementById("search-client-name").value);

    const resultados = citas.filter(function (c) {
        // includes: basta con que el nombre contenga lo escrito ("an" encuentra "Ana")
        return normalizar(c.nombre).includes(nombre);
    });

    pintarLista(listaBusqueda, resultados, "No se encontraron citas.");
});

// ---------- 7. ARRANQUE ----------
mostrarFechaYSaludo();
actualizarPantalla();