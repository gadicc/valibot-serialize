export interface Formatter {
  name: string;
  test(): boolean | Promise<boolean>;
  format(input: string): string | Promise<string>;
}
