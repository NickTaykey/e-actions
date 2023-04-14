<script lang="ts">
 import { currentItem, setCurrentItem } from '../../helpers/items.store';
 import { deleteQuestion } from '../../helpers/questions.store';
 import QuestionForm from './QuestionForm.svelte';
 import { FormTypes } from '../../helpers/types';
 import { currentUser } from '../../helpers';
 import { Button } from 'sveltestrap';

 import type { Question } from '../../helpers/types';

 export let question: Question;

 const handleExpandTextClick = () => (showExpandedText = showExpandedText);
 let showEditQuestionForm = false;
 let showExpandedText = false;

 const toggleEditQuestionForm = () => {
  showEditQuestionForm = !showEditQuestionForm;
 };

 const handleDeleteQuestion = async () => {
  if ($currentItem === null || question === null) return;
  const updatedItem = await deleteQuestion(question.id, $currentItem!);
  setCurrentItem(updatedItem);
 };

 const isItemCreatorUser = $currentItem?.userId === $currentUser?.uid;
 const doesUserOwnsQuestion = $currentUser?.uid === question?.userId;
</script>

<article class="my-4">
 {#if question.text.length > 50}
  <p>{question.text.substring(0, 50)} ...</p>
  <button on:click={handleExpandTextClick}>Expand Text</button>
 {:else}
  <p>{question.text}</p>
 {/if}
 {#if question.answer !== null}
  <p>{question.answer}</p>
 {/if}
 {#if isItemCreatorUser || doesUserOwnsQuestion}
  <Button color="warning" class="mb-2 w-100" on:click={toggleEditQuestionForm}>
   {#if showEditQuestionForm}
    Close
   {:else if doesUserOwnsQuestion}
    Edit
   {:else}
    Answer
   {/if}
  </Button>
  {#if showEditQuestionForm}
   <QuestionForm
    type={FormTypes.EDIT}
    {question}
    {isItemCreatorUser}
    {doesUserOwnsQuestion}
   />
  {/if}
 {/if}
 {#if doesUserOwnsQuestion}
  <Button color="danger" class="w-100" on:click={handleDeleteQuestion}>
   Delete
  </Button>
 {/if}
</article>
