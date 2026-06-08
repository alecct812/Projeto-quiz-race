import { useState } from "react";
import { useGame } from "../state/GameContext.jsx";

const DIFICULDADES = [
    { valor: "facil", classe: "easy", icone: "⭐", texto: "Fácil" },
    { valor: "medio", classe: "medium", icone: "⭐⭐", texto: "Médio" },
    { valor: "dificil", classe: "hard", icone: "⭐⭐⭐", texto: "Difícil" }
];

export default function Lobby() {
    const g = useGame();
    const [nome, setNome] = useState("");
    const [codigoInput, setCodigoInput] = useState("");
    const [dificuldade, setDificuldade] = useState("facil");
    const [avisoLocal, setAvisoLocal] = useState("");

    const emEspera = g.fase === "waiting";

    function validarNome() {
        if (!nome.trim()) {
            setAvisoLocal("Digite seu nome para continuar.");
            return false;
        }
        setAvisoLocal("");
        return true;
    }

    function criar() {
        if (!validarNome()) return;
        g.criarSala(nome.trim());
    }

    function entrar() {
        if (!validarNome()) return;
        if (!codigoInput.trim()) {
            setAvisoLocal("Digite o código da sala.");
            return;
        }
        g.entrarSala(codigoInput.trim().toUpperCase(), nome.trim());
    }

    const aviso = avisoLocal || g.erro;

    return (
        <div className="container">
            <header className="header">
                <h1 className="title">🏁 Quiz Race 🏁</h1>
                <p className="subtitle">Multiplayer online — jogue em computadores diferentes!</p>
            </header>

            <main className="config-panel">
                {!emEspera ? (
                    <div className="config-card">
                        <h2 className="config-title">Entrar no jogo</h2>

                        <div className="input-group">
                            <label htmlFor="nome">Seu nome</label>
                            <input
                                id="nome"
                                type="text"
                                autoFocus
                                maxLength={20}
                                placeholder="Digite seu nome..."
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && criar()}
                            />
                        </div>

                        {aviso && <p className="aviso-msg">{aviso}</p>}

                        <div className="lobby-actions">
                            <div className="action-card create">
                                <h3>Criar sala</h3>
                                <p>Crie uma sala e compartilhe o código com seu amigo.</p>
                                <button className="start-button" onClick={criar}>
                                    Criar sala 🎮
                                </button>
                            </div>

                            <div className="lobby-or">OU</div>

                            <div className="action-card join">
                                <h3>Entrar com código</h3>
                                <input
                                    type="text"
                                    className="code-input"
                                    maxLength={4}
                                    placeholder="Ex: A7K2"
                                    value={codigoInput}
                                    onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === "Enter" && entrar()}
                                />
                                <button className="start-button secondary" onClick={entrar}>
                                    Entrar 🚪
                                </button>
                            </div>
                        </div>

                        {!g.conectado && (
                            <p className="conexao-aviso">Conectando ao servidor...</p>
                        )}
                    </div>
                ) : (
                    <div className="config-card waiting-card">
                        <h2 className="config-title">Sala criada!</h2>
                        <p className="room-code-hint">
                            Compartilhe este código com o outro jogador:
                        </p>
                        <div className="room-code">{g.codigo}</div>

                        <div className="players-waiting">
                            {g.players.map((p) => (
                                <div key={p.id} className={`player-chip player${p.id}`}>
                                    <span className="chip-icon">{p.id === 1 ? "🏃‍♂️" : "🏃‍♀️"}</span>
                                    {p.nome}
                                    {p.id === g.youId && <span className="voce-tag">(você)</span>}
                                </div>
                            ))}
                            {g.players.length < 2 && (
                                <div className="player-chip empty">
                                    <span className="chip-icon">⏳</span>
                                    Aguardando jogador 2...
                                </div>
                            )}
                        </div>

                        {g.youId === 1 ? (
                            <>
                                <div className="difficulty-section">
                                    <h3>Dificuldade</h3>
                                    <div className="difficulty-options">
                                        {DIFICULDADES.map((d) => (
                                            <label key={d.valor} className="difficulty-option">
                                                <input
                                                    type="radio"
                                                    name="difficulty"
                                                    value={d.valor}
                                                    checked={dificuldade === d.valor}
                                                    onChange={() => setDificuldade(d.valor)}
                                                />
                                                <span className={`difficulty-label ${d.classe}`}>
                                                    <span className="diff-icon">{d.icone}</span>
                                                    <span className="diff-text">{d.texto}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className="start-button"
                                    disabled={g.players.length < 2}
                                    onClick={() => g.iniciar(dificuldade)}
                                >
                                    {g.players.length < 2
                                        ? "Aguardando jogador 2..."
                                        : "Iniciar Corrida! 🚀"}
                                </button>
                            </>
                        ) : (
                            <p className="waiting-host">
                                Você entrou na sala! Aguardando o anfitrião iniciar a corrida...
                            </p>
                        )}

                        <button className="link-button" onClick={g.voltarLobby}>
                            ← Sair da sala
                        </button>
                    </div>
                )}
            </main>

            <footer className="footer">
                <p>Quiz Race &copy; 2026 - Projeto de Programação Frontend (Unidade 2)</p>
            </footer>
        </div>
    );
}
