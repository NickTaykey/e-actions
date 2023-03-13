<script lang="ts">
 import AuthPanel from '../components/AuthPanel.svelte';
 import ItemsView from '../components/ItemsView.svelte';
 import ItemForm from '../components/ItemForm.svelte';
 import { loadItems } from '../helpers/items.store';
 import { onMount } from 'svelte';
 import { ItemFormTypes } from '../helpers/types';

 onMount(() => {
  loadItems();
 });
</script>

<h1>Home Page</h1>
<ItemForm type={ItemFormTypes.NEW} />
<hr />
<AuthPanel />
<ItemsView />
