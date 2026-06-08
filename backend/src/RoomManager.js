// Gerencia as salas (partidas) em memória, indexadas por um código curto.
// Cada sala guarda os jogadores conectados, a dificuldade e o GameState ativo.
const GameState = require("./game/GameState");

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem caracteres ambíguos (0/O, 1/I)

function gerarCodigo() {
    var codigo = "";
    for (var i = 0; i < 4; i++) {
        codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
    }
    return codigo;
}

class RoomManager {
    constructor() {
        this.salas = new Map();
    }

    criarSala(socketId, nome) {
        var codigo;
        do {
            codigo = gerarCodigo();
        } while (this.salas.has(codigo));

        var sala = {
            codigo: codigo,
            players: [{ socketId: socketId, nome: nome, id: 1 }],
            dificuldade: "facil",
            gameState: null,
            status: "waiting", // waiting | playing | finished
            timer: null
        };
        this.salas.set(codigo, sala);
        return sala;
    }

    entrarSala(codigo, socketId, nome) {
        var sala = this.salas.get(codigo);
        if (!sala) {
            return { erro: "Sala não encontrada. Confira o código." };
        }
        if (sala.players.length >= 2) {
            return { erro: "Essa sala já está cheia." };
        }
        if (sala.players.some(function (p) { return p.nome.toLowerCase() === nome.toLowerCase(); })) {
            return { erro: "Já existe um jogador com esse nome na sala." };
        }
        sala.players.push({ socketId: socketId, nome: nome, id: 2 });
        return { sala: sala };
    }

    getSala(codigo) {
        return this.salas.get(codigo);
    }

    acharSalaPorSocket(socketId) {
        for (var sala of this.salas.values()) {
            if (sala.players.some(function (p) { return p.socketId === socketId; })) {
                return sala;
            }
        }
        return null;
    }

    iniciarPartida(sala, dificuldade) {
        if (sala.timer) {
            clearTimeout(sala.timer);
            sala.timer = null;
        }
        sala.dificuldade = dificuldade || "facil";
        sala.gameState = new GameState(sala.players[0].nome, sala.players[1].nome, sala.dificuldade);
        sala.gameState.getProximaPergunta();
        sala.status = "playing";
        return sala.gameState;
    }

    removerSala(codigo) {
        var sala = this.salas.get(codigo);
        if (sala && sala.timer) {
            clearTimeout(sala.timer);
        }
        this.salas.delete(codigo);
    }
}

module.exports = RoomManager;
