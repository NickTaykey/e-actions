<script lang="ts">
 import { addQuestion, updateQuestion } from '../helpers/questions.store';
 import { currentItem } from '../helpers/items.store';
 import { FormTypes } from '../helpers/types';
 import { currentUser } from '../helpers';

 import type { Question } from '../helpers/types';

 export let question: Question | null = null;
 export let type: FormTypes = FormTypes.NEW;
 export let doesUserOwnsQuestion = false;
 export let isItemCreatorUser = false;

 let text = question !== null ? question.text : '';
 let answer = question !== null ? question.answer : '';
 let showValidationErrorAlert = false;
 let showErrorAlert = false;

 let currentItemObj = $currentItem;

 const handleFormSubmit = async () => {
  try {
   if (currentItemObj === null || $currentUser === null) return;

   if (doesUserOwnsQuestion && text.length === 0) {
    showValidationErrorAlert = true;
    return;
   }

   if (type === FormTypes.NEW) {
    await addQuestion(text, currentItemObj);
    text = '';
   }

   if (type === FormTypes.EDIT && question !== null) {
    await Promise.all([
     doesUserOwnsQuestion &&
      question.text !== text &&
      updateQuestion(question.id, 'text', text),
     isItemCreatorUser && updateQuestion(question.id, 'answer', answer),
    ]);
   }

   showValidationErrorAlert = false;
  } catch (e) {
   showErrorAlert = true;
  }
 };
</script>

{#if showErrorAlert}
 <div>Unexpected Error while creating the Question</div>
{/if}
<form action="#" on:submit|preventDefault={handleFormSubmit}>
 {#if doesUserOwnsQuestion || type === FormTypes.NEW}
  <label>
   Text:
   <textarea bind:value={text} cols="30" rows="10" />
   {#if showValidationErrorAlert}
    <div class="validation-error">
     Please, provide a valid text for the question
    </div>
   {/if}
  </label>
 {/if}
 {#if isItemCreatorUser}
  <label>
   Answer:
   <textarea bind:value={answer} cols="30" rows="10" />
  </label>
 {/if}

 <button type="submit">
  {#if type === FormTypes.NEW}
   Post
  {:else}
   Update
  {/if}
 </button>
</form>

<style>
 .validation-error {
  color: red;
 }
</style>
