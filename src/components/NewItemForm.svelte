<script lang="ts">
 import {
  serverTimestamp,
  getFirestore,
  collection,
  addDoc,
 } from 'firebase/firestore';
 import { getAuth } from 'firebase/auth';

 let categories: string[] = [''];
 let description = '';
 let name = '';
 let minPrice = 10;

 const handleFormSubmit = async (e: SubmitEvent) => {
  const { currentUser } = getAuth();

  if (currentUser === null) {
   throw new Error('Create Item operation requires user authenticated');
  }

  const db = getFirestore();
  const collectionRef = collection(db, 'items');
  const docData = {
   createdAt: serverTimestamp(),
   userId: currentUser.uid,
   description,
   categories,
   minPrice,
   name,
  };

  try {
   await addDoc(collectionRef, docData);
  } catch (error) {
   console.log(error);
  }

  window.alert('Item successfully posted!');
 };

 const handleAddCategory = () => (categories = [...categories, '']);
</script>

<form on:submit|preventDefault={handleFormSubmit}>
 <div>
  <label>
   Name of the item:
   <input type="text" bind:value={name} />
  </label>
 </div>
 <div>
  <label>
   Description:
   <textarea bind:value={description} cols="30" rows="10" />
  </label>
 </div>
 <div>
  <label>
   min price:
   <input type="number" bind:value={minPrice} />
  </label>
 </div>
 <div>
  {#each categories as category, index}
   <label>
    Category {index}:
    <input type="text" bind:value={category} />
   </label>
  {/each}
  <button type="button" on:click={handleAddCategory}>Add Category</button>
 </div>
 <button type="submit">Publish Item</button>
</form>
