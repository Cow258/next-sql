declare const _exports: {
    [x: string]: {
        client: typeof import("mysql");
        pool: import("mysql").PoolCluster;
        isLog: boolean;
        isInit: boolean;
        logger: (msg: string) => void;
        escape(value: any, stringifyObjects?: boolean | undefined, timeZone?: string | undefined): string;
        escapeId(value: string, forbidQualified?: boolean | undefined): string;
        init(config: import("mysql").PoolClusterConfig): void;
        close(): Promise<any>;
        _checkInit(): Promise<void>;
        getConnection(hostId: string): Promise<import("mysql").PoolConnection>;
        query(conn: import("mysql").PoolConnection, sql: string, params: any[], log: boolean): any[];
        getTransaction(conn: import("mysql").PoolConnection): {
            beginTransaction(): Promise<any>;
            commit(): Promise<any>;
            rollback(): Promise<any>;
            release(): void;
        };
        toStatement(cmd: import("../command").Command, table: string, state: import("..").State, data: any, options?: {
            primaryKeys: Set<any>;
            sumKeys: Set<any>;
            jsonKeys: string[];
        }): [sql: string, params: any[]];
        toRaw(sql: string, params: any[]): string;
    } | {
        client: typeof import("mysql2");
        pool: import("mysql2").PoolCluster;
        isLog: boolean;
        isInit: boolean;
        logger: (msg: string) => void;
        escape(value: any): string;
        escapeId(value: any): string;
        init(config: any): void;
        close(): Promise<any>;
        _checkInit(): Promise<void>;
        getConnection(hostId: string): Promise<import("mysql2").PoolConnection>;
        query(conn: import("mysql2").PoolConnection, sql: string, params: any[], log: boolean): any[];
        getTransaction(conn: import("mysql2").PoolConnection): {
            beginTransaction(): Promise<any>;
            commit(): Promise<any>;
            rollback(): Promise<any>;
            release(): void;
        };
        toStatement(cmd: import("../command").Command, table: string, state: import("..").State, data: any, options?: {
            primaryKeys: Set<any>;
            sumKeys: Set<any>;
            jsonKeys: string[];
        }): [sql: string, params: any[]];
        toRaw(sql: string, params: any[]): string;
    } | {
        client: typeof import("@planetscale/database");
        pool: Map<string, import("@planetscale/database").Connection>;
        isLog: boolean;
        isInit: boolean;
        logger: (msg: string) => void;
        init(config: databaseJs.ConfigOptions): void;
        close(): null;
        _checkInit(): Promise<void>;
        getConnection(hostId: string): Promise<import("@planetscale/database").Connection>;
        query(conn: import("@planetscale/database").Connection, sql: string, params: any[], log: boolean): any[];
        getTransaction(conn: import("@planetscale/database").Connection): Promise<any>;
        toStatement(cmd: import("../command").Command, table: string, state: import("..").State, data: any, options?: {
            primaryKeys: Set<any>;
            sumKeys: Set<any>;
            jsonKeys: string[];
        }): [sql: string, params: any[]];
        toRaw(sql: string, params: any[]): string;
    };
};
export = _exports;
import databaseJs = require("./database-js");
