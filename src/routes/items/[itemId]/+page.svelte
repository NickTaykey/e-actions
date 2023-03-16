<script lang="ts">
 import { signOutUser, signInUser } from '../../../helpers/index';
 import { selectedItem } from '../../../helpers/items.store';
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import ItemView from '../../../components/ItemView.svelte';
 import { doc, getDoc } from 'firebase/firestore';
 import { db } from '../../../helpers/firebase';
 import { onMount } from 'svelte';

 import type { Item } from '../../../helpers/types';
 import type { PageData } from './$types';

 export let data: PageData;

 onAuthStateChanged(getAuth(), (user) => {
  if (user !== null) signInUser(user);
  else signOutUser();
 });

 onMount(async () => {
  if ($selectedItem === null) {
   const docRef = doc(db, 'items', data.props.itemId!);
   const item = await getDoc(docRef);
   $selectedItem = { ...item.data(), id: docRef.id } as Item;
  }
 });
</script>

<ItemView />
