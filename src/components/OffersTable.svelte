<script lang="ts">
 import { currentItemOffers } from '../helpers/items.store';
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
   </tr>
  {/each}
 </tbody>
</table>
