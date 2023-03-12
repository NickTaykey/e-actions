import type { FieldValue } from 'firebase/firestore';

export interface ItemFields {
 name: string;
 description: string;
 minPrice: number;
 categories: string[];
}

export interface ItemFirebaseInput extends ItemFields {
 createdAt: FieldValue;
 userId: string;
}

export interface Item extends ItemFirebaseInput {
 id: string;
}
