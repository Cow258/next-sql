export type xSQL = import('./');
export type Command = ("read" | "update" | "insert" | "delete" | "batchInsert");
export type OkPacket = any;
/**
   * @private
   * @this xSQL
   * @param {Command} cmd
   * @returns {Promise<ReadResult>}
   */
export function _runCommand(this: import("./"), cmd: Command, table: any, data: any, options: any, xSQL: any): Promise<ReadResult>;
/**
 * Read table from database
 * @this xSQL
 * @param {string} table
 * @param {Object} options
 * @param {string[]} options.jsonKeys
 * @returns {Promise<ReadResult>}
 */
export function Read(this: import("./"), table: string, options: {
    jsonKeys: string[];
}): Promise<ReadResult>;
/**
 * Delete rows from table
 * @this xSQL
 * @param {string} table
 * @returns {Promise<OkPacket>}
 */
export function Delete(this: import("./"), table: string): Promise<OkPacket>;
/**
 * Update row from table
 * @this xSQL
 * @param {string} table
 * @param {Object} options
 * @param {string[]} options.sumKeys
 * @param {string[]} options.jsonKeys
 * @returns {Promise<OkPacket>}
 */
export function Update(this: import("./"), table: string, data: any, options: {
    sumKeys: string[];
    jsonKeys: string[];
}): Promise<OkPacket>;
/**
 * Insert a row into table
 * @this xSQL
 * @param {string} table
 * @param {Object} options
 * @param {string[]} options.jsonKeys
 * @returns {Promise<OkPacket>}
 */
export function Insert(this: import("./"), table: string, data: any, options: {
    jsonKeys: string[];
}): Promise<OkPacket>;
/**
 * BatchInsert Insert a row into table
 * @this xSQL
 * @param {string} table
 * @param {Object} options
 * @param {string[]} options.primaryKeys
 * @param {string[]} options.sumKeys
 * @param {string[]} options.jsonKeys
 * @returns {Promise<void>}
 */
export function BatchInsert(this: import("./"), table: string, data: any, options: {
    primaryKeys: string[];
    sumKeys: string[];
    jsonKeys: string[];
}): Promise<void>;
import { ReadResult } from "./array";
