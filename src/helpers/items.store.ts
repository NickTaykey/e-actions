import { derived, get, writable } from 'svelte/store';
import * as firebase from 'firebase/firestore';
import { ChangePageBehaviour } from './types';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';

import type { ItemFirebaseInput, ItemFields, Item } from '../helpers/types';
import type { DocumentData } from 'firebase/firestore';

const firebaseCollection = firebase.collection(db, 'items');

export const itemsPerPage = 3;

const _currentItem = writable<Item | null>(Object.freeze(null));
export const currentItem = derived(
 _currentItem,
 ($_currentItem) => $_currentItem
);
export const setCurrentItem = (item: Item | null) => _currentItem.set(item);

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
    questions: [],
   };

   try {
    const docRef = await firebase.addDoc(firebaseCollection, inputData);

    _items.update((items) => {
     const newMap = new Map(items);
     newMap.set(docRef.id, {
      ...inputData,
      id: docRef.id,
     });
     return Object.freeze(newMap);
    });

    _hottestItemsIds.update((hottestItemsIds) => {
     return [...hottestItemsIds, docRef.id].slice(0, itemsPerPage);
    });
    _latestItemsIds.update((latestItemsIds) => {
     return [docRef.id, ...latestItemsIds].slice(0, itemsPerPage);
    });
    _nItemsPublished.update((nItemsPublished) => 1 + nItemsPublished);

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

export const updateItem = (newItem: ItemFields, currentItem: Item) => {
 return new Promise<Item>(
  async (resolve: (item: Item) => void, reject: (e: unknown) => void) => {
   try {
    const docRef = firebase.doc(db, 'items', currentItem.id);
    await firebase.updateDoc(docRef, { ...newItem });
    const item = {
     ...currentItem,
     ...newItem,
    } as Item;

    _items.update((items) => {
     if (items.size === 0) return items;

     const newMap = new Map(items);

     newMap.set(currentItem.id, item);

     return Object.freeze(newMap);
    });

    resolve(item);
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

export const deleteItem = (item: Item) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    await firebase.deleteDoc(firebase.doc(db, 'items', item.id));

    _items.update((items) => {
     if (items.size === 0) return items;
     const newMap = new Map(items);
     newMap.delete(item.id);
     return Object.freeze(newMap);
    });

    _hottestItemsIds.update((hottestItemsIds) => {
     return hottestItemsIds.filter((id) => id !== item.id);
    });
    _latestItemsIds.update((hottestItemsIds) => {
     return hottestItemsIds.filter((id) => id !== item.id);
    });

    Promise.all(
     item.questions.map((qId) => {
      return firebase.deleteDoc(firebase.doc(db, 'questions', qId));
     })
    );

    _nItemsPublished.update((nItemsPublished) => nItemsPublished - 1);

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

export const loadCurrentItem = (itemId: string) => {
 return new Promise<Item>(
  async (resolve: (item: Item) => void, reject: (e: unknown) => void) => {
   try {
    const docRef = firebase.doc(db, 'items', itemId);

    await firebase.updateDoc(docRef, { views: firebase.increment(1) });

    const itemSnapshot = await firebase.getDoc(docRef);
    const itemData = itemSnapshot.data();

    if (itemData === undefined) {
     throw new Error(`No items with id: ${itemId} was found!`);
    }

    if (get(items).size > 0) {
     _items.update((items) => {
      const newMap = new Map(items);
      const item = newMap.get(itemId);

      if (item === undefined) {
       throw new Error(`No items with id: ${itemId} was stored locally!`);
      }

      item.views++;
      newMap.set(itemId, item);

      return newMap;
     });
    }

    resolve({ ...itemData, id: docRef.id } as Item);
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
