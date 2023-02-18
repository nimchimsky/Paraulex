document.addEventListener("DOMContentLoaded", function() {

var score = 0;
var scoreboard = document.createElement('div');
scoreboard.id = 'scoreboard';
scoreboard.innerHTML = 'Score: ' + score;
document.body.appendChild(scoreboard);

var text = document.createElement('div');
text.innerHTML = "El lèxic català està en perill! Les paraules de la llengua s'han barrejat amb un munt de paraules que no existeixen, paraules amb faltes d'ortografia i barbarismes.<br>Formes part d'un equip de valents disposats a refer el diccionari de la llengua.<br>Podràs identificar correctament totes les <b>paraules infiltrades</b>?";
text.style.position = 'absolute';
text.style.top = '40%';
text.style.transform = 'translateY(-150%)';
text.style.textAlign = 'center';
text.style.fontSize = '24px';
text.style.width = '100%';
document.body.appendChild(text);

var correctItems = ['vial', 'inspirador', 'removedor', 'cigronera', 'alarma', 'mamada', 'cros', 'acompanyada', 'malagraït', 'enlairat', 'magnètic', 'emmandriment', 'satisfacció', 'pèl', 'quaternari', 'consulta', 'disculpar', 'febrilment', 'pioca', 'malvapoma', 'tornassol', 'revetlla', 'callol', 'obnubilar', 'substanciar', 'bel·líger', 'autarquia', 'saguer', 'presoner', 'tómbola', 'malgastar', 'amplament', 'antiàcid', 'dissenyar', 'albercoc', 'veneçolà', 'catxaruta', 'reforçament', 'poema', 'porció', 'catre', 'inconnex', 'viscositat', 'requesta', 'anàrquic', 'renòs', 'dogmatisme', 'arcàdic', 'maternitat', 'trapezial'];
var incorrectItems = ['poenati', 'ogrenar', 'pregler', 'coscadra', 'llavot', 'carriltrí', 'estaiàsant', 'bipot', 'francessí', 'enpetai', 'ingrinvigue', 'botonobia', 'revollac', 'estaiàmir', 'milebre', 'regoixà', 'regra', 'mecaterbar', 'relipedadeu', 'rorta', 'calentar', 'palomitas', 'munyeca', 'apresar', 'cierre', 'parrilla', 'taburet', 'inscribir', 'sabiondo', 'xumbera', 'rompeolas', 'jinete', 'empenyar', 'rehén', 'pulgada', 'radiofonic', 'célebrement', 'sobergüeria', 'güerxa', 'cagüerri', 'cadenciòs', 'mitjò', 'encorvar', 'esquíbol', 'traba', 'galamo', 'intercesió', 'bosada', 'reçorgir', 'suspensiò'];

// Shuffle both lists separately
correctItems.sort(function() { return 0.5 - Math.random() });
incorrectItems.sort(function() { return 0.5 - Math.random() });

// Merge shuffled lists with 1 to 3 items from each list consecutively
var items = [];
var i = 0;
var j = 0;
	while (i < correctItems.length && j < incorrectItems.length) {
	  var numCorrectItems = Math.floor(Math.random() * 3) + 1; // Randomly select 1 to 3 correct items
	  for (var k = 0; k < numCorrectItems && i < correctItems.length; k++) {
		items.push(correctItems[i]);
		i++;
	  }
	  var numIncorrectItems = Math.floor(Math.random() * 3) + 1; // Randomly select 1 to 3 incorrect items
	  var fadeOutDuration = 1000;
	  for (var k = 0; k < numIncorrectItems && j < incorrectItems.length; k++) {
		items.push(incorrectItems[j]);
		j++;
	  }
	}
	while (i < correctItems.length) {
	  items.push(correctItems[i]);
	  i++;
	}
	while (j < incorrectItems.length) {
	  items.push(incorrectItems[j]);
	  j++;
	}
items = items.slice(0, 20); // Select only 20 items from the shuffled list
  
  var playButton = document.createElement('button');
  playButton.innerHTML = 'Play';
  playButton.classList.add('play-button');
  
  playButton.onclick = function() {
  	document.body.removeChild(text);
	this.remove(); // Remove the Play button
    var i = 0;
    var lastItem = null;
    var interval = setInterval(function() {
      if (i < items.length) {
        var item = document.createElement('div');
		item.isClicked = false; 
        item.innerHTML = items[i];
        item.style.position = 'absolute';
        item.style.top = '0px';
        item.style.left = Math.random() * (window.innerWidth / 2) + (window.innerWidth / 4) - (item.offsetWidth / 2) + 'px';
        item.style.fontSize = '50px';
        item.style.color = '#000000';
        item.style.backgroundColor = '#add8e6';
        item.style.padding = '10px';
        item.style.borderRadius = '10px';
        item.style.cursor = 'pointer';
		item.timeout = setTimeout(function() {
	  if (!item.isClicked) {
		if (correctItems.includes(item.innerHTML)) {
		  score += 1;
			} else {
			score -= 1;
			}
			scoreboard.innerHTML = 'Score: ' + score;
			}
			if (document.body.contains(item)) {
				document.body.removeChild(item);
				}
			}, 9000);
	item.onclick = function() {
		item.isClicked = true;
		clearTimeout(item.timeout);
		if (correctItems.includes(item.innerHTML)) {
			score -= 1;
			item.classList.add('correct-click');
		} else {
			score += 1;
			item.classList.add('incorrect-click');
		}
		if (document.body.contains(item)) {
			setTimeout(function() {
				document.body.removeChild(item);
			}, 1000); // Wait for animation to finish before removing item
		}
		scoreboard.innerHTML = 'Score: ' + score;
	};
        document.body.appendChild(item);
        var top = 0;
        var interval2 = setInterval(function() {
          if (top < window.innerHeight) {
            top += 1;
            item.style.top = top + 'px';
          } else {
			if (document.body.contains(item)) {
				document.body.removeChild(item);
				}
            clearInterval(interval2);
          }
        }, 10);
        lastItem = item;
        i++;
      } else if (lastItem !== null && parseInt(lastItem.style.top, 10) >= window.innerHeight) {
		  clearInterval(interval);
		document.body.appendChild(playButton);
		}
    }, 1000);
  };
  document.body.appendChild(playButton);
});