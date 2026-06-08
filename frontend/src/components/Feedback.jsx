import { useGame } from "../state/GameContext.jsx";

// Mostrado nos ~2,5s entre a resposta e a próxima pergunta. O servidor controla
// a passagem de vez — por isso não há botão "próximo" aqui.
export default function Feedback() {
    const { state, ultimoResultado } = useGame();
    const r = ultimoResultado;
    if (!r) return null;

    const jogador = state.jogadores.find((j) => j.id === r.jogadorId);
    const nome = jogador ? jogador.nome : "";
    const posicao = jogador ? jogador.posicao : 0;

    return (
        <section className={`feedback-section ${r.acertou ? "correct-feedback" : "wrong-feedback"}`}>
            <div className="feedback-content">
                <div className="feedback-icon">{r.acertou ? "✅" : "❌"}</div>
                <p className="feedback-text">
                    {nome} {r.acertou ? "acertou!" : "errou!"}
                </p>
                <p className="feedback-answer">
                    {r.acertou
                        ? `Avançou para a posição ${posicao}.`
                        : `Resposta correta: ${r.respostaCorreta}. Voltou para a posição ${posicao}.`}
                </p>
                <p className="feedback-next">
                    {r.jogoEncerrado ? "Calculando resultado..." : "Próxima pergunta em instantes..."}
                </p>
            </div>
        </section>
    );
}
