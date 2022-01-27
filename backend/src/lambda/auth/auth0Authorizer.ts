import { APIGatewayTokenAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-ktb8f-yx.us.auth0.com/cer'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJcJgnjNiynyhJMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1rdGI4Zi15eC51cy5hdXRoMC5jb20wHhcNMjExMjE3MjE1MTQ0WhcN
MzUwODI2MjE1MTQ0WjAkMSIwIAYDVQQDExlkZXYta3RiOGYteXgudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0OR0UArG05nd5oQg
WKl2By3zx3vi0/8OtmvUnSYgO9BxgAdViUqSsFu3b2EO0r62xGepo84g7QCaSScr
56jrCcEbhwh2taaaYFp9mPEO9WOwh0o9oWMve7R9kYcs/reZX1ox0919bTHqLZjW
lVDLYb6s2niATGyBQfnCll53GCzhTd/4QPh3IwBnaqko5c3sSEsimplWSqvzBBRV
u2pnx0dot80jpFf+IEbnHVTrDRoL7T1zygLedOyGqFnZXoQn+yhmiuTq37ATBvcN
2smiu1XufrjHBhmBPePCLhtsJ6iMEy9h4ERjDUTP6p71eePXHyVT2Im0k2OiPklK
SZ7FFQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSk1gUXjCYY
o9YJkF9gCLo+6cNypzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AMcdWWCDmQtj5AUMNpJnUdnPvSMqY1kgeawScEwtf9Vupf67jh7U/1o/Dc3z/PZj
x7gO9eAKWYjmCZL4zAY3tBBWFb2pqPxhIwawLFBE/lFZUvL5iZKIhxSKRPpjeSRG
gRyiGoxj6og7mpF/avuiECCxzdNI10WUX/fHcQG6g7B6Wv6RJCnGKg/Uc9KgIZif
EHPa77KEM7MLaWWgbV4/b6BZlUBFVNsy4nuYgBCdsIIxA5Dok6NqFnqwx+QOShcD
PMDKg2nHivW3Rx7vVx+0AmZ2UnjOPRbgzPpL9I4jVIkF7VUkZFc64iwgGrUxXI6L
US2aMM5PHDF62NAd6KyRwTw=
-----END CERTIFICATE-----`


export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt
 
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const verResult = verify(token, cert, { algorithms: ['RS256'] })
  
  return verResult as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]
  console.log(`here it is: ${token}`)

  return token
}
