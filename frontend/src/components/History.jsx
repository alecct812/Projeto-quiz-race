import { useGame } from "../state/GameContext.jsx";
import { formatarCategoria } from "../utils.js";

export default function History() {
    const { historico } = useGame();

    return (
        <section className="history-section">
            <h2 className="section-title">Histórico de Jogadas</h2>
            <ol className="history-list">
                {historico.length === 0 && (
                    <li className="history-empty">Nenhuma jogada ainda.</li>
                )}
                {historico.map((item) => (
                    <li
                        key={item.id}
                        className={`history-item ${item.acertou ? "correct" : "wrong"}`}
                    >
                        {item.acertou ? "✓" : "✗"} {item.nome}{" "}
                        {item.acertou ? "acertou" : "errou"} ({formatarCategoria(item.categoria)}) → Pos:{" "}
                        {item.posicao}
                    </li>
                ))}
            </ol>
        </section>
    );
}
