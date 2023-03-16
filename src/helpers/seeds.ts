import {
 serverTimestamp,
 collection,
 addDoc,
 getDoc,
} from 'firebase/firestore';
import { faker } from '@faker-js/faker';
import { _items } from './items.store';
import { currentUser } from './index';
import { get } from 'svelte/store';
import { db } from './firebase';

import type { ItemFirebaseInput, Item } from './types';

const seedDB = async () => {
 const auctionItems: ItemFirebaseInput[] = [];
 for (let i = 0; i < 20; i++) {
  auctionItems.push({
   name: faker.commerce.productName(),
   description: faker.lorem.sentences(),
   views: 0,
   minPrice: faker.datatype.number({ min: 1, max: 100 }),
   createdAt: serverTimestamp(),
   categories: new Array(4)
    .fill(null)
    .map(() => faker.science.chemicalElement().name),
   userId: get(currentUser)!.uid,
  } as ItemFirebaseInput);
 }
 const docRefs = await Promise.all(
  auctionItems.map((item) => addDoc(collection(db, 'items'), item))
 );
 const items = await Promise.all(docRefs.map((ref) => getDoc(ref)));
 const itemsMap = new Map(
  items.map((item) => [item.id, { ...item.data(), id: item.id } as Item])
 );
 _items.set(itemsMap);
};

export default seedDB;
