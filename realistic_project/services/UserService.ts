import { User, UserStats, UserStatus, UserRoleType, DEFAULT_ROLES } from '../types/user';

export class UserService {
  private users: Map<number, User> = new Map();
  private nextId: number = 1;

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers(): void {
    const defaultUsers: User[] = [
      {
        id: this.nextId++,
        name: 'Admin User',
        email: 'admin@example.com',
        age: 35,
        isActive: true,
        createdAt: new Date(),
        roles: [{ id: 1, name: 'admin', permissions: [] }]
      },
      {
        id: this.nextId++,
        name: 'Test User',
        email: 'test@example.com',
        age: 28,
        isActive: true,
        createdAt: new Date(),
        roles: [{ id: 2, name: 'user', permissions: [] }]
      },
      {
        id: this.nextId++,
        name: 'New User',
        email: 'new@example.com',
        age: 25,
        isActive: false,
        createdAt: new Date(),
        roles: [{ id: 3, name: 'guest', permissions: [] }]
      }
    ];

    defaultUsers.forEach(user => this.users.set(user.id, user));
  }

  createUser(data: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      ...data,
      id: this.nextId++,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id: number): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  updateUser(id: number, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id: number): boolean {
    return this.users.delete(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUsersByStatus(status: UserStatus): User[] {
    return this.getAllUsers().filter(u => {
      if (status === 'active') return u.isActive;
      if (status === 'inactive') return !u.isActive;
      return true;
    });
  }

  getUsersByRole(role: UserRoleType): User[] {
    return this.getAllUsers().filter(u =>
      u.roles.some(r => r.name === role)
    );
  }

  searchUsers(query: string): User[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllUsers().filter(u =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery)
    );
  }

  getStats(): UserStats {
    const users = this.getAllUsers();
    const activeUsers = users.filter(u => u.isActive);
    const ages = users.map(u => u.age);

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      inactiveUsers: users.length - activeUsers.length,
      averageAge: ages.length > 0
        ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
        : 0
    };
  }

  activateUser(id: number): boolean {
    const user = this.users.get(id);
    if (!user) return false;
    user.isActive = true;
    return true;
  }

  deactivateUser(id: number): boolean {
    const user = this.users.get(id);
    if (!user) return false;
    user.isActive = false;
    return true;
  }

  addRoleToUser(userId: number, roleName: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (!user.roles.some(r => r.name === roleName)) {
      user.roles.push({ id: Date.now(), name: roleName, permissions: [] });
    }
    return true;
  }

  removeRoleFromUser(userId: number, roleName: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.roles = user.roles.filter(r => r.name !== roleName);
    return true;
  }
}

export const userService = new UserService();
