<script lang="ts">

    import { writable } from 'svelte/store';
    import Header from './Header.svelte';
    
    let searchQuery = writable('');
</script>
  
<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #1A192B;
    }

    input {
        padding: 15px; /* Aumenté el tamaño del padding */
        border-radius: 5px;
        border: none;
        outline: none;
        background-color: #fff;
        color: #333;
        font-size: 18px; /* Aumenté el tamaño de la fuente */
        width: 400px; /* Aumenté el ancho del campo de búsqueda */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-top: -50px; /* Desplazamiento hacia arriba */
    }
</style>

<Header />
<div class="container">
    
    <input type="text" placeholder="Calculate reputation for ..." bind:value={$searchQuery} />
</div>
