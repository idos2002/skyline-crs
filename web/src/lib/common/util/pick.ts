export default function pick<T, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const picked: any = {};

  for (const key of keys) {
    picked[key] = obj[key];
  }

  return picked;
}
