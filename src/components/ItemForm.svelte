<script lang="ts">
 import {
  setCurrentItem,
  currentItem,
  updateItem,
  addItem,
 } from '../helpers/items.store';
 import { validateFormFields } from '../helpers/index';
 import { FormTypes } from '../helpers/types';
 import { db, storage } from '../helpers/firebase';
 import { deleteObject, ref } from 'firebase/storage';
 import { doc, updateDoc } from 'firebase/firestore';

 export let type: FormTypes;

 let categories: string[] = [''];
 let description = '';
 let minPrice = 10;
 let name = '';
 let files: FileList;

 if (type === FormTypes.EDIT && $currentItem !== null) {
  description = $currentItem.description;
  categories = $currentItem.categories;
  minPrice = $currentItem.minPrice;
  name = $currentItem.name;
 }

 let showErrorAlert = false;

 let invalidCategoriesIndexes: number[] = [];
 let invalidFieldsIndexes: number[] = [];

 const handleFormSubmit = async (e: SubmitEvent) => {
  const fields = { categories, description, name, minPrice };
  const validationData = validateFormFields(fields);

  invalidCategoriesIndexes = validationData.invalidCategoriesIndexes;
  invalidFieldsIndexes = validationData.invalidFieldsIndexes;

  if (!validationData.areFieldsValid) return;

  try {
   if (type === FormTypes.NEW) {
    await addItem(fields, files.item(0));
    categories = [''];
    description = '';
    minPrice = 10;
    name = '';
    window.alert('Item successfully posted!');
   } else if (currentItem) {
    const updatedItem = await updateItem(
     {
      description,
      categories,
      minPrice,
      name,
     },
     $currentItem!,
     files.item(0)
    );
    setCurrentItem(updatedItem);
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

 const handleDeleteImage = async () => {
  if ($currentItem === null || $currentItem.image === null) return;
  await Promise.all([
   updateDoc(doc(db, 'items', $currentItem.id), { image: null }),
   deleteObject(ref(storage, $currentItem.image.id)),
   setCurrentItem({
    ...$currentItem,
    image: null,
   }),
  ]);
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
   <div class="error">Please, provide a valid name for the item</div>
  {/if}
 </div>
 <div>
  <label>
   Description:
   <textarea bind:value={description} cols="30" rows="10" />
  </label>
  {#if invalidFieldsIndexes.includes(1)}
   <div class="error">Please, provide a valid description for the item</div>
  {/if}
 </div>
 <div>
  <label>
   min price:
   <input type="number" bind:value={minPrice} min={1} />
  </label>
  {#if invalidFieldsIndexes.includes(2)}
   <div class="error">Please, provide a valid minimum price for the item</div>
  {/if}
 </div>
 <div>
  <label>
   Optional Image:
   <input bind:files type="file" name="image-input" />
  </label>
  {#if type === FormTypes.EDIT && $currentItem?.image}
   <button on:click={handleDeleteImage}>Delete Image</button>
  {/if}
 </div>
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
   <div class="error">Please, provide this category or remove it</div>
  {/if}
 {/each}
 <button type="button" on:click={handleAddCategory}>Add Category</button>
 <button type="submit">
  {type === FormTypes.NEW ? 'Publish' : 'Update'}
 </button>
</form>
