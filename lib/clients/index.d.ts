declare const _exports: {
    [x: string]: {
        client: any;
        pool: any;
        isLog: boolean;
        isInit: boolean;
        logger: (msg: string) => void;
        init(config: any): void;
        _checkInit(): void;
        getConnection(hostId: string): Promise<any>;
        query(conn: any, sql: string, params: any[], log: boolean): any[];
        getTransaction(conn: any): {
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
