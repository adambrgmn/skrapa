import * as Yup from 'yup';

export const isString = (possibleString: unknown): possibleString is string => {
  return typeof possibleString === 'string';
};

export const isValidationError = (err: any): err is Yup.ValidationError => {
  return err != null && 'name' in err && err.name === 'ValidationError';
};
