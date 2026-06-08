// Estado central do jogo (portado da 1ª unidade).
// Agora vive no BACKEND: ele é a única fonte da verdade sobre regras,
// pontuação, perguntas e de quem é a vez.
const Question = require("./Question");
const Player = require("./Player");
const { QUESTIONS_DB } = require("./questions");

class GameState {
    constructor(nomeJogador1, nomeJogador2, dificuldade) {
        this.jogador1 = new Player(nomeJogador1, 1);
        this.jogador2 = new Player(nomeJogador2, 2);
        this.dificuldade = dificuldade;
        this.turnoAtual = 1;
        this.perguntaAtual = null;
        this.numeroPergunta = 0;
        this.jogoEncerrado = false;
        this.vencedor = null;
        this.perguntas = [];
        this.perguntasUsadas = new Set();
        this._carregarPerguntas();
    }

    _carregarPerguntas() {
        var questoesRaw = QUESTIONS_DB[this.dificuldade] || QUESTIONS_DB.facil;
        for (var i = 0; i < questoesRaw.length; i++) {
            var q = questoesRaw[i];
            this.perguntas.push(new Question(q.categoria, q.texto, q.opcoes, q.correta));
        }
        this._embaralhar(this.perguntas);
    }

    _embaralhar(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    getJogadorAtual() {
        return this.turnoAtual === 1 ? this.jogador1 : this.jogador2;
    }

    getProximaPergunta() {
        if (this.perguntasUsadas.size >= this.perguntas.length) {
            this.perguntasUsadas.clear();
            this._embaralhar(this.perguntas);
        }

        for (var i = 0; i < this.perguntas.length; i++) {
            if (!this.perguntasUsadas.has(i)) {
                this.perguntasUsadas.add(i);
                this.perguntaAtual = this.perguntas[i];
                this.numeroPergunta++;
                return this.perguntaAtual;
            }
        }
        return null;
    }

    responder(indiceEscolhido) {
        if (!this.perguntaAtual || this.jogoEncerrado) {
            return null;
        }

        var jogador = this.getJogadorAtual();
        var acertou = this.perguntaAtual.verificarResposta(indiceEscolhido);

        if (acertou) {
            jogador.avancar();
        } else {
            jogador.recuar();
        }

        if (jogador.venceu()) {
            this.jogoEncerrado = true;
            this.vencedor = jogador;
        }

        return {
            acertou: acertou,
            jogador: jogador,
            indiceCorreta: this.perguntaAtual.correta,
            respostaCorreta: this.perguntaAtual.getRespostaCorreta(),
            pergunta: this.perguntaAtual,
            jogoEncerrado: this.jogoEncerrado
        };
    }

    passarTurno() {
        this.turnoAtual = this.turnoAtual === 1 ? 2 : 1;
    }

    getDificuldadeTexto() {
        var map = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };
        return map[this.dificuldade] || this.dificuldade;
    }

    // Snapshot seguro enviado aos clientes. A pergunta vai SEM o gabarito.
    toClientState() {
        return {
            jogadores: [this.jogador1.toJSON(), this.jogador2.toJSON()],
            turnoAtual: this.turnoAtual,
            numeroPergunta: this.numeroPergunta,
            dificuldade: this.dificuldade,
            dificuldadeTexto: this.getDificuldadeTexto(),
            jogoEncerrado: this.jogoEncerrado,
            vencedor: this.vencedor ? this.vencedor.toJSON() : null,
            perguntaAtual: this.perguntaAtual ? this.perguntaAtual.toPublic() : null
        };
    }
}

module.exports = GameState;
