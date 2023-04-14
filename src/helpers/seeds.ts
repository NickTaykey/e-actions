import * as firebase from 'firebase/firestore';
import { faker } from '@faker-js/faker';
import { _items } from './items.store';
import { currentUser } from './index';
import { get } from 'svelte/store';
import { db } from './firebase';

import type { ItemFirebaseInput, Item } from './types';

const seedDB = async () => {
 const auctionItems: ItemFirebaseInput[] = [];

 for (let i = 0; i < 10; i++) {
  const name = faker.commerce.productName();
  auctionItems.push({
   name,
   nameLowerCase: name.toLowerCase(),
   description: faker.lorem.sentences(),
   views: Math.trunc(Math.random() * 100),
   minPrice: faker.datatype.number({ min: 1, max: 100 }),
   questions: [],
   createdAt: firebase.serverTimestamp(),
   categories: new Array(4)
    .fill(null)
    .map(() => faker.science.chemicalElement().name),
   userId: get(currentUser)!.uid,
   image: null,
  } as ItemFirebaseInput);
 }

 const docRefs = await Promise.all(
  auctionItems.map((item) =>
   firebase.addDoc(firebase.collection(db, 'items'), item)
  )
 );

 const itemDocs = await Promise.all(docRefs.map((ref) => firebase.getDoc(ref)));
 const itemsMap = new Map(
  itemDocs.map((item) => [item.id, { ...item.data(), id: item.id } as Item])
 );

 _items.set(itemsMap);
};

export default seedDB;
