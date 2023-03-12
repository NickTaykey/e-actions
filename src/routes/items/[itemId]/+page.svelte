<script lang="ts">
 import { items, loadItems, selectedItem } from '../../../helpers/items.store';
 import ItemView from '../../../components/ItemView.svelte';
 import { onMount } from 'svelte';

 import type { PageData } from './$types';

 export let data: PageData;

 onMount(async () => {
  if ($items.size === 0) await loadItems();
  $selectedItem = $items.get(data.props.itemId!)!;
 });
</script>

<ItemView />
