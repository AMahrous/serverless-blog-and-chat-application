import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import { deleteTodo } from '../../helpers/todos'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Remove a TODO item by id
    try{
      
        const deletedItem = await deleteTodo(event)
    
    
        return {
          statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': '*'
            },
          body: JSON.stringify({
              deletedItem
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
      

  }
)



/*
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
*/