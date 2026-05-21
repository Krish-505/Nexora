import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { tenants, users } from '../database/memory-db';
import { RealtimeService } from './realtime.service';
import { REALTIME_NAMESPACE, REALTIME_ROOMS } from './realtime.constants';

type RealtimeUser = {
  userId: string;
  role: string;
  tenantId: string | null;
};

@WebSocketGateway({
  namespace: REALTIME_NAMESPACE,
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly realtimeService: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.bindServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const user = this.authenticate(client);
      client.data.user = user;

      await client.join(REALTIME_ROOMS.user(user.userId));
      await client.join(REALTIME_ROOMS.role(user.role));

      if (user.role === 'superadmin') {
        await client.join(REALTIME_ROOMS.platform);
      } else if (user.tenantId) {
        await client.join(REALTIME_ROOMS.tenant(user.tenantId));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Realtime authentication failed';

      client.emit('connect_error', message);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as RealtimeUser | undefined;

    if (user) {
      this.logger.debug(`Realtime disconnected: ${user.userId}`);
    }
  }

  private authenticate(client: Socket): RealtimeUser {
    const token = this.extractToken(client);

    if (!token) {
      throw new UnauthorizedException('Missing realtime token');
    }

    const payload = this.jwtService.verify(token, {
      secret: 'SUPER_SECRET_KEY',
    }) as RealtimeUser;

    const user = users.find((entry) => entry.id === payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role !== 'superadmin') {
      const tenant = tenants.find((entry) => entry.id === user.tenantId);

      if (!tenant || tenant.active === false) {
        throw new UnauthorizedException('Tenant account has been deactivated');
      }
    }

    return {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    const bearerHeader = client.handshake.headers.authorization;

    if (typeof authToken === 'string') {
      return authToken;
    }

    if (typeof bearerHeader === 'string' && bearerHeader.startsWith('Bearer ')) {
      return bearerHeader.slice('Bearer '.length);
    }

    return null;
  }
}
