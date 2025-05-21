//variaveis de controle do estado do usuario arrastado
let isDragging = false;
let offsetX = 0, offsetY = 0;

//inicia o comportamento de arrastar o usuario na tela
function inicializarArraste() {
    
    usuario.addEventListener('pointerdown', (e) => {        //quando pressiona sobre o usuario
        isDragging = !isDragging;                           //altera o estado do arraste
        usuario.classList.toggle('ativo');                  //troca o icone para o icone arrastavel do usuario
        usuario.setPointerCapture(e.pointerId);             //captura o mouse para continuar seguindo ele

        if (isDragging) {
        document.querySelectorAll('.passo-caminho').forEach(e => e.remove());       //remove os caminhos anteriormente definidos (temporario)
        offsetX = e.clientX - posX;                 //calcula o deslocamento entre o ponto clicado e a posição atual do usuário
        offsetY = e.clientY - posY;
        } else {
        usuario.releasePointerCapture(e.pointerId); //se o arraste terminou, libera a captura do ponteiro
        }
    });

    document.addEventListener('pointermove', (e) => {   //evento que detecta o movimento do ponteiro na tela
        if (!isDragging) return;                        //se não estiver arrastando, ignora o evento
        setPosicaoUsuario(e.clientX - offsetX, e.clientY - offsetY);    //atualiza a posição do usuário com base no movimento do ponteiro
        const { x, y } = getPosicaoUsuario();           //recebe a posição atual do usuário e atualiza as bússolas para refletir essa posição
        atualizarBussolas(x, y);
    });

    window.addEventListener('resize', () => {   //evento para quando a janela do navegador for redimensionada
        center.x = window.innerWidth / 2;
        center.y = window.innerHeight / 2;
    });
}