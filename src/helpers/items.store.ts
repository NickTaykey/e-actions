import {
 serverTimestamp,
 getFirestore,
 collection,
 updateDoc,
 deleteDoc,
 getDocs,
 orderBy,
 addDoc,
 limit,
 query,
 doc,
} from 'firebase/firestore';
import { derived, get, writable } from 'svelte/store';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';

import type { Item, ItemFields, ItemFirebaseInput } from './types';

export const selectedItem = writable<Item | null>(null);

export const _items = writable<Map<string, Item>>(
 Object.freeze(new Map<string, Item>())
);

export const items = derived(_items, ($_items) => $_items);

export const addItem = async (newItem: ItemFields) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   const { currentUser } = getAuth();

   if (currentUser === null) {
    throw new Error('Create Item operation requires user authenticated');
   }

   const db = getFirestore();
   const collectionRef = collection(db, 'items');
   const inputData: ItemFirebaseInput = {
    ...newItem,
    createdAt: serverTimestamp(),
    userId: currentUser.uid,
    views: 0,
   };

   try {
    const docRef = await addDoc(collectionRef, inputData);

    _items.update((items) => {
     const newMap = new Map(items);

     newMap.set(docRef.id, {
      ...inputData,
      id: docRef.id,
     });

     return Object.freeze(newMap);
    });

    resolve();
   } catch (e) {
    reject(e);
    console.error(e);
    throw new Error(
     'Unexpected Error while adding a document to Cloud Firestore'
    );
   }
  }
 );
};

export const loadItems = () => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const collectionRef = collection(db, 'items');
    const docsQuery = query(collectionRef, orderBy('createdAt'), limit(9));
    const docs = Array.from((await getDocs(docsQuery)).docs);
    const itemsMap = new Map<string, Item>();

    for (const doc of docs) {
     const itemData = doc.data();
     itemsMap.set(doc.id, {
      description: itemData.description as string,
      categories: itemData.categories as string[],
      minPrice: itemData.minPrice as number,
      userId: itemData.userId as string,
      name: itemData.name as string,
      createdAt: itemData.createdAt,
      views: itemData.views,
      id: doc.id,
     });
    }

    _items.set(Object.freeze(itemsMap));
    resolve();
   } catch (e) {
    reject(e);
    console.error(e);
    throw new Error(
     'Unexpected error while loading documents from Firebase Cloud Store'
    );
   }
  }
 );
};

export const updateItem = (itemId: string, newItem: ItemFields) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const { userId, createdAt } = get(items).get(itemId)!;
    const docRef = doc(db, 'items', itemId);
    await updateDoc(docRef, { ...newItem });

    _items.update((items) => {
     const newMap = new Map(items);
     const item = {
      description: newItem.description,
      categories: newItem.categories,
      minPrice: newItem.minPrice,
      name: newItem.name,
      id: itemId,
      createdAt,
      userId,
     } as Item;
     newMap.set(itemId, item);
     selectedItem.set(item);
     return Object.freeze(newMap);
    });

    resolve();
   } catch (e) {
    reject(e);
    console.error(e);
    throw new Error(
     'Unexpected Error while updating a document to Cloud Firestore'
    );
   }
  }
 );
};

export const deleteItem = (itemId: string) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    await deleteDoc(doc(db, 'items', itemId));
    _items.update((items) => {
     const newMap = new Map(items);
     newMap.delete(itemId);
     return Object.freeze(newMap);
    });
    selectedItem.set(null);
    resolve();
   } catch (e) {
    reject(e);
    console.error(e);
    throw new Error(
     'Unexpected Error while deleting a document to Cloud Firestore'
    );
   }
  }
 );
};
