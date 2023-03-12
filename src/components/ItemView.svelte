<script lang="ts">
 import { deleteItem, selectedItem } from '../helpers/items.store';
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import EditItemForm from './EditItemForm.svelte';
 import { goto } from '$app/navigation';

 import type { User } from 'firebase/auth';

 let currentUser: User | null;
 let showEditItemForm = false;
 let errorAlertMessage = '';

 onAuthStateChanged(getAuth(), (user) => {
  currentUser = user;
 });

 const handleDeleteItem = async () => {
  try {
   await deleteItem($selectedItem!.id);
   goto('/', { replaceState: true });
  } catch (e) {
   errorAlertMessage =
    'Unexpected server side error, we are unable to delete the item.';
  }
 };

 const toggleEditItemForm = () => (showEditItemForm = !showEditItemForm);
</script>

{#if errorAlertMessage.length}
 <div>{errorAlertMessage}</div>
{/if}

{#if $selectedItem}
 <h1>Item {$selectedItem.name}</h1>
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
 <EditItemForm />
{/if}
