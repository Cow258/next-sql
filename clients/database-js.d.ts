export type xsql = import('../index');
export type Conditions = import('../index').Conditions;
export type State = import('../index').State;
export type Command = import('../index').Command;
export type database = typeof import("@planetscale/database");
export type Connection = import('@planetscale/database').Connection;
export type ExecutedQuery = import('@planetscale/database').ExecutedQuery;
export type escape = any;
export type escapeId = any;
export type Row = {
    [field: string]: string | number | boolean | Buffer | Date;
};
export type Filter = (row: Row) => Row[];
export type QueryReturn = Promise<Row[] | ExecutedQuery>;
export type HostOptions = {
    client: "database-js";
    host: string;
    user: string;
    password: string;
    database: string;
};
export type ConfigOptions = {
    isLog: boolean;
    logger: () => {};
    pools: {
        [x: string]: HostOptions;
    };
};
