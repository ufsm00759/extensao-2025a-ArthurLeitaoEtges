// Define o tamanho de cada célula na grade (em pixels) e calcula quantas linhas e colunas cabem na tela
const larguraCelula = 40, alturaCelula = 40;
const linhas = Math.ceil(window.innerHeight / alturaCelula);
const colunas = Math.ceil(window.innerWidth / larguraCelula);
const grade = Array.from({ length: linhas }, () => Array(colunas).fill(0)); // Cria uma matriz 2D representando o mapa, com 0 indicando espaço livre


// Converte coordenadas em pixels para coordenadas na grade (posição em células)
function posicaoParaGrid(x, y) {
    return {
        x: Math.floor(x / larguraCelula),
        y: Math.floor(y / alturaCelula)
    };
}


// Mostra o caminho encontrado na tela, colocando marcadores para cada passo
function mostrarCaminho(ux, uy, dx, dy) {
    const inicio = posicaoParaGrid(ux, uy);     // posição inicial na grade
    const fim = posicaoParaGrid(dx, dy);        // posição final na grade
    const caminho = aStar(grade, new No(inicio.x, inicio.y), new No(fim.x, fim.y));     // encontra o caminho

    // Remove marcadores de caminho anteriores
    document.querySelectorAll('.passo-caminho').forEach(e => e.remove());

    // Cria um marcador visual para cada passo do caminho encontrado
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


// Classe que representa um nó no algoritmo A*, guardando coordenadas e custo
class No {
    constructor(x, y, pai = null) {
        this.x = x;
        this.y = y;
        this.pai = pai; // nó anterior no caminho
        this.g = 0;     // custo do caminho até este nó
        this.h = 0;     // heurística (estimativa até o destino)
        this.f = 0;     // custo total (g + h)
    }
}


// Função heurística para estimar distância entre dois nós (usando distância Euclidiana)
function heuristica(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}


// Implementação do algoritmo A* para encontrar o caminho mais curto na grade
function aStar(grid, inicio, fim) {
    const open = [inicio], closed = [];       // lista de nós a serem avaliados e ja avaliados

    // Possíveis movimentos (8 direções: cima, baixo, esquerda, direita e diagonais)
    const movimentos = [
        { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
        { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
    ];


    while (open.length > 0) {
        let atual = open.reduce((a, b) => a.f < b.f ? a : b);   // Seleciona o nó com menor custo total f

        if (atual.x === fim.x && atual.y === fim.y) {           // Se chegou no destino, reconstrói o caminho retornando a lista de nós
        let caminho = [];
        for (let temp = atual; temp; temp = temp.pai)
            caminho.push({ x: temp.x, y: temp.y });
        return caminho.reverse();
        }

        open.splice(open.indexOf(atual), 1);                    // Remove o nó atual da lista open e adiciona à closed
        closed.push(atual);

        for (const dir of movimentos) {                         // Para cada possível movimento do nó atual
        const nx = atual.x + dir.x, ny = atual.y + dir.y;

        if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;    // Ignora posições fora dos limites da grade

        if (grid[ny][nx] === 1 || closed.find(n => n.x === nx && n.y === ny)) continue; // Ignora posições com obstáculo (valor 1) ou já avaliadas

        const gExtra = (dir.x && dir.y) ? Math.SQRT2 : 1;       // Custo extra para movimentos diagonais
        const vizinho = new No(nx, ny, atual);                  // Cria nó vizinho e calcula seus custos
        vizinho.g = atual.g + gExtra;
        vizinho.h = heuristica(vizinho, fim);
        vizinho.f = vizinho.g + vizinho.h;

        const existente = open.find(n => n.x === nx && n.y === ny);                     // Se já existe um nó igual na lista open com menor custo, ignora este vizinho
        if (existente && existente.f <= vizinho.f) continue;
        open.push(vizinho);                                                             // Caso contrário, adiciona o vizinho à lista open para avaliar depois
        }
    }

    // Se não encontrou caminho, retorna array vazio
    return [];
}
