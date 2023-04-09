import type { FieldValue } from 'firebase/firestore';

export enum FormTypes {
 EDIT,
 NEW,
}

export type ImageStorageData = { url: string; id: string } | null;

export interface ItemFields {
 name: string;
 description: string;
 minPrice: number;
 categories: string[];
}

export type Offer = {
 id: string;
 email: string;
 amount: number;
};

export interface ItemFirebaseInput extends ItemFields {
 views: number;
 createdAt: FieldValue;
 nameLowerCase: string;
 userId: string;
 questions: string[];
 image: ImageStorageData;
}

export interface Item extends ItemFirebaseInput {
 id: string;
 offers: string[];
 acceptedOffer: Offer | null;
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
