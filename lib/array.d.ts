export type PaginationResult = import('./pagination').PaginationResult;
/** @typedef {import('./pagination').PaginationResult} PaginationResult */
export class Statement extends Array<any> {
    constructor({ array, toRaw }: {
        array: any;
        toRaw: any;
    });
    /** @returns {string} */
    toRaw(): string;
}
/**
 * @template T
 */
export class ReadResult<T> extends Array<any> {
    /**
     * @param {{ array: T[], eof: boolean, pagination: PaginationResult }} param0
     */
    constructor({ array, eof, pagination }: {
        array: T[];
        eof: boolean;
        pagination: PaginationResult;
    });
    /** @type {boolean} */
    eof: boolean;
    /** @type {PaginationResult} */
    pagination: PaginationResult;
}
/** @param {any[]} ary */
export function getLastItem(ary: any[]): any;
