// Abstração de um jogador (portada da 1ª unidade).
class Player {
    constructor(nome, id) {
        this.nome = nome;
        this.id = id;
        this.posicao = 0;
        this.acertos = 0;
        this.erros = 0;
    }

    avancar() {
        if (this.posicao < 10) {
            this.posicao++;
        }
        this.acertos++;
    }

    recuar() {
        if (this.posicao > 0) {
            this.posicao--;
        }
        this.erros++;
    }

    getTotalRespostas() {
        return this.acertos + this.erros;
    }

    venceu() {
        return this.acertos >= 10;
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            posicao: this.posicao,
            acertos: this.acertos,
            erros: this.erros
        };
    }
}

module.exports = Player;
