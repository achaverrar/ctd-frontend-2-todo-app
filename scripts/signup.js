window.addEventListener("load", function () {
  /* ---------------------- obtenemos variables globales ---------------------- */
  const url = "https://todo-api.digitalhouse.com/v1/users";
  const form = document.forms[0];
  const botonSignUp = form.querySelector("[type=submit]");
  const inputNombre = document.querySelector("#inputNombre");
  const inputApellido = document.querySelector("#inputApellido");
  const inputEmail = document.querySelector("#inputEmail");
  const inputContrasenia = document.querySelector("#inputPassword");
  const inputReContrasenia = document.querySelector("#inputPasswordRepetida");

  /* -------------------------------------------------------------------------- */
  /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
  /* -------------------------------------------------------------------------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const VALIDACION_CAMPOS = [
      {
        nombreCampo: "firstName",
        campo: inputNombre,
        validador: validarTexto,
      },
      {
        nombreCampo: "lastName",
        campo: inputApellido,
        validador: validarTexto,
      },
      {
        nombreCampo: "email",
        campo: inputEmail,
        validador: validarEmail,
      },
      {
        nombreCampo: "password",
        campo: inputContrasenia,
        validador: validarContrasenia,
      },
      {
        nombreCampo: "rePassword",
        campo: inputReContrasenia,
        validador: (reContrasenia) =>
          compararContrasenias(inputContrasenia.value, reContrasenia),
      },
    ];

    const [datos, mensajesError] = validarFormulario(VALIDACION_CAMPOS);

    if (mensajesError.length > 0) {
      return notificarError(mensajesError.join("\n"));
    }

    const { rePassword, ...bodyObj } = datos;

    const config = {
      method: "POST",
      body: JSON.stringify(bodyObj),
      headers: {
        "Content-type": "application/json",
      },
    };

    realizarRegister(config);
  });

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 2: Realizar el signup [POST]                    */
  /* -------------------------------------------------------------------------- */
  function realizarRegister(settings) {
    deshabilitarBoton(botonSignUp);
    fetch(url, settings)
      .then((res) => res.json())
      .then((data) => {
        const esError = !data.jwt;

        if (esError) throw new Error(data);

        localStorage.setItem("jwt", data.jwt);
        setTimeout(() => {
          location.replace("./mis-tareas.html");
        }, 2000);
      })
      .catch((err) => {
        habilitarBoton(botonSignUp);
        notificarError(err);
      });
  }
});
