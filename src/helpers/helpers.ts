import type { ItemFields } from './types';

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
