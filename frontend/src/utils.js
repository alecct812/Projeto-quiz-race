// Formatadores compartilhados pelos componentes.

const CATEGORIAS = {
    matematica: "Matemática",
    biologia: "Biologia",
    geografia: "Geografia",
    historia: "História",
    fisica: "Física",
    computacao: "Computação"
};

export function formatarCategoria(cat) {
    return CATEGORIAS[cat] || cat;
}

export const LETRAS = ["A", "B", "C", "D"];

// Emoji do corredor por id de jogador.
export function runnerEmoji(id) {
    return id === 1 ? "🏃‍♂️" : "🏃‍♀️";
}
