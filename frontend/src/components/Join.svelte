<script>
    import { gameState } from '../store.js';
    import { navigate } from "svelte-routing";
    
    let enteredCode = "";
    let error = null;

    gameState.subscribe(state => {
        switch(state.status) {
            case 'game-ready':
                navigate('/game');
                break;
            case 'error':
				error = state.error;
                break;
        }
    });

    function joinRoom() {
        if (enteredCode.length != 6) {
            alert("Room code must be 6 characters");
            return
        }
        gameState.joinRoom(enteredCode);
    }
</script>

<div class="join-container">
    <h2>Join Game</h2>
    <label>
        Room Code:
        <input 
            type="text" 
            bind:value={enteredCode} 
            maxlength="6" 
            placeholder="Enter 6-digit code"
        />
    </label>
    <button on:click={joinRoom}>
        Join Room
    </button>

    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>