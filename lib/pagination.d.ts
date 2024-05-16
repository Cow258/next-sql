export type xsql = import('./');
export type State = import('./').State;
export type ReadResult = import("./array").ReadResult<any>;
export type PaginationOptions = {
    /**
     * [Default: 1] The current page
     */
    currPage: number;
    /**
     * [Default: 10] How many rows pre each page
     */
    rowStep: number;
    /**
     * [Default: 4] How many pages will shown on the navigation bar
     */
    navStep: number;
    /**
     * Database start index
     */
    aLimit: number;
    /**
     * Database end index
     */
    bLimit: number;
    /**
     * Page start index
     */
    aPage: number;
    /**
     * Page end index
     */
    bPage: number;
};
export type PaginationNavButton = {
    page: number;
    enable: boolean;
    className: string;
};
export type PaginationResult = {
    isOutOfRange: boolean;
    currPage: number;
    rowStep: number;
    navStep: number;
    row: {
        from: number;
        to: number;
    };
    page: {
        from: number;
        current: number;
        to: number;
        hasPrev: boolean;
        hasNext: boolean;
    };
    nav: {
        hasPrev: boolean;
        hasNext: boolean;
        buttons: PaginationNavButton[];
    };
};
/**
 * @memberof xsql
 * @this xsql
 * @param {PaginationOptions} options
 * @returns {xsql}
 */
export function pagination(this: import("./"), options: PaginationOptions): xsql;
/** @this xsql */
export function paginationBefore(this: import("./")): void;
/**
 * @this xsql
 * @param {ReadResult} rows
 * @param {State} state
 */
export function paginationAfter(this: import("./"), rows: import("./array").ReadResult<any>, state: State): {
    paginationRows: any[];
    paginationResult: {
        isOutOfRange: boolean;
        currPage: number;
        rowStep: number;
        navStep: number;
        row: {
            record: {
                from: number;
                to: number;
            };
            index: {
                from: number;
                to: number;
            };
        };
        page: {
            from: number;
            current: number;
            to: number;
            hasPrev: boolean;
            hasNext: boolean;
        };
        nav: {
            current: number;
            hasPrev: boolean;
            hasNext: boolean;
        };
    };
};
