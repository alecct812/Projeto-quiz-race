// Abstração de uma pergunta do quiz (portada da 1ª unidade).
class Question {
    constructor(categoria, texto, opcoes, correta) {
        this.categoria = categoria;
        this.texto = texto;
        this.opcoes = opcoes;
        this.correta = correta;
    }

    verificarResposta(indiceEscolhido) {
        return indiceEscolhido === this.correta;
    }

    getRespostaCorreta() {
        return this.opcoes[this.correta];
    }

    // Versão segura enviada ao cliente: SEM o índice da resposta correta.
    toPublic() {
        return {
            categoria: this.categoria,
            texto: this.texto,
            opcoes: this.opcoes
        };
    }
}

module.exports = Question;
