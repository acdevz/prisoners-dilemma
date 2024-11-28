<script>
    import { gameState } from '../store.js';
    import { navigate } from "svelte-routing";

    gameState.reset();
    
    let rounds = 5;
    let roomCode = '';
    let error = null;

    gameState.subscribe(state => {
        switch(state.status) {
            case 'room-created':
                roomCode = state.roomCode;
                break;
            case 'game-ready':
                navigate('/game');
                break;
            case 'error':
				error = state.error;
                break;
        }
    });

    function createRoom() {
        gameState.createRoom(rounds);
    }
</script>

<div>
    <h2>Host Game</h2>
    <label>
        Number of Rounds:
        <input type="number" bind:value={rounds} min="1" max="10" />
    </label>
    <button on:click={createRoom}>Create Room</button>

    {#if roomCode}
        <p>Room Code: {roomCode}</p>
    {/if}
    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>