export type xsql = import("./");
export type LogEntry = {
    ts: number;
    cmd: string;
    table?: string | undefined;
    data?: any;
    sql: string;
    params: any[];
    toRaw: () => string;
};
export type TestStore = {
    testId: string;
    conn: any;
    logs: LogEntry[];
};
/** @typedef {import('./')} xsql */
/**
 * @typedef {Object} LogEntry
 * @property {number} ts
 * @property {string} cmd
 * @property {string} [table]
 * @property {any} [data]
 * @property {string} sql
 * @property {any[]} params
 * @property {() => string} toRaw
 */ /** @exports LogEntry */
/**
 * @typedef {Object} TestStore
 * @property {string} testId
 * @property {any} conn
 * @property {LogEntry[]} logs
 */ /** @exports TestStore */
/** @type {AsyncLocalStorage<TestStore>} */
export const als: AsyncLocalStorage<TestStore>;
/**
 * @type {{ [testId: string]: LogEntry[] }}
 */
export const logs: {
    [testId: string]: LogEntry[];
};
/**
 * @returns {TestStore|undefined}
 */
export function getStore(): TestStore | undefined;
/**
 * Fuse: under `__isTesting`, DB work is only allowed inside `mount`.
 * Stale instance: `this.conn` set but not the current store conn.
 *
 * @param {xsql|null} instance
 * @param {typeof import('./')} xsqlFn
 */
export function assertTestingAccess(instance: xsql | null, xsqlFn: typeof import("./")): void;
/**
 * Push a log entry onto the active mount store (array reference).
 *
 * @param {Omit<LogEntry, 'ts'> & { ts?: number }} entry
 */
export function pushLog(entry: Omit<LogEntry, "ts"> & {
    ts?: number;
}): void;
/**
 * @param {typeof import('./')} xsqlFn
 */
export function createTestHook(xsqlFn: typeof import("./")): {
    logs: {
        [testId: string]: LogEntry[];
    };
    mount: (callback: (testId: string) => Promise<void> | void) => Promise<void>;
};
import { AsyncLocalStorage } from "node:async_hooks";
