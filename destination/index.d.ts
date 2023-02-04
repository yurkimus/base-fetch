export type PipeParameters = [
    init: Omit<RequestInit, 'headers'>,
    headers: RequestInit['headers']
];
export type Pipe = (...parameters: PipeParameters) => Promise<PipeParameters>;
/**
 * @description Provides a litle bit cleaner syntax when unpucking promise result from the `request`
 */
export declare const unwrap: <T>(parameters: readonly [Response, T]) => T;
/**
 * @description Foundation of making requests
 */
export declare const request: <T>(info: URL, init?: RequestInit) => Promise<readonly [Response, T]>;
/**
 * @description Function that provides a way to pipe request paramteres down to one request with composed `RequestInit` at final request
 */
export declare const pipe: (...pipes: Pipe[]) => <T>(info: URL, init?: RequestInit) => Promise<readonly [Response, T]>;
