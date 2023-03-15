<script lang="ts">
 import { doc, getDoc, increment, updateDoc } from 'firebase/firestore';
 import { deleteItem, selectedItem } from '../helpers/items.store';
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import { ItemFormTypes } from '../helpers/types';
 import ItemForm from './ItemForm.svelte';
 import { db } from '../helpers/firebase';
 import { goto } from '$app/navigation';
 import { onMount } from 'svelte';

 import type { Item } from '../helpers/types';
 import type { User } from 'firebase/auth';

 let currentUser: User | null;
 let showEditItemForm = false;
 let errorAlertMessage = '';

 onAuthStateChanged(getAuth(), (user) => {
  currentUser = user;
 });

 const handleDeleteItem = async () => {
  if ($selectedItem === null) return;
  try {
   await deleteItem($selectedItem.id);
   goto('/', { replaceState: true });
  } catch (e) {
   errorAlertMessage =
    'Unexpected server side error, we are unable to delete the item.';
  }
 };

 const toggleEditItemForm = () => (showEditItemForm = !showEditItemForm);

 onMount(async () => {
  try {
   const itemId = window.location.pathname.split('/').at(-1)!;
   const docRef = doc(db, 'items', itemId);

   if ($selectedItem === null) {
    $selectedItem = (await getDoc(docRef)).data() as Item;
   }
   await updateDoc(docRef, { views: increment(1) });
  } catch (e) {
   errorAlertMessage =
    'Unexpected server side error, we are unable to display the item.';
  }
 });
</script>

{#if errorAlertMessage.length}
 <div>{errorAlertMessage}</div>
{/if}

{#if $selectedItem && !errorAlertMessage.length}
 <h1>Item {$selectedItem.name}</h1>
 <div>Views: {$selectedItem.views}</div>
 <h2>Min. Offer: ${$selectedItem.minPrice}</h2>
 <p>{$selectedItem.description}</p>
 <div>{$selectedItem.categories.join(', ')}</div>
 {#if currentUser && $selectedItem.userId === currentUser.uid}
  <button on:click={toggleEditItemForm}>
   {showEditItemForm ? 'Close' : 'Edit'}
  </button>
  <button on:click={handleDeleteItem}>Delete</button>
 {/if}
{/if}

{#if showEditItemForm}
 <ItemForm type={ItemFormTypes.EDIT} />
{/if}
