<script lang="ts">
 import { currentItem, deleteItem } from '../../helpers/items.store';
 import QuestionForm from '../Question/QuestionForm.svelte';
 import QuestionView from '../Question/QuestionView.svelte';
 import { questions } from '../../helpers/questions.store';
 import OffersView from '../Offer/OffersView.svelte';
 import { Container, Button } from 'sveltestrap';
 import { FormTypes } from '../../helpers/types';
 import { currentUser } from '../../helpers';
 import ItemForm from './ItemForm.svelte';
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
 <Container class="mt-4">
  <div class="row">
   <div class="col-12 col-lg-6">
    <h1>{$currentItem.name}</h1>
    <div>Views: {$currentItem.views}</div>
    <h4 class="my-3">Min. Offer: ${$currentItem.minPrice}</h4>
    <p>{$currentItem.description}</p>
    <div class="my-3">
     {#each $currentItem.categories as category}
      <span
       class="badge text-bg-secondary d-inline-block"
       style="margin-right: 2px;"
      >
       {category}
      </span>
     {/each}
    </div>

    {#if $currentItem.image}
     <img
      src={$currentItem.image.url}
      alt={$currentItem.name}
      style="width: 200px"
      class="my-4"
     />
    {/if}

    {#if $currentUser && $currentItem.userId === $currentUser.uid}
     <div class="mb-3">
      <Button color="warning" on:click={toggleEditItemForm}>
       {showEditItemForm ? 'Close' : 'Edit'}
      </Button>
      <Button color="danger" on:click={handleDeleteItem}>Delete</Button>
     </div>
     {#if showEditItemForm}
      <ItemForm type={FormTypes.EDIT} />
     {/if}
    {/if}
   </div>

   <div class="col-12 col-lg-6 mb-3">
    <h3>Have a question?</h3>
    {#if $currentUser !== null}
     <QuestionForm type={FormTypes.NEW} />
    {/if}

    {#each $questions as question}
     <QuestionView {question} />
    {/each}
   </div>
  </div>

  <div class="row">
   <div class="col-12">
    <OffersView />
   </div>
  </div>
 </Container>
{/if}
