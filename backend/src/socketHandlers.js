// Liga os eventos de Socket.IO à lógica do jogo.
// O servidor é a autoridade: valida a vez, calcula o resultado, controla a
// pontuação e "passa a vez" sozinho — fazendo broadcast do estado às duas pontas.
const RoomManager = require("./RoomManager");

const FEEDBACK_MS = 2500; // tempo que o feedback fica na tela antes de passar a vez

function jogadorPublico(p) {
    return { id: p.id, nome: p.nome };
}

function registerHandlers(io) {
    var rooms = new RoomManager();

    io.on("connection", function (socket) {
        // --- Criar sala ---------------------------------------------------
        socket.on("create_room", function (data) {
            var nome = (data && data.nome ? data.nome : "").trim();
            if (!nome) {
                socket.emit("join_error", { msg: "Informe seu nome." });
                return;
            }
            var sala = rooms.criarSala(socket.id, nome);
            socket.join(sala.codigo);
            socket.data.codigo = sala.codigo;
            socket.emit("room_created", {
                codigo: sala.codigo,
                players: sala.players.map(jogadorPublico),
                youId: 1
            });
        });

        // --- Entrar em sala existente ------------------------------------
        socket.on("join_room", function (data) {
            var codigo = (data && data.codigo ? data.codigo : "").toUpperCase().trim();
            var nome = (data && data.nome ? data.nome : "").trim();
            if (!nome) {
                socket.emit("join_error", { msg: "Informe seu nome." });
                return;
            }
            var res = rooms.entrarSala(codigo, socket.id, nome);
            if (res.erro) {
                socket.emit("join_error", { msg: res.erro });
                return;
            }
            socket.join(codigo);
            socket.data.codigo = codigo;
            socket.emit("room_joined", {
                codigo: codigo,
                players: res.sala.players.map(jogadorPublico),
                youId: 2
            });
            // Avisa a sala inteira (inclui o anfitrião) que o 2º jogador entrou.
            io.to(codigo).emit("player_joined", {
                players: res.sala.players.map(jogadorPublico)
            });
        });

        // --- Iniciar partida (só o anfitrião) ----------------------------
        socket.on("start_game", function (data) {
            var sala = rooms.getSala(socket.data.codigo);
            if (!sala) return;
            var eu = sala.players.find(function (p) { return p.socketId === socket.id; });
            if (!eu || eu.id !== 1) return; // só o anfitrião inicia
            if (sala.players.length < 2) {
                socket.emit("join_error", { msg: "Aguarde o segundo jogador entrar." });
                return;
            }
            var dificuldade = (data && data.dificuldade) ? data.dificuldade : "facil";
            var gs = rooms.iniciarPartida(sala, dificuldade);
            io.to(sala.codigo).emit("game_state", { state: gs.toClientState() });
        });

        // --- Responder pergunta ------------------------------------------
        socket.on("submit_answer", function (data) {
            var sala = rooms.getSala(socket.data.codigo);
            if (!sala || !sala.gameState || sala.status !== "playing") return;

            var gs = sala.gameState;
            var jogadorDaVez = gs.getJogadorAtual();
            var eu = sala.players.find(function (p) { return p.socketId === socket.id; });
            if (!eu || eu.id !== jogadorDaVez.id) return; // ignora quem não é da vez (autoridade)

            var opcao = data ? data.opcao : -1;
            var resultado = gs.responder(opcao);
            if (!resultado) return;

            var result = {
                acertou: resultado.acertou,
                jogadorId: resultado.jogador.id,
                opcaoEscolhida: opcao,
                indiceCorreta: resultado.indiceCorreta,
                respostaCorreta: resultado.respostaCorreta,
                categoria: resultado.pergunta.categoria,
                jogoEncerrado: resultado.jogoEncerrado
            };

            io.to(sala.codigo).emit("answer_result", {
                result: result,
                state: gs.toClientState()
            });

            if (resultado.jogoEncerrado) {
                sala.status = "finished";
                io.to(sala.codigo).emit("game_over", {
                    winner: gs.vencedor.toJSON(),
                    state: gs.toClientState()
                });
            } else {
                // O servidor passa a vez sozinho depois do feedback.
                sala.timer = setTimeout(function () {
                    gs.passarTurno();
                    gs.getProximaPergunta();
                    io.to(sala.codigo).emit("game_state", { state: gs.toClientState() });
                }, FEEDBACK_MS);
            }
        });

        // --- Reiniciar (só o anfitrião) ----------------------------------
        socket.on("restart", function () {
            var sala = rooms.getSala(socket.data.codigo);
            if (!sala) return;
            var eu = sala.players.find(function (p) { return p.socketId === socket.id; });
            if (!eu || eu.id !== 1) return;
            if (sala.players.length < 2) return;
            var gs = rooms.iniciarPartida(sala, sala.dificuldade);
            io.to(sala.codigo).emit("game_state", { state: gs.toClientState() });
        });

        // --- Sair da sala explicitamente ---------------------------------
        socket.on("leave_room", function () {
            encerrarSala(socket);
        });

        // --- Desconexão ---------------------------------------------------
        socket.on("disconnect", function () {
            encerrarSala(socket);
        });
    });

    // Notifica o oponente e descarta a sala quando alguém sai.
    function encerrarSala(socket) {
        var sala = rooms.acharSalaPorSocket(socket.id);
        if (!sala) return;
        socket.to(sala.codigo).emit("opponent_left", {});
        rooms.removerSala(sala.codigo);
        socket.data.codigo = null;
    }
}

module.exports = registerHandlers;
