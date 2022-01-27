import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
4//import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
//import { getUserId } from '../utils'
//import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'

//const XAWS = AWSXRay.captureAWS(AWS)


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const signedUrl = createAttachmentPresignedUrl(todoId)

    return {
      statusCode: 201,
       headers: {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Methods': '*'
       },
      body: JSON.stringify({
          uploadUrl: signedUrl
      })
    }
    }catch(error)
    {
      console.log(error)
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
