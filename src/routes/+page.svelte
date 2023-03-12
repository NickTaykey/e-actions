<script lang="ts">
 import NewItemForm from '../components/NewItemForm.svelte';
 import AuthPanel from '../components/AuthPanel.svelte';
 import ItemsView from '../components/ItemsView.svelte';
 import { loadItems } from '../helpers/items.store';
 import { onMount } from 'svelte';

 onMount(() => {
  loadItems();
 });
</script>

<h1>Home Page</h1>
<NewItemForm />
<hr />
<AuthPanel />
<ItemsView />
