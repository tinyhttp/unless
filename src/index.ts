import type { Request, Response, NextFunction, Middleware } from '@tinyhttp/app'

/**
 * Middleware options
 */
export type UnlessMiddlewareOptions = Partial<{
  /**
   * Methods to compare
   */
  method: string | string[] | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'DELETE'
  /**
   * Paths to compare
   */
  path: string | RegExp | (string | RegExp | PathObject)[]
  /**
   * Last part of endpoint to compare
   */
  ext: string | string[] //last part of endpoint to compare
}>

/**
 * Optional path object
 */
interface PathObject {
  url: string
  methods: (string | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'DELETE')[]
}

/**
 * Custom function for `@tinyhttp/unless`
 */
export type CustomUnless = (req: Request) => boolean

// Convert single element to array of one element
function toArray(val: any | any[]): any[] {
  if (!Array.isArray(val) && val !== undefined) return [val]

  return val
}

/**
 * Check path parameter
 * @param path path
 * @param url URL
 * @param method HTTP method
 */
function pathCheck(path: (string | RegExp | PathObject)[], url: string, method: string): boolean {
  let res = false
  for (const p of path) {
    if (typeof p === 'string') res = res || p === url
    else if (p instanceof RegExp) {
      const regexPath: RegExp = p
      res = res || regexPath.test(url)
    } else {
      const objectPath: PathObject = p
      res = res || (objectPath.url === url && objectPath.methods.indexOf(method) !== -1)
    }
    if (res) return res
  }
  return res
}

/**
 * Middleware for conditional middleware executing.
 * @param mw middleware to run under a specific condition
 * @param options conditions (e.g. options)
 */
export function unless(
  mw: Middleware,
  options: UnlessMiddlewareOptions | CustomUnless
): (req: Request, res: Response, next: NextFunction) => any {
  let opts: UnlessMiddlewareOptions // options
  let custom: CustomUnless // function

  if (typeof options === 'object') opts = options as UnlessMiddlewareOptions
  else if (typeof options === 'function') custom = options as CustomUnless

  // Returned middleware with configuration
  return function result(req: Request, res: Response, next: NextFunction): any {
    if (custom == undefined && (Object.keys(opts).length === 0 || opts == undefined)) next()
    if (custom == undefined) {
      const method: string[] = toArray(opts.method) // methods
      const path: string[] | RegExp[] = toArray(opts.path) // full path
      const ext: string[] = toArray(opts.ext) // last part of the endpoint

      const url: string[] = req.url.split('/') // splited endpoint array

      let skip = false // determine if should skip middleware

      if (method != undefined) skip = skip || method.indexOf(req.method) !== -1
      if (ext != undefined) skip = skip || ext.indexOf('/' + url[url.length - 1]) !== -1
      if (path != undefined) skip = skip || pathCheck(path, req.url, req.method)

      if (skip) next()
      else mw.handler(req, res, next)
    } else {
      if (custom(req)) next()
      else mw.handler(req, res, next)
    }
  }
}
