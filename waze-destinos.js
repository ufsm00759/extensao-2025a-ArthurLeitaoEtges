// Seleciona os elementos do DOM com as classes especificadas e converte para arrays
const pontos = Array.from(document.querySelectorAll('.ponto-especifico'));    // pontos de destino
const bussolas = Array.from(document.querySelectorAll('.bussola'));           // elementos bússola que apontam para os pontos
const distancias = Array.from(document.querySelectorAll('.distancia'));       // elementos que mostram a distância até cada ponto


// Cria um array de objetos "sistemas", associando cada bússola a um ponto e uma legenda
const sistemas = bussolas.map((bussolaEl, i) => {
  const pontoEl = pontos[i];            // ponto correspondente à bússola atual

  // Cria uma legenda para o ponto e adiciona ao corpo da página
  const legendaEl = document.createElement('div');
  legendaEl.classList.add('legenda');
  legendaEl.textContent = ['Ponto Vermelho', 'Ponto Azul', 'Ponto Amarelo'][i];
  document.body.appendChild(legendaEl);

  // Retorna o objeto que representa esse sistema, com bússola, legenda e posição do ponto
  return {
    bussola: bussolaEl,
    legenda: legendaEl,
    ponto: {
      x: pontoEl.offsetLeft + pontoEl.offsetWidth / 2,  // posição X central do ponto
      y: pontoEl.offsetTop + pontoEl.offsetHeight / 2   // posição Y central do ponto
    },
    lastAngle: null                                     // guarda o último ângulo para suavizar rotação
  };
});


// Calcula o ângulo (em graus) entre o usuário (ux, uy) e um ponto (px, py)
function calcularAngulo(ux, uy, px, py) {
  return Math.atan2(py - uy, px - ux) * (180 / Math.PI);
}


// Calcula a distância euclidiana entre o usuário e o ponto
function calcularDistancia(ux, uy, px, py) {
  return Math.hypot(px - ux, py - uy);
}


// Atualiza a rotação das bússolas, as distâncias e as legendas baseadas na posição do usuário
function atualizarBussolas(ux, uy) {
  sistemas.forEach((sistema, i) => {
    const { bussola, ponto, legenda } = sistema;

    // Calcula o ângulo para apontar a bússola na direção do ponto + 90 graus para alinhar o gráfico
    let angulo = calcularAngulo(ux, uy, ponto.x, ponto.y) + 90;

    // Ajusta o ângulo para evitar rotações abruptas (ex. pulos de 360º)
    if (sistema.lastAngle !== null) {
      let diff = angulo - sistema.lastAngle;
      if (Math.abs(diff) > 180) angulo += diff > 0 ? -360 : 360;
    }

    sistema.lastAngle = angulo;

    // Aplica a rotação com uma transição suave
    bussola.style.transition = 'transform 0.1s ease-out';
    bussola.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;

    // Calcula e mostra a distância até o ponto em metros
    const dist = Math.round(calcularDistancia(ux, uy, ponto.x, ponto.y));
    distancias[i].textContent = `${dist} m`;
    distancias[i].style.display = 'block';

    // Posiciona o elemento de distância próximo à bússola
    distancias[i].style.top = `${bussola.offsetTop - 90}px`;
    distancias[i].style.left = `${bussola.offsetLeft}px`;

    // Posiciona a legenda ao lado da bússola
    legenda.style.top = `${bussola.offsetTop + bussola.offsetHeight / 2}px`;
    legenda.style.left = `${bussola.offsetLeft}px`;
  });
}


// Inicializa eventos de clique para cada ponto, para mostrar o caminho ao clicar
function inicializarDestinos() {
  pontos.forEach((pontoEl) => {
    pontoEl.addEventListener('click', () => {
      // Calcula a posição central do ponto clicado
      const ponto = {
        x: pontoEl.offsetLeft + pontoEl.offsetWidth / 2,
        y: pontoEl.offsetTop + pontoEl.offsetHeight / 2
      };

      // Obtém a posição atual do usuário (função presumida disponível)
      const { x, y } = getPosicaoUsuario();

      // Mostra o caminho entre o usuário e o ponto clicado
      mostrarCaminho(x, y, ponto.x, ponto.y);
    });
  });
}
