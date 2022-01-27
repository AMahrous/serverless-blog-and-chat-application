import { TodosAccess } from './todosAcess'
//import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
//import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { createLogger } from '../utils/logger'
//import * as uuid from 'uuid'
//import * as createError from 'http-errors'
import { getUserId } from '../lambda/utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
//import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb';

// TODO: Implement businessLogic

const uuid = require('uuid')
const todosAccess = new TodosAccess()
const bucketName = process.env.TODOS_S3_BUCKET
const todosTable = process.env.TODOS_TABLE


export async function getTodos(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
    const userId = getUserId(event)
    return todosAccess.getTodos(userId)
}


export async function createTodo(event: APIGatewayProxyEvent): Promise<TodoItem> {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const createdAt = new Date().toISOString()
    const todoId = uuid.v4()

    const newItem: TodoItem = {
      userId: userId,
      todoId: todoId,
      createdAt: createdAt,
      ...newTodo,
      done: false,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }

    await todosAccess.createTodo(newItem)
    console.log('Storing new item: ', newItem)

    return newItem
}

export async function updateTodo(event: APIGatewayProxyEvent): Promise<TodoItem> {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const body = JSON.parse(event.body)
    const newName = body.name
    const newDueDate = body.dueDate
    const newState = body.done

    console.log("Updating the item...")
    const updatedTodo = await todosAccess.updateTodo(todosTable, userId, todoId, newName, newDueDate, newState)
    
    return updatedTodo
}

export function createAttachmentPresignedUrl(todoId: string): string {
    return todosAccess.createAttachmentPresignedUrl(todoId)
}

export async function deleteTodo(event: APIGatewayProxyEvent): Promise<TodoItem> {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    
        console.log("Updating the item...")
    return await todosAccess.deleteTodo(userId, todoId)
}
