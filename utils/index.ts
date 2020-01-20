import * as Yup from 'yup';

export const isString = (possibleString: any): possibleString is string => {
  return typeof possibleString === 'string';
};

export const isValidationError = (err: any): err is Yup.ValidationError => {
  return err.name === 'ValidationError';
};
