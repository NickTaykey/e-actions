import { derived, get, writable } from 'svelte/store';
import * as firebase from 'firebase/firestore';
import { db } from './firebase';
import { currentUser } from '.';

import type { Item, Question } from './types';

const _questions = writable<readonly Question[]>(Object.freeze([]));
export const questions = derived(_questions, ($_questions) => $_questions);

export const addQuestion = (text: string, item: Item) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const currentUserObj = get(currentUser);

    if (currentUserObj === null) {
     throw new Error(
      'Unexpected null currentUser, impossible to create a Question'
     );
    }

    const itemRef = firebase.doc(db, 'items', item.id);
    const questionId = crypto.randomUUID();

    const itemData = (await firebase.getDoc(itemRef)).data();

    if (itemData === undefined) {
     throw new Error(`No items with id: ${item.id} was found!`);
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

export const loadItemQuestions = (currentItem: Item) => {
 return new Promise<void>(
  async (resolve: () => void, reject: (e: unknown) => void) => {
   try {
    const questions = await Promise.all(
     currentItem.questions.map((q) => {
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

    _questions.set(
     Object.freeze([...questionsData.map((_, i, a) => a[a.length - 1 - i])])
    );

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

export const deleteQuestion = (questionId: string, item: Item) => {
 return new Promise<Item>(
  async (resolve: (item: Item) => void, reject: (e: unknown) => void) => {
   try {
    await Promise.all([
     firebase.deleteDoc(firebase.doc(db, 'questions', questionId)),
     firebase.updateDoc(firebase.doc(db, 'items', item.id), {
      questions: firebase.arrayRemove(questionId),
     }),
    ]);

    _questions.update((questions) => {
     return questions.filter((q) => q.id !== questionId);
    });
    const updatedItem = {
     ...item,
     questions: item.questions.filter((qId) => qId !== questionId),
    };

    resolve(updatedItem);
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
     return questions.map((q) =>
      q.id === questionId
       ? {
          ...q,
          ...updateObj,
         }
       : q
     );
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
