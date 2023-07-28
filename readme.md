# base-fetch

This package is a flexible and customizable tool to handle various types of HTTP requests using fetch. It automatically recognizes MIME types and processes the response accordingly. Use it with ramda to achieve better experience!

## Features

- Written in [ramda](https://ramdajs.com/)
- Can automatically parse the response based on the MIME type.
- Handles multiple MIME types including text, JSON, and media types.
- Throws an error when the response status is not okay (200-299).
- Returns both the response and parsed result.

## Installation

As this is a JavaScript package, ensure that you have Node.js and npm installed. You can then use npm to install this package. You should have Node.js > 18.x if you want to work with fetch.

```bash
npm install base-fetch
```

## Importing

```javascript
import { request, takeResponse, takeParsed } from 'base-fetch'
```

## Usage

The main function exported from this package is request.

`request` takes the same arguments as the built-in fetch function, and returns a Promise that resolves to a tuple of `[Response, Result]``. The Result is the parsed response body.

Here's an example of how to use it:

```javascript
request('https://api.github.com/users/octocat')
  .then(takeParsed)
  .then(console.log)
  .catch(console.error)
```

In this example, request sends a GET request to the GitHub API to get the user data for 'octocat'. The takeParsed function is used to extract the parsed response body (in this case, it's JSON), which is then logged to the console. Any errors that occur during the process are also logged to the console.

## API

The package also exports two helper functions for handling the result of request:

- `takeResponse`: Extracts the Response object from the result of request.
- `takeParsed`: Extracts the parsed response body from the result of request.

## Contributing

If you found a bug or want to propose a feature, feel free to visit the Issues tab and post an issue.

## Examples

### Composing requests

```javascript
import { request, takeParsed } from 'base-fetch'
import { assoc, __, call, pipeWith, andThen } from 'ramda'

const result = { user: null, todo: null }

const getUser = (properties = result) =>
  request('https://jsonplaceholder.typicode.com/users/1')
    .then(takeParsed)
    .then(assoc('user', __, properties))

const getTodo = (properties = result) =>
  request('https://jsonplaceholder.typicode.com/todos/1')
    .then(takeParsed)
    .then(assoc('todo', __, properties))

call(pipeWith(andThen)([getUser, getTodo]))
  .then(console.log) // logs { user: ..., todo: ... }
  .catch(console.error)
```
