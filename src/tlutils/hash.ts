/**
 * Hash a string using the FNV-1a algorithm.
 *
 * @public
 * @example
 * getHashForString("hello world"); // "1794106052"
 */
export function getHashForString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash + "";
}

/**
 * Hash a string using the FNV-1a algorithm.
 *
 * @public
 * @example
 * getHashForString({ data: "hello world" }); // "417085702"
 */
export function getHashForObject(obj: any) {
  return getHashForString(JSON.stringify(obj));
}

/** 
 * @description lns algorithm
 * @public
 * @example
 * lns("1234567890"); // "8760432159"
 *  */
export function lns(str: string) {
  const result = str.split("");
  result.push(...result.splice(0, Math.round(result.length / 5)));
  result.push(...result.splice(0, Math.round(result.length / 4)));
  result.push(...result.splice(0, Math.round(result.length / 3)));
  result.push(...result.splice(0, Math.round(result.length / 2)));
  return result
    .reverse()
    .map((n) => (+n ? (+n < 5 ? 5 + +n : +n > 5 ? +n - 5 : n) : n))
    .join("");
}
