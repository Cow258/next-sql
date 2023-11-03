import { host } from "../testConfig";
import { user } from "../testConfig";
import { password } from "../testConfig";
import { database } from "../testConfig";
export namespace sqlConfig {
    const defaultHost: string;
    const connectionLimit: number;
    const waitForConnections: boolean;
    const acquireTimeout: number;
    const timeout: number;
    const charset: string;
    const isLog: boolean;
    namespace hosts {
        namespace test {
            export const client: string;
            export { host };
            export { user };
            export { password };
            export { database };
        }
    }
}
export function GetUuid(): any;
export function GetLetter(num: any): string;
export function GenArray(start: any, length: any): any[];
export function Sleep(ms: any): Promise<any>;
export function xLog(obj: any): void;
