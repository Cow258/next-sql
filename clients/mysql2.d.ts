export = mysql2;
declare namespace mysql2 {
    export { xsql, Conditions, State, Command, mysql2, PoolCluster, PoolClusterConfig, PoolConnection, OkPacket, escape, escapeId, Row, Filter, QueryReturn };
}
type xsql = import('../index');
type Conditions = import('../index').Conditions;
type State = import('../index').State;
type Command = import('../index').Command;
type mysql2 = typeof import("mysql2");
type PoolCluster = import('mysql2').PoolCluster;
type PoolClusterConfig = import('mysql2').PoolClusterConfig;
type PoolConnection = import('mysql2').PoolConnection;
type OkPacket = import('mysql2').OkPacket;
type escape = typeof import("mysql2").escape;
type escapeId = typeof import("mysql2").escapeId;
type Row = {
    [field: string]: string | number | boolean | Buffer | Date;
};
type Filter = (row: Row) => Row[];
type QueryReturn = Promise<Row[] | OkPacket>;
