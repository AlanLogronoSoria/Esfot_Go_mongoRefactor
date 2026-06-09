declare module 'papaparse' {
  interface ParseConfig<T = unknown> {
    header?: boolean;
    skipEmptyLines?: boolean;
    transformHeader?: (header: string) => string;
    complete?: (results: { data: T[] }) => void;
    error?: (error: Error) => void;
    [key: string]: unknown;
  }

  function parse<T>(input: string, config?: ParseConfig<T>): void;
  export default { parse };
}
