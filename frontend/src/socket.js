import { io } from "socket.io-client";

// Em dev, VITE_SERVER_URL aponta para o backend (:3001).
// Em produção (Render) a variável não existe e o socket conecta na MESMA
// origem da página — o mesmo serviço que serviu o React.
const url = import.meta.env.VITE_SERVER_URL;

export const socket = url ? io(url) : io();
