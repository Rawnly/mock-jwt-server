import fastify, { FastifyRequest } from 'fastify';
import fastifyJWT from 'fastify-jwt';
import fastifyCors from 'fastify-cors'
import { badRequest, unauthorized } from '@hapi/boom';
import { USERS } from './data';

const app = fastify( {
  logger: {
    prettyPrint: true,
  },
} );

type LoginPayload = {
  username: string;
  password: string;
};

type RefreshPayload = {
  refreshToken: string;
};

app
  .register( fastifyCors, {
    origin: '*',
  })
  .register( fastifyJWT, {
    secret: 'secret-key',
  } );

app.get( '/me', async ( req, res ) => {
  await req.jwtVerify();

  const user = USERS.find( ( user ) => user.id === req.user.id );

  if ( !user ) {
    const { output } = unauthorized( 'Invalid Credentials' );

    return res.status( output.statusCode )
      .send( output.payload );
  }

  return user;
} );

app.post(
  '/auth/login',
  async ( req: FastifyRequest<{ Body: LoginPayload }>, res ) => {
    const user = USERS.find( ( user ) => user.username === req.body.username );

    if ( !user || user.password !== req.body.password ) {
      const { output } = unauthorized( 'Invalid Credentials' );

      return res.status( output.statusCode )
        .send( output.payload );
    }

    return {
      refreshToken: 'refreshToken',
      accessToken: await res.jwtSign(
        {
          id: user.id,
        },
        {
          expiresIn: '5s',
        }
      ),
    };
  }
);

app.post(
  '/auth/refresh-token',
  async ( req: FastifyRequest<{ Body: RefreshPayload }>, res ) => {
    await req.jwtVerify( {
      ignoreExpiration: true,
    } );

    const user = USERS.find( ( user ) => user.id === req.user.id );

    if ( !req.body.refreshToken ) {
      const { output } = badRequest( 'Missing Refresh Token' );

      return res.status( output.statusCode )
        .send( output.payload );
    }

    if ( !user ) {
      const { output } = unauthorized( 'Invalid Credentials' );

      return res.status( output.statusCode )
        .send( output.payload );
    }

    return {
      refreshToken: 'refreshToken',
      accessToken: await res.jwtSign(
        {
          id: user.id,
        },
        {
          expiresIn: '5s',
        }
      ),
    };
  }
);

app.get(
  '/test/:num',
  async ( req: FastifyRequest<{ Params: { num: string } }>, res ) => {
    await req.jwtVerify();

    return res.send( { message: `Test #${req.params.num}` } );
  }
);

app.listen( 3000, ( err ) => {
  if ( err ) app.log.error( err );
} );

declare module 'fastify-jwt' {
  interface FastifyJWT {
    payload: { id: number };
  }
}
