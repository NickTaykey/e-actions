<script lang="ts">
 import { selectedItem, updateItem } from '../helpers/items.store';

 let { id, name, description, categories, minPrice } = $selectedItem!;

 let showErrorAlert = false;
 const handleFormSubmit = async (e: SubmitEvent) => {
  try {
   await updateItem(id, { name, description, categories, minPrice });
  } catch (e) {
   showErrorAlert = true;
  }
 };
 const handleAddCategory = () => (categories = [...categories, '']);
</script>

{#if showErrorAlert}
 <div>Unexpected Error while saving the Item</div>
{/if}

<form on:submit|preventDefault={handleFormSubmit}>
 <div>
  <label>
   Name of the item:
   <input type="text" bind:value={name} />
  </label>
 </div>

 <div>
  <label>
   Description:
   <textarea bind:value={description} cols="30" rows="10" />
  </label>
 </div>
 <div>
  <label>
   min price:
   <input type="number" bind:value={minPrice} />
  </label>
 </div>
 <div>
  {#each categories as category, index}
   <label>
    Category {index}:
    <input type="text" bind:value={category} />
   </label>
  {/each}
  <button type="button" on:click={handleAddCategory}>Add Category</button>
  <button type="button">Add Category</button>
 </div>
 <button type="submit">Update Item</button>
</form>
