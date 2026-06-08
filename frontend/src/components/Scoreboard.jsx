import { useGame } from "../state/GameContext.jsx";

export default function Scoreboard() {
    const { state, fase } = useGame();
    const turno = state.turnoAtual;

    return (
        <section className="scoreboard-section">
            <h2 className="section-title">Placar</h2>
            <table className="scoreboard">
                <thead>
                    <tr>
                        <th>Jogador</th>
                        <th>Acertos</th>
                        <th>Erros</th>
                        <th>Posição</th>
                    </tr>
                </thead>
                <tbody>
                    {state.jogadores.map((j) => {
                        const ativo = j.id === turno && fase !== "over";
                        return (
                            <tr key={j.id} className={`player${j.id}-row ${ativo ? "active-row" : ""}`}>
                                <td>{j.nome}</td>
                                <td>
                                    {/* key muda quando o valor muda -> remonta -> dispara a animação de pulso */}
                                    <span key={j.acertos} className="score-pop">{j.acertos}</span>
                                </td>
                                <td>
                                    <span key={j.erros} className="score-pop">{j.erros}</span>
                                </td>
                                <td>{j.posicao}/10</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </section>
    );
}
