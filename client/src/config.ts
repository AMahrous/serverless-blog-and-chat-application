// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'k42zazai5d'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-ktb8f-yx.us.auth0.com',            // Auth0 domain
  clientId: 'PEeZBC6Fiuv2YQdJ1T60yus1Mkg7ZuOe',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
