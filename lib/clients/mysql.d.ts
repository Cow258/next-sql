export = mysql;
declare namespace mysql {
    export { xsql, Conditions, State, Command, mysql, PoolCluster, PoolClusterConfig, PoolConnection, OkPacket, escape, escapeId, Row, Filter, QueryReturn };
}
type xsql = import('../index');
type Conditions = import('../index').Conditions;
type State = import('../index').State;
type Command = import('../index').Command;
type mysql = typeof import("mysql");
type PoolCluster = import('mysql').PoolCluster;
type PoolClusterConfig = import('mysql').PoolClusterConfig;
type PoolConnection = import('mysql').PoolConnection;
type OkPacket = import('mysql').OkPacket;
type escape = typeof import("mysql").escape;
type escapeId = typeof import("mysql").escapeId;
type Row = {
    [field: string]: string | number | boolean | Buffer | Date;
};
type Filter = (row: Row) => Row[];
type QueryReturn = Promise<Row[] | OkPacket>;
