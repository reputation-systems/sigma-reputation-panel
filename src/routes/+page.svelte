<script lang="ts">
    import App from "./App.svelte";
    import Main from "./Main.svelte";

    let show_app: boolean = true;
    let search: string|null = null;

</script>
{#if show_app}
<App bind:show_app={show_app} search={search}/>
{:else}
<Main bind:show_app={show_app} search={search}/>
{/if}