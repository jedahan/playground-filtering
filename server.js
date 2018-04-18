const Koa = require('koa')
const mount = require('koa-mount')
const cors = require('@koa/cors')
const graphqlHTTP = require('koa-graphql')
const koaPlayground = require('graphql-playground-middleware-koa').default
const opn = require('opn')
const getPort = require('get-port')
const app = new Koa()

const { buildSchema } = require('graphql')
const schema = buildSchema(`
type Query {
  hello: Hello,
}

type Hello {
  there: String
}

type Mutation {
  setHello(input: HelloInput!): Hello
}

input HelloInput {
  there: String!
}
`)

const db = {
  hello: {
    there: `General Kenobi!`
  }
}

const rootValue = {
  hello: () => db.hello,
  setHello: ({ hello }) => {
    previous = db.hello
    db.hello = hello
    return previous
  }
}

app.use(cors())

app.use(
  mount(
    '/graphql',
    graphqlHTTP(async (request) => {
      const start = Date.now()
      const extensions = ({ document, variables, operationName, result }) => ({
        duration: new Date() - start
      })
      return { schema, rootValue, extensions }
    })
  )
)

app.use(
  mount(
    '/playground',
    koaPlayground({
      endpoint: '/graphql'
    })
  )
)

getPort({ port: 4000 }).then(port => {
  app.listen(port, () => {
    const base = `http://localhost:${port}`
    console.log(`API: ${base}/graphql`)
    console.log(`Playground: ${base}/playground`)
    opn(`${base}/playground`)
  })
})
