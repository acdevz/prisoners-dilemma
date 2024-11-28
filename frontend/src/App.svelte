<script>
    import { Router, Link, Route } from "svelte-routing";
    import { gameState } from './store.js';
    import Host from './components/Host.svelte';
    import Join from './components/Join.svelte';
    import Game from './components/Game.svelte';
    
    export let url = "";
    let error = null;
    let retryState = null;
    gameState.subscribe(state => {
        if(state.status === 'connected'){
            clearInterval(retryState);
            error = null;
        }
        if(state.status === 'disconnected'){
            let count = 3;
            clearInterval(retryState);
            retryState = setInterval(() => {
                error = count <= 0 ? `disconnected.` :  `disconnected. Trying in ${count--}s...`
            }, 1000)
            return
        }
    });
</script>

<Router {url}>
    <nav>
        <Link to="/">Home</Link>
        <Link to="/host">Host</Link>
        <Link to="/join">Join</Link>
    </nav>

    <main>
        <Route path="/host" component={Host} />
        <Route path="/join" component={Join} />
        <Route path="/game" component={Game} />
    </main>
    {#if error}
        <p class='error'>{error}</p>
    {/if}
</Router>