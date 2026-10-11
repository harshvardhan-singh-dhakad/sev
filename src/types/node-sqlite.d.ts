declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean; enableForeignKeyConstraints?: boolean });
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }

  export class StatementSync {
    all(...namedParameters: unknown[]): unknown[];
    get(...namedParameters: unknown[]): unknown;
    run(...namedParameters: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  }
}
