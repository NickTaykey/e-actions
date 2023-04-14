<script lang="ts">
 import { addQuestion, updateQuestion } from '../../helpers/questions.store';
 import { currentItem } from '../../helpers/items.store';
 import { Input, Label, Button } from 'sveltestrap';
 import { FormTypes } from '../../helpers/types';
 import { currentUser } from '../../helpers';

 import type { Question } from '../../helpers/types';

 export let question: Question | null = null;
 export let type: FormTypes = FormTypes.NEW;
 export let doesUserOwnsQuestion = false;
 export let isItemCreatorUser = false;

 let answer = question !== null ? question.answer : '';
 let text = question !== null ? question.text : '';
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
 <div class="error">Unexpected Error while creating the Question</div>
{/if}

<form action="#" on:submit|preventDefault={handleFormSubmit} class="w-100">
 {#if doesUserOwnsQuestion || type === FormTypes.NEW}
  <Label class="w-100 mt-2">
   Text:
   <Input type="textarea" bind:value={text} cols={30} rows={1} class="w-100" />
   {#if showValidationErrorAlert}
    <div class="error">Please, provide a valid text for the question</div>
   {/if}
  </Label>
 {/if}

 <div>
  {#if isItemCreatorUser}
   <Label class="w-100 mt-2">
    Answer:
    <Input
     class="w-100"
     type="textarea"
     bind:value={answer}
     cols={30}
     rows={1}
    />
   </Label>
  {/if}
 </div>

 <Button type="submit" color="primary" class="w-100 mb-2">
  {#if type === FormTypes.NEW}
   Post
  {:else}
   Update
  {/if}
 </Button>
</form>
