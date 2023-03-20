import type { FieldValue } from 'firebase/firestore';

export enum ItemFormTypes {
 NEW,
 EDIT,
}

export interface ItemFields {
 name: string;
 description: string;
 minPrice: number;
 categories: string[];
}

export interface ItemFirebaseInput extends ItemFields {
 views: number;
 createdAt: FieldValue;
 userId: string;
}

export interface Item extends ItemFirebaseInput {
 id: string;
}

export enum ChangePageBehaviour {
 INITIAL,
 NEXT,
 PREV,
}
