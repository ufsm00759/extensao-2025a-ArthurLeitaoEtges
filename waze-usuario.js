// Variáveis que armazenam a posição atual do usuário na tela
let posX, posY;

// Elemento que representa o usuário
const usuario = document.getElementById('usuario');

// Define o centro da tela, usado como posição inicial do usuário
const center = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
};


// Função que inicializa a posição do usuário no centro da tela
function inicializarUsuario() {
    posX = center.x;                    // define a posição X no centro da tela
    posY = center.y;                    // define a posição Y no centro da tela
    usuario.style.left = `${posX}px`;   // posiciona o usuario na horizontal
    usuario.style.top = `${posY}px`;    // posiciona o usuario na vertical
}


// Função que retorna a posição atual do usuário como um objeto {x, y}
function getPosicaoUsuario() {
    return { x: posX, y: posY };
}


// Função que atualiza a posição do usuário e reposiciona o elemento na tela
function setPosicaoUsuario(x, y) {
    posX = x;                           // atualiza a posição X
    posY = y;                           // atualiza a posição Y
    usuario.style.left = `${posX}px`;   // move o usuario na horizontal
    usuario.style.top = `${posY}px`;    // move o usuario na vertical
}
