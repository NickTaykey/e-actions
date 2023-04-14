<script lang="ts">
 import {
  InputGroupText,
  InputGroup,
  Button,
  Input,
  Alert,
  Label,
 } from 'sveltestrap';
 import { currentItem } from '../../helpers/items.store';
 import { setOffer } from '../../helpers/items.store';

 let showErrorAlert = false;
 let amount = $currentItem?.minPrice || 0;

 const handlePostOffer = async () => {
  try {
   await setOffer($currentItem!, amount);
   amount = 0;
  } catch (e: unknown) {
   showErrorAlert = true;
  }
 };
</script>

<div class="mb-3 w-50">
 {#if showErrorAlert}
  <Alert color="danger">
   Unexpected server side error, impossible to set offer.
  </Alert>
 {/if}
 <Label class="d-block w-100">
  Make an offer:
  <InputGroup>
   <InputGroupText>$</InputGroupText>
   <Input type="number" bind:value={amount} />
  </InputGroup>
 </Label>
 <Button color="primary" block on:click={handlePostOffer}>Post</Button>
</div>
