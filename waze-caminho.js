const tamanhoGrid = 20;
const larguraCelula = tamanhoGrid, alturaCelula = tamanhoGrid; // Tamanho das células (para visualização)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const linhas = Math.ceil(canvas.height / alturaCelula);
const colunas = Math.ceil(canvas.width / larguraCelula);

// Grade de células (0=livre, 1=obstáculo)
const grade = Array.from({ length: linhas }, () => Array(colunas).fill(0));

// Função para converter coordenadas px em índice de vértice
function posicaoParaVertice(x, y) {
    return {
        x: Math.round(x / larguraCelula),
        y: Math.round(y / alturaCelula)
    };
}

// Classe Nó com direção para A*
class No {
    constructor(x, y, pai = null) {
        this.x = x;
        this.y = y;
        this.pai = pai;
        this.g = 0;
        this.h = 0;
        this.f = 0;
    }
}

// Heurística Euclidiana
function heuristica(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function celulaComBufferLivre(linha, col) {
    // Verifica linha e coluna dentro dos limites
    if (linha < 0 || linha >= linhas || col < 0 || col >= colunas) return true; // fora do grid é livre (não bloqueia)

    // Percorre a célula e seus 8 vizinhos
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const ny = linha + dy;
            const nx = col + dx;

            if (ny >= 0 && ny < linhas && nx >= 0 && nx < colunas) {
                if (grade[ny][nx] === 1) {
                    return false; // obstáculo na célula ou ao redor bloqueia
                }
            }
        }
    }
    return true; // área livre
}

// Verifica se movimento entre dois vértices passa por célula bloqueada
function arestaLivre(v1, v2) {
    if (v1.x === v2.x && v1.y === v2.y) return false;

    if (v1.y === v2.y) {
        const linha = v1.y - 1;
        const col = Math.min(v1.x, v2.x);
        if (linha < 0 || linha >= linhas) return true;
        if (col < 0 || col >= colunas) return false;
        return celulaComBufferLivre(linha, col);
    }
    if (v1.x === v2.x) {
        const linha = Math.min(v1.y, v2.y);
        const col = v1.x - 1;
        if (col < 0 || col >= colunas) return true;
        if (linha < 0 || linha >= linhas) return false;
        return celulaComBufferLivre(linha, col);
    }

    const minX = Math.min(v1.x, v2.x);
    const minY = Math.min(v1.y, v2.y);

    if (
        minX <= 0 || minX >= colunas ||
        minY <= 0 || minY >= linhas
    ) return false;

    return (
        celulaComBufferLivre(minY - 1, minX - 1) &&
        celulaComBufferLivre(minY - 1, minX) &&
        celulaComBufferLivre(minY, minX - 1)
    );
}


// Movimentos possíveis entre vértices
const movimentos = [
    { x: 0, y: -1, custo: 1 }, { x: 1, y: 0, custo: 1 },
    { x: 0, y: 1, custo: 1 }, { x: -1, y: 0, custo: 1 },
    { x: 1, y: -1, custo: Math.SQRT2 }, { x: 1, y: 1, custo: Math.SQRT2 },
    { x: -1, y: 1, custo: Math.SQRT2 }, { x: -1, y: -1, custo: Math.SQRT2 }
];

// Algoritmo A* para vértices
function aStarVertices(inicio, fim) {
    const aberto = [];
    const fechado = new Set();

    const inicioNo = new No(inicio.x, inicio.y);
    inicioNo.h = heuristica(inicio, fim);
    inicioNo.f = inicioNo.h;
    aberto.push(inicioNo);

    while (aberto.length > 0) {
        let atualIndex = 0;
        for (let i = 1; i < aberto.length; i++) {
            if (aberto[i].f < aberto[atualIndex].f) atualIndex = i;
        }

        const atual = aberto.splice(atualIndex, 1)[0];
        const chaveAtual = `${atual.x},${atual.y}`;
        fechado.add(chaveAtual);

        if (atual.x === fim.x && atual.y === fim.y) {
            const caminho = [];
            let no = atual;
            while (no) {
                caminho.unshift({ x: no.x, y: no.y });
                no = no.pai;
            }
            return caminho;
        }

        for (const mov of movimentos) {
            const nx = atual.x + mov.x;
            const ny = atual.y + mov.y;
            const chave = `${nx},${ny}`;

            if (
                nx < 0 || ny < 0 ||
                nx > colunas || ny > linhas || // > pois agora tem (linhas+1)x(colunas+1)
                fechado.has(chave)
            ) continue;

            if (!arestaLivre(atual, { x: nx, y: ny })) continue;

            const g = atual.g + mov.custo;
            const h = heuristica({ x: nx, y: ny }, fim);
            const f = g + h;

            const existente = aberto.find(n => n.x === nx && n.y === ny);
            if (!existente || g < existente.g) {
                const vizinho = new No(nx, ny, atual);
                vizinho.g = g;
                vizinho.h = h;
                vizinho.f = f;

                if (!existente) aberto.push(vizinho);
            }
        }
    }

    return []; // sem caminho
}

// Função para testar se o agente pode se mover em linha reta entre dois vértices, sem obstáculos
function linhaLivre(v1, v2) {
    let x0 = v1.x;
    let y0 = v1.y;
    let x1 = v2.x;
    let y1 = v2.y;

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);

    let x = x0;
    let y = y0;

    let n = 1;
    let x_inc = (x1 > x0) ? 1 : (x1 < x0 ? -1 : 0);
    let y_inc = (y1 > y0) ? 1 : (y1 < y0 ? -1 : 0);

    let error;

    if (dx > dy) {
        error = dx / 2;
        for (; n <= dx; n++) {
            if (x < 0 || y < 0 || y >= linhas || x >= colunas) return false;

            // Aqui testamos se a célula e seu buffer estão livres
            if (!celulaComBufferLivre(y, x)) return false;

            x += x_inc;
            error -= dy;
            if (error < 0) {
                y += y_inc;
                error += dx;
            }
        }
    } else {
        error = dy / 2;
        for (; n <= dy; n++) {
            if (x < 0 || y < 0 || y >= linhas || x >= colunas) return false;

            if (!celulaComBufferLivre(y, x)) return false;

            y += y_inc;
            error -= dx;
            if (error < 0) {
                x += x_inc;
                error += dy;
            }
        }
    }
    return true;
}

// Suaviza o caminho eliminando vértices intermediários supérfluos
function suavizarCaminho(caminho) {
    if (caminho.length < 3) return caminho;

    let A1 = 0;
    let A2 = 1;

    while (true) {
        if (A2 >= caminho.length - 1) break;

        const origem = caminho[A1];
        const destino = caminho[A2 + 1];

        if (linhaLivre(origem, destino)) {
            // Remove o ponto A2, substituindo A1->A2 + A2->A3 por A1->A3
            caminho.splice(A2, 1);
            // Não avança A1, pois queremos tentar juntar o próximo A2
        } else {
            A1 = A2;
            A2++;
        }
    }

    return caminho;
}

// Desenha grade células
function desenharGrade() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (let y = 0; y <= linhas; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * alturaCelula);
        ctx.lineTo(canvas.width, y * alturaCelula);
        ctx.stroke();
    }
    for (let x = 0; x <= colunas; x++) {
        ctx.beginPath();
        ctx.moveTo(x * larguraCelula, 0);
        ctx.lineTo(x * larguraCelula, canvas.height);
        ctx.stroke();
    }

    // Desenha obstáculos preenchidos
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            if (grade[y][x] === 1) {
                ctx.fillRect(x * larguraCelula, y * alturaCelula, larguraCelula, alturaCelula);
            }
        }
    }
}

// Desenha caminho suavizado nas arestas com curvas
function mostrarCaminho(ux, uy, dx, dy) {
    desenharGrade();

    const inicio = posicaoParaVertice(ux, uy);
    const fim = posicaoParaVertice(dx, dy);

    let caminho = aStarVertices(inicio, fim);
    if (caminho.length === 0) return;

    // Suaviza caminho eliminando vértices intermediários supérfluos
    caminho = suavizarCaminho(caminho);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();

    // Começa no primeiro ponto (convertendo vértice para pixel)
    let p0 = caminho[0];
    ctx.moveTo(
        p0.x * larguraCelula,
        p0.y * alturaCelula
    );

    // Desenha curvas quadráticas para suavizar o caminho
    for (let i = 1; i < caminho.length - 1; i++) {
        const p1 = caminho[i];
        const p2 = caminho[i + 1];

        const cx = (p1.x + p2.x) / 2 * larguraCelula;
        const cy = (p1.y + p2.y) / 2 * alturaCelula;

        ctx.quadraticCurveTo(
            p1.x * larguraCelula,
            p1.y * alturaCelula,
            cx,
            cy
        );
    }

    // Linha reta até o último ponto (se houver)
    const ultimo = caminho[caminho.length - 1];
    ctx.lineTo(
        ultimo.x * larguraCelula,
        ultimo.y * alturaCelula
    );

    ctx.stroke();
}

// Eventos de clique para desenhar caminho
let cliqueInicial = null;
canvas.addEventListener('click', e => {
    const x = e.clientX;
    const y = e.clientY;
    if (!cliqueInicial) {
        cliqueInicial = { x, y };
    } else {
        mostrarCaminho(cliqueInicial.x, cliqueInicial.y, x, y);
        cliqueInicial = null;
    }
});

// Exemplo: marca alguns obstáculos (você pode editar)
grade[15][35] = 1;
grade[16][35] = 1;
grade[17][35] = 1;
grade[15][36] = 1;
grade[15][37] = 1;
grade[15][38] = 1;
grade[15][39] = 1;
grade[16][39] = 1;
grade[17][39] = 1;

desenharGrade();
