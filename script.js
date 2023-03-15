// Variables globales
let nivel = 1;
let puntuacion = 0;
let palabras = [];
let pseudopalabras = [];

// Función para cargar palabras y pseudopalabras de los archivos JSON
function cargarItems() {
    return new Promise((resolve) => {
        // Carga palabras.json
        fetch("words.json")
            .then((response) => response.json())
            .then((data) => {
                palabras = data;
                // Carga pseudo.json
                fetch("pseudo.json")
                    .then((response) => response.json())
                    .then((data) => {
                        pseudopalabras = data;
                        resolve(); // Resuelve la promesa
                    })
                    .catch((error) => console.error("Error al cargar pseudo.json:", error));
            })
            .catch((error) => console.error("Error al cargar words.json:", error));
    });
}
// Función para seleccionar 50 ítems al azar y mezclarlos
function seleccionarItems() {
    // Filtra las palabras y pseudopalabras según el nivel
    const palabrasNivel = palabras.filter((item) => item.L === nivel);
    const pseudopalabrasNivel = pseudopalabras.filter((item) => item.L === nivel);

    // Selecciona 25 palabras y 25 pseudopalabras al azar
    const palabrasSeleccionadas = seleccionarAleatoriamente(palabrasNivel, 25);
    const pseudopalabrasSeleccionadas = seleccionarAleatoriamente(pseudopalabrasNivel, 25);

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
    let resultado = [];
    while (arr1.length > 0 || arr2.length > 0) {
        if (arr1.length > 0) {
            resultado.push(arr1.shift());
        }
        if (arr2.length > 0) {
            resultado.push(arr2.shift());
        }
    }
    return resultado;
}

// Función para crear y mostrar un ítem en la zona de juego
function mostrarItem(item) {
    // Crea un elemento div para el ítem
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.innerText = item.W;

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
    
    // Agrega posición absoluta al ítem
    itemDiv.style.position = "absolute";

  // Anima el ítem hacia abajo
    const distancia = zonaDeJuego.clientHeight - itemDiv.clientHeight;
    const duracion = 10; // 10 segundos
    const animation = itemDiv.animate([{ top: "0px" }, { top: `${distancia}px` }], {
        duration: duracion * 1000,
        easing: "linear",
    });
	
	function esPalabra(item) {
		return palabras.some((palabra) => palabra.W === item.W);
}
	// Evento de finalización de animación
	animation.onfinish = () => {
		// Comprueba si el ítem llegó al final sin ser clicado y actualiza la puntuación
		if (!itemDiv.classList.contains("correct") && !itemDiv.classList.contains("incorrect")) {
			if (esPalabra(item)) {
				puntuacion--; // Resta un punto si es una palabra
			} else {
				puntuacion++; // Suma un punto si es una pseudopalabra
			}
			actualizarPuntuacion();
		}

		itemDiv.remove();
	};

    // Establece el atributo 'clicked' del dataset en 'false'
    itemDiv.dataset.clicked = 'false';
	
    // Evento de clic
    itemDiv.addEventListener("click", () => {
        // Verifica si el ítem ya ha sido clicado
        if (itemDiv.dataset.clicked === 'true') {
            return; // Si el ítem ya ha sido clicado, no hacer nada
        }

        // Establece el atributo 'clicked' del dataset en 'true'
        itemDiv.dataset.clicked = 'true';
		
        // Comprueba si la respuesta es correcta
        const esCorrecta = palabras.some((palabra) => palabra.W === item.W);

        // Actualiza la puntuación y muestra el resultado
        if (esCorrecta) {
            puntuacion++;
            itemDiv.classList.add("correct");
        } else {
            puntuacion--;
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
    puntuacionElement.innerText = puntuacion;
}

function actualizarNivel() {
    const nivelElement = document.querySelector("#level-value");
    nivelElement.innerText = nivel;
}

// Función para iniciar el juego
function iniciarJuego() {
    // Carga las palabras y pseudopalabras de los archivos JSON
    cargarItems().then(() => {
        // Inicializa el nivel y la puntuación
        nivel = 1;
        puntuacion = 0;
        actualizarPuntuacion();
	
        // Comienza el nivel
        comenzarNivel();
    });
}

function mostrarMensajeNivel() {
    const mensajeNivel = document.createElement("div");
    mensajeNivel.classList.add("mensaje-nivel");
    mensajeNivel.innerText = `NIVELL ${nivel}`;
    
    const gameArea = document.querySelector(".game-area");
    gameArea.appendChild(mensajeNivel);
    
    // Centrar el mensaje en el área del juego
    mensajeNivel.style.position = "absolute";
    mensajeNivel.style.top = "50%";
    mensajeNivel.style.left = "50%";
    mensajeNivel.style.transform = "translate(-50%, -50%)";

    // Estilos del mensaje (puedes mover esto al archivo CSS si prefieres)
    mensajeNivel.style.fontSize = "2rem";
    mensajeNivel.style.fontWeight = "bold";
    mensajeNivel.style.color = "#2196F3";
    mensajeNivel.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.5)";
    
    return mensajeNivel;
}

function comenzarNivel() {
    // Muestra el mensaje del nivel actual
    const mensajeNivel = mostrarMensajeNivel();

    // Espera 2 segundos antes de continuar con los ítems
    setTimeout(() => {
        // Elimina el mensaje del nivel
        mensajeNivel.remove();

        // Selecciona y mezcla los ítems para el nivel actual
        const items = seleccionarItems();

        // Muestra los ítems en la pantalla con un intervalo de 1 segundo
        let contadorItems = 0;
        const intervaloItems = setInterval(() => {
            mostrarItem(items[contadorItems]);
            contadorItems++;

            // Verifica si se han mostrado todos los ítems
            if (contadorItems >= items.length) {
                clearInterval(intervaloItems);

                // Espera a que todos los ítems hayan terminado de moverse
                setTimeout(() => {
                    // Verifica si se debe avanzar al siguiente nivel
                    if (puntuacion >= 25) {
                        nivel++;
                    }

                    // Comienza el siguiente nivel
                    comenzarNivel();
                }, 10000); // Espera 10 segundos, que es el tiempo que tardan los ítems en llegar al final
            }
        }, 1000); // Intervalo de 1 segundo entre ítems
		 // Actualiza el nivel en la pantalla
		actualizarNivel();
    }, 2000); // Espera de 2 segundos antes de comenzar con los ítems
}

 // Actualiza el nivel en la pantalla
    actualizarNivel();


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
});
