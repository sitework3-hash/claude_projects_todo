import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserCommand } from '../contracts/create-user.command';
import { GetUserByEmailQuery } from '../contracts/get-user-by-email.query';
import { PublicUser, UserWithHash } from '../contracts/user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.commandBus.execute<CreateUserCommand, PublicUser>(
      new CreateUserCommand(dto.name, dto.email, passwordHash),
    );

    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.queryBus.execute<GetUserByEmailQuery, UserWithHash | null>(
      new GetUserByEmailQuery(dto.email),
    );

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.buildAuthResult(user);
  }

  private async buildAuthResult(user: PublicUser): Promise<AuthResult> {
    const publicUser: PublicUser = { id: user.id, name: user.name, email: user.email };
    const accessToken = await this.jwtService.signAsync({ sub: publicUser.id, email: publicUser.email });
    return { accessToken, user: publicUser };
  }
}
