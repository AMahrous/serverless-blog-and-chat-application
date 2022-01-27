import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
//import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
//import { TodoUpdate } from '../models/TodoUpdate';
//import { CreateTodoRequest } from '../requests/CreateTodoRequest';

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })

//const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
 export class TodosAccess {

    constructor (
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosBucket = process.env.TODOS_S3_BUCKET,
        private readonly urlExpiration = 3000
    ) {

    }

    async getTodos(userId: String): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            },
            ScanIndexForward: false
          }).promise()
        
          return result.Items as TodoItem[]
    }


    async createTodo(itemToCreate: TodoItem): Promise<TodoItem> {
        await this.docClient
       .put({
         TableName: this.todosTable,
         Item: itemToCreate,
         ReturnValues: "ALL_OLD"
       })
       .promise()
       return itemToCreate
    }

    async updateTodo(todosTable: string, userId: string, todoId: string, newName: string, newDueDate: string, newState: string): Promise<TodoItem> {
    const updatedVersion = await this.docClient.update(
      {
        TableName:todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: "set #Name = :nameVal, dueDate = :dueDateVal, done = :doneVal",
        ConditionExpression: "userId = :userIdVal and todoId = :todoVal",
        ExpressionAttributeNames: {
            "#Name": "name"
        },
        ExpressionAttributeValues: {
            ":userIdVal": userId,
            ":todoVal": todoId,
            ":nameVal": newName,
            ":dueDateVal": newDueDate,
            ":doneVal":newState
        },
        ReturnValues:"ALL_NEW"
      }
    ).promise()

    return updatedVersion.Attributes as TodoItem
    }

    createAttachmentPresignedUrl(todoId: string): string {
        return s3.getSignedUrl('putObject', {
          Bucket: this.todosBucket,
          Key: todoId,
          Expires: this.urlExpiration
        })
    }

    async deleteTodo(userId: string, todoId: string, ): Promise<TodoItem> {
        const deletedItem = await this.docClient.delete(
          {
            TableName:this.todosTable,
            Key:{
              userId: userId,
              todoId: todoId
            },
            ConditionExpression: "userId = :userIdVal and todoId = :todoVal",
            ExpressionAttributeValues:{
                ":userIdVal": userId,
                ":todoVal": todoId
            },
            ReturnValues:"ALL_OLD"
          }
        ).promise()
        return deletedItem.Attributes as TodoItem
    }
 }