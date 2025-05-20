
/* Definição das variáveis básicas dos elementos */ 
const usuario = document.getElementById('usuario');
const pontos = Array.from(document.querySelectorAll('.ponto-especifico'));
const bussolas = Array.from(document.querySelectorAll('.bussola'));
const distancias = Array.from(document.querySelectorAll('.distancia'));

/* Definição das variáveis básicas dos elementos */ 
const sistemas = bussolas.map((bussolaEl, i) => {
  const pontoEl = pontos[i];

  const legendaEl = document.createElement('div');
  legendaEl.classList.add('legenda');
  legendaEl.textContent = ['Ponto Vermelho', 'Ponto Azul', 'Ponto Amarelo'][i];
  document.body.appendChild(legendaEl);

  return {
    bussola: bussolaEl,
    legenda: legendaEl,
    ponto: {
      x: pontoEl.offsetLeft + pontoEl.offsetWidth / 2,
      y: pontoEl.offsetTop + pontoEl.offsetHeight / 2
    },
    lastAngle: null
  };
});

const center = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

let posX = center.x;
let posY = center.y;
usuario.style.left = `${posX}px`;
usuario.style.top = `${posY}px`;

const calcularAngulo = (ux, uy, px, py) => Math.atan2(py - uy, px - ux) * (180 / Math.PI);
const calcularDistancia = (ux, uy, px, py) => Math.hypot(px - ux, py - uy);

const atualizarBussolas = (ux, uy) => {
  sistemas.forEach((sistema, i) => {
    const { bussola, ponto, legenda } = sistema;
    let angulo = calcularAngulo(ux, uy, ponto.x, ponto.y) + 90;

    if (sistema.lastAngle !== null) {
      let diff = angulo - sistema.lastAngle;
      if (Math.abs(diff) > 180) angulo += diff > 0 ? -360 : 360;
    }

    sistema.lastAngle = angulo;
    bussola.style.transition = 'transform 0.1s ease-out';
    bussola.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;

    const dist = Math.round(calcularDistancia(ux, uy, ponto.x, ponto.y));
    distancias[i].textContent = `${dist} m`;
    distancias[i].style.display = 'block';
    distancias[i].style.top = `${bussola.offsetTop - 90}px`;
    distancias[i].style.left = `${bussola.offsetLeft}px`;
    legenda.style.top = `${bussola.offsetTop + bussola.offsetHeight / 2}px`;
    legenda.style.left = `${bussola.offsetLeft}px`;
  });
};

pontos.forEach((pontoEl) => {
  pontoEl.addEventListener('click', () => {
    const ponto = {
      x: pontoEl.offsetLeft + pontoEl.offsetWidth / 2,
      y: pontoEl.offsetTop + pontoEl.offsetHeight / 2
    };
    mostrarCaminho(posX, posY, ponto.x, ponto.y);
  });
});

function posicaoParaGrid(x, y) {
  return {
    x: Math.floor(x / larguraCelula),
    y: Math.floor(y / alturaCelula)
  };
}

function mostrarCaminho(ux, uy, dx, dy) {
  const inicio = posicaoParaGrid(ux, uy);
  const fim = posicaoParaGrid(dx, dy);
  const caminho = aStar(grade, new No(inicio.x, inicio.y), new No(fim.x, fim.y));

  document.querySelectorAll('.passo-caminho').forEach(e => e.remove());

  caminho.forEach(pos => {
    const marcador = document.createElement('div');
    marcador.className = 'passo-caminho';
    marcador.style = `
      position: absolute;
      width: 10px;
      height: 10px;
      background: red;
      border-radius: 50%;
      left: ${pos.x * larguraCelula + larguraCelula / 2}px;
      top: ${pos.y * alturaCelula + alturaCelula / 2}px;
      transform: translate(-50%, -50%);
      z-index: 4;
    `;
    document.getElementById('area').appendChild(marcador);
  });
}

// Drag do usuário
let isDragging = false, offsetX = 0, offsetY = 0;
const larguraCelula = 40, alturaCelula = 40;
const linhas = Math.ceil(window.innerHeight / alturaCelula);
const colunas = Math.ceil(window.innerWidth / larguraCelula);
const grade = Array.from({ length: linhas }, () => Array(colunas).fill(0));

usuario.addEventListener('pointerdown', (e) => {
  isDragging = !isDragging;
  usuario.classList.toggle('ativo');
  usuario.setPointerCapture(e.pointerId);

  if (isDragging) {
    document.querySelectorAll('.passo-caminho').forEach(e => e.remove());
    offsetX = e.clientX - posX;
    offsetY = e.clientY - posY;
  } else {
    usuario.releasePointerCapture(e.pointerId);
  }
});

document.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  posX = e.clientX - offsetX;
  posY = e.clientY - offsetY;
  usuario.style.left = `${posX}px`;
  usuario.style.top = `${posY}px`;
  atualizarBussolas(posX, posY);
});

window.addEventListener('resize', () => {
  center.x = window.innerWidth / 2;
  center.y = window.innerHeight / 2;
});

class No {
  constructor(x, y, pai = null) {
    this.x = x; this.y = y; this.pai = pai;
    this.g = 0; this.h = 0; this.f = 0;
  }
}

function heuristica(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function aStar(grid, inicio, fim) {
  const open = [inicio], closed = [];
  const movimentos = [
    { x: 0, y: -1 }, { x: 1, y: 0 },
    { x: 0, y: 1 }, { x: -1, y: 0 },
    { x: 1, y: -1 }, { x: 1, y: 1 },
    { x: -1, y: 1 }, { x: -1, y: -1 }
  ];

  while (open.length > 0) {
    let atual = open.reduce((a, b) => a.f < b.f ? a : b);
    if (atual.x === fim.x && atual.y === fim.y) {
      let caminho = [];
      for (let temp = atual; temp; temp = temp.pai)
        caminho.push({ x: temp.x, y: temp.y });
      return caminho.reverse();
    }

    open.splice(open.indexOf(atual), 1);
    closed.push(atual);

    for (const dir of movimentos) {
      const nx = atual.x + dir.x, ny = atual.y + dir.y;
      if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
      if (grid[ny][nx] === 1 || closed.find(n => n.x === nx && n.y === ny)) continue;

      const gExtra = (dir.x && dir.y) ? Math.SQRT2 : 1;
      const vizinho = new No(nx, ny, atual);
      vizinho.g = atual.g + gExtra;
      vizinho.h = heuristica(vizinho, fim);
      vizinho.f = vizinho.g + vizinho.h;

      const existente = open.find(n => n.x === nx && n.y === ny);
      if (existente && existente.f <= vizinho.f) continue;
      open.push(vizinho);
    }
  }

  return [];
}
