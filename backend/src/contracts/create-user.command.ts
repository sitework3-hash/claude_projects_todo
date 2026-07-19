export class CreateUserCommand {
  constructor(
    public readonly name: string | undefined,
    public readonly email: string,
    public readonly passwordHash: string,
  ) {}
}
