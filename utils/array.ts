const id = <T, U>(item: T): U => (item as unknown) as U;

export const unique = <T, U>(items: T[], getKey: (item: T) => U = id): T[] => {
  const filteredItems: T[] = [];
  for (let item of items) {
    const key = getKey(item);
    if (filteredItems.findIndex(otherItem => getKey(otherItem) === key) < 0) {
      filteredItems.push(item);
    }
  }

  return filteredItems;
};
