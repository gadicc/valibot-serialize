export function cloneSerializable<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch (_error) {
    throw new Error(
      "Unsupported default value: must be structured-cloneable",
    );
  }
}

export function valueToCode(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch (_error) {
    throw new Error("Unsupported default value: must be JSON serializable");
  }
}
