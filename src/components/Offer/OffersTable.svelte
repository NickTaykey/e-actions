<script lang="ts">
 import {
  currentItemOffers,
  setAcceptedOffer,
  currentItem,
 } from '../../helpers/items.store';
 import { Table, Button } from 'sveltestrap';
 import { currentUser } from '../../helpers';

 import type { Offer } from '../../helpers/types';

 const handleAcceptOfferFactory = (offer: Offer) => {
  return () => setAcceptedOffer(offer);
 };
</script>

<Table>
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
      <Button color="success" on:click={handleAcceptOfferFactory(offer)}>
       Accept Offer
      </Button>
     </td>
    {/if}
   </tr>
  {/each}
 </tbody>
</Table>
