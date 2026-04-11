export type xsql = import("./");
export type State = import("./").State;
export type ReadResult = import("./array").ReadResult;
export type PaginationOptions = {
    /**
     * [Default: 1] The current page
     */
    currPage?: number | undefined;
    /**
     * [Default: 10] How many rows pre each page
     */
    rowStep?: number | undefined;
    /**
     * [Default: 4] How many pages will shown on the navigation bar
     */
    navStep?: number | undefined;
    /**
     * Database start index
     */
    aLimit?: number | undefined;
    /**
     * Database end index
     */
    bLimit?: number | undefined;
    /**
     * Page start index
     */
    aPage?: number | undefined;
    /**
     * Page end index
     */
    bPage?: number | undefined;
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
export function paginationAfter(this: import("./"), rows: ReadResult, state: State): {
    paginationRows: any[];
    paginationResult: {
        isOutOfRange: boolean;
        currPage: number | undefined;
        rowStep: number | undefined;
        navStep: number | undefined;
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
            from: number | undefined;
            current: number | undefined;
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
