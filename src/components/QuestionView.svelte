<script lang="ts">
 import QuestionForm from './QuestionForm.svelte';
 import { FormTypes } from '../helpers/types';

 import type { Question } from '../helpers/types';
 import { deleteQuestion } from '../helpers/questions.store';
 import { selectedItem } from '../helpers/items.store';

 export let question: Question;

 const handleExpandTextClick = () => (showExpandedText = showExpandedText);
 let showEditQuestionForm = false;
 let showExpandedText = false;

 const toggleEditQuestionForm = () => {
  showEditQuestionForm = !showEditQuestionForm;
 };

 const handleDeleteQuestion = () => {
  if ($selectedItem === null || question === null) return;
  deleteQuestion($selectedItem.id, question.id);
 };
</script>

<article>
 {#if question.text.length > 50}
  <p>{question.text.substring(0, 50)} ...</p>
  <button on:click={handleExpandTextClick}>Expand Text</button>
 {:else}
  <p>{question.text}</p>
 {/if}
 <button on:click={toggleEditQuestionForm}>
  {#if showEditQuestionForm}
   Close
  {:else}
   Edit
  {/if}
 </button>
 {#if showEditQuestionForm}
  <QuestionForm type={FormTypes.EDIT} {question} />
 {/if}
 <button on:click={handleDeleteQuestion}>Delete</button>
</article>
