export const isString = (possibleString: any): possibleString is string => {
  return typeof possibleString === 'string';
};
