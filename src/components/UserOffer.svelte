<script lang="ts">
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

<div>
 {#if showErrorAlert}
  <div class="error">
   Unexpected server side error, impossible to set offer.
  </div>
 {/if}
 <label>
  Amount:
  <input type="number" bind:value={amount} />
 </label>
 <button on:click={handlePostOffer}>Post</button>
</div>
