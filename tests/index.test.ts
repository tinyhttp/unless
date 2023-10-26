import { describe, it } from 'node:test'
import { unless, UnlessMiddlewareOptions, CustomUnless } from '../src/index.js'

import { IncomingMessage, Server, ServerResponse, createServer } from 'node:http'
import { makeFetch } from 'supertest-fetch'

function exampleMiddleware(_: IncomingMessage, res: ServerResponse): void {
  res.setHeader('MW', 1)
}

function InitAppAndTestUnless(options: UnlessMiddlewareOptions | CustomUnless) {
  const app = createServer((req, res) => {
    unless<IncomingMessage, ServerResponse<IncomingMessage>>({ handler: exampleMiddleware, type: 'mw' }, options)(
      req,
      res,
      () => {
        return
      }
    )
    res.statusCode = 200
    res.end()
  })

  const fetch = makeFetch(app as unknown as Server)

  return fetch
}

describe('Unless Middleware path parameter test', () => {
  it("should execute if path string doesn't match", async () => {
    const fetch = InitAppAndTestUnless({ path: '/test' })

    await fetch('/').expectStatus(200).expectHeader('MW', 1)
  })
  it("should execute if path string doesn't match", async () => {
    const fetch = InitAppAndTestUnless({ path: /test/ })

    await fetch('/').expectStatus(200).expectHeader('MW', 1)
  })
  it('should execute if only object url has a match', async () => {
    const fetch = InitAppAndTestUnless({ path: ['/test', { url: '/', methods: ['POST'] }] })

    await fetch('/').expectStatus(200).expectHeader('MW', 1)
  })
  it('should execute if only object methods has a match', async () => {
    const fetch = InitAppAndTestUnless({ path: ['/test', { url: '/tes', methods: ['GET'] }] })

    await fetch('/').expectStatus(200).expectHeader('MW', 1)
  })

  it('should not execute if path string match', async () => {
    const fetch = InitAppAndTestUnless({ path: [/\/test/, '/'] })

    await fetch('/').expectStatus(200).expectHeader('MW', undefined)
  })
  it('should not execute if path regex match', async () => {
    const fetch = InitAppAndTestUnless({ path: ['/test', /\//] })

    await fetch('/').expectStatus(200).expectHeader('MW', undefined)
  })
  it('should not execute if object url and method match', async () => {
    const fetch = InitAppAndTestUnless({ path: ['/test', { url: '/', methods: ['POST', 'GET'] }] })

    await fetch('/').expectStatus(200).expectHeader('MW', undefined)
  })
})

describe('Unless Middleware ext parameter test', () => {
  it("should execute if ext doesn't match", async () => {
    const fetch = InitAppAndTestUnless({ ext: ['/users/123', '/users'] })

    await fetch('/users/123').expectStatus(200).expectHeader('MW', 1)
  })

  it('should not execute if ext match', async () => {
    const fetch = InitAppAndTestUnless({ ext: ['/users/123', '/123'] })

    await fetch('/users/123').expectStatus(200).expectHeader('MW', undefined)
  })
})

describe('Unless Middleware method parameter test', () => {
  it("should execute if method string doesn't match", async () => {
    const fetch = InitAppAndTestUnless({ method: ['POST', 'PUT'] })
    await fetch('/').expectStatus(200).expectHeader('MW', 1)
  })

  it('should not execute if method string match', async () => {
    const fetch = InitAppAndTestUnless({ method: ['POST', 'GET'] })

    await fetch('/').expectStatus(200).expectHeader('MW', undefined)
  })
})

describe('Unless Middleware custom parameter test', () => {
  it('should execute if function returns false', async () => {
    const fetch = InitAppAndTestUnless(() => false)

    await fetch('/').expectStatus(200).expectHeader('MW', 1)
  })

  it('should not execute if function returns true', async () => {
    const fetch = InitAppAndTestUnless(() => true)

    await fetch('/').expectStatus(200).expectHeader('MW', undefined)
  })
})
