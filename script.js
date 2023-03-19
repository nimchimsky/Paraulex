// Variables globales
let itemsxnivel = 30;
let aciertosminimos = 20;
let nivel = 1;
let puntuacion = 0;
let palabras = [];
let pseudopalabras = [];
let pausado = false;
let itemInterval;
let contadorItems = 0;
let aciertos = 0;

// Función para cargar palabras y pseudopalabras de los archivos JSON
async function cargarItems() {
  try {
    const palabrasResponse = await fetch("words.json");
    palabras = await palabrasResponse.json();
    const pseudopalabrasResponse = await fetch("pseudo.json");
    pseudopalabras = await pseudopalabrasResponse.json();
  } catch (error) {
    console.error("Error al cargar los archivos JSON:", error);
  }
}

// Función para seleccionar 50 ítems al azar y mezclarlos
function seleccionarItems() {
    // Filtra las palabras y pseudopalabras según el nivel
    const palabrasNivel = palabras.filter((item) => item.L === nivel);
    const pseudopalabrasNivel = pseudopalabras.filter((item) => item.L === nivel);

    // Selecciona 15 palabras y 15 pseudopalabras al azar
    const palabrasSeleccionadas = seleccionarAleatoriamente(palabrasNivel, itemsxnivel / 2);
    const pseudopalabrasSeleccionadas = seleccionarAleatoriamente(pseudopalabrasNivel, itemsxnivel / 2);

    // Combina y mezcla las palabras y pseudopalabras
    const items = mezclarArrays(palabrasSeleccionadas, pseudopalabrasSeleccionadas);

    return items;
}

function seleccionarAleatoriamente(arr, n) {
    const resultado = [];
    for (let i = 0; i < n; i++) {
        const index = Math.floor(Math.random() * arr.length);
        resultado.push(arr[index]);
        arr.splice(index, 1);
    }
    return resultado;
}

function mezclarArrays(arr1, arr2) {
    const resultado = seleccionarAleatoriamente([...arr1, ...arr2], arr1.length + arr2.length);
    return resultado;
}

function verificarFinalizacionAnimacion(itemDiv, item, animation) {
    const interval = setInterval(() => {
        if (animation.playState === "finished") {
            if (!itemDiv.classList.contains("correct") && !itemDiv.classList.contains("incorrect")) {
                if (esPalabra(item)) {
                    modificarPuntuacion(-1); // Resta tantos puntos como el nivel actual si es una palabra
                } else {
                    modificarPuntuacion(+1); // Suma tantos puntos como el nivel actual si es una pseudopalabra
                }
                actualizarPuntuacion();
            }

            itemDiv.remove();
            clearInterval(interval);
        }
    }, 100);
}

function modificarPuntuacion(e) {
  if (e > 0) {
    aciertos++;
  }
  puntuacion += e * nivel;
  actualizarBarraDeProgreso();
  actualizarPuntuacion();
}

function esPalabra(item) {
    return palabras.some((palabra) => palabra.W === item.W);
}

// Función para crear y mostrar un ítem en la zona de juego
function mostrarItem(item) {
    // Crea un elemento div para el ítem
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.textContent = item.W;

    // Añade el ítem al DOM en la zona de juego
    const zonaDeJuego = document.querySelector(".game-area");
    zonaDeJuego.appendChild(itemDiv);

    // Establece la posición horizontal al azar
    const anchuraZonaDeJuego = zonaDeJuego.clientWidth;
    const anchuraItem = itemDiv.getBoundingClientRect().width;
    const posicionX = Math.floor(Math.random() * (anchuraZonaDeJuego - anchuraItem));
    itemDiv.style.left = `${posicionX}px`;

    // Establece la posición vertical inicial
    itemDiv.style.top = "0px";
    
	// Verifica si el ítem cruza la línea roja y cambia su estilo en consecuencia
	verificarCruceLineaRoja(itemDiv, item);	
	
	// Anima el ítem hacia abajo
	const distancia = zonaDeJuego.clientHeight - itemDiv.clientHeight;
	const duracion = 15; // 15 segundos
	const animation = itemDiv.animate([{ top: "0px" }, { top: `${distancia}px` }], {
		duration: duracion * 1000,
		easing: "linear",
	});

	// Inicia en pausa si el estado de pausa es verdadero
	if (pausado) {
		animation.pause();
	}
	
	// Verifica la finalización de la animación y actualiza la puntuación
	verificarFinalizacionAnimacion(itemDiv, item, animation);
	
	function esPalabra(item) {
		return palabras.some((palabra) => palabra.W === item.W);
}

    // Establece el atributo 'clicked' del dataset en 'false'
    itemDiv.dataset.clicked = 'false';
	
    // Evento de clic
    itemDiv.addEventListener("click", () => {
        // Verifica si el ítem ya ha sido clicado
        if (itemDiv.dataset.clicked === 'true') {
            return; // Si el ítem ya ha sido clicado, no hacer nada
        }

		// Verifica si el ítem ha cruzado completamente la línea roja
		const redLine = document.querySelector(".red-line");
		const redLineY = redLine.getBoundingClientRect().top;
		const itemY = itemDiv.getBoundingClientRect().top;

		if (itemY >= redLineY) {
			return; // Si el ítem ha cruzado la línea roja, no hacer nada
		}

        // Establece el atributo 'clicked' del dataset en 'true'
        itemDiv.dataset.clicked = 'true';
		
        // Comprueba si la respuesta es correcta
        const esCorrecta = palabras.some((palabra) => palabra.W === item.W);

        // Actualiza la puntuación y muestra el resultado
        if (esCorrecta) {
            modificarPuntuacion(+1);
            itemDiv.classList.add("correct");
        } else {
            modificarPuntuacion(-1);
            itemDiv.classList.add("incorrect");
        }
        actualizarPuntuacion();

        // Elimina el ítem después de 1 segundo
        setTimeout(() => {
            itemDiv.remove();
        }, 1000);
    });
}

function actualizarPuntuacion() {
    const puntuacionElement = document.querySelector("#score-value");
    puntuacionElement.textContent = puntuacion;
}

function actualizarNivel() {
    const nivelElement = document.querySelector("#level-value");
    nivelElement.textContent = nivel;
}

function actualizarBarraDeProgreso() {
  const progressYellow = document.querySelector(".progress-yellow");
  const progressGreen = document.querySelector(".progress-green");
  const progressBarWidth = document.querySelector(".progress-bar").clientWidth;

  const yellowWidth = Math.min(aciertos, aciertosminimos - 1) * (progressBarWidth / itemsxnivel);
  const greenWidth = Math.max(0, 1 + aciertos - aciertosminimos) * (progressBarWidth / itemsxnivel);

  progressYellow.style.width = `${yellowWidth}px`;
  progressGreen.style.width = `${greenWidth}px`;
  progressGreen.style.left = `${yellowWidth}px`;
}

// Función para iniciar el juego
function iniciarJuego(nivelInicial = 1) {
    reiniciarAciertos();
	// Carga las palabras y pseudopalabras de los archivos JSON
    cargarItems().then(() => {
        // Inicializa el nivel y la puntuación
        nivel = nivelInicial;
        puntuacion = 0;
        actualizarPuntuacion();
		actualizarBarraDeProgreso();
	
        // Comienza el nivel
        comenzarNivel();
    });
}

function mostrarMensajeNivel() {
    const mensajeNivel = document.createElement("div");
    mensajeNivel.classList.add("mensajenivel");
    mensajeNivel.textContent = `NIVELL ${nivel}`;
    
    const gameArea = document.querySelector(".game-area");
    gameArea.appendChild(mensajeNivel);
    
    return mensajeNivel;
}

function mostrarMensajeNivel() {
  const message = document.createElement("div");
  message.classList.add("level-message");
  message.textContent = `Nivell ${nivel}`;
  message.style.left = "50%";
  message.style.top = "-100px";
  message.style.transform = "translateX(-50%)";

  const gameArea = document.querySelector(".game-area");
  gameArea.appendChild(message);

  // Anima el mensaje de nivel hacia abajo
  const zonaDeJuego = document.querySelector(".game-area");
  const distancia = zonaDeJuego.clientHeight - message.clientHeight;
  const duracion = 15; // 15 segundos
  const animation = message.animate([{ top: "0px" }, { top: `${distancia}px` }], {
    duration: duracion * 1000,
    easing: "linear",
  });

  // Verifica si el mensaje de nivel cruza la línea roja y lo elimina
  verificarCruceLineaRoja(message, () => {
    message.remove();
  });
}

// Comienza el nivel
function comenzarNivel() {
    reiniciarAciertos();
	actualizarBarraDeProgreso();
	mostrarMensajeNivel(); 

       setTimeout(() => {
        const items = seleccionarItems(); // Selecciona y mezcla los ítems para el nivel actual
        contadorItems = 0; 
        clearInterval(itemInterval);

		itemInterval = setInterval(() => {
		  mostrarItem(items[contadorItems]);
		  ++contadorItems >= items.length &&
			(clearInterval(itemInterval),
			setTimeout(() => {
			  aciertos >= aciertosminimos
				? (nivel++, aciertos = 0, comenzarNivel())
				: (mostrarGameOver(), finalizarJuego());
			}, 15000));
		}, 1250);

		actualizarNivel();
	  }, 3000);
	}

 // Actualiza el nivel en la pantalla
    actualizarNivel();

function reiniciarAciertos() {
  aciertos = 0;
}

function verificarCruceLineaRoja(e, a) {
    let t = document.querySelector(".red-line"),
        n = t.getBoundingClientRect().top,
        r = e.getBoundingClientRect().top;

    if (r >= n && "false" === e.dataset.clicked) {
        let i = palabras.some(e => e.W === a.W);
        i ? (e.classList.add("incorrect"), modificarPuntuacion(-1)) : (e.classList.add("correct"), modificarPuntuacion(1));
        actualizarPuntuacion();
    } else if (!e.classList.contains("correct") && !e.classList.contains("incorrect")) {
        requestAnimationFrame(() => verificarCruceLineaRoja(e, a));
    }
}

// Función para pausar o reanudar el juego
function togglePausa() {
    pausado = !pausado;

    const pantallaPausa = document.querySelector(".pantalla-pausa");
    pantallaPausa.style.display = pausado ? "flex" : "none";

    const zonaDeJuego = document.querySelector(".game-area");
    const items = zonaDeJuego.querySelectorAll(".item");

    if (pausado) {
        items.forEach((item) => {
            const animaciones = item.getAnimations();
            animaciones.forEach((animacion) => animacion.pause());
        });
        clearInterval(itemInterval);
    } else {
        items.forEach((item) => {
            const animaciones = item.getAnimations();
            animaciones.forEach((animacion) => animacion.play());
        });

        // Ajusta el intervalo para continuar mostrando ítems desde donde se detuvo
        clearInterval(itemInterval);
        const itemsRestantes = seleccionarItems().slice(contadorItems);
        itemInterval = setInterval(() => {
            mostrarItem(itemsRestantes.shift());
            contadorItems++;

            // Verifica si se han mostrado todos los ítems
            if (contadorItems >= seleccionarItems().length) {
                clearInterval(itemInterval);

                // Espera a que todos los ítems hayan terminado de moverse
                setTimeout(() => {
                    // Verifica si se debe avanzar al siguiente nivel
                    if (puntuacion >= aciertosminimos) {
                        nivel++;
                    }

                    // Comienza el siguiente nivel
                    comenzarNivel();
                }, 10000);
            }
        }, 1000);
    }
}

function mostrarGameOver() {
  let gameOverElement = document.createElement("div");
  gameOverElement.classList.add("game-over");
  gameOverElement.textContent = "GAME OVER";
  
  // Crear el botón de reiniciar
  let restartButton = document.createElement("button");
  restartButton.textContent = "REINICIAR";
  restartButton.classList.add("button"); // Utilizar la clase "button" existente
  restartButton.style.display = "block"; // Añadir estilo para centrar el botón
  restartButton.style.margin = "0 auto";
  restartButton.style.marginTop = "40px";
  restartButton.addEventListener("click", () => {
    gameOverElement.remove(); // Eliminar el mensaje y el botón de "Game Over"
    iniciarJuego(); // Reiniciar el juego desde el nivel 1
  });

  // Añadir el botón de reiniciar debajo del texto "GAME OVER"
  gameOverElement.appendChild(restartButton);

  let gameArea = document.querySelector(".game-area");
  gameArea.appendChild(gameOverElement);
}

// Nueva función para finalizar el juego
function finalizarJuego() {
  clearInterval(itemInterval);
  let gameArea = document.querySelector(".game-area");
  let items = gameArea.querySelectorAll(".item");
  items.forEach((item) => {
    item.remove();
  });
}

// Escucha el evento de clic en el botón de inicio
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".boton-comenzar").addEventListener("click", () => {
    // Oculta las instrucciones y el botón de inicio
    document.querySelector(".instrucciones").style.display = "none";
    
    // Muestra el juego
    document.querySelector(".game").style.display = "flex";

    // Inicia el juego
    iniciarJuego();
  });
  
  document.querySelectorAll(".boton-nivel").forEach((boton) => {
    boton.addEventListener("click", () => {
      const nivelElegido = parseInt(boton.dataset.level, 10);
	  document.querySelector(".instrucciones").style.display = "none";
	  document.querySelector(".game").style.display = "flex";
      iniciarJuego(nivelElegido);
    });
  });
  
  // Evento de clic en el botón de pausa
  document.querySelector(".boton-pausa").addEventListener("click", togglePausa);
});