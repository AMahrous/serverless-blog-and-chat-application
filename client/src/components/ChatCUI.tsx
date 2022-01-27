import { GridList, IconButton, ListItemText, Paper, TextField } from '@material-ui/core'
import dateFormat from 'dateformat'
import { Socket, SocketType } from 'dgram'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  List,
  ListItem
} from 'semantic-ui-react'
import ListGroup from 'react-bootstrap/ListGroup'
import { ListGroupItemProps } from 'react-bootstrap'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import { ChattingClient } from './chat-client'

const URL = 'wss://12l0a0sh5d.execute-api.us-east-1.amazonaws.com/dev'
// my code

// my code


export const ChatCUII = () => {

  var newUserName: string = 'newUser'
  var newMessage: string = 'newMessage'

  const socket = React.useRef<WebSocket | null>(null)
  const [connectionState, setConnectionState] = React.useState(false)
  const [connectionDate, setConnectionDate] = React.useState("now")
  const [onlineMembers, setOnlineMembers] = React.useState<string[]>(["Join to see online members"])
  const [message, setMessage] = React.useState<string>()
  const [chatMessages, setChatMessages] = React.useState<string[]>(["No messages"])
  const [actionButtonText, setActionButtonText] = React.useState(false)

  
  const afterConnection = React.useCallback(() => {
    setConnectionState(true)
    socket.current?.send(JSON.stringify({ action: 'setName', name: `${newUserName}`}))
  }, [])


   const notConnected = React.useCallback(() => {
     alert(`Click "Connect" first!`)
   }, [])

  const setName = React.useCallback(() => {
    socket.current?.send(JSON.stringify({ action: 'setName', name: `${newUserName}`}))
  }, [])

  const afterDisconnection = React.useCallback(() => {
    setOnlineMembers(["Connect to see online members"]);
    setConnectionState(false);
    setChatMessages(["No messages"]);
  }, [])

  const disconnect = React.useCallback(() => {
    socket.current?.close()
    alert(`${newUserName}! You are disconnected`)
  }, [])

   const handleNameChange = React.useCallback((event: any) => {
     newUserName = event.target.value
   }, [])

   const handleMsgChange = React.useCallback((event: any) => {
    newMessage = event.target.value
  }, [])


  const onSendMsg = React.useCallback((msg: string) => {
      const data = JSON.parse(msg);
      if (data.members) {
        setOnlineMembers(data.members);
      } else if (data.publicMessage) {
        console.log(data.publicMessage)
        //setChatMessages(data.publicMessage);
        setChatMessages(oldArray => [...oldArray, data.publicMessage]);
      } else if (data.privateMessage) {
        alert(data.privateMessage);
      } else if (data.systemMessage) {
        setChatMessages([data.message]);
      }
  }, [])

  const setConnectButtonClick = React.useCallback(() => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
    socket.current = new WebSocket(URL)
    socket.current.addEventListener('open', afterConnection)
    socket.current.addEventListener('close', afterDisconnection)
    socket.current.addEventListener('message', (event: any) => {
    //onSocketMessage(event.data)})
    onSendMsg(event.data)})
    }
  }, [])


  // React.useEffect(() => {
  //   return () => {
  //     socket.close();
  //   };
  // }, []);

  const sendPublicMsg = React.useCallback(() => {
    socket.current?.send(JSON.stringify({action: "sendPublic", message: newMessage}))
  }, [])

  const sendPrivateMsg = React.useCallback((toUser: string) => {
    const msg = prompt('Enter the message: ');
    socket.current?.send(JSON.stringify({action: "sendPrivate", message: msg, to:`${toUser}`}))
  }, [])
  

  return (
    <Grid>
      <Grid style={{ height: '700px' , width: '900px'}} >
      <Paper>
        <Grid style={{ height: '700px' , width: '200px'}} >
      <div>
      <ul>
        {onlineMembers.map(item => (
          <li key={item} onClick={(event) => { sendPrivateMsg(item); }}>{item}</li>
        ))}
      </ul>
      </div>
      </Grid>
      </Paper>
      <Paper>
      <Grid style={{ height: '700px' , width: '500px'}} >
      <div>
      <ul>
        {chatMessages.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      </div>
      </Grid>
      </Paper>
      </Grid>
    <Grid.Row>
    <Grid.Column width={16}>
        <Input
          action={{
            color: connectionState? 'green' : 'grey',
            labelPosition: 'left',
            icon: 'send',
            content: connectionState?'Send' : 'Send',
            onClick: connectionState? sendPublicMsg : notConnected
          }}
          fluid
          actionPosition="left"
          placeholder="Your message..."
          onChange={(event) => handleMsgChange(event)}
        />
      </Grid.Column>
      
      
  
      <Grid.Column width={16}>
        <Divider />
      </Grid.Column>
      <TextField id="userName" label="User name" variant="outlined" onChange={(event) => handleNameChange(event)} />


      
      <Button variant="outlined" size="small" onClick={setConnectButtonClick} >Connect</Button>
      <Button variant="outlined" size="small" onClick={disconnect} >Disconnect</Button>
         
    </Grid.Row>
    </Grid>
  )
}


//export default ChatCUII