import "dotenv/config"
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || 'localhost';
const server = new WebSocketServer({ host: HOST, port: PORT });

const rooms = new Map();
console.log(`WebSocket server running on ws://${HOST}:${PORT}`);

server.on("connection", (socket) => {
    console.log("A new client connected!");

    socket.on("message", (rawMessage) => {
        try {
            const message = JSON.parse(rawMessage.toString());

            switch (message.type) {
                case "createRoom":
                    handleCreateRoom(socket, message);
                    break;

                case "joinRoom":
                    handleJoinRoom(socket, message);
                    break;

                case "playerChoice":
                    handlePlayerChoice(message);
                    break;

                default:
                    console.log("Unknown message type:", message.type);
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    socket.on("close", () => {
        console.log("A client disconnected.");
        handleDisconnect(socket);
    });
});

function handleCreateRoom(socket, data) {
    const roomCode = uuidv4().slice(0, 6).toUpperCase();
    rooms.set(roomCode, {
        host: socket,
        joiner: null,
        rounds: data.rounds || 50,
        currentRound: 0,
        scores: { host: 0, joiner: 0 },
        choices: {},
    });

    socket.send(JSON.stringify({
        type: "roomCreated",
        roomCode,
    }));

    console.log(`Room created with code: ${roomCode}`);
}

function handleJoinRoom(socket, data) {
    const { roomCode } = data;
    const room = rooms.get(roomCode);

    if (!room) {
        return socket.send(JSON.stringify({ 
            type: "error", 
            message: "Room not found." 
        }));
    }

    if (room.joiner) {
        return socket.send(JSON.stringify({ 
            type: "error", 
            message: "Room already full." 
        }));
    }

    room.joiner = socket;

    room.host.send(JSON.stringify({ type: "gameReady", roomCode, player : 'host' }));
    room.joiner.send(JSON.stringify({ type: "gameReady", roomCode, player : 'joiner' }));

    console.log(`Player joined room: ${roomCode}`);
}

function handlePlayerChoice(data) {
    const { roomCode, player, choice } = data;
    const room = rooms.get(roomCode);

    if (!room) return;

    room.choices[player] = choice;

    if (room.choices.host && room.choices.joiner) {
        const result = resolveRound(room);
        room.host.send(JSON.stringify({ type: "roundResult", result }));
        room.joiner.send(JSON.stringify({ type: "roundResult", result }));

        room.choices = {};
        room.currentRound++;

        if (room.currentRound > room.rounds) {
            const winner = determineWinner(room.scores);

            room.host.send(JSON.stringify({ type: "gameOver", winner }));
            room.joiner.send(JSON.stringify({ type: "gameOver", winner }));

            rooms.delete(roomCode);
        }
    }
}

function resolveRound(room) {
    const payoffMatrix = {
        cc: [3, 3],
        cr: [0, 5],
        rc: [5, 0],
        rr: [1, 1],
    };

    const hostChoice = room.choices.host;
    const joinerChoice = room.choices.joiner;

    const resultKey = hostChoice + joinerChoice;
    const [hostPoints, joinerPoints] = payoffMatrix[resultKey];

    room.scores.host += hostPoints;
    room.scores.joiner += joinerPoints;

    return {
        hostChoice,
        joinerChoice,
        hostPoints,
        joinerPoints,
        scores: room.scores,
        currentRound: room.currentRound,
    };
}

function determineWinner(scores) {
    if (scores.host > scores.joiner) return "Host";
    if (scores.host < scores.joiner) return "Joiner";
    return "Tie";
}

function handleDisconnect(socket) {
    for (const [roomCode, room] of rooms.entries()) {
        if (room.host === socket || room.joiner === socket) {
            room.host?.send(JSON.stringify({
                type: "error",
                message: "Opponent disconnected.",
            }));
            room.joiner?.send(JSON.stringify({
                type: "error",
                message: "Opponent disconnected.",
            }));
            rooms.delete(roomCode);
            break;
        }
    }
}