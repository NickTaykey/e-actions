import type { FieldValue } from 'firebase/firestore';

export enum FormTypes {
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
 questions: string[];
}

export interface Item extends ItemFirebaseInput {
 id: string;
}

export enum ChangePageBehaviour {
 INITIAL,
 NEXT,
 PREV,
}

export interface QuestionFields {
 answer: string | null;
 text: string;
 createdAt: FieldValue;
 userId: string;
}

export interface Question extends QuestionFields {
 id: string;
 updated: boolean;
 itemCreatorId: string;
}
