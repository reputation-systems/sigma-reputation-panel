<script lang="ts">
    import { show_app } from "$lib/store";
    import App from "./App.svelte";
    import Main from "./Main.svelte";

</script>
{#if $show_app}
    <App />
{:else}
    <Main />
{/if}