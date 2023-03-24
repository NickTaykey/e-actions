import { derived, writable } from 'svelte/store';
import * as firebase from 'firebase/firestore';
import { db } from './firebase';

import type { Item, Question } from './types';
import { text } from 'svelte/internal';

const _questions = writable<readonly Question[]>(Object.freeze([]));
export const questions = derived(_questions, ($_questions) => $_questions);

export const addQuestion = (itemId: string, text: string, userId: string) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const questionId = crypto.randomUUID();
    const question = {
     text,
     userId,
     updated: false,
     createdAt: firebase.serverTimestamp(),
    };
    await Promise.all([
     firebase.setDoc(firebase.doc(db, 'questions', questionId), question),
     firebase.updateDoc(firebase.doc(db, 'items', itemId), {
      questions: firebase.arrayUnion(questionId),
     }),
     _questions.update((questions) => [
      { id: questionId, ...question },
      ...questions,
     ]),
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

export const loadItemQuestions = (itemId: string) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const item = await firebase.getDoc(firebase.doc(db, 'items', itemId));
    const itemData = item.data() as Item | undefined;
    if (itemData === undefined) {
     throw new Error(`No items with id: ${itemId} was found!`);
    }
    const questions = await Promise.all(
     itemData.questions.map((q) => {
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

export const deleteQuestion = (itemId: string, questionId: string) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    await Promise.all([
     firebase.deleteDoc(firebase.doc(db, 'questions', questionId)),
     firebase.updateDoc(firebase.doc(db, 'items', itemId), {
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

export const updateQuestion = (questionId: string, newText: string) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    firebase.updateDoc(firebase.doc(db, 'questions', questionId), {
     text: newText,
     updated: true,
    });
    _questions.update((questions) => {
     return questions.map((q) => ({
      ...q,
      text: questionId === q.id ? newText : q.text,
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
