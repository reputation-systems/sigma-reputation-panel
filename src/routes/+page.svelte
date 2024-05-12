<script lang="ts">
    import App from "./App.svelte";
    import Main from "./Main.svelte";

    let show_app: boolean = false;

</script>
{#if show_app}
<App bind:show_app={show_app}/>
{:else}
<Main bind:show_app={show_app}/>
{/if}