import {
  T,
  __,
  always,
  any,
  cond,
  defaultTo,
  head,
  includes,
  invoker,
  juxt,
  pathEq,
  pipe,
  prop,
  split,
  unless,
} from 'ramda'

const text = [
  'text/plain',
  'text/html',
  'text/css',
  'application/xml',
  'application/x-www-form-urlencoded',
  'application/xml-dtd',
  'application/atom+xml',
  'application/rss+xml',
  'application/x-javascript',
]

const json = [
  'application/json',
  'application/ld+json',
  'application/json-patch+json',
  'application/vnd.api+json',
  'application/csp-report',
]

const media = [
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'video/mp4',
  'video/ogg',
  'video/webm',
  'image/jpeg',
  'image/png',
  'image/gif',
]

const raise = (error: any) => {
  throw error
}

const mime = pipe<[Response], Headers, string, string, string[], string>(
  prop('headers'),
  invoker(1, 'get')('Content-Type'),
  defaultTo(''),
  split(';'),
  head
)

const isMime = (types: string[]) =>
  pipe<[Response], string, (args_0: string) => boolean, boolean>(
    mime,
    includes,
    any(__, types)
  )

const clone = (as: (...args: any) => any) => juxt([invoker(0, 'clone'), as])

export const takeResponse = <Result extends any>(result: [Response, Result]) =>
  result[0]

export const takeParsed = <Result extends any>(result: [Response, Result]) =>
  result[1]

export const request = <Result extends unknown>(
  ...args: Parameters<typeof fetch>
): Promise<[Response, Result]> =>
  fetch(...args)
    .then(
      cond([
        [isMime(text), clone(invoker(0, 'text'))],
        [isMime(json), clone(invoker(0, 'json'))],
        [isMime(media), clone(invoker(0, 'blob'))],
        [T, clone(always(null))],
      ])
    )
    .then(unless(pathEq(true, ['0', 'ok']), raise))
