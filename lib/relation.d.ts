export type RelationOptions = {
    type?: "toOne" | "toMany" | "fromOne" | undefined;
    currentKey: string;
    targetTable: string;
    targetKey: string;
    addonKey?: string | undefined;
    jsonKeys?: string[] | undefined;
    splitter?: string | undefined;
    omitMapperKey?: boolean | undefined;
    filter?: ((row: ReadResult) => (row: ReadResult) => any) | undefined;
    map?: ((row: ReadResult) => (row: ReadResult) => any) | undefined;
    query?: ((q: xsql) => {}) | undefined;
    /**
     * ) => {}} [override]
     */
    "": (q: xsql, targetIds: [], row: any) => ReadResult;
};
export type xsql = import("./");
export type ReadResult = import("./array").ReadResult;
/**
 * @this xsql
 * @param {ReadResult} currentRows
 * @param {xsql} xsql
 */
export function _relationFetch(this: import("./"), currentRows: ReadResult, xsql: xsql): Promise<any[] | undefined>;
/**
 * @this xsql
 * @template {string} CurrentKey
 * @template {string} TargetTable
 * @template {string} TargetKey
 * @param {`${CurrentKey}:${TargetTable}.${TargetKey}`} mapper
 * @param {Object} [options]
 * @param {string} [options.addonKey]
 * @param {string[]} [options.jsonKeys]
 * @param {boolean} [options.omitMapperKey]
 * @param {(row: ReadResult) => (row: ReadResult)} [options.filter]
 * @param {(row: ReadResult) => (row: ReadResult)} [options.map]
 * @param {(q: xsql) => {}} [options.query]
 * @param {(q: xsql, currentIds: any[], currentRows: any[]) => {}} [options.override]
 */
export function toOne<CurrentKey extends string, TargetTable extends string, TargetKey extends string>(this: import("./"), mapper: `${CurrentKey}:${TargetTable}.${TargetKey}`, options?: {
    addonKey?: string | undefined;
    jsonKeys?: string[] | undefined;
    omitMapperKey?: boolean | undefined;
    filter?: ((row: ReadResult) => (row: ReadResult) => any) | undefined;
    map?: ((row: ReadResult) => (row: ReadResult) => any) | undefined;
    query?: ((q: xsql) => {}) | undefined;
    override?: ((q: xsql, currentIds: any[], currentRows: any[]) => {}) | undefined;
}): import("./");
/**
 * @this xsql
 * @template {string} CurrentKey
 * @template {string} TargetTable
 * @template {string} TargetKey
 * @param {`${CurrentKey}:${TargetTable}.${TargetKey}`} mapper
 * @param {Object} [options]
 * @param {string} [options.addonKey]
 * @param {string[]} [options.jsonKeys]
 * @param {boolean} [options.omitMapperKey]
 * @param {string} [options.splitter]
 * @param {(jsonArray: []) => string[]} [options.arrayMapper]
 * @param {(row: ReadResult) => (row: ReadResult)} [options.filter]
 * @param {(row: ReadResult) => (row: ReadResult)} [options.map]
 * @param {(q: xsql) => {}} [options.query]
 * @param {(q: xsql, currentIds: any[], currentRows: any[]) => {}} [options.override]
 */
export function toMany<CurrentKey extends string, TargetTable extends string, TargetKey extends string>(this: import("./"), mapper: `${CurrentKey}:${TargetTable}.${TargetKey}`, options?: {
    addonKey?: string | undefined;
    jsonKeys?: string[] | undefined;
    omitMapperKey?: boolean | undefined;
    splitter?: string | undefined;
    arrayMapper?: ((jsonArray: []) => string[]) | undefined;
    filter?: ((row: ReadResult) => (row: ReadResult) => any) | undefined;
    map?: ((row: ReadResult) => (row: ReadResult) => any) | undefined;
    query?: ((q: xsql) => {}) | undefined;
    override?: ((q: xsql, currentIds: any[], currentRows: any[]) => {}) | undefined;
}): import("./");
/**
 * @this xsql
 * @template {string} CurrentKey
 * @template {string} TargetTable
 * @template {string} TargetKey
 * @param {string} addonKey
 * @param {`${CurrentKey}:${TargetTable}.${TargetKey}`} mapper
 * @param {Object} [options]
 * @param {string[]} [options.jsonKeys]
 * @param {boolean} [options.omitMapperKey]
 * @param {(row: ReadResult) => (row: ReadResult)} [options.filter]
 * @param {(row: ReadResult) => (row: ReadResult)} [options.map]
 * @param {(q: xsql) => {}} [options.query]
 * @param {(q: xsql, currentIds: any[], currentRows: any[]) => {}} [options.override]
 */
export function fromOne<CurrentKey extends string, TargetTable extends string, TargetKey extends string>(this: import("./"), addonKey: string, mapper: `${CurrentKey}:${TargetTable}.${TargetKey}`, options?: {
    jsonKeys?: string[] | undefined;
    omitMapperKey?: boolean | undefined;
    filter?: ((row: ReadResult) => (row: ReadResult) => any) | undefined;
    map?: ((row: ReadResult) => (row: ReadResult) => any) | undefined;
    query?: ((q: xsql) => {}) | undefined;
    override?: ((q: xsql, currentIds: any[], currentRows: any[]) => {}) | undefined;
}): import("./");
