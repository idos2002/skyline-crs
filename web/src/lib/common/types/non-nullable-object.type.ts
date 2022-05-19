type NoneNullableObject<T> = { [K in keyof T]: NonNullable<T[K]> };

export default NoneNullableObject;
