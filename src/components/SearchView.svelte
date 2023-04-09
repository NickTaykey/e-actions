<script lang="ts">
 import { searchItem, showSearchResults } from '../helpers/items.store';
 import { Button, FormGroup, Input, Container } from 'sveltestrap';
 import ItemCard from './ItemCard.svelte';

 import type { Item } from '../helpers/types';

 let results: Item[] = [];

 const handleFormSubmit = async () => {
  results = await searchItem(name || null, category || null);
  $showSearchResults = !!results.length;
 };

 const handleSearchReset = () => {
  category = name = '';
  $showSearchResults = false;
 };

 let category = '';
 let name = '';
</script>

<div class="container my-3">
 <div class="row">
  <div class="col-12 col-lg-4">
   <h3>Search Item</h3>
   <form on:submit|preventDefault={handleFormSubmit} action="#">
    <FormGroup floating label="Search by name">
     <Input bind:value={name} placeholder="Type a name" />
    </FormGroup>
    <FormGroup floating label="Search by category">
     <Input bind:value={category} placeholder="Type a category" />
    </FormGroup>
    <Button type="submit" color="info">Search</Button>
    <Button type="reset" on:click={handleSearchReset} color="danger">
     Reset
    </Button>
   </form>
  </div>
 </div>
</div>

{#if $showSearchResults}
 <Container>
  {#each results as r}
   <ItemCard item={r} />
  {/each}
 </Container>
{/if}
