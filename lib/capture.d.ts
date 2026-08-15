export type CaptureStatement = {
    cmd: string;
    table?: string | undefined;
    sql: string;
    params: any[];
    toRaw: () => string;
};
export type CaptureExecutorContext = {
    cmd: string;
    table?: string | undefined;
    sql: string;
    params: any[];
    toRaw: () => string;
    data?: any;
};
export type CaptureExecutor = (ctx: CaptureExecutorContext) => Promise<any[] | OkPacket> | any[] | OkPacket;
export type CaptureXsql = typeof import("./index") & {
    statements: CaptureStatement[];
};
export type xsql = import("./");
export type OkPacket = import("./index").OkPacket;
/**
 * @param {xsql} xsql
 * @param {CaptureExecutor} executor
 * @returns {CaptureXsql}
 */
export function createCapture(xsql: xsql, executor: CaptureExecutor): CaptureXsql;
/**
 * @param {Record<string, object[]>} seed
 * @returns {CaptureExecutor}
 */
export function createTablesExecutor(seed: Record<string, object[]>): CaptureExecutor;
