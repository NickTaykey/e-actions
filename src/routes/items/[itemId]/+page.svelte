<script lang="ts">
 import {
  loadCurrentItem,
  setCurrentItem,
  currentItem,
  items,
 } from '../../../helpers/items.store';
 import { loadItemQuestions } from '../../../helpers/questions.store';
 import { signOutUser, signInUser } from '../../../helpers/index';
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import ItemView from '../../../components/ItemView.svelte';
 import { onMount } from 'svelte';

 let errorAlertMessage = '';

 onAuthStateChanged(getAuth(), (user) => {
  if (user !== null) signInUser(user);
  else signOutUser();
 });

 onMount(async () => {
  try {
   const itemId = window.location.pathname.split('/').at(-1)!;

   if ($currentItem === null || $items.size === 0) {
    setCurrentItem(await loadCurrentItem(itemId));
   }

   loadItemQuestions($currentItem!);
  } catch (e) {
   console.error(e);
   errorAlertMessage =
    'Unexpected server side error, we are unable to display the item.';
  }
 });
</script>

{#if errorAlertMessage.length}
 <div>{errorAlertMessage}</div>
{/if}

{#if $currentItem && !errorAlertMessage.length}
 <ItemView />
{/if}
