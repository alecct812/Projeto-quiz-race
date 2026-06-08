import { useGame } from "../state/GameContext.jsx";
import TurnIndicator from "./TurnIndicator.jsx";
import RaceTrack from "./RaceTrack.jsx";
import Scoreboard from "./Scoreboard.jsx";
import History from "./History.jsx";
import QuestionPanel from "./QuestionPanel.jsx";
import Feedback from "./Feedback.jsx";
import WinnerModal from "./WinnerModal.jsx";

export default function Game() {
    const g = useGame();
    const { state, fase } = g;

    if (!state) return null;

    return (
        <div className="game-container">
            <header className="game-header">
                <h1 className="game-title">🏁 Quiz Race 🏁</h1>
                <span className={`difficulty-badge diff-${state.dificuldade}`}>
                    Dificuldade: {state.dificuldadeTexto}
                </span>
                <TurnIndicator />
            </header>

            <RaceTrack />

            <div className="main-content">
                <div className="left-panel">
                    <Scoreboard />
                    <History />
                </div>

                <div className="right-panel">
                    {fase === "feedback" ? <Feedback /> : <QuestionPanel />}
                </div>
            </div>

            {fase === "over" && <WinnerModal />}

            {g.oponenteSaiu && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="trophy">😢</div>
                        <h2 className="modal-title">Oponente saiu</h2>
                        <p className="modal-text">
                            O outro jogador deixou a partida. Volte ao início para jogar de novo.
                        </p>
                        <div className="modal-buttons">
                            <button className="modal-btn restart-btn" onClick={g.voltarLobby}>
                                Voltar ao Início
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="game-footer">
                <button className="link-button" onClick={g.voltarLobby}>
                    ← Sair da partida
                </button>
                <p>Quiz Race &copy; 2026</p>
            </footer>
        </div>
    );
}
