export type ReadResultType<RowType> = Array<RowType> & {
    eof: boolean;
    pagination: PaginationResult;
};
export type PaginationResult = import("./pagination").PaginationResult;
/** @typedef {import('./pagination').PaginationResult} PaginationResult */
export class Statement extends Array<any> {
    constructor({ array, toRaw }: {
        array: any;
        toRaw: any;
    });
    /** @returns {string} */
    toRaw(): string;
}
export class ReadResult extends Array<any> {
    constructor({ array, eof, pagination }: {
        array: any;
        eof: any;
        pagination: any;
    });
    /** @type {boolean} */
    eof: boolean;
    /** @type {PaginationResult} */
    pagination: PaginationResult;
}
/**
 * @template RowType
 * @typedef {Array<RowType> & { eof: boolean, pagination: PaginationResult }} ReadResultType
 */ /** @exports ReadResultType */
/** @param {any[]} ary */
export function getLastItem(ary: any[]): any;
