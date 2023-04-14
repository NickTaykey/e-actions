<script lang="ts">
 import {
  loadCurrentItem,
  setCurrentItem,
  loadItemOffers,
  currentItem,
  items,
 } from '../../../helpers/items.store';
 import { loadItemQuestions } from '../../../helpers/questions.store';
 import { signOutUser, signInUser } from '../../../helpers/index';
 import ItemView from '../../../components/Item/ItemView.svelte';
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import Navbar from '../../../components/Navbar.svelte';
 import { Alert } from 'sveltestrap';
 import { onMount } from 'svelte';

 import type { Item } from '../../../helpers/types';
 import LoadingScreen from '../../../components/LoadingScreen.svelte';

 let errorAlertMessage = '';

 onAuthStateChanged(getAuth(), (user) => {
  if (user !== null) signInUser(user);
  else signOutUser();
 });

 onMount(async () => {
  try {
   const itemId = window.location.pathname.split('/').at(-1)!;

   if ($currentItem && $items.has($currentItem.id)) {
    setCurrentItem($items.get(itemId) as Item);
   }

   if ($currentItem === null || $items.size === 0) {
    const item = await loadCurrentItem(itemId);
    if (item) setCurrentItem({ ...item, offers: item.offers || [] });
    else errorAlertMessage = '404 Item not found';
   }

   if ($currentItem) {
    loadItemQuestions($currentItem);
    loadItemOffers($currentItem);
   }
  } catch (e) {
   console.error(e);
   errorAlertMessage =
    'Unexpected server side error, we are unable to display the item.';
  }
 });
</script>

<Navbar />

{#if errorAlertMessage.length}
 <Alert color="danger" class="text-center mt-5 mx-auto w-75">
  {errorAlertMessage}
 </Alert>
{/if}

{#if !errorAlertMessage.length}
 {#if $currentItem}
  <ItemView />
 {:else}
  <LoadingScreen />
 {/if}
{/if}
