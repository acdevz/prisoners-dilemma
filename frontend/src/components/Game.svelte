<script>
    import { gameState } from '../store.js';

    let gameStat = null;
    let roomCode = "";
    let player = "";
    let played = false;

    gameState.subscribe(state => {
        gameStat = state;
        player = state.player;
        roomCode = state.roomCode;
        if(gameStat.status === 'round-complete'){
            played = false;
        }
        console.table(state);
    });

    function makeChoice(choice) {
        played = true;
        gameState.submitChoice(roomCode, player, choice);
    }

    function renderGameState() {
        switch (gameStat.status) {
            case 'game-ready':
                return "Game is ready. Make your choice!";
            case 'round-complete':
                return `Last round result: Host scored ${gameStat.hostPoints}, Joiner scored ${gameStat.joinerPoints}`;
            case 'game-over':
                return `Game Over! Winner: ${gameStat.winner}`;
            default:
                return "Waiting for game to start...";
        }
    }
</script>

<div class="game-container">
    <h2>Prisoner's Dilemma</h2>
    
    <p>{renderGameState()}</p>
    {#if gameStat.status === 'round-complete' || gameStat.status === 'game-over'}
        <div class="game-stats">
            <p>Current Scores:</p>
            <p>Host: {gameStat.scores?.host || 0}</p>
            <p>Joiner: {gameStat.scores?.joiner || 0}</p>
            
            {#if gameStat.status === 'game-over'}
                <h3>Final Winner: {gameStat.winner}</h3>
            {/if}
        </div>
    {/if}
    <div class="choices">
        <div class="player-choices">
            <h3>Your Choices</h3>
            <button 
                on:click={() => makeChoice('c')} 
                disabled={played}
            >
                Collaborate (C)
            </button>
            <button 
                on:click={() => makeChoice('r')} 
                disabled={played}
            >
                Retaliate (R)
            </button>
        </div>
    </div>
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