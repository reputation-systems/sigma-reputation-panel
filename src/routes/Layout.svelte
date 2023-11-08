<!-- Layout.svelte -->
<script>
    import Navbar from './Navbar.svelte';
  
    export let content;
</script>

<div>
    <Navbar /> 
    <main>
        {content} 
    </main>
</div>
  