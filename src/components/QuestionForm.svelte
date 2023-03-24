<script lang="ts">
 import { addQuestion, updateQuestion } from '../helpers/questions.store';
 import { selectedItem } from '../helpers/items.store';
 import { FormTypes } from '../helpers/types';
 import { currentUser } from '../helpers';

 import type { Question } from '../helpers/types';

 export let type: FormTypes = FormTypes.NEW;
 export let question: Question | null = null;

 let text = question !== null ? question.text : '';
 let showValidationErrorAlert = false;
 let showErrorAlert = false;

 const handleFormSubmit = async () => {
  try {
   if ($selectedItem === null || $currentUser === null) return;
   if (text.length === 0) {
    showValidationErrorAlert = true;
    return;
   }
   if (type === FormTypes.NEW) {
    await addQuestion($selectedItem.id, text, $currentUser.uid);
    text = '';
   }
   if (type === FormTypes.EDIT && question !== null) {
    await updateQuestion(question.id, text);
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
 <label>
  Text:
  <textarea bind:value={text} cols="30" rows="10" />
  {#if showValidationErrorAlert}
   <div class="validation-error">Please, provide a valid text for the item</div>
  {/if}
 </label>
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
