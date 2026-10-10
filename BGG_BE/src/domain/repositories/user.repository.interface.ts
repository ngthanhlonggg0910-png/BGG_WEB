import type { User } from "../entities/user.entity.ts";

export interface IUserRepository {
  login(username: string, password: string): Promise<User | null>;
}
