<script lang="ts">
 import { Alert, Label, Input, Button } from 'sveltestrap';
 import { currentItem } from '../helpers/items.store';
 import { setOffer } from '../helpers/items.store';

 let showErrorAlert = false;
 let amount = 0;

 const handlePostOffer = async () => {
  try {
   await setOffer($currentItem!, amount);
   amount = 0;
  } catch (e: unknown) {
   showErrorAlert = true;
  }
 };
</script>

{#if showErrorAlert}
 <Alert color="danger">
  Unexpected server side error, impossible to set offer.
 </Alert>
{/if}
<Label>
 Amount:
 <Input type="number" bind:value={amount} />
</Label>
<Button color="primary" on:click={handlePostOffer}>Post</Button>
