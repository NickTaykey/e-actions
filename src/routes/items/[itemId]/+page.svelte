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
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import ItemView from '../../../components/ItemView.svelte';
 import { Alert } from 'sveltestrap';
 import { onMount } from 'svelte';

 import type { Item } from '../../../helpers/types';
 import Navbar from '../../../components/Navbar.svelte';

 let errorAlertMessage = '';

 onAuthStateChanged(getAuth(), (user) => {
  if (user !== null) signInUser(user);
  else signOutUser();
 });

 onMount(async () => {
  try {
   const itemId = window.location.pathname.split('/').at(-1)!;

   if ($currentItem === null || $items.size === 0) {
    const item = await loadCurrentItem(itemId);
    setCurrentItem({ ...item, offers: item.offers || [] });
   } else if ($items.has($currentItem.id)) {
    setCurrentItem($items.get(itemId) as Item);
   }

   loadItemOffers($currentItem!);
   loadItemQuestions($currentItem!);
  } catch (e) {
   console.error(e);
   errorAlertMessage =
    'Unexpected server side error, we are unable to display the item.';
  }
 });
</script>

<Navbar />

{#if errorAlertMessage.length}
 <Alert color="danger">{errorAlertMessage}</Alert>
{/if}

{#if $currentItem && !errorAlertMessage.length}
 <ItemView />
{/if}
