export type RelationOptions = {
    type: ('toOne' | 'toMany' | 'fromOne');
    currentKey: string;
    targetTable: string;
    targetKey: string;
    addonKey: string;
    jsonKeys: string[];
    splitter: string;
    omitMapperKey: boolean;
    filter: (row: ReadResult) => (row: ReadResult) => any;
    map: (row: ReadResult) => (row: ReadResult) => any;
    query: (q: xsql) => {};
    override: (q: xsql, targetIds: [], row: any, ReadResult: any) => {};
};
export type xsql = import('./');
export type ReadResult = import('./array').ReadResult;
/**
 * @this xsql
 * @param {ReadResult} currentRows
 * @param {xsql} xsql
 */
export function _relationFetch(this: import("./"), currentRows: ReadResult, xsql: xsql): Promise<any[] | undefined>;
/**
 * @this xsql
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {string} options.addonKey
 * @param {string[]} options.jsonKeys
 * @param {boolean} options.omitMapperKey
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(row: ReadResult) => (row: ReadResult)} options.map
 * @param {(q: xsql) => {}} options.query
 * @param {(q: xsql, currentIds: any[], currentRows: any[]) => {}} options.override
 */
export function toOne(this: import("./"), mapper: 'currentKey:targetTable.targetKey', options?: {
    addonKey: string;
    jsonKeys: string[];
    omitMapperKey: boolean;
    filter: (row: ReadResult) => (row: ReadResult) => any;
    map: (row: ReadResult) => (row: ReadResult) => any;
    query: (q: xsql) => {};
    override: (q: xsql, currentIds: any[], currentRows: any[]) => {};
}): import("./");
/**
 * @this xsql
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {string} options.addonKey
 * @param {string[]} options.jsonKeys
 * @param {boolean} options.omitMapperKey
 * @param {string} options.splitter
 * @param {(jsonArray: []) => string[]} options.arrayMapper
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(row: ReadResult) => (row: ReadResult)} options.map
 * @param {(q: xsql) => {}} options.query
 * @param {(q: xsql, currentIds: any[], currentRows: any[]) => {}} options.override
 */
export function toMany(this: import("./"), mapper: 'currentKey:targetTable.targetKey', options?: {
    addonKey: string;
    jsonKeys: string[];
    omitMapperKey: boolean;
    splitter: string;
    arrayMapper: (jsonArray: []) => string[];
    filter: (row: ReadResult) => (row: ReadResult) => any;
    map: (row: ReadResult) => (row: ReadResult) => any;
    query: (q: xsql) => {};
    override: (q: xsql, currentIds: any[], currentRows: any[]) => {};
}): import("./");
/**
 * @this xsql
 * @param {string} addonKey
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {string[]} options.jsonKeys
 * @param {boolean} options.omitMapperKey
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(row: ReadResult) => (row: ReadResult)} options.map
 * @param {(q: xsql) => {}} options.query
 * @param {(q: xsql, currentIds: any[], currentRows: any[]) => {}} options.override
 */
export function fromOne(this: import("./"), addonKey: string, mapper: 'currentKey:targetTable.targetKey', options?: {
    jsonKeys: string[];
    omitMapperKey: boolean;
    filter: (row: ReadResult) => (row: ReadResult) => any;
    map: (row: ReadResult) => (row: ReadResult) => any;
    query: (q: xsql) => {};
    override: (q: xsql, currentIds: any[], currentRows: any[]) => {};
}): import("./");
