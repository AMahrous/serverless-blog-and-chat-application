import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
//import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
//import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
//import { getUserId } from '../utils'
//import * as AWS  from 'aws-sdk'
//import { getUserId } from '../utils'
//import { TodosAccess } from '../../helpers/todosAcess'
//import { TodoUpdate } from '../../models/TodoUpdate'


//const docClient = new AWS.DynamoDB.DocumentClient()
//const todosTable = process.env.TODOS_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
try{
    const updatedVersion = await updateTodo(event)

    return {
      statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*'
        },
      body: JSON.stringify({
          updatedVersion
      })
    }
  }catch (error){
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
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
*/
