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

export function pipe<First>(
  first: () => Promise<First>
): (initial: Promise<any>) => Promise<First>

export function pipe<First, Second>(
  first: () => Promise<First>,
  second: () => Promise<Second>
): (initial: Promise<any>) => Promise<First & Second>

export function pipe<First, Second, Third>(
  first: () => Promise<First>,
  second: () => Promise<Second>,
  third: () => Promise<Third>
): (initial: Promise<any>) => Promise<First & Second & Third>

export function pipe<First, Second, Third, Fourth>(
  first: () => Promise<First>,
  second: () => Promise<Second>,
  third: () => Promise<Third>,
  fourth: () => Promise<Fourth>
): (initial: Promise<any>) => Promise<First & Second & Third & Fourth>

/**
 * @description Function that provides a way to pipe request requests responses down to one promise
 */
export function pipe(...pipes: (() => Promise<any>)[]) {
  const chain = (previous: Promise<any>, next: () => Promise<any>) =>
    previous.then(composed =>
      next().then(response => ({
        ...composed,
        ...response,
      }))
    )

  return (initial: Promise<object>) => pipes.reduce(chain, initial) as any
}
