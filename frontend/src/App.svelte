<script>
    import { Router, Link, Route } from "svelte-routing";

    import Host from './components/Host.svelte';
    import Join from './components/Join.svelte';
    import Game from './components/Game.svelte';

    let url = "";
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
</Router>