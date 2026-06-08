# 🏁 Quiz Race Online — Unidade 2

Versão **multiplayer em rede** do *Quiz Race* (jogo da 1ª unidade), reescrita em
**React** com toda a lógica central movida para um **backend Node + Socket.IO**.
Dois jogadores, em **computadores diferentes**, respondem perguntas de quiz e
correm numa pista: **acerto avança 1 casa, erro recua 1 casa, vence quem chega a
10 acertos**.

## 🎮 Jogar agora

**▶️ Online (sem instalar nada):** https://projeto-quiz-race.onrender.com

Abra o link em **dois dispositivos/abas** (pode ser em redes diferentes):
1. Os dois digitam um **nome**.
2. Um clica em **Criar sala** → recebe um **código** de 4 letras.
3. O outro digita esse código em **Entrar com código**.
4. O **anfitrião** (quem criou) escolhe a dificuldade e clica em **Iniciar Corrida**.

> ⏱️ O serviço está num plano gratuito que **hiberna após ~15 min** sem uso. Se a
> primeira abertura demorar ~30–50s, é só o *cold start* — depois fica rápido.
> Dica para apresentar: abra o link 1 minuto antes para "acordar" o servidor.

**Repositório:** https://github.com/alecct812/Projeto-quiz-race

## Como funciona

- Quem está **na vez** vê a pergunta com as alternativas clicáveis e o botão
  *Confirmar*. O outro jogador vê o **mesmo tabuleiro ao vivo**, em modo
  espectador ("Aguardando o oponente responder…").
- Ao responder, o **servidor** valida, calcula o resultado, move o corredor e
  atualiza **placar e histórico em tempo real nas duas telas**.
- Depois de mostrar o feedback (~2,5s), o **servidor passa a vez sozinho** e envia
  a próxima pergunta.
- Quem chega a **10 acertos** vence → tela de vencedor com estatísticas. O
  anfitrião pode **jogar novamente**.

## ✅ Requisitos atendidos

### Unidade 1 (preservados nesta versão)
| Requisito | Onde / Como |
|---|---|
| Animação com figuras (pista com 2 corredores) | `components/RaceTrack.jsx` — posição/animação derivadas do estado |
| Pelo menos 2 jogadores humanos | 2 humanos, agora em **máquinas diferentes** |
| Tabela dinâmica (TABLE/TH/TR/TD) | `components/Scoreboard.jsx` e `components/WinnerModal.jsx` |
| Lista dinâmica (OL/LI) — itens inseridos/removidos | `components/History.jsx` (histórico limitado a 15) |
| Estilo muda com o estado do jogo | vez ativa (`turn-indicator`, `active-lane`, `active-row`), opção selecionada, feedback certo/errado |
| Resposta a eventos | handlers `onClick` do React |
| Placar com pontuação atualizada + nomes | `components/Scoreboard.jsx` (atualizado em tempo real) |
| Duas telas (configuração → jogo) | `Lobby` e `Game`, alternadas por estado |
| Layout/estilização em CSS | `styles/base.css`, `styles/lobby.css`, `styles/game.css` |
| Classes (abstrações) do jogo | `Question`, `Player`, `GameState` (agora no backend) |
| Separação HTML/CSS/JS | componentes JSX + CSS em arquivos próprios |

### Entrega 2 (novos requisitos)
| Requisito | Como foi atendido |
|---|---|
| Reescrito em **React, sem usar o DOM do JS** | Toda a UI é estado + JSX. A única referência a `document` é o *mount* padrão do React (`main.jsx`). |
| **Multiplayer em computadores diferentes** | Salas por código via WebSocket; publicado numa URL pública. |
| **Controle central no backend** (inteligência, regras, pontuação, passar a vez) | `backend/src/game/` + `backend/src/socketHandlers.js`: o servidor é a única fonte da verdade. |
| **Interação constante** backend ↔ fronts | Socket.IO: cada mudança é transmitida por *broadcast* às duas pontas. |

> Regras da U1 que a U2 **substitui de propósito**: "não usar DOM" troca a
> manipulação manual de DOM; React/Socket.IO são bibliotecas agora **exigidas**;
> e o jogo deixou de ser local para ser **online** (a "versão futura" que a própria
> especificação da U1 previa).

## Arquitetura

```
[Front React PC-A] <—— WebSocket (Socket.IO) ——> [Backend Node] <—— WebSocket ——> [Front React PC-B]
   (envia ações,                                   (regras, pontuação,                (envia ações,
    renderiza estado)                               vez, perguntas)                    renderiza estado)
```

- **Backend autoritativo:** guarda as salas em memória, valida de quem é a vez,
  calcula a pontuação, decide o vencedor e passa a vez sozinho.
- **Frontend "burro":** só envia ações (`criar/entrar sala`, `iniciar`, `responder`)
  e **renderiza o estado** que o servidor transmite.
- **Produção (Render):** o **mesmo** processo Node serve o React já buildado **e**
  o Socket.IO na **mesma origem** — um único serviço, sem CORS.

## Detalhes de implementação

- **Anti-trapaça:** o banco de perguntas vive no servidor e o **gabarito nunca é
  enviado** ao cliente antes da resposta (`Question.toPublic()` omite o índice
  correto). O servidor também **ignora respostas de quem não é a vez**.
- **Eventos Socket.IO** (`backend/src/socketHandlers.js`):
  `create_room` / `join_room` → `room_created` / `room_joined` / `player_joined`;
  `start_game` → `game_state`; `submit_answer` → `answer_result` (+ `game_over` ou,
  após ~2,5s, novo `game_state`); `restart`; `leave_room`/`disconnect` →
  `opponent_left`.
- **Estado no front:** um único `state/GameContext.jsx` (Context + `useReducer`)
  espelha o servidor; **toda atualização passa por estado/reducer, nunca pelo DOM**.
- **Animações sem DOM:** posição do corredor via `style={{ left }}` calculado do
  estado; classes (`running`/`wrong`, `active-lane`, `active-row`, pulso do placar)
  derivadas do estado.
- **Passar a vez:** controlado 100% pelo servidor (`setTimeout` após o feedback).

## 💻 Rodar localmente (desenvolvimento)

Pré-requisito: **Node.js 18+**.

```bash
npm install     # instala raiz + backend + frontend (via postinstall)
npm run dev     # sobe o backend (:3001) e o frontend Vite (:5173)
```

Abra **http://localhost:5173** em duas abas (uma cria a sala, a outra entra).

- Em dois PCs na mesma rede (LAN): no segundo PC, crie `frontend/.env.local` com
  `VITE_SERVER_URL=http://IP-DO-HOST:3001` e libere a porta 3001 no firewall.

## ☁️ Hospedagem

O projeto está **publicado no Render** (plano gratuito) como um **único serviço**:
o mesmo processo Node serve o React já buildado e o Socket.IO na mesma origem.
Já está disponível na URL no topo deste README.

## Estrutura e componentes

```
entrega_2/
├─ backend/
│  ├─ server.js              # Express + Socket.IO; serve o React buildado
│  └─ src/
│     ├─ game/
│     │  ├─ Question.js      # classe Pergunta
│     │  ├─ Player.js        # classe Jogador
│     │  ├─ GameState.js     # classe Partida (regras + pontuação)
│     │  └─ questions.js     # banco de perguntas
│     ├─ RoomManager.js      # gerência de salas
│     └─ socketHandlers.js   # eventos Socket.IO <-> jogo
├─ frontend/
│  ├─ index.html             # HTML raiz do React
│  ├─ vite.config.js
│  └─ src/
│     ├─ main.jsx            # ponto de entrada (monta o React)
│     ├─ App.jsx             # alterna Lobby <-> Game
│     ├─ socket.js           # cliente Socket.IO
│     ├─ utils.js            # helpers (categorias, letras, emojis)
│     ├─ state/GameContext.jsx   # estado global (espelho do servidor)
│     ├─ components/         # componentes de tela (ver tabela abaixo)
│     └─ styles/             # base.css, lobby.css, game.css
└─ package.json              # orquestra instalação/build/start (1 serviço)
```

### Backend (servidor — a "fonte da verdade")
| Arquivo | O que faz |
|---|---|
| `server.js` | Sobe Express + Socket.IO no mesmo HTTP server, serve o `frontend/dist`, expõe `/health` e usa `process.env.PORT`. |
| `src/game/Question.js` | Classe `Question`: enunciado, opções e índice correto; `verificarResposta()` e `toPublic()` (envia a pergunta **sem o gabarito**). |
| `src/game/Player.js` | Classe `Player`: nome, posição, acertos, erros; `avancar()`, `recuar()`, `venceu()` (10 acertos). |
| `src/game/GameState.js` | Classe `GameState` — coração da partida: sorteia perguntas, processa a resposta (`responder()`), passa a vez (`passarTurno()`), detecta a vitória e gera o snapshot seguro (`toClientState()`). |
| `src/game/questions.js` | `QUESTIONS_DB`: banco de perguntas (3 dificuldades × 6 categorias). |
| `src/RoomManager.js` | Salas em memória (mapa por código de 4 letras): criar, entrar, achar por socket, iniciar e remover. |
| `src/socketHandlers.js` | Liga os eventos de socket à lógica: `create_room`, `join_room`, `start_game`, `submit_answer` (com anti-trapaça e o "passar a vez" automático), `restart` e saída/desconexão. |

### Frontend (cliente React)
| Arquivo / Componente | O que faz |
|---|---|
| `main.jsx` | Monta o app dentro do `GameProvider` e importa os CSS. |
| `App.jsx` | Mostra o `Lobby` ou o `Game` conforme a fase do jogo. |
| `socket.js` | Cria a conexão Socket.IO (mesma origem em produção; `VITE_SERVER_URL` em dev). |
| `state/GameContext.jsx` | Context + `useReducer`: guarda o estado vindo do servidor, ouve os eventos de socket e expõe as ações (`criarSala`, `entrarSala`, `iniciar`, `responder`, `reiniciar`). |
| `components/Lobby.jsx` | Tela inicial: nome, criar/entrar sala e sala de espera (código, jogadores e — para o anfitrião — dificuldade + iniciar). |
| `components/Game.jsx` | Container da tela de jogo (cabeçalho, pista, painéis e modais). |
| `components/TurnIndicator.jsx` | Indica de quem é a vez ("Sua vez!" / "Vez de X"). |
| `components/RaceTrack.jsx` | A pista com os 2 corredores; posição e animações (acerto/erro) derivadas do estado. |
| `components/Scoreboard.jsx` | **Tabela** do placar (nome/acertos/erros/posição), com destaque da vez e pulso ao mudar. |
| `components/History.jsx` | **Lista** (OL/LI) do histórico de jogadas, mais recentes no topo. |
| `components/QuestionPanel.jsx` | Pergunta + alternativas; clicáveis só na sua vez (senão, modo espectador "aguardando o oponente"). |
| `components/Feedback.jsx` | Mostra certo/errado por ~2,5s antes de o servidor enviar a próxima pergunta. |
| `components/WinnerModal.jsx` | Modal de vencedor com estatísticas; "Jogar novamente" (anfitrião) / "Voltar ao início". |
| `styles/` | `base.css` (reset/base), `lobby.css` (tela inicial) e `game.css` (tela de jogo). |

## Tecnologias

React 18 · Vite 5 · Node.js · Express 4 · Socket.IO 4.

---
*Projeto de Programação Frontend — CESAR School. Categorias: Matemática, Biologia,
Geografia, História, Física e Computação · 3 níveis de dificuldade.*
