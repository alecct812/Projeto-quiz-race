import { useGame } from "../state/GameContext.jsx";
import { runnerEmoji } from "../utils.js";

// Marcadores 0..10 da pista.
const MARCADORES = Array.from({ length: 11 }, (_, i) => i);

function Lane({ jogador, ativo, animClass }) {
    const left = (jogador.posicao / 10) * 90 + 1; // % horizontal (igual à 1ª unidade)
    return (
        <div className={`track-lane lane-${jogador.id} ${ativo ? "active-lane" : ""}`}>
            <div className="lane-label">{jogador.nome}</div>
            <div className="lane-path">
                <div className="lane-markers">
                    {MARCADORES.map((n) => (
                        <div key={n} className="lane-marker">
                            <span className="lane-marker-number">{n}</span>
                        </div>
                    ))}
                </div>
                <div
                    className={`runner ${animClass}`}
                    style={{ left: left + "%" }}
                >
                    {runnerEmoji(jogador.id)}
                </div>
            </div>
        </div>
    );
}

export default function RaceTrack() {
    const { state, fase, ultimoResultado } = useGame();
    const turno = state.turnoAtual;

    function animFor(jogadorId) {
        if (fase === "feedback" && ultimoResultado && ultimoResultado.jogadorId === jogadorId) {
            return ultimoResultado.acertou ? "running" : "wrong";
        }
        return "";
    }

    return (
        <section className="track-section">
            <h2 className="section-title">Pista de Corrida</h2>
            <div className="race-track">
                <div className="track-labels">
                    <span className="track-label start-label">INÍCIO</span>
                    <span className="track-label finish-label">META (10)</span>
                </div>
                {state.jogadores.map((j) => (
                    <Lane
                        key={j.id}
                        jogador={j}
                        ativo={j.id === turno && fase === "playing"}
                        animClass={animFor(j.id)}
                    />
                ))}
            </div>
        </section>
    );
}
