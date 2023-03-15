<script lang="ts">
 import { addItem, selectedItem, updateItem } from '../helpers/items.store';
 import { ItemFormTypes } from '../helpers/types';
 import { validateFormFields } from '../helpers';

 export let type: ItemFormTypes;

 let categories: string[] = [''];
 let description = '';
 let minPrice = 10;
 let name = '';

 if (type === ItemFormTypes.EDIT && $selectedItem !== null) {
  description = $selectedItem.description;
  categories = $selectedItem.categories;
  minPrice = $selectedItem.minPrice;
  name = $selectedItem.name;
 }

 let showErrorAlert = false;

 let invalidCategoriesIndexes: number[] = [];
 let invalidFieldsIndexes: number[] = [];

 const handleFormSubmit = async () => {
  const fields = { categories, description, name, minPrice };
  const validationData = validateFormFields(fields);

  invalidCategoriesIndexes = validationData.invalidCategoriesIndexes;
  invalidFieldsIndexes = validationData.invalidFieldsIndexes;

  if (!validationData.areFieldsValid) return;

  try {
   if (type === ItemFormTypes.NEW) {
    await addItem(fields);
    window.alert('Item successfully posted!');
   } else if ($selectedItem) {
    await updateItem($selectedItem.id, {
     description,
     categories,
     minPrice,
     name,
    });
   }
  } catch (e) {
   showErrorAlert = true;
  }
 };

 const handleAddCategory = () => (categories = [...categories, '']);

 const handleRemoveCategoryFactory = (index: number) => {
  return () => {
   if (categories.length === 1) return;
   categories = categories.filter((_, idx) => idx !== index);
  };
 };
</script>

{#if showErrorAlert}
 <div>Unexpected Error while saving the Item</div>
{/if}

<form on:submit|preventDefault={handleFormSubmit} novalidate>
 <div>
  <label>
   Name of the item:
   <input type="text" bind:value={name} />
  </label>
  {#if invalidFieldsIndexes.includes(0)}
   <div class="validation-error">Please, provide a valid name for the item</div>
  {/if}
 </div>
 <div>
  <label>
   Description:
   <textarea bind:value={description} cols="30" rows="10" />
  </label>
  {#if invalidFieldsIndexes.includes(1)}
   <div class="validation-error">
    Please, provide a valid description for the item
   </div>
  {/if}
 </div>
 <div>
  <label>
   min price:
   <input type="number" bind:value={minPrice} min={1} />
  </label>
  {#if invalidFieldsIndexes.includes(2)}
   <div class="validation-error">
    Please, provide a valid minimum price for the item
   </div>
  {/if}
 </div>
 <div>
  {#each categories as category, index}
   <label>
    Category {index + 1}:
    <input type="text" bind:value={category} />
   </label>
   {#if index > 0}
    <button type="button" on:click={handleRemoveCategoryFactory(index)}>
     Remove
    </button>
   {/if}
   {#if invalidCategoriesIndexes.includes(index)}
    <div class="validation-error">
     Please, provide this category or remove it
    </div>
   {/if}
  {/each}
  <button type="button" on:click={handleAddCategory}>Add Category</button>
 </div>
 <button type="submit">
  {type === ItemFormTypes.NEW ? 'Publish' : 'Update'}
 </button>
</form>

<style>
 .validation-error {
  color: red;
 }
</style>
