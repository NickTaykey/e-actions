<script lang="ts">
 import {
  setCurrentItem,
  currentItem,
  updateItem,
  addItem,
 } from '../../helpers/items.store';
 import { Button, Label, Input, Alert } from 'sveltestrap';
 import { validateFormFields } from '../../helpers/index';
 import { deleteObject, ref } from 'firebase/storage';
 import { db, storage } from '../../helpers/firebase';
 import { doc, updateDoc } from 'firebase/firestore';
 import { FormTypes } from '../../helpers/types';
 import { goto } from '$app/navigation';

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
    const newItem = await addItem(fields, files.item(0))!;
    categories = [''];
    description = '';
    minPrice = 10;
    name = '';
    setCurrentItem(newItem);
    goto(`/items/${newItem.id}`);
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
  return (e: KeyboardEvent) => {
   if (
    e.code !== 'Backspace' ||
    categories.length === 1 ||
    categories[index].length
   ) {
    return;
   }
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
 <Label class="w-100">
  Name of the item:
  <Input bind:value={name} />
 </Label>

 {#if invalidFieldsIndexes.includes(0)}
  <Alert color="danger">Please, provide a valid name for the item</Alert>
 {/if}

 <Label class="w-100">
  Description:
  <Input
   bind:value={description}
   type="textarea"
   class="w-100"
   cols={30}
   rows={1}
  />
 </Label>

 {#if invalidFieldsIndexes.includes(1)}
  <Alert color="danger">Please, provide a valid description for the item</Alert>
 {/if}

 <Label class="w-100">
  min price:
  <Input type="number" bind:value={minPrice} min={1} />
 </Label>

 {#if invalidFieldsIndexes.includes(2)}
  <Alert color="danger">
   Please, provide a valid minimum price for the item
  </Alert>
 {/if}

 <Label class="w-100">
  Optional Image:
  <Input type="file" bind:files />
 </Label>

 {#if type === FormTypes.EDIT && $currentItem?.image}
  <Button color="danger" on:click={handleDeleteImage}>Delete Image</Button>
 {/if}

 {#each categories as category, index}
  <Label class="w-100">
   Category {index + 1}
   <Input
    on:keydown={handleRemoveCategoryFactory(index)}
    bind:value={category}
   />
  </Label>
  {#if invalidCategoriesIndexes.includes(index)}
   <Alert color="danger">Please, provide this category or remove it</Alert>
  {/if}
 {/each}

 <Button color="success" type="button" on:click={handleAddCategory}>
  Add Category
 </Button>

 <Button color="primary" type="submit">
  {type === FormTypes.NEW ? 'Publish' : 'Update'}
 </Button>
</form>
