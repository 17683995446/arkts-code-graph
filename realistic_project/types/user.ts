export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  resource: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  averageAge: number;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'banned';

export type UserRoleType = 'admin' | 'moderator' | 'user' | 'guest';

export const DEFAULT_ROLES: UserRoleType[] = ['guest', 'user', 'moderator', 'admin'];
