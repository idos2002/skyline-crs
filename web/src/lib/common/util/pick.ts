/* eslint-disable  @typescript-eslint/no-explicit-any */

export default function pick<T, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const picked: any = {};

  for (const key of keys) {
    picked[key] = obj[key];
  }

  return picked;
}
