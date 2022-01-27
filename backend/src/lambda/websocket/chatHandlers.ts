import * as AWS  from 'aws-sdk'
//var NAMES_DB = {};

/*
  IMPORTANT: remove 'https://' and '@connections' from the Connection URL that you copy over
  example:
    Connection URL https://xxxxxxxxxxx/execute-api.us-east-1.amazonaws.com/production/@connections
  turns to:
    ENDPOINT = 'xxxxxxxxxxx/execute-api.us-east-1.amazonaws.com/production/'
  see minute 7:00 https://youtu.be/BcWD-M2PJ-8?t=420
*/

//const connectionsTable = process.env.CONNECTIONS_TABLE
//const stage = process.env.STAGE
//const apiId = process.env.API_ID

const docClient = new AWS.DynamoDB.DocumentClient()
const connectionsTable = process.env.CONNECTIONS_TABLE

const ENDPOINT = `12l0a0sh5d.execute-api.us-east-1.amazonaws.com/dev`;
const client = new AWS.ApiGatewayManagementApi({ apiVersion: "2018-11-29",endpoint: ENDPOINT });

const sendToOne = async (id, body) => {
  try {
    await client.postToConnection({
      'ConnectionId': id,
      'Data': Buffer.from(JSON.stringify(body)),
    }).promise();
  } catch (err) {
    console.error(err);
  }
};

const sendToAll = async (ids, body) => {
  console.log(`sendToAll invoked...`)

  const all = ids.map(i => sendToOne(i, body));
  return Promise.all(all);
};

const getIdByName = async (toName) => {
  console.log(`getIdByName invoked: getting id of user: ${JSON.stringify(toName)}`)
  const result = await docClient.query({
    TableName: connectionsTable,
    IndexName: "userName_index",
    KeyConditionExpression: 'userName = :userNameVal',
    ExpressionAttributeValues: {
      ':userNameVal': toName
    },
    ScanIndexForward: false
  }).promise()
  return result
}

const getNameById = async (fromId) => {
  console.log(`getIdByName invoked: getting name of user: ${JSON.stringify(fromId)}`)
  const result = await docClient.query({
    TableName: connectionsTable,
    KeyConditionExpression: 'id = :idVal',
    ExpressionAttributeValues: {
      ':idVal': fromId
    },
    ScanIndexForward: false
  }).promise()
  return result
}

const getAllItems = async () => {
  const allItems = await docClient.scan(
    {
      TableName : connectionsTable
  }
  ).promise()
  return allItems
}

const getAllIds = async (allItems) => {
  let allIds = []

  if (allItems.Count === 0)
  {
    console.log(`No users are found...!`)
    return false
  }
  for (let i = 0; i < allItems.Count; i++)
  {
    allIds.push(allItems.Items[i].id)
  }

  return allIds
}

const getAllNames = async (allItems) => {
  let allNames = []
  
  if (allItems.Count === 0)
  {
    console.log(`No names are found...!`)
    return false
  }
  for (let i = 0; i < allItems.Count; i++)
  {
    allNames.push(allItems.Items[i].userName)
  }

  return allNames
}

export const $connect = async (payload, meta) => {
  console.log(`Websocket connection, payload: ${JSON.stringify(payload)}, meta: ${JSON.stringify(meta)} `)

  const connectionId = meta.connectionId
  const timestamp = new Date().toISOString()

  const item = {
    id: connectionId,
    timestamp,
    userName: "newUser"
  }

  console.log('Storing item: ', item)

  await docClient.put({
    TableName: connectionsTable,
    Item: item
  }).promise()

  return {};
};


export const setName = async (payload, meta) => {
  //NAMES_DB[meta.connectionId] = payload.name;
  const connectionId = meta.connectionId
  const timestamp = new Date().toISOString()

  const item = {
    id: connectionId,
    timestamp,
    userName: payload.name
  }

  console.log('Storing item: ', item)

  await docClient.put({
    TableName: connectionsTable,
    Item: item
  }).promise()
  /*const updatedVersion = await docClient.update(
    {
      TableName:connectionsTable,
      Key: {
        id: meta.connectionId
      },
      UpdateExpression: "set userName = :nameVal",
      ConditionExpression: "id = :idVal",
      ExpressionAttributeValues: {
          ":idVal": meta.connectionId,
          ":nameVal": payload.name
      },
      ReturnValues:"ALL_NEW"
    }
  ).promise()*/
  console.log(`Set item: ${JSON.stringify(item)}`)
  const allItems = await getAllItems()
  const Ids = await getAllIds(allItems)
  const names = await getAllNames(allItems)
  console.log(`allItems: ${JSON.stringify(allItems)}`)
  console.log(`Ids: ${Ids}`)
  console.log(`names: ${names}`)
  
  await sendToAll(Ids, { members: names });
  await sendToAll(Ids, { systemMessage: `${payload.name} has joined the chat` })
  return {};
};

export const sendPublic = async (payload, meta) => {
  console.log(`SendPublic invoked: Sending a public message...: "payload": ${payload}, "id":${meta.connectionId}`)

  const from = await getNameById(meta.connectionId)
  const allItems = await getAllItems()
  const Ids = await getAllIds(allItems)
  await sendToAll(Ids, { publicMessage: `${from.Items[0].userName}: ${payload.message}` })
  return {};
};

export const sendPrivate = async (payload, meta) => {
  
  //const to = Object.keys(NAMES_DB).find(key => NAMES_DB[key] === payload.to);
  const from = await getNameById(meta.connectionId)

  if (from.Count === 0)
  {
    console.log(`Private error: userName of ${meta.connectionId} is not found`)
    //sendToOne(meta.connectionId,{"Private error": `User ${payload.to} is not found` })
    return {};
  }
  const to = await getIdByName(payload.to)
  if (to.Count === 0)
  {
    console.log(`Private error: User ${payload.to} is not found`)
    //sendToOne(meta.connectionId,{"Private error": `User ${payload.to} is not found` })
    return {};
  }
  console.log(`SendPrivate is invoked by user: ${from.Items[0].userName}`)
  console.log(`Items: ${JSON.stringify(to.Items)}`)
  console.log(`to name: ${payload.to}`)
  console.log(`to Id: ${to.Items[0].id}`)
  await sendToOne(to.Items[0].id, { privateMessage: `${from.Items[0].userName}: ${payload.message}` });
  return {};
};

export const $disconnect = async (payload, meta) => {
  console.log(`Websocket disconnect, payload: ${JSON.stringify(payload)}, meta: ${JSON.stringify(meta)} `)


  const from = await getNameById(meta.connectionId)
  console.log('Removing user: ', from.Items[0].userName)

  const connectionId = meta.connectionId
  const key = {
      id: connectionId
  }

  await docClient.delete({
    TableName: connectionsTable,
    Key: key
  }).promise()

  const allItems = await getAllItems()
  const Ids = await getAllIds(allItems)
  const names = await getAllNames(allItems)
  await sendToAll(Ids, { systemMessage: `${from.Items[0].userName} has left the chat` })
  await sendToAll(Ids, { members: names })
  
  return {};
};