const id = <T, V>(item: T): V => (item as unknown) as V;

type GetComparableValueFn<T, V> = (item: T) => V;

export const unique = <T, V>(
  items: T[],
  getValue: GetComparableValueFn<T, V> = id,
): T[] => {
  const filteredItems: T[] = [];
  for (let item of items) {
    const key = getValue(item);
    if (filteredItems.findIndex(otherItem => getValue(otherItem) === key) < 0) {
      filteredItems.push(item);
    }
  }

  return filteredItems;
};
