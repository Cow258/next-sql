export type xsql = import("./");
export type Command = ("read" | "update" | "insert" | "delete" | "batchInsert");
/**
   * @private
   * @this xsql
   * @param {Command} cmd
   * @returns {Promise<ReadResult>}
   */
export function _runCommand(this: import("./"), cmd: Command, table: any, data: any, options: any, xsql: any): Promise<ReadResult>;
/**
 * Read table from database
 * @this xsql
 * @template RowType
 * @param {string} table
 * @param {Object} [options]
 * @param {string[]} [options.jsonKeys]
 * @returns {Promise<ReadResultType<RowType>>}
 */
export function Read<RowType>(this: import("./"), table: string, options?: {
    jsonKeys?: string[] | undefined;
}): Promise<ReadResultType<RowType>>;
/**
 * Delete rows from table
 * @this xsql
 * @param {string} table
 * @returns {Promise<ResultSetHeader>}
 */
export function Delete(this: import("./"), table: string): Promise<ResultSetHeader>;
/**
 * Update row from table
 * @this xsql
 * @param {string} table
 * @param {Object} [options]
 * @param {string[]} [options.sumKeys]
 * @param {string[]} [options.jsonKeys]
 * @returns {Promise<ResultSetHeader>}
 */
export function Update(this: import("./"), table: string, data: any, options?: {
    sumKeys?: string[] | undefined;
    jsonKeys?: string[] | undefined;
}): Promise<ResultSetHeader>;
/**
 * Insert a row into table
 * @this xsql
 * @param {string} table
 * @param {Object} [options]
 * @param {string[]} [options.jsonKeys]
 * @returns {Promise<ResultSetHeader>}
 */
export function Insert(this: import("./"), table: string, data: any, options?: {
    jsonKeys?: string[] | undefined;
}): Promise<ResultSetHeader>;
/**
 * BatchInsert Insert a row into table
 * @this xsql
 * @param {string} table
 * @param {Object} [options]
 * @param {string[]} [options.primaryKeys]
 * @param {string[]} [options.sumKeys]
 * @param {string[]} [options.jsonKeys]
 * @returns {Promise<void>}
 */
export function BatchInsert(this: import("./"), table: string, data: any, options?: {
    primaryKeys?: string[] | undefined;
    sumKeys?: string[] | undefined;
    jsonKeys?: string[] | undefined;
}): Promise<void>;
import { ReadResult } from "./array";
import type { ReadResultType } from './array';
import type { ResultSetHeader } from 'mysql2';
