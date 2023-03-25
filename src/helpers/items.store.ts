import { derived, get, writable } from 'svelte/store';
import * as firebase from 'firebase/firestore';
import { ChangePageBehaviour } from './types';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';

import type { ItemFirebaseInput, ItemFields, Item } from '../helpers/types';
import type { DocumentData } from 'firebase/firestore';

const firebaseCollection = firebase.collection(db, 'items');

export const itemsPerPage = 9;

export const selectedItem = writable<Item | null>(null);

export const _hottestItemsIds = writable<string[]>([]);
export const hottestItemsIds = derived(
 _hottestItemsIds,
 ($_hottestItemsIds) => $_hottestItemsIds
);

export const _latestItemsIds = writable<string[]>([]);
export const latestItemsIds = derived(
 _latestItemsIds,
 ($_latestItemsIds) => $_latestItemsIds
);

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

export const setItems = (
 hottestItemsShapshot: firebase.QuerySnapshot<DocumentData> | null,
 latestItemsSnapshot: firebase.QuerySnapshot<DocumentData> | null
) => {
 const hottestItemsDocs = hottestItemsShapshot
  ? Array.from(hottestItemsShapshot.docs)
  : [];
 const latestItemsDocs = latestItemsSnapshot
  ? Array.from(latestItemsSnapshot.docs)
  : [];

 const itemsMap = new Map<string, Item>(get(_items));

 const itemsWithoutDuplicates = [
  ...new Set([...hottestItemsDocs, ...latestItemsDocs]),
 ];

 for (const doc of itemsWithoutDuplicates) {
  const itemData = doc.data();
  itemsMap.set(doc.id, {
   description: itemData.description as string,
   categories: itemData.categories as string[],
   minPrice: itemData.minPrice as number,
   userId: itemData.userId as string,
   name: itemData.name as string,
   createdAt: itemData.createdAt,
   questions: itemData.questions,
   views: itemData.views,
   id: doc.id,
  });
 }

 _hottestItemsIds.update((hottestItemsIds) => [
  ...new Set([...hottestItemsIds, ...hottestItemsDocs.map((doc) => doc.id)]),
 ]);

 _latestItemsIds.update((latestItemsIds) => [
  ...new Set([...latestItemsIds, ...latestItemsDocs.map((doc) => doc.id)]),
 ]);

 _items.set(Object.freeze(itemsMap));
};

export const handleItemsLoading = async (
 behaviour: ChangePageBehaviour,
 sortField: 'views' | 'createdAt'
) => {
 const queryComponents: firebase.QueryConstraint[] = [
  firebase.orderBy(sortField, 'desc'),
  firebase.limit(itemsPerPage),
 ];

 if (behaviour === ChangePageBehaviour.NEXT) {
  const lastItemId = get(
   sortField === 'createdAt' ? latestItemsIds : hottestItemsIds
  ).at(-1)!;
  const lastPageItemRef = firebase.doc(db, 'items', lastItemId);
  const lastItemSnapshot = await firebase.getDoc(lastPageItemRef);
  queryComponents.push(firebase.startAfter(lastItemSnapshot));
 }

 const querySnapshot = await firebase.getDocs(
  firebase.query(firebaseCollection, ...queryComponents)
 );

 return querySnapshot;
};

export const addItem = async (newItem: ItemFields) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   const { currentUser } = getAuth();

   if (currentUser === null) {
    throw new Error('Create Item operation requires user authenticated');
   }

   const inputData: ItemFirebaseInput = {
    ...newItem,
    createdAt: firebase.serverTimestamp(),
    userId: currentUser.uid,
    views: 0,
   };

   try {
    const docRef = await firebase.addDoc(firebaseCollection, inputData);

    _items.update((items) => {
     const newMap = new Map(items);
     newMap.set(docRef.id, {
      ...inputData,
      id: docRef.id,
      questions: [],
     });
     return Object.freeze(newMap);
    });

    _hottestItemsIds.update((hottestItemsIds) => [
     ...hottestItemsIds,
     docRef.id,
    ]);
    _latestItemsIds.update((latestItemsIds) => [docRef.id, ...latestItemsIds]);

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
    const [countSnapshot] = await Promise.all([
     firebase.getCountFromServer(firebaseCollection),
     loadPage(ChangePageBehaviour.INITIAL),
    ]);

    _nItemsPublished.set(countSnapshot.data().count);

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

export const updateItem = (newItem: ItemFields) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const itemToUpdate = get(selectedItem);
    if (itemToUpdate === null) throw new Error('Item to update not found');

    const docRef = firebase.doc(db, 'items', itemToUpdate.id);
    await firebase.updateDoc(docRef, { ...newItem });

    selectedItem.set(
     Object.freeze({
      ...itemToUpdate,
      ...newItem,
     } as Item)
    );

    _items.update((items) => {
     if (items.size === 0) return items;

     const newMap = new Map(items);
     const item = {
      createdAt: itemToUpdate.createdAt,
      description: newItem.description,
      categories: newItem.categories,
      userId: itemToUpdate.userId,
      minPrice: newItem.minPrice,
      id: itemToUpdate.id,
      name: newItem.name,
     } as Item;

     newMap.set(itemToUpdate.id, item);
     selectedItem.set(Object.freeze(item));

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
    await firebase.deleteDoc(firebase.doc(db, 'items', itemId));

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
    const snapshot = await Promise.all([
     handleItemsLoading(behaviour, 'views'),
     handleItemsLoading(behaviour, 'createdAt'),
    ]);

    setItems(...snapshot);

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

export const loadCurrentItem = () => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const itemId = window.location.pathname.split('/').at(-1)!;
    const docRef = firebase.doc(db, 'items', itemId);
    const promises: Promise<any>[] = [
     firebase.updateDoc(docRef, { views: firebase.increment(1) }),
    ];

    if (get(selectedItem) === null) promises.push(firebase.getDoc(docRef));

    const resolvedPromises = await Promise.all(promises);

    if (get(selectedItem) === null) {
     const itemData = resolvedPromises[1].data() as Item | undefined;
     if (itemData === undefined) {
      throw new Error(`No items with id: ${itemId} was found!`);
     }
     selectedItem.set(itemData);
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
