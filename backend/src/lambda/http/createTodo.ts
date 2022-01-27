import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import middy from '@middy/core'
//import { cors } from 'middy/middlewares'
//import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
//import { getUserId } from '../utils';
//import { createTodo } from '../../businessLogic/todos'

//import * as AWS  from 'aws-sdk'
//import { TodoItem } from '../../models/TodoItem'
import { createTodo } from '../../helpers/todos';
//const uuid = require('uuid')

//const docClient = new AWS.DynamoDB.DocumentClient()
//const todosTable = process.env.TODOS_TABLE
//const bucketName = process.env.TODOS_S3_BUCKET


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
    
      const createdTodo = await createTodo(event)
      console.log(`here it is: ${JSON.stringify(createdTodo)}`)
    return {
      statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*'
        },
      body: JSON.stringify({
          item: createdTodo
      })
    }
  }catch(error) {
    return {
      statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*'
        },
      body: JSON.stringify({
          error
      })
    }
  }
  })

  /*
handler.use(
  cors({
    credentials: true
  })
)
*/