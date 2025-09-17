export interface HandlerTransformResult {
  exports?: Record<string, string | null>;
  typeExports?: Record<string, string | null>;
}

export interface Handler {
  name: string;
  available(): boolean | Promise<boolean>;
  test(object: unknown): boolean | Promise<boolean>;
  transform(
    symbol: string,
    object: unknown,
  ): HandlerTransformResult | Promise<HandlerTransformResult>;
}
