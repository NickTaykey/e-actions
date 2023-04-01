<script lang="ts">
 import {
  currentItemOffers,
  setCurrentItem,
  setItemOffers,
  currentItem,
 } from '../helpers/items.store';
 import * as firestore from 'firebase/firestore';
 import OffersTable from './OffersTable.svelte';
 import UserOffer from './UserOffer.svelte';
 import { currentUser } from '../helpers';
 import { db } from '../helpers/firebase';
 import { goto } from '$app/navigation';
 import { onMount } from 'svelte';

 import type { Item } from '../helpers/types';

 onMount(() => {
  const unsubscribe = firestore.onSnapshot(
   firestore.doc(db, 'items', $currentItem!.id),
   async (doc) => {
    if (!doc.exists()) return goto('/');
    setCurrentItem({ id: doc.id, ...doc.data()! } as Item);
    setItemOffers($currentItem!);
   }
  );
  return unsubscribe;
 });
</script>

{#if $currentUser}
 <UserOffer />
{/if}
{#if $currentItemOffers.length}
 <OffersTable />
{/if}
