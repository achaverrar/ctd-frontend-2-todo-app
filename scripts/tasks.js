// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
const token = localStorage.getItem("jwt");
if (!token) {
  location.replace("./index.html");
}

/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener("load", function () {
  /* ---------------- variables globales y llamado a funciones ---------------- */
  const tareasPendientesEl = document.querySelector(".tareas-pendientes");
  const tareasTerminadasEl = document.querySelector(".tareas-terminadas");
  const totalFinalizadasEl = document.querySelector("#cantidad-finalizadas");
  const container = document.querySelector("main.container");

  const botonLogout = document.querySelector("#closeApp");
  const formCrearTarea = document.forms[0];
  const urlUser = "https://todo-api.digitalhouse.com/v1/users/getMe";
  const urlTask = "https://todo-api.digitalhouse.com/v1/tasks";

  obtenerNombreUsuario();
  consultarTareas();
  manejarEventosBotonesTareas();

  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */
  botonLogout.addEventListener("click", function (e) {
    confirmarAccion("¿En verdad deseas cerrar sesión?")
      .then((cerrarSesion) => {
        if (!cerrarSesion) return;

        deshabilitarBoton(e.target);
        localStorage.removeItem("jwt");

        setTimeout(() => {
          location.replace("./index.html");
        }, 2000);
      })
      .catch((err) => {
        notificarError(err);
        habilitarBoton(e.target);
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */
  function obtenerNombreUsuario() {
    const settings = {
      method: "GET",
      headers: {
        Authorization: token,
      },
    };
    fetch(urlUser, settings)
      .then((res) => res.json())
      .then((data) => {
        const esError = !data.firstName;

        if (esError) throw new Error(data);

        const userInfo = document.querySelector(".user-info p");
        userInfo.innerText = data.firstName;
      })
      .catch((err) => notificarError(err));
  }

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */
  function consultarTareas() {
    fetch(urlTask, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const esError = !Array.isArray(data);

        if (esError) throw new Error(data);

        const tareasOrdenadasPorFecha = data.sort(
          (tareaA, tareaB) =>
            new Date(tareaB.createdAt) - new Date(tareaA.createdAt)
        );
        renderizarTareas(tareasOrdenadasPorFecha);
        // botonesCambioEstado();
      })
      .catch((err) => notificarError(err));
  }

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */
  formCrearTarea.addEventListener("submit", function (event) {
    event.preventDefault();

    const botonCrearTarea = formCrearTarea.querySelector("[type=submit]");
    deshabilitarBoton(botonCrearTarea);

    const nuevaTarea = document.getElementById("nuevaTarea");
    const VALIDACION_FORMULARIO = [
      {
        nombreCampo: "description",
        campo: nuevaTarea,
        validador: validarTexto,
      },
    ];

    const [data, mensajesError] = validarFormulario(VALIDACION_FORMULARIO);

    if (mensajesError.length > 0) {
      habilitarBoton(botonCrearTarea);
      return notificarError(mensajesError.join("\n"));
    }

    data.completed = false;

    const settings = {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch(urlTask, settings)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const esError = !data.userId;

        if (esError) throw new Error(data);

        totalFinalizadasEl.innerText;
        nuevaTarea.value = "";
        tareasPendientesEl.innerHTML =
          generarTareaPendiente(data) + tareasPendientesEl.innerHTML;
      })
      .catch((err) => notificarError(err))
      .finally(() => habilitarBoton(botonCrearTarea));
  });

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(listado) {
    let contador = 0;
    totalFinalizadasEl.innerText = contador;
    tareasPendientesEl.innerHTML = "";
    tareasTerminadasEl.innerHTML = "";

    listado.forEach((tarea) => {
      if (tarea.completed) {
        contador++;
        tareasTerminadasEl.innerHTML += generarTareaCompletada(tarea);
      } else {
        tareasPendientesEl.innerHTML += generarTareaPendiente(tarea);
      }
    });
    totalFinalizadasEl.innerText = contador;
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  function manejarEventosBotonesTareas() {
    // El elemento que contiene los botones, está pendiente de todos los clicks que
    // hacen en su interior
    container.addEventListener("click", (e) => {
      const boton = e.target.closest("button");

      // Si el click no es sobre un botón, no hace nada
      if (!boton) return;
      // Maneja el evento, dependiendo del tipo de botón sobre el que se hizo click
      if (boton.classList.contains("change")) cambiarEstadoTarea(boton);
      if (boton.classList.contains("borrar")) borrarTarea(boton);
    });
  }

  function cambiarEstadoTarea(boton) {
    deshabilitarBoton(boton);
    const tareaEl = boton.closest(".tarea");
    const idTarea = boton.id;
    const urlCambiarEstadoTarea = `${urlTask}/${idTarea}`;

    const estaCompleta = boton.classList.contains("incompleta");
    const textoTarea = tareaEl.querySelector(".nombre").textContent;

    const settings = {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        description: textoTarea,
        completed: !estaCompleta,
      }),
    };

    fetch(urlCambiarEstadoTarea, settings)
      .then((res) => res.json())
      .then((data) => {
        const esError = !data.userId;

        if (esError) throw new Error(data);

        consultarTareas();
      })
      .catch((err) => {
        notificarError(err);
        habilitarBoton(boton);
      });
  }

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function borrarTarea(boton) {
    deshabilitarBoton(boton);

    const idTarea = boton.id;
    const urlEliminarTarea = `${urlTask}/${idTarea}`;
    const settings = {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-type": "application/json",
      },
    };

    fetch(urlEliminarTarea, settings)
      .then((res) => {
        if (!res.ok) return res.json();
      })
      .then((data) => {
        const esError = data !== undefined;
        if (esError) throw new Error(data);

        const tareaEl = boton.closest(".tarea");
        tareaEl.remove();
      })
      .catch((err) => {
        habilitarBoton(boton);
        notificarError(err);
      });
  }
});

const generarTareaPendiente = ({ id, description, createdAt }) => {
  const fecha = new Date(createdAt);

  return `
    <li class="tarea">
      <button class="change" id="${id}"><i class="fa-regular fa-circle"></i></button>
      <div class="descripcion">
        <p class="nombre">${description}</p>
        <p class="timestamp">${fecha.toLocaleDateString()}</p>
      </div>
    </li>
    `;
};

const generarTareaCompletada = ({ id, description }) => {
  return `
          <li class="tarea">
            <div class="hecha">
              <i class="fa-regular fa-circle-check"></i>
            </div>
            <div class="descripcion">
              <p class="nombre">${description}</p>
              <div class="cambios-estados">
                <button class="change incompleta" id="${id}" ><i class="fa-solid fa-rotate-left"></i></button>
                <button class="borrar" id="${id}"><i class="fa-regular fa-trash-can"></i></button>
              </div>
            </div>
          </li>
        `;
};
