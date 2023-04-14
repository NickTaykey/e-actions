<script lang="ts">
 import {
  currentItemOffers,
  setCurrentItem,
  loadItemOffers,
  currentItem,
 } from '../../helpers/items.store';
 import OffersTable from '../Offer/OffersTable.svelte';
 import * as firestore from 'firebase/firestore';
 import UserOffer from './UserOffer.svelte';
 import { currentUser } from '../../helpers';
 import { db } from '../../helpers/firebase';
 import { goto } from '$app/navigation';
 import { onMount } from 'svelte';

 import type { Item, Offer } from '../../helpers/types';

 onMount(() => {
  const unsubscribe = firestore.onSnapshot(
   firestore.doc(db, 'items', $currentItem!.id),
   async (doc) => {
    if (!doc.exists()) return goto('/');

    const item = doc.data() as Item;

    if (doc.id !== $currentItem!.id || !item.offers) return;
    if (item.acceptedOffer) {
     return setCurrentItem({
      ...$currentItem,
      acceptedOffer: item.acceptedOffer || null,
      offers: item.offers || [],
     } as Item);
    }

    const offerSnapshot = await firestore.getDoc(
     firestore.doc(db, 'user-offers', item.offers.at(-1)!)
    );
    const offer = { ...(offerSnapshot.data() as Offer), id: offerSnapshot.id };

    if ($currentUser && offer.email === $currentUser.email) return;

    setCurrentItem({
     ...$currentItem,
     acceptedOffer: item.acceptedOffer || null,
     offers: item.offers || [],
    } as Item);

    loadItemOffers($currentItem!);
   }
  );

  return unsubscribe;
 });
</script>

{#if $currentItem && $currentItem.acceptedOffer}
 <div>Auction Closed {$currentItem.acceptedOffer.email}</div>
{:else}
 {#if $currentUser}
  <UserOffer />
 {/if}
 {#if $currentItemOffers.length}
  <OffersTable />
 {/if}
{/if}
