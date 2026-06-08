import { useGame } from "../state/GameContext.jsx";

export default function WinnerModal() {
    const g = useGame();
    const { state, vencedor, youId } = g;
    if (!vencedor) return null;

    const souAnfitriao = youId === 1;
    const venci = youId === vencedor.id;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="trophy">🏆</div>
                <h2 className="modal-title">🎉 {vencedor.nome} venceu! 🎉</h2>
                <p className="modal-text">
                    {venci
                        ? "Parabéns, você alcançou 10 acertos e venceu a corrida!"
                        : `${vencedor.nome} alcançou 10 acertos e venceu a corrida!`}
                </p>

                <div className="final-stats">
                    <table>
                        <thead>
                            <tr>
                                <th>Jogador</th>
                                <th>Acertos</th>
                                <th>Erros</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.jogadores.map((j) => (
                                <tr key={j.id} className={j.id === vencedor.id ? "winner-highlight" : ""}>
                                    <td>{j.nome}</td>
                                    <td>{j.acertos}</td>
                                    <td>{j.erros}</td>
                                    <td>{j.acertos + j.erros}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="modal-buttons">
                    {souAnfitriao ? (
                        <button className="modal-btn restart-btn" onClick={g.reiniciar}>
                            Jogar Novamente
                        </button>
                    ) : (
                        <p className="rematch-hint">Aguardando o anfitrião reiniciar...</p>
                    )}
                    <button className="modal-btn home-btn" onClick={g.voltarLobby}>
                        Voltar ao Início
                    </button>
                </div>
            </div>
        </div>
    );
}
