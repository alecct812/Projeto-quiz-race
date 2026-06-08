import { useState, useEffect } from "react";
import { useGame } from "../state/GameContext.jsx";
import { formatarCategoria, LETRAS } from "../utils.js";

export default function QuestionPanel() {
    const g = useGame();
    const { state, youId } = g;
    const [selecionada, setSelecionada] = useState(-1);

    const pergunta = state.perguntaAtual;
    const turno = state.turnoAtual;
    const suaVez = youId === turno;
    const oponente = state.jogadores.find((j) => j.id === turno);

    // Zera a seleção sempre que muda a pergunta.
    useEffect(() => {
        setSelecionada(-1);
    }, [state.numeroPergunta]);

    if (!pergunta) return null;

    function confirmar() {
        if (selecionada < 0 || !suaVez) return;
        g.responder(selecionada);
    }

    return (
        <section className="question-section">
            <div className="question-header">
                <span className={`question-category category-${pergunta.categoria}`}>
                    {formatarCategoria(pergunta.categoria)}
                </span>
                <span className="question-number">Pergunta {state.numeroPergunta}</span>
            </div>

            <p className="question-text">{pergunta.texto}</p>

            <div className="options-container">
                {pergunta.opcoes.map((op, i) => (
                    <button
                        key={i}
                        className={`option-btn ${selecionada === i ? "selected" : ""} ${
                            suaVez ? "" : "disabled"
                        }`}
                        disabled={!suaVez}
                        onClick={() => suaVez && setSelecionada(i)}
                    >
                        <span className="option-letter">{LETRAS[i]}</span>
                        <span>{op}</span>
                    </button>
                ))}
            </div>

            {suaVez ? (
                <button className="confirm-btn" disabled={selecionada < 0} onClick={confirmar}>
                    Confirmar Resposta
                </button>
            ) : (
                <p className="waiting-msg">
                    ⏳ Aguardando {oponente ? oponente.nome : "o oponente"} responder...
                </p>
            )}
        </section>
    );
}
