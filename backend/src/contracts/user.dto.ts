export interface PublicUser {
  id: string;
  name: string | null;
  email: string;
}

export interface UserWithHash extends PublicUser {
  passwordHash: string;
}
