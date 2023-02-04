export type PipeParameters = [
  init: Omit<RequestInit, 'headers'>,
  headers: RequestInit['headers']
]

export type Pipe = (...parameters: PipeParameters) => Promise<PipeParameters>

const mime = (response: Response) =>
  response.headers.get('content-type')?.split(';')[0]

const text = (response: Response) => {
  const clone = response.clone()

  return response.text().then(value => [clone, value] as const)
}

const json = (response: Response) => {
  const clone = response.clone()

  return response.json().then(value => [clone, value] as const)
}

const empty = (response: Response) =>
  Promise.resolve([response, undefined] as const)

const parse = (response: Response) => {
  switch (mime(response)) {
    case 'text/html':
    case 'text/plain':
      return text(response)

    case 'application/json':
      return json(response)

    default:
      return empty(response)
  }
}

const decide = (parameters: readonly [Response, any]) => {
  const [response] = parameters

  if (response.ok) {
    return parameters
  } else {
    throw parameters
  }
}

/**
 * @description Provides a litle bit cleaner syntax when unpucking promise result from the `request`
 */
export const unwrap = <T>(parameters: readonly [Response, T]) => parameters[1]

/**
 * @description Foundation of making requests
 */
export const request = <T>(
  info: URL,
  init?: RequestInit
): Promise<readonly [Response, T]> => fetch(info, init).then(parse).then(decide)

/**
 * @description Function that provides a way to pipe request paramteres down to one request with composed `RequestInit` at final request
 */
export const pipe =
  (...pipes: Pipe[]) =>
  <T>(info: URL, init: RequestInit = {}) => {
    if (pipes.length < 1) {
      throw new Error('`...pipes` length is less then 1!')
    }

    const { headers: initialHeaders, ...initialInit } = init

    const chain = (piped: Promise<PipeParameters>, pipe: Pipe) =>
      piped.then(parameters => pipe(...parameters))

    const head = pipes[0]!
    const tail = pipes.slice(1)

    return tail.reduce(chain, head({}, undefined)).then(([init, headers]) =>
      request<T>(info, {
        ...initialInit,
        ...init,
        headers: new Headers([
          ...new Headers(initialHeaders),
          ...new Headers(headers),
        ]),
      })
    )
  }
