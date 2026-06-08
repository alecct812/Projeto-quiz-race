import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { GameProvider } from "./state/GameContext.jsx";
import "./styles/base.css";
import "./styles/lobby.css";
import "./styles/game.css";

// Único ponto de contato com o DOM: o "root" exigido pelo próprio React.
// Toda a lógica/renderização do jogo é feita via estado e JSX (sem DOM manual).
createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GameProvider>
            <App />
        </GameProvider>
    </React.StrictMode>
);
