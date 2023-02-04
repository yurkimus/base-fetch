var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const mime = (response) => { var _a; return (_a = response.headers.get('content-type')) === null || _a === void 0 ? void 0 : _a.split(';')[0]; };
const text = (response) => {
    const clone = response.clone();
    return response.text().then(value => [clone, value]);
};
const json = (response) => {
    const clone = response.clone();
    return response.json().then(value => [clone, value]);
};
const empty = (response) => Promise.resolve([response, undefined]);
const parse = (response) => {
    switch (mime(response)) {
        case 'text/html':
        case 'text/plain':
            return text(response);
        case 'application/json':
            return json(response);
        default:
            return empty(response);
    }
};
const decide = (parameters) => {
    const [response] = parameters;
    if (response.ok) {
        return parameters;
    }
    else {
        throw parameters;
    }
};
/**
 * @description Provides a litle bit cleaner syntax when unpucking promise result from the `request`
 */
export const unwrap = (parameters) => parameters[1];
/**
 * @description Foundation of making requests
 */
export const request = (info, init) => fetch(info, init).then(parse).then(decide);
/**
 * @description Function that provides a way to pipe request paramteres down to one request with composed `RequestInit` at final request
 */
export const pipe = (...pipes) => (info, init = {}) => {
    if (pipes.length < 1) {
        throw new Error('`...pipes` length is less then 1!');
    }
    const { headers: initialHeaders } = init, initialInit = __rest(init, ["headers"]);
    const chain = (piped, pipe) => piped.then(parameters => pipe(...parameters));
    const head = pipes[0];
    const tail = pipes.slice(1);
    return tail.reduce(chain, head({}, undefined)).then(([init, headers]) => request(info, Object.assign(Object.assign(Object.assign({}, initialInit), init), { headers: new Headers([
            ...new Headers(initialHeaders),
            ...new Headers(headers),
        ]) })));
};
