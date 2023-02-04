# Fetch-based wrapper!

Requires NodeJS v17.5.0 or newer.

## Installation

```
npm install base-fetch
```

## Documentation

If you are using typescript, the following libraries should be provided in your tsconfig file: `"DOM", "DOM.Iterable", "ES2015"`

### [Core](#core-1)

- [`request`](#request)

### [Addon](#addon-1)

- [`pipe`](#pipe)

### [Utilities](#utilities-1)

- [`unwrap`](#unwrap)

You can use dev tools to test following example.
Do not forget to include `request` function into you environment (browser, node...) and then the rest of the items if needed, such as `unwrap` for example

Example requests can be done at `https://jsonplaceholder.typicode.com`

Use this helper:

```typescript
const base = new URL('https://jsonplaceholder.typicode.com')
```

### Basic usage example in browser or node runtimes

```typescript
import { request, unwrap } from 'base-fetch'

const url = new URL('todos', base)

request(url)
  .then(unwrap)
  .then(console.log)
  .catch(reason => console.error(reason))
```

### Providing type information

```typescript
interface Shape {
  id: number
}

request<Shape>(url)
  .then(unwrap)
  .then(value => value.id)
```

## Core

### `request`

Request from from the given resource.

Learn:

- Request (`RequestInfo` and `RequestInit` are typescript definitions)
  - [at MDN](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request)

#### example

```typescript
const url = new URL('todos', base)

request('https://jsonplaceholder.typicode.com/todos')

request(url, { method: 'GET' })

request(url, { method: 'POST', body: JSON.stringify({}) })

request(url, { method: 'PUT', body: new FormData() })

request(url, { method: 'DELETE', signal: new AbortController().signal })

request(url, { method: 'PATCH', credentials: 'include' })
```

## Addon

### `pipe`

Function that provides a way to compose foundamental requets down to one request with composed `RequestInit` at finale. Resulted request will have all `x----` headers we providing with the pipe contract.

While iterating over functions provided into `pipe` we have access to the sequentially derived parameters that we can pass into the next request call or return.

#### example

```typescript
const withPost: Pipe = (init, headers) =>
  request(new URL('posts/1', base))
    .then(take)
    .then(value => [
      init,
      new Headers([
        ...new Headers(headers),
        ...new Headers([['x----post----x', JSON.stringify(value)]]),
      ]),
    ])

const withUser: Pipe = (init, headers) =>
  request(new URL('users/1', base))
    .then(take)
    .then(value => [
      init,
      new Headers([
        ...new Headers(headers),
        ...new Headers([['x----user----x', JSON.stringify(value)]]),
      ]),
    ])

const withTodo: Pipe = (init, headers) =>
  request(new URL('todos/1', base))
    .then(take)
    .then(value => [
      init,
      new Headers([
        ...new Headers(headers),
        ...new Headers([['x----todo----x', JSON.stringify(value)]]),
      ]),
    ])

const pipedRequest = pipe(withPost, withUser, withTodo)

const response = pipedRequest(new URL('albums/1', base))
  .then(unwrap)
  .then(value => console.log(value))
```

## Utilities

### `unwrap`

Simple functions taht provides a little bit more cleaner syntax when working with request's return value

#### example

```typescript
request(url)
  .then(unwrap)
  .then(value => value)
```
