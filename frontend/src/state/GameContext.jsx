import { createContext, useContext, useReducer, useEffect } from "react";
import { socket } from "../socket.js";

// Estado global do jogo no cliente. É apenas um ESPELHO do que o servidor envia
// (o backend é a fonte da verdade). Toda atualização passa pelo reducer -> setState,
// nunca por manipulação direta do DOM.

const GameContext = createContext(null);

export function useGame() {
    return useContext(GameContext);
}

const initialState = {
    conectado: false,
    fase: "lobby", // lobby | waiting | playing | feedback | over
    codigo: null,
    youId: null, // 1 (anfitrião) ou 2
    players: [], // [{ id, nome }]
    state: null, // último snapshot do servidor (jogadores, perguntaAtual, turnoAtual, ...)
    ultimoResultado: null, // payload de answer_result
    historico: [], // [{ id, acertou, nome, categoria, posicao }]
    vencedor: null,
    erro: null, // erro ao entrar em sala
    oponenteSaiu: false
};

const MAX_HISTORICO = 15;

function reducer(s, action) {
    switch (action.type) {
        case "CONNECTED":
            return { ...s, conectado: true };
        case "DISCONNECTED":
            return { ...s, conectado: false };

        case "ROOM_CREATED":
            return {
                ...s,
                fase: "waiting",
                codigo: action.codigo,
                players: action.players,
                youId: action.youId,
                erro: null,
                oponenteSaiu: false
            };
        case "ROOM_JOINED":
            return {
                ...s,
                fase: "waiting",
                codigo: action.codigo,
                players: action.players,
                youId: action.youId,
                erro: null,
                oponenteSaiu: false
            };
        case "PLAYER_JOINED":
            return { ...s, players: action.players };

        case "JOIN_ERROR":
            return { ...s, erro: action.msg };

        case "GAME_STATE":
            // Novo estado/pergunta vindo do servidor: entra (ou continua) em jogo.
            return {
                ...s,
                fase: "playing",
                state: action.state,
                ultimoResultado: null,
                vencedor: null
            };

        case "ANSWER_RESULT": {
            const { result, state } = action;
            const jogador = state.jogadores.find((j) => j.id === result.jogadorId);
            const item = {
                id: Date.now() + "-" + Math.random(),
                acertou: result.acertou,
                nome: jogador ? jogador.nome : "",
                categoria: result.categoria,
                posicao: jogador ? jogador.posicao : 0
            };
            return {
                ...s,
                fase: "feedback",
                state,
                ultimoResultado: result,
                historico: [item, ...s.historico].slice(0, MAX_HISTORICO)
            };
        }

        case "GAME_OVER":
            return {
                ...s,
                fase: "over",
                state: action.state,
                vencedor: action.winner
            };

        case "OPPONENT_LEFT":
            return { ...s, oponenteSaiu: true };

        case "RESET":
            // Volta ao lobby mantendo a conexão.
            return { ...initialState, conectado: s.conectado };

        default:
            return s;
    }
}

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        function onConnect() {
            dispatch({ type: "CONNECTED" });
        }
        function onDisconnect() {
            dispatch({ type: "DISCONNECTED" });
        }
        function onRoomCreated(p) {
            dispatch({ type: "ROOM_CREATED", ...p });
        }
        function onRoomJoined(p) {
            dispatch({ type: "ROOM_JOINED", ...p });
        }
        function onPlayerJoined(p) {
            dispatch({ type: "PLAYER_JOINED", ...p });
        }
        function onJoinError(p) {
            dispatch({ type: "JOIN_ERROR", ...p });
        }
        function onGameState(p) {
            dispatch({ type: "GAME_STATE", ...p });
        }
        function onAnswerResult(p) {
            dispatch({ type: "ANSWER_RESULT", ...p });
        }
        function onGameOver(p) {
            dispatch({ type: "GAME_OVER", ...p });
        }
        function onOpponentLeft() {
            dispatch({ type: "OPPONENT_LEFT" });
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("room_created", onRoomCreated);
        socket.on("room_joined", onRoomJoined);
        socket.on("player_joined", onPlayerJoined);
        socket.on("join_error", onJoinError);
        socket.on("game_state", onGameState);
        socket.on("answer_result", onAnswerResult);
        socket.on("game_over", onGameOver);
        socket.on("opponent_left", onOpponentLeft);

        if (socket.connected) dispatch({ type: "CONNECTED" });

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("room_created", onRoomCreated);
            socket.off("room_joined", onRoomJoined);
            socket.off("player_joined", onPlayerJoined);
            socket.off("join_error", onJoinError);
            socket.off("game_state", onGameState);
            socket.off("answer_result", onAnswerResult);
            socket.off("game_over", onGameOver);
            socket.off("opponent_left", onOpponentLeft);
        };
    }, []);

    const actions = {
        criarSala: (nome) => socket.emit("create_room", { nome }),
        entrarSala: (codigo, nome) => socket.emit("join_room", { codigo, nome }),
        iniciar: (dificuldade) => socket.emit("start_game", { dificuldade }),
        responder: (opcao) => socket.emit("submit_answer", { opcao }),
        reiniciar: () => socket.emit("restart"),
        voltarLobby: () => {
            socket.emit("leave_room");
            dispatch({ type: "RESET" });
        }
    };

    return (
        <GameContext.Provider value={{ ...state, ...actions }}>
            {children}
        </GameContext.Provider>
    );
}
