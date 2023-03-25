<script lang="ts">
 import {
  loadCurrentItem,
  selectedItem,
  deleteItem,
 } from '../helpers/items.store';
 import { loadItemQuestions, questions } from '../helpers/questions.store';
 import QuestionView from './QuestionView.svelte';
 import QuestionForm from './QuestionForm.svelte';
 import { FormTypes } from '../helpers/types';
 import ItemForm from './ItemForm.svelte';
 import { currentUser } from '../helpers';
 import { goto } from '$app/navigation';
 import { onMount } from 'svelte';

 let showEditItemForm = false;
 let errorAlertMessage = '';

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
   await loadCurrentItem();
   loadItemQuestions();
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
 {#if $currentUser && $selectedItem.userId === $currentUser.uid}
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
