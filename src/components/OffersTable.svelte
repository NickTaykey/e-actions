<script lang="ts">
 import {
  currentItemOffers,
  setAcceptedOffer,
  currentItem,
 } from '../helpers/items.store';
 import { currentUser } from '../helpers';

 import type { Offer } from '../helpers/types';

 const handleAcceptOfferFactory = (offer: Offer) => {
  return () => setAcceptedOffer(offer);
 };
</script>

<table>
 <thead>
  <th>Offer</th>
  <th>User email</th>
 </thead>
 <tbody>
  {#each $currentItemOffers as offer (offer.id)}
   <tr>
    <td>{offer.amount}</td>
    <td>{offer.email}</td>
    {#if $currentItem?.userId === $currentUser?.uid}
     <td>
      <button on:click={handleAcceptOfferFactory(offer)}>Accept Offer</button>
     </td>
    {/if}
   </tr>
  {/each}
 </tbody>
</table>
