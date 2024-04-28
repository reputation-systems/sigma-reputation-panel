<script lang="ts">
    export let showModal: any; // boolean
    let dialog: any; // HTMLDialogElement
  
    let setting1 = "";  
    let setting2 = "";  
    let setting3 = "";  
  
    function handleSetting1Change(event: any) {
      setting1 = event.target.value;
    }
  
    function handleSetting2Change(event: any) {
      setting2 = event.target.value;
    }
  
    function handleSetting3Change(event: any) {
      setting3 = event.target.value;
    }
  
    $: if (dialog && showModal) dialog.showModal();
  
  </script>
  
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog bind:this={dialog} on:close={() => (showModal = false)} on:click|self={() => dialog.close()}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
      <h2 class="modal-title" id="settingsLabel">Panel de Ajustes</h2>
      <hr />
      <form id="settingsForm">
        <label for="setting1">Ajuste 1:</label>
        <input type="text" id="setting1" name="setting1" bind:value={setting1} on:change={handleSetting1Change}>
  
        <label for="setting2">Ajuste 2:</label>
        <input type="text" id="setting2" name="setting2" bind:value={setting2} on:change={handleSetting2Change}>
  
        <label for="setting3">Ajuste 3:</label>
        <input type="text" id="setting3" name="setting3" bind:value={setting3} on:change={handleSetting3Change}>
  
        <input type="submit" value="Guardar">
      </form>
    </div>
  </dialog>
  