<script lang="ts">
 import { currentUser, signInUser, signOutUser } from '../helpers/index';
 import PagesController from '../components/PagesController.svelte';
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import { loadItems, items } from '../helpers/items.store';
 import AuthPanel from '../components/AuthPanel.svelte';
 import ItemsView from '../components/ItemsView.svelte';
 import ItemForm from '../components/ItemForm.svelte';
 import { ItemFormTypes } from '../helpers/types';
 // import seedDB from '../helpers/seeds';
 import { onMount } from 'svelte';

 const auth = getAuth();

 onAuthStateChanged(auth, (user) => {
  if (user !== null) {
   signInUser(user);
   // *** ONLY FOR TESTING PORPUSE ***
   // Populate the DB with random auction items
   // seedDB();
  } else signOutUser();
 });

 onMount(() => {
  if ($items.size === 0) loadItems();
 });
</script>

<h1>E-Actions</h1>

{#if $currentUser !== null}
 <p>Welcome, {$currentUser.email}!</p>
 <button on:click={() => auth.signOut()}>Sign Out</button>
 <ItemForm type={ItemFormTypes.NEW} />
{:else}
 <AuthPanel />
{/if}

<h2>Hottest items for sale!</h2>
<ItemsView />

<PagesController />
