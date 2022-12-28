export type RelationOptions = {
    type: ('toOne' | 'toMany' | 'fromOne');
    currentKey: string;
    targetTable: string;
    targetKey: string;
    addonKey: string;
    splitter: string;
    omitMapperKey: boolean;
    filter: (row: ReadResult) => (row: ReadResult) => any;
    query: (q: xSQL) => {};
};
export type xSQL = import('./');
export type ReadResult = import('./array').ReadResult;
/**
 * @this xSQL
 * @param {ReadResult} currentRows
 * @param {xSQL} xSQL
 */
export function _relationFetch(this: import("./"), currentRows: ReadResult, xSQL: xSQL): Promise<any[] | undefined>;
/**
 * @this xSQL
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {string} options.addonKey
 * @param {boolean} options.omitMapperKey
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(q: xSQL) => {}} options.query
 */
export function toOne(this: import("./"), mapper: 'currentKey:targetTable.targetKey', options?: {
    addonKey: string;
    omitMapperKey: boolean;
    filter: (row: ReadResult) => (row: ReadResult) => any;
    query: (q: xSQL) => {};
}): import("./");
/**
 * @this xSQL
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {string} options.addonKey
 * @param {boolean} options.omitMapperKey
 * @param {string} options.splitter
 * @param {(jsonArray: []) => string[]} options.arrayMapper
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(q: xSQL) => {}} options.query
 */
export function toMany(this: import("./"), mapper: 'currentKey:targetTable.targetKey', options?: {
    addonKey: string;
    omitMapperKey: boolean;
    splitter: string;
    arrayMapper: (jsonArray: []) => string[];
    filter: (row: ReadResult) => (row: ReadResult) => any;
    query: (q: xSQL) => {};
}): import("./");
/**
 * @this xSQL
 * @param {string} addonKey
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {boolean} options.omitMapperKey
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(q: xSQL) => {}} options.query
 */
export function fromOne(this: import("./"), addonKey: string, mapper: 'currentKey:targetTable.targetKey', options?: {
    omitMapperKey: boolean;
    filter: (row: ReadResult) => (row: ReadResult) => any;
    query: (q: xSQL) => {};
}): import("./");
