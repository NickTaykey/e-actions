import { derived, writable } from 'svelte/store';

import type { User } from 'firebase/auth';
import type { ItemFields } from './types';

const _currentUser = writable<User | null>(null);

export const currentUser = derived(_currentUser, ($_currentUser) => {
 return $_currentUser;
});

export const signOutUser = () => {
 _currentUser.set(null);
};

export const signInUser = (user: User) => {
 _currentUser.set(Object.freeze(user));
};

export const validateFormFields = (fields: ItemFields) => {
 const invalidCategoriesIndexes: number[] = [];
 const invalidFieldsIndexes: number[] = [];
 const areCategoriesValid = fields.categories.reduce((acm, name, i) => {
  const isValid = typeof name === 'string' && name.length;
  if (!isValid) invalidCategoriesIndexes.push(i);
  if (acm && !isValid) return false;
  return acm;
 }, true);

 let areFieldsValid = true;

 if (fields.categories.length === 0 || !areCategoriesValid) {
  areFieldsValid = false;
  invalidFieldsIndexes.push(3);
 }
 if (fields.description.length === 0) {
  areFieldsValid = false;
  invalidFieldsIndexes.push(1);
 }
 if (fields.name.length === 0) {
  areFieldsValid = false;
  invalidFieldsIndexes.push(0);
 }
 if (fields.minPrice < 1) {
  areFieldsValid = false;
  invalidFieldsIndexes.push(2);
 }

 return { areFieldsValid, invalidCategoriesIndexes, invalidFieldsIndexes };
};
