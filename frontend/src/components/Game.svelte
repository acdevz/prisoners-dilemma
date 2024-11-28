<script>
    import { gameState } from '../store.js';
    import { navigate } from "svelte-routing";

    let roomCode = null;
    let currState = gameState;
    let currPlayer = null;
    let disableChoice = false;
    let error = null;

    gameState.subscribe(state => {
        if(state.status === 'disconnected'){
            navigate('/');
            return
        }
        if(state.status === 'error'){
            error = state.error;
        }
        currState = state;
        currPlayer = state.player;
        roomCode = state.roomCode;
        if(state.status === 'game-ready' || state.status === 'round-complete'){
            disableChoice = false;
        }
    });

    function makeChoice(choice) {
        disableChoice = true;
        gameState.submitChoice(roomCode, currPlayer, choice);
    }

    function rendercurrState() {
        switch (currState.status) {
            case 'round-complete':
                return `Last round result: Host scored ${currState.hostPoints}, Joiner scored ${currState.joinerPoints}`;
            case 'game-over':
                return `Game Over! Winner: ${currState.winner}`;
            default:
                return "Make your move!";
        }
    }
</script>

<div class="game-container">
    <h2>Prisoner's Dilemma</h2>
    
    {#if !error}
        <p>{rendercurrState()}</p>
        {#if currState.status === 'round-complete' || currState.status === 'game-over'}
            <div class="game-stats">
                <p>Current Scores:</p>
                <p>You: {currPlayer === 'host' ? currState.scores?.host : currState.scores?.joiner}</p>
                <p>Other: {currPlayer === 'host' ? currState.scores?.joiner : currState.scores?.host}</p>
                
                {#if currState.status === 'game-over'}
                    <h3>{currState.winner === 'breakeven' ? `it's a breakeven.` : currState.winner === currPlayer ? `Winner.` : `Loser.`}</h3>
                {/if}
            </div>
        {/if}
        {#if currState.status != 'game-over'}
        <div class="choices">
            <div class="player-choices">
                <h3>Your Choices</h3>
                <button 
                    on:click={() => makeChoice('c')} 
                    disabled={disableChoice}
                >
                    Collaborate (C)
                </button>
                <button 
                    on:click={() => makeChoice('r')} 
                    disabled={disableChoice}
                >
                    Retaliate (R)
                </button>
            </div>
        </div>
        {/if}
    {:else}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .game-container {
        max-width: 400px;
        margin: 0 auto;
        text-align: center;
    }
    .choices {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
    }
    button {
        padding: 10px;
        margin: 5px;
    }
    button:disabled{
        cursor: not-allowed;
        opacity: 0.5;
    }
</style>