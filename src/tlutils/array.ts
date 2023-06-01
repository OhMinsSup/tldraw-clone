/**
 * Rotate the contents of an array.
 *
 * @public
 * @example
 * rotateArray([1, 2, 3, 4, 5], 2); // [3, 4, 5, 1, 2]
 * rotateArray([1, 2, 3, 4, 5], -2); // [undefined, undefined, 1, 2, 3]
 * rotateArray([1, 2, 3, 4, 5], 0); // [1, 2, 3, 4, 5]
 */
export function rotateArray<T>(arr: T[], offset: number): T[] {
  // offset 값이 음수인 경우 에러를 던진다.
  if (offset < 0) {
    throw new Error("offset must be greater than or equal to 0");
  }
  return arr.map((_, i) => arr[(i + offset) % arr.length]);
}

/**
 * Deduplicate the items in an array
 *
 * @public
 * @example
 * dedupe([1, 2, 3]); // [1, 2, 3]
 * dedupe([1, 2, 3, 2, 1]); // [1, 2, 3]
 */
export function dedupe<T>(input: T[], equals?: (a: T, b: T) => boolean): T[] {
  const result: T[] = [];
  mainLoop: for (const item of input) {
    for (const existing of result) {
      if (equals ? equals(item, existing) : item === existing) {
        continue mainLoop;
      }
    }
    result.push(item);
  }
  return result;
}

/** 
 * @internal
 * @example
 * compact([1, undefined, 2, null, 3]); // [1, 2, 3]
 *  */
export function compact<T>(arr: T[]): NonNullable<T>[] {
  return arr.filter((i) => i !== undefined && i !== null) as NonNullable<T>[];
}

/** 
 * @internal
 * @example
 * minBy([{ a: 1 }, { a: 2 }, { a: 3 }], (item) => item.a); // { a: 1 }
 *  */
export function minBy<T>(
  arr: readonly T[],
  fn: (item: T) => number
): T | undefined {
  let min: T | undefined;
  let minVal = Infinity;
  for (const item of arr) {
    const val = fn(item);
    if (val < minVal) {
      min = item;
      minVal = val;
    }
  }
  return min;
}

/**
 * Partitions an array into two arrays, one with items that satisfy the predicate, and one with
 * items that do not.
 *
 * @param arr - The array to partition
 * @param predicate - The predicate to use to partition the array
 * @returns A tuple of two arrays, the first one with items that satisfy the predicate and the
 *   second one with the ones that dont
 * @internal
 * @example
 * partition([1, 2, 3, 4, 5], (item) => item % 2 === 0); // [[2, 4], [1, 3, 5]]
 */
export function partition<T>(
  arr: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const satisfies: T[] = [];
  const doesNotSatisfy: T[] = [];
  for (const item of arr) {
    if (predicate(item)) {
      satisfies.push(item);
    } else {
      doesNotSatisfy.push(item);
    }
  }
  return [satisfies, doesNotSatisfy];
}
