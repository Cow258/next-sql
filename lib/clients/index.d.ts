declare const _exports: {
    [x: string]: {
        client: typeof import("mysql");
        pool: import("mysql").PoolCluster;
        isLog: boolean;
        isInit: boolean;
        logger: (msg: string) => void;
        escape(value: any, stringifyObjects?: boolean | undefined, timeZone?: string | undefined): string;
        init(config: import("mysql").PoolClusterConfig): void;
        _checkInit(): void;
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
    };
};
export = _exports;
