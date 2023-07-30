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
  once,
  unless,
  mergeWith,
  concat,
} from 'ramda'

const text = [
  'text/plain',
  'text/html',
  'text/css',
  'application/xml',
  'application/x-www-form-urlencoded',
]

const json = ['application/json']

const blob = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/aac',
  'audio/flac',
  'audio/midi',
  'video/mp4',
  'video/ogg',
  'video/webm',
  'video/quicktime',
]

const formData = ['multipart/form-data']

let mimeTypes = {
  text,
  json,
  blob,
  formData,
} as const

export const registerMimeTypes = once(
  (configuration: Partial<typeof mimeTypes>) => {
    mimeTypes = mergeWith(concat)(configuration, mimeTypes)
  }
)

const raise = (error: any) => {
  throw error
}

const getMimeType = pipe<[Response], Headers, string, string, string[], string>(
  prop('headers'),
  invoker(1, 'get')('Content-Type'),
  defaultTo(''),
  split(';'),
  head
)

const isMime = (types: string[]) =>
  pipe<[Response], string, (args_0: string) => boolean, boolean>(
    getMimeType,
    includes,
    any(__, types)
  )

const clone = (as: (...args: any) => any) => juxt([invoker(0, 'clone'), as])

export const takeResponse = <Result extends any>(result: [Response, Result]) =>
  result[0]

export const takeParsed = <Result extends any>(result: [Response, Result]) =>
  result[1]

const mimeCond = (
  type: keyof typeof mimeTypes
): [ReturnType<typeof isMime>, ReturnType<typeof clone>] => [
  isMime(mimeTypes[type]),
  clone(invoker(0, type)),
]

export const request = <Result extends unknown>(
  ...args: Parameters<typeof fetch>
): Promise<[Response, Result]> =>
  fetch(...args)
    .then(
      cond([
        mimeCond('text'),
        mimeCond('json'),
        mimeCond('blob'),
        mimeCond('formData'),
        [T, clone(always(null))],
      ])
    )
    .then(unless(pathEq(true, ['0', 'ok']), raise))
