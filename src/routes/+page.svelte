<script lang="ts">
 import { loadItems, items, showSearchResults } from '../helpers/items.store';
 import { currentUser, signInUser, signOutUser } from '../helpers/index';
 import HottestItemsView from '../components/HottestItemsView.svelte';
 import LatestItemsView from '../components/LatestItemsView.svelte';
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import SearchView from '../components/SearchView.svelte';
 import AuthPanel from '../components/AuthPanel.svelte';
 import ItemForm from '../components/ItemForm.svelte';
 import { FormTypes } from '../helpers/types';
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
  $showSearchResults = false;
  if ($items.size === 0) loadItems();
 });
</script>

<h1>E-Actions</h1>

<SearchView />

<hr />

{#if $currentUser !== null}
 <p>Welcome, {$currentUser.email}!</p>
 <button on:click={() => auth.signOut()}>Sign Out</button>
 <ItemForm type={FormTypes.NEW} />
{:else}
 <AuthPanel />
{/if}

{#if !$showSearchResults}
 <HottestItemsView />
 <LatestItemsView />
{/if}
