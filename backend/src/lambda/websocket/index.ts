import { LambdaActions } from 'lambda-actions';
import { $connect, $disconnect, setName, sendPublic, sendPrivate } from './chatHandlers';

export const handler = async (event, context) => {
    context = event.requestContext
    if (!context) {
        console.log(`No request context`)
        return {};
    }

    try {

    const connectionId: String = event.requestContext.connectionId;
    const routeKey: String = event.requestContext.routeKey;
    const body = JSON.parse(event.body || '{}');

    const lambdaActions: LambdaActions = new LambdaActions();
    lambdaActions.action('$connect', $connect);
    lambdaActions.action('$disconnect', $disconnect);
    lambdaActions.action('setName', setName);
    lambdaActions.action('sendPublic', sendPublic);
    lambdaActions.action('sendPrivate', sendPrivate);

    await lambdaActions.fire({
      action: routeKey,
      payload: body,
      meta: { connectionId: connectionId },
    });

    console.log(`connectionId: ${connectionId}`)
    console.log(`routeKey: ${routeKey}`)
    console.log(`body: ${JSON.stringify(body)}`)

  } catch (e) {
    console.error(e);
  }

  return {};
};