import { User } from '@/types';

// Real authentication service using Prisma
export class AuthService {
  private static currentUser: User | null = null;

  static async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      const user = data.user;

      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    
    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static isTeacher(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'TEACHER';
  }

  static isStudent(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'STUDENT';
  }

  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
}