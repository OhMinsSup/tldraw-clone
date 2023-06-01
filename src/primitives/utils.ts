/**
 * @public */
export const PI = Math.PI;
/**
 * @public
 * @see https://namu.wiki/w/%ED%83%80%EC%9A%B0(%EC%88%98%ED%95%99)
 *  */
export const TAU = PI / 2;
/**
 * @public
 */
export const PI2 = PI * 2;
/**
 * @public
 * @see https://ko.wikipedia.org/wiki/%CE%95
 *  */
export const EPSILON = Math.PI / 180;
/** @public */
export const SIN = Math.sin;

/**
 * Clamp a value into a range.
 * 설정된 이상적인 값을 기준으로 상한과 하한 사이의 값을 고정합니다.
 * @see https://web.dev/i18n/ko/min-max-clamp/
 * @example
 *
 * ```ts
 * const A = clamp(0, 1) // 1
 * ```
 *
 * @param n - The number to clamp.
 * @param min - The minimum value.
 * @public
 */
export function clamp(n: number, min: number): number;
/**
 * Clamp a value into a range.
 *
 * @example
 *
 * ```ts
 * const A = clamp(0, 1, 10) // 1
 * const B = clamp(11, 1, 10) // 10
 * const C = clamp(5, 1, 10) // 5
 * ```
 *
 * @param n - The number to clamp.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @public
 */
export function clamp(n: number, min: number, max: number): number;
export function clamp(n: number, min: number, max?: number): number {
  return Math.max(min, typeof max !== "undefined" ? Math.min(n, max) : n);
}

/**
 * Get a number to a precision.
 *
 * @param n - The number.
 * @param precision - The precision.
 * @public
 * @see https://justinjeong77.tistory.com/25
 */
export function toPrecision(n: number, precision = 10000000000) {
  if (!n) return 0;
  return Math.round(n * precision) / precision;
}

/**
 * Whether two numbers numbers a and b are approximately equal.
 *
 * @param a - The first point.
 * @param b - The second point.
 * @public
 */
export function approximately(a: number, b: number, precision = 0.000001) {
  return Math.abs(a - b) <= precision;
}

/**
 * Find the approximate perimeter of an ellipse.
 *
 * @param rx - The ellipse's x radius.
 * @param ry - The ellipse's y radius.
 * @public
 */
export function perimeterOfEllipse(rx: number, ry: number): number {
  // perimeter = π × (a + b) × [1 + ((3h) / (10 + √(4 - 3h)))]
  const h = Math.pow(rx - ry, 2) / Math.pow(rx + ry, 2);
  // perimeter = π × (a + b) × [1 + ((3h) / (10 + √(4 - 3h)))]
  const p = PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  return p;
}

/**
 * @param a - Any angle in radians
 * @returns A number between 0 and 2 * PI
 * @public
 */
export function canolicalizeRotation(a: number) {
  a = a % PI2;
  if (a < 0) {
    a = a + PI2;
  } else if (a === 0) {
    // prevent negative zero
    a = 0;
  }
  return a;
}

/**
 * Get the short angle distance between two angles.
 *
 * @param a0 - The first angle.
 * @param a1 - The second angle.
 * @public
 */
export function shortAngleDist(a0: number, a1: number): number {
  const da = (a1 - a0) % PI2;
  return ((2 * da) % PI2) - da;
}

/**
 * Get the long angle distance between two angles.
 *
 * @param a0 - The first angle.
 * @param a1 - The second angle.
 * @public
 */
export function longAngleDist(a0: number, a1: number): number {
  return PI2 - shortAngleDist(a0, a1);
}
