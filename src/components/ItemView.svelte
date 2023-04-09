<script lang="ts">
 import { currentItem, deleteItem } from '../helpers/items.store';
 import { questions } from '../helpers/questions.store';
 import QuestionForm from './QuestionForm.svelte';
 import QuestionView from './QuestionView.svelte';
 import { FormTypes } from '../helpers/types';
 import OffersView from './OffersView.svelte';
 import ItemForm from './ItemForm.svelte';
 import { currentUser } from '../helpers';
 import { goto } from '$app/navigation';
 import { get } from 'svelte/store';

 let showEditItemForm = false;
 let errorAlertMessage = '';

 const handleDeleteItem = async () => {
  try {
   if (currentItem === null) return;
   await deleteItem(get(currentItem)!);
   goto('/', { replaceState: true });
  } catch (e) {
   errorAlertMessage =
    'Unexpected server side error, we are unable to delete the item.';
  }
 };

 const toggleEditItemForm = () => (showEditItemForm = !showEditItemForm);
</script>

{#if $currentItem}
 <h1>Item {$currentItem.name}</h1>
 <div>Views: {$currentItem.views}</div>
 <h2>Min. Offer: ${$currentItem.minPrice}</h2>
 <p>{$currentItem.description}</p>
 <div>{$currentItem.categories.join(', ')}</div>

 {#if $currentItem.image}
  <img src={$currentItem.image.url} alt={$currentItem.name} />
 {/if}

 {#if $currentUser && $currentItem.userId === $currentUser.uid}
  <button on:click={toggleEditItemForm}>
   {showEditItemForm ? 'Close' : 'Edit'}
  </button>
  <button on:click={handleDeleteItem}>Delete</button>
  {#if showEditItemForm}
   <ItemForm type={FormTypes.EDIT} />
  {/if}
 {/if}

 {#if $currentUser !== null}
  <QuestionForm type={FormTypes.NEW} />
 {/if}

 {#each $questions as question}
  <QuestionView {question} />
 {/each}
{/if}

<OffersView />
