const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const CONTRASENIA_REGEX = /\S{4,}/;

/* ---------------------------------- texto --------------------------------- */
function validarTexto(texto) {
  const textoNormalizado = normalizarTexto(texto);
  let errorMessage = "";

  if (!textoNormalizado) {
    errorMessage = "El texto no puede estar vacío";
  } else if (textoNormalizado.length < 3) {
    errorMessage = "El texto debe tener al menos 3 caracteres";
  }

  return [textoNormalizado, errorMessage];
}

function normalizarTexto(texto) {
  return texto?.trim();
}

/* ---------------------------------- email --------------------------------- */
function validarEmail(email) {
  const emailNormalizado = normalizarEmail(email);
  let errorMessage = "";

  if (!emailNormalizado) {
    errorMessage = "El email no puede estar vacío";
  } else if (!EMAIL_REGEX.test(emailNormalizado)) {
    errorMessage = "El formato del email es inválido";
  }

  return [emailNormalizado, errorMessage];
}

function normalizarEmail(email) {
  return email?.trim()?.toLowerCase();
}

/* -------------------------------- password -------------------------------- */
function validarContrasenia(contrasenia) {
  let errorMessage = "";

  if (!contrasenia?.trim()) {
    errorMessage = "La contraseña no puede estar vacía";
  } else if (!CONTRASENIA_REGEX.test(contrasenia)) {
    errorMessage = "La contraseña no puede tener espacios";
  }

  return [contrasenia, errorMessage];
}

function compararContrasenias(contrasenia1, contrasenia2) {
  let errorMessage = "";

  if (contrasenia1 !== contrasenia2) {
    errorMessage = "Las contraseñas deben coincidir";
  }

  return [[contrasenia1, contrasenia2], errorMessage];
}

/* -------------------------------- formulario -------------------------------- */

function validarFormulario(config) {
  const mensajesError = [];
  const datos = {};

  // Valida campo por campo:
  // Guarda los datos normalizados en el objeto datos y
  // Guarda los mensajes de error en un arreglo
  // Cambia el estilo de los campos con datos inválidos
  // Restablece los estilos de los campos con datos válidos
  config.forEach(({ nombreCampo, campo, validador }) => {
    const [dato, mensajeError] = validador(campo.value);
    // mensajeError solo es nulo cuando el valor
    // que ingresa el usuario pasa todas las validaciones
    if (mensajeError) {
      invalidarCampo(campo);
      mensajesError.push(mensajeError);
    } else {
      restablecerValidezCampo(campo);
    }
    datos[nombreCampo] = dato;
  });

  return [datos, mensajesError];
}

function invalidarCampo(campo) {
  campo.classList.add("invalid");
}

function restablecerValidezCampo(campo) {
  campo.classList.remove("invalid");
}

/* ----------------------------- notificaciones ----------------------------- */
function notificarError(mensaje) {
  Swal.fire({
    icon: "error",
    width: 400,
    text: mensaje,
  });
}

function confirmarAccion(mensaje) {
  return Swal.fire({
    text: mensaje,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff7059ff",
    cancelButtonColor: "#00cc7eff",
    width: 400,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
  }).then((result) => result.isConfirmed);
}

/* --------------------------------- loader --------------------------------- */
function agregarLoader(elemento) {
  const loader = document.createElement("span");
  loader.className = "loader";
  elemento.prepend(loader);
}

function quitarLoader(elemento) {
  const loader = elemento.querySelector(".loader");
  loader?.remove();
}

function deshabilitarBoton(boton) {
  boton.disabled = true;
  boton.style.cursor = "not-allowed";
  agregarLoader(boton);
}

function habilitarBoton(boton) {
  boton.disabled = false;
  boton.style.cursor = "pointer";
  quitarLoader(boton);
}
