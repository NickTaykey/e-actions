import { derived, get, writable } from 'svelte/store';
import * as firebase from 'firebase/firestore';
import { db } from './firebase';

import type { Item, Question } from './types';
import { selectedItem } from './items.store';
import { currentUser } from '.';

const _questions = writable<readonly Question[]>(Object.freeze([]));
export const questions = derived(_questions, ($_questions) => $_questions);

export const addQuestion = (text: string) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const selectedItemObj = get(selectedItem);
    const currentUserObj = get(currentUser);

    if (selectedItemObj === null) {
     throw new Error(
      'Unexpected null selectedItem, impossible to create a Question'
     );
    }

    if (currentUserObj === null) {
     throw new Error(
      'Unexpected null currentUser, impossible to create a Question'
     );
    }

    const itemRef = firebase.doc(db, 'items', selectedItemObj.id);
    const questionId = crypto.randomUUID();

    const itemData = (await firebase.getDoc(itemRef)).data();

    if (itemData === undefined) {
     throw new Error(`No items with id: ${selectedItemObj.id} was found!`);
    }

    const question = {
     createdAt: firebase.serverTimestamp(),
     itemCreatorId: itemData.userId,
     userId: currentUserObj.uid,
     updated: false,
     answer: null,
     text,
    };

    await Promise.all([
     firebase.updateDoc(itemRef, {
      questions: firebase.arrayUnion(questionId),
     }),
     firebase.setDoc(firebase.doc(db, 'questions', questionId), question),
    ]);

    _questions.update((questions) => [
     {
      id: questionId,
      ...question,
     },
     ...questions,
    ]);

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

export const loadItemQuestions = () => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const selectedItemObj = get(selectedItem);

    if (selectedItemObj === null) {
     throw new Error(
      'Unexpected null selectedItem, impossible to create a Question'
     );
    }

    const itemDoc = await firebase.getDoc(
     firebase.doc(db, 'items', selectedItemObj.id)
    );
    const itemData = itemDoc.data();

    if (itemData === undefined) {
     throw new Error(`No items with id: ${selectedItemObj.id} was found!`);
    }

    if (itemData.questions === undefined) {
     itemData.questions = [];
    }

    const item = itemData as Item;

    const questions = await Promise.all(
     item.questions.map((q) => {
      return firebase.getDoc(firebase.doc(db, 'questions', q));
     })
    );

    const questionsData = questions.map((q) => {
     let data = q.data();
     if (data === undefined) {
      throw new Error('Unexpected Error while loading questions of the Item');
     }
     return { id: q.id, ...data } as Question;
    });

    _questions.update((questions) => {
     return Object.freeze([
      ...questionsData.map((_, i, a) => a[a.length - 1 - i]),
      ...questions,
     ]);
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

export const deleteQuestion = (questionId: string) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const selectedItemObj = get(selectedItem);
    if (selectedItemObj === null) {
     throw new Error(
      'Unexpected null selectedItem, impossible to create a Question'
     );
    }

    await Promise.all([
     firebase.deleteDoc(firebase.doc(db, 'questions', questionId)),
     firebase.updateDoc(firebase.doc(db, 'items', selectedItemObj.id), {
      questions: firebase.arrayRemove(questionId),
     }),
    ]);

    _questions.update((questions) => {
     return questions.filter((q) => q.id !== questionId);
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

export const updateQuestion = (
 questionId: string,
 field: 'answer' | 'text',
 value: string | null
) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    if (field === 'text' && value === null) {
     throw new Error('Error while updating the question no text was provided!');
    }

    const updateObj: any = {
     [field]: value,
    };
    if (field === 'text') {
     updateObj.updated = true;
    }

    await firebase.updateDoc(
     firebase.doc(db, 'questions', questionId),
     updateObj
    );

    _questions.update((questions) => {
     return questions.map((q) => ({
      ...q,
      ...updateObj,
     }));
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
