import { useGame } from "./state/GameContext.jsx";
import Lobby from "./components/Lobby.jsx";
import Game from "./components/Game.jsx";

// As "duas páginas" do jogo viram duas views trocadas pelo estado (sem rotas/DOM):
// Lobby (configuração/sala de espera) e Game (a corrida).
export default function App() {
    const { fase } = useGame();
    const emJogo = fase === "playing" || fase === "feedback" || fase === "over";
    return emJogo ? <Game /> : <Lobby />;
}
