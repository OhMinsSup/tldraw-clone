const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

export const nanoid = () => {
  const arr = new Uint8Array(21);
  crypto.getRandomValues(arr);
  return encode(arr);
};

const encode = (arr: Uint8Array) => {
  let s = "";
  for (let i = 0; i < arr.length; i++) {
    s += ALPHABET.charAt(arr[i] % 64);
  }
  return s;
};
