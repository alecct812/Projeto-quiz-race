import { useGame } from "../state/GameContext.jsx";

export default function TurnIndicator() {
    const { state, youId } = useGame();
    const turno = state.turnoAtual;
    const jogadorDaVez = state.jogadores.find((j) => j.id === turno);
    const suaVez = youId === turno;

    return (
        <div className={`turn-indicator player${turno}-turn`}>
            {suaVez ? "🎯 Sua vez!" : `Vez de: ${jogadorDaVez ? jogadorDaVez.nome : "---"}`}
        </div>
    );
}
