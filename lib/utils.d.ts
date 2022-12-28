/**
 * Convert object to JSON string
 * @param {Object} data
 * @param {string[]} jsonKeys
 */
export function objectToJson(data: any, jsonKeys: string[]): any;
/**
 * Parse JSON string to js object
 * @param {Object} data
 * @param {string[]} [jsonKeys]
 */
export function parseJson(data: any, jsonKeys?: string[] | undefined): any;
