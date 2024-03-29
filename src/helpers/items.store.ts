import {
 getDownloadURL,
 deleteObject,
 uploadBytes,
 ref,
} from 'firebase/storage';
import { ChangePageBehaviour, ImageStorageData } from './types';
import { derived, get, writable } from 'svelte/store';
import * as firestore from 'firebase/firestore';
import { db, storage } from './firebase';
import { getAuth } from 'firebase/auth';

import type {
 ItemFirebaseInput,
 ItemFields,
 Offer,
 Item,
} from '../helpers/types';
import type { DocumentData } from 'firebase/firestore';

const firebaseCollection = firestore.collection(db, 'items');

export const itemsPerPage = 3;

const _currentItem = writable<Item | null>(Object.freeze(null));
export const currentItem = derived(
 _currentItem,
 ($_currentItem) => $_currentItem
);

const _currentItemOffers = writable<readonly Offer[]>(Object.freeze([]));
export const currentItemOffers = derived(
 _currentItemOffers,
 ($_currentItemOffers) => $_currentItemOffers
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

const _nItemsPublished = writable(0);

export const nItemsPublished = derived(
 _nItemsPublished,
 ($_nItemsPublished) => $_nItemsPublished
);

export const showSearchResults = writable(false);

export const setItems = (
 hottestItemsShapshot: firestore.QuerySnapshot<DocumentData> | null,
 latestItemsSnapshot: firestore.QuerySnapshot<DocumentData> | null
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
   offers: itemData.offers,
   image: itemData.image,
   nameLowerCase: itemData.name.toLowerCase(),
   description: itemData.description as string,
   categories: itemData.categories as string[],
   minPrice: itemData.minPrice as number,
   acceptedOffer: itemData.acceptedOffer || null,
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
 const queryComponents: firestore.QueryConstraint[] = [
  firestore.orderBy(sortField, 'desc'),
  firestore.limit(itemsPerPage),
 ];

 if (behaviour === ChangePageBehaviour.NEXT) {
  const lastItemId = get(
   sortField === 'createdAt' ? latestItemsIds : hottestItemsIds
  ).at(-1)!;
  const lastPageItemRef = firestore.doc(db, 'items', lastItemId);
  const lastItemSnapshot = await firestore.getDoc(lastPageItemRef);
  queryComponents.push(firestore.startAfter(lastItemSnapshot));
 }

 const querySnapshot = await firestore.getDocs(
  firestore.query(firebaseCollection, ...queryComponents)
 );

 return querySnapshot;
};

export const addItem = async (newItem: ItemFields, image: File | null) => {
 return new Promise<Item>(
  async (resolve: (item: Item) => void, reject: (e: unknown) => void) => {
   const { currentUser } = getAuth();

   if (currentUser === null) {
    throw new Error('Create Item operation requires user authenticated');
   }

   try {
    let imageStorageData: ImageStorageData = null;
    if (image) {
     imageStorageData = await saveImagesOnCloudStorage(image);
    }

    const inputData: ItemFirebaseInput = {
     ...newItem,
     nameLowerCase: newItem.name.toLowerCase(),
     createdAt: firestore.serverTimestamp(),
     userId: currentUser.uid,
     image: imageStorageData,
     questions: [],
     views: 0,
    };

    const docRef = await firestore.addDoc(firebaseCollection, inputData);
    const newItemObject = {
     ...inputData,
     id: docRef.id,
     offers: [],
     image: imageStorageData,
     acceptedOffer: null,
    };

    _items.update((items) => {
     const newMap = new Map(items);
     newMap.set(docRef.id, newItemObject);
     return Object.freeze(newMap);
    });

    _hottestItemsIds.update((hottestItemsIds) => {
     return [...hottestItemsIds, docRef.id].slice(0, itemsPerPage);
    });
    _latestItemsIds.update((latestItemsIds) => {
     return [docRef.id, ...latestItemsIds].slice(0, itemsPerPage);
    });
    _nItemsPublished.update((nItemsPublished) => 1 + nItemsPublished);

    resolve(newItemObject);
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
     firestore.getCountFromServer(firebaseCollection),
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

export const updateItem = (
 newItem: ItemFields,
 currentItem: Item,
 image: File | null
) => {
 return new Promise<Item>(
  async (resolve: (item: Item) => void, reject: (e: unknown) => void) => {
   try {
    const [imageStorageData] = await Promise.all([
     image && saveImagesOnCloudStorage(image),
     image &&
      currentItem.image &&
      deleteObject(ref(storage, currentItem.image.id)),
    ]);

    const docRef = firestore.doc(db, 'items', currentItem.id);
    await firestore.updateDoc(docRef, {
     ...newItem,
     image: imageStorageData || currentItem.image || null,
    });
    const item = {
     ...currentItem,
     ...newItem,
     image: imageStorageData,
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

export const loadItemOffers = async (item: Item) => {
 let offers: Offer[] = [];
 if (item.offers && item.offers.length > 0) {
  offers = (
   await Promise.all(
    item.offers.map((offerId) => {
     return firestore.getDoc(firestore.doc(db, 'user-offers', offerId));
    })
   )
  )
   .map(
    (offerSnapshot, i) =>
     ({ id: item.offers[i], ...offerSnapshot.data()! } as Offer)
   )
   .sort((a, b) => (a.amount > b.amount ? -1 : 1));
 }

 _currentItemOffers.set(Object.freeze(offers));

 return offers;
};

export const deleteItem = (item: Item) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    await Promise.all([
     firestore.deleteDoc(firestore.doc(db, 'items', item.id)),
     item.image && deleteObject(ref(storage, item.image.id)),
    ]);

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
      return firestore.deleteDoc(firestore.doc(db, 'questions', qId));
     })
    );

    _nItemsPublished.update((nItemsPublished) => nItemsPublished - 1);

    resolve();
   } catch (e) {
    reject(e);
    console.error(e);
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
   }
  }
 );
};

export const loadCurrentItem = (itemId: string) => {
 return new Promise<Item | null>(
  async (
   resolve: (item: Item | null) => void,
   reject: (e: unknown) => void
  ) => {
   try {
    const docRef = firestore.doc(db, 'items', itemId);

    const itemSnapshot = await firestore.getDoc(docRef);

    if (!itemSnapshot.exists()) return resolve(null);

    const itemData = itemSnapshot.data()!;

    firestore.updateDoc(docRef, { views: firestore.increment(1) });

    if (!itemData.offers) itemData.offers = [];
    if (!itemData.acceptedOffer) itemData.acceptedOffer = null;

    const item = itemData as Item;
    await loadItemOffers(item);

    if (get(items).size > 0) {
     _items.update((items) => {
      const newMap = new Map(items);
      const item = newMap.get(itemId);

      if (!item) {
       throw new Error(`No items with id: ${itemId} was stored locally!`);
      }

      item.views++;
      newMap.set(itemId, item);

      return newMap;
     });
    }

    resolve({ ...item, id: docRef.id } as Item);
   } catch (e) {
    reject(e);
    console.error(e);
   }
  }
 );
};

export const searchItem = (name: string | null, category: string | null) => {
 return new Promise<Item[]>(
  async (resolve: (items: Item[]) => void, reject: (e: unknown) => void) => {
   try {
    const queries: firestore.Query<firestore.DocumentData>[] = [];
    const itemsCollection = firestore.collection(db, 'items');

    if (name !== null) {
     queries.push(
      firestore.query(
       itemsCollection,
       firestore.where('nameLowerCase', '>=', name.toLowerCase()),
       firestore.where('nameLowerCase', '<=', name.toLowerCase() + '\uf8ff')
      )
     );
    }

    if (category !== null) {
     queries.push(
      firestore.query(
       itemsCollection,
       firestore.where('categories', 'array-contains', category)
      )
     );
    }

    const snapshots = await Promise.all(
     queries.map((q) => firestore.getDocs(q))
    );

    const resultsMap = new Map<string, Item>();

    for (const s of snapshots.map((s) => s.docs).flat()) {
     if (!resultsMap.has(s.id)) {
      const data = s.data();
      if (data) resultsMap.set(s.id, { ...s.data(), id: s.id } as Item);
     }
    }

    resolve(Array.from(resultsMap.values()));
   } catch (e: unknown) {
    console.error(e);
    reject(e);
   }
  }
 );
};

export const setOffer = (item: Item, amount: number) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const { currentUser } = getAuth();
    if (currentUser === null) {
     throw new Error('Set offer operation requires user authenticated');
    }

    const newOffer = {
     email: currentUser.email as string,
     amount,
    };

    const newOfferId = crypto.randomUUID();

    await Promise.all([
     firestore.updateDoc(firestore.doc(db, 'items', item.id), {
      offers: firestore.arrayUnion(newOfferId),
     }),
     firestore.setDoc(firestore.doc(db, 'user-offers', newOfferId), newOffer),
    ]);

    _currentItemOffers.update((currentItemOffers) => {
     let newOffers = [{ id: newOfferId, ...newOffer }, ...currentItemOffers];
     newOffers.sort((a, b) => (a.amount > b.amount ? -1 : 1));
     return Object.freeze(newOffers);
    });

    resolve();
   } catch (e: unknown) {
    console.error(e);
    reject(e);
   }
  }
 );
};

const saveImagesOnCloudStorage = (image: File) => {
 return new Promise<ImageStorageData>(
  async (
   resolve: (imageStorageData: ImageStorageData) => void,
   reject: (e: unknown) => void
  ) => {
   try {
    const id = crypto.randomUUID();
    const imageRef = ref(storage, id);
    await uploadBytes(imageRef, image);
    const url = await getDownloadURL(imageRef);
    resolve({ url, id });
   } catch (e: unknown) {
    console.error('Unexpected error while uploading image on cloud storage!');
    reject(e);
   }
  }
 );
};

export const setAcceptedOffer = async (offer: Offer) => {
 await firestore.updateDoc(firestore.doc(db, 'items', get(currentItem)!.id), {
  acceptedOffer: offer,
 });
 setCurrentItem({ ...get(currentItem)!, acceptedOffer: offer });
};
