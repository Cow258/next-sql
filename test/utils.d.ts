import { host } from "../testConfig";
import { user } from "../testConfig";
import { password } from "../testConfig";
import { database } from "../testConfig";
export namespace sqlConfig {
    let defaultHost: string;
    let connectionLimit: number;
    let waitForConnections: boolean;
    let acquireTimeout: number;
    let timeout: number;
    let charset: string;
    let isLog: boolean;
    namespace hosts {
        namespace test {
            export let client: string;
            export { host };
            export { user };
            export { password };
            export { database };
        }
    }
}
export function GetUuid(): string;
export function GetLetter(num: any): string;
export function GenArray(start: any, length: any): any[];
export function Sleep(ms: any): Promise<any>;
export function xLog(obj: any): void;
