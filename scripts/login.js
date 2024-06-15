window.addEventListener("load", function () {
  /* ---------------------- obtenemos variables globales ---------------------- */
  const url = "https://todo-api.digitalhouse.com/v1/users/login";
  const form = document.forms[0];
  const botonlogin = form.querySelector("[type=submit]");
  const inputEmail = document.querySelector("#inputEmail");
  const inputContrasenia = document.querySelector("#inputPassword");

  /* -------------------------------------------------------------------------- */
  /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
  /* -------------------------------------------------------------------------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const VALIDACION_CAMPOS = [
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
    ];

    const [data, mensajesError] = validarFormulario(VALIDACION_CAMPOS);

    if (mensajesError.length > 0) {
      return notificarError(mensajesError.join("\n"));
    }

    const config = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
      },
    };

    realizarLogin(config);
  });

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 2: Realizar el login [POST]                    */
  /* -------------------------------------------------------------------------- */
  function realizarLogin(settings) {
    deshabilitarBoton(botonlogin);
    fetch(url, settings)
      .then((res) => res.json())
      .then((data) => {
        if (!data.jwt) throw new Error(data);

        localStorage.setItem("jwt", data.jwt);
        setTimeout(() => {
          location.replace("./mis-tareas.html");
        }, 2000);
      })
      .catch((mensajeError) => {
        habilitarBoton(botonlogin);
        notificarError(mensajeError);
      });
  }
});
