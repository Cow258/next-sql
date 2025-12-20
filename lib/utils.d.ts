/**
 * Convert object to JSON string
 * @param {Object} data
 * @param {string[]} jsonKeys
 * @param {Record<string, 'object' | 'array'>} jsonMap
 * @returns {[any, { [jsonKey: string]: 'object' | 'array' }]}
 */
export function objectToJson(data: any, jsonKeys: string[], jsonMap: Record<string, "object" | "array">): [any, {
    [jsonKey: string]: "object" | "array";
}];
/**
 * Parse JSON string to js object
 * @param {Object} data
 * @param {string[]} [jsonKeys]
 */
export function parseJson(data: any, jsonKeys?: string[]): any;
export function getByString(obj: any, path?: string): any;
