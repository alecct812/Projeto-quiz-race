// Servidor do Quiz Race Online.
// Em produção (Render) este MESMO processo serve o React buildado e o
// Socket.IO na mesma origem — um único serviço, sem CORS.
const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const registerHandlers = require("./src/socketHandlers");

const app = express();
const server = http.createServer(app);

// CORS liberado para facilitar o desenvolvimento (front no Vite :5173).
// Em produção o front é servido na mesma origem, então isso fica inócuo.
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

registerHandlers(io);

// Serve o front buildado (frontend/dist) — gerado por `npm run build`.
const distPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(distPath));

// Healthcheck simples.
app.get("/health", function (req, res) {
    res.json({ status: "ok" });
});

// SPA fallback: qualquer outra rota GET devolve o index.html do React.
app.get("*", function (req, res) {
    res.sendFile(path.join(distPath, "index.html"), function (err) {
        if (err) {
            res
                .status(200)
                .send("Frontend ainda não foi buildado. Rode `npm run build` na raiz do projeto.");
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, function () {
    console.log("Servidor Quiz Race ouvindo na porta " + PORT);
});
