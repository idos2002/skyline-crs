/**
 * Returns the first element of the array, or null if empty.
 * Used to unwrap arrays that could either have one value or be empty.
 *
 * @param arr The array to unwrap.
 * @returns The array's first element, or null if empty.
 */
export default function unwrapArray<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[0];
}
