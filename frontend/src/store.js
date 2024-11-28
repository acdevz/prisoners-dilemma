import { writable } from "svelte/store";

function createWebSocketStore() {
  const { subscribe, update } = writable({
    status: 'disconnected',
    error: null
  });
  let socket = null;

  function connect() {
    const PORT = 8088;
    const HOST = '192.168.1.18'
    socket = new WebSocket(`ws://${HOST}:${PORT}`);

    socket.onopen = () => {
      update(state => ({ ...state, status: 'connected', error: null }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "roomCreated":
          update(state => ({ 
            ...state, 
            roomCode: message.roomCode,
            status: 'room-created'
          }));
          break;

        case "gameReady":
          update(state => ({ 
            ...state, 
            status: 'game-ready',
            roomCode: message.roomCode,
            player: message.player
          }));
          break;

        case "roundResult":
          update(state => ({ 
            ...state, 
            ...message.result,
            status: 'round-complete'
          }));
          break;

        case "gameOver":
          update(state => ({ 
            ...state, 
            winner: message.winner,
            status: 'game-over'
          }));
          break;

        case "error":
          update(state => ({ 
            ...state, 
            error: message.message,
            status: 'error'
          }));
          break;

        default:
          console.log("Unknown message type:", message);
      }
    };

    socket.onclose = () => {
      update(state => ({ ...state, status: 'disconnected' }));
      setTimeout(() => connect(), 3000);
    };

    socket.onerror = (error) => {
      update(state => ({ 
        ...state, 
        status: 'error', 
        error: error.message 
      }));
    };
  }

  function send(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }

  function createRoom(rounds = 5) {
    send({ type: 'createRoom', rounds });
  }

  function joinRoom(roomCode) {
    send({ type: 'joinRoom', roomCode });
  }

  function submitChoice(roomCode, player, choice) {
    send({ 
      type: 'playerChoice', 
      roomCode, 
      player, 
      choice 
    });
  }

  function reset(){
    update(() => ({
      status: 'connected',
      error: null,
    }))
  }

  connect();

  return {
    subscribe,
    createRoom,
    joinRoom,
    submitChoice,
    reset,
    send
  };
}

export const gameState = createWebSocketStore();