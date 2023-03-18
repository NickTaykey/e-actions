import {
 getCountFromServer,
 serverTimestamp,
 QuerySnapshot,
 getFirestore,
 startAfter,
 collection,
 updateDoc,
 deleteDoc,
 getDocs,
 orderBy,
 addDoc,
 getDoc,
 limit,
 query,
 doc,
} from 'firebase/firestore';
import { derived, get, writable } from 'svelte/store';
import { ChangePageBehaviour } from './types';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';

import type { ItemFirebaseInput, ItemFields, Item } from '../helpers/types';
import type { DocumentData } from 'firebase/firestore';

export const itemsPerPage = 9;

export const selectedItem = writable<Item | null>(null);

export const _items = writable<Map<string, Item>>(
 Object.freeze(new Map<string, Item>())
);
export const items = derived(_items, ($_items) => {
 return $_items;
});

const _currentPageNumber = writable(1);

export const currentPageNumber = derived(
 _currentPageNumber,
 ($_currentPageNumber) => $_currentPageNumber
);

const _nItemsPublished = writable<number>(0);

export const nItemsPublished = derived(
 _nItemsPublished,
 ($_nItemsPublished) => $_nItemsPublished
);

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
    const docsQuery = query(
     collectionRef,
     orderBy('views', 'desc'),
     limit(itemsPerPage)
    );

    const [countSnapshot, querySnapshot] = await Promise.all([
     getCountFromServer(collectionRef),
     getDocs(docsQuery),
    ]);

    _nItemsPublished.set(countSnapshot.data().count);
    setItems(querySnapshot);
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
    const itemToUpdate = get(selectedItem);
    if (itemToUpdate === null) throw new Error('Item to update not found');

    const docRef = doc(db, 'items', itemId);
    await updateDoc(docRef, { ...newItem });

    selectedItem.set({
     ...itemToUpdate,
     ...newItem,
    } as Item);

    _items.update((items) => {
     if (items.size === 0) return items;

     const newMap = new Map(items);
     const item = {
      createdAt: itemToUpdate.createdAt,
      description: newItem.description,
      categories: newItem.categories,
      userId: itemToUpdate.userId,
      minPrice: newItem.minPrice,
      name: newItem.name,
      id: itemId,
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
     if (items.size === 0) return items;
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

export const loadPage = (behaviour: ChangePageBehaviour) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    if (behaviour === ChangePageBehaviour.NEXT) {
     const collectionRef = collection(db, 'items');
     const lastPageItemRef = doc(
      db,
      'items',
      Array.from(get(items).keys()).at(-1)!
     );
     const lastItemSnapshot = await getDoc(lastPageItemRef);
     const docsQuery = query(
      collectionRef,
      orderBy('views', 'desc'),
      limit(itemsPerPage),
      startAfter(lastItemSnapshot)
     );
     const querySnapshot = await getDocs(docsQuery);
     _currentPageNumber.update((currentPageNumber) => currentPageNumber + 1);
     setItems(querySnapshot);
    }

    if (behaviour === ChangePageBehaviour.PREV) {
     _currentPageNumber.update((currentPageNumber) => currentPageNumber - 1);
    }

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

const setItems = (querySnapshot: QuerySnapshot<DocumentData>) => {
 const docs = Array.from(querySnapshot.docs);
 const itemsMap = new Map<string, Item>(get(_items));
 const newIds = [];

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
  newIds.push(doc.id);
 }

 _items.set(Object.freeze(itemsMap));
};
