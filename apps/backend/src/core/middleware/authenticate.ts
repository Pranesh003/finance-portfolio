import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { UserRole } from '@finance/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const DEV_DEFAULT_USER: AuthenticatedUser = {
  id: '15fd3394-2993-4e4f-9b37-d35c72ecbb83',
  email: 'praneshkumar2375@gmail.com',
  role: 'USER' as UserRole
};

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const extracted = authHeader.split(' ')[1];
    if (extracted && extracted !== 'null' && extracted !== 'undefined') {
      token = extracted;
    }
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/accessToken=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    // In development mode, auto-authenticate to the primary user to provide a seamless local dev experience
    if (env.NODE_ENV === 'development') {
      req.user = DEV_DEFAULT_USER;
      return next();
    }
    return next(new UnauthorizedError('Authentication token missing or invalid'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    if (env.NODE_ENV === 'development') {
      req.user = DEV_DEFAULT_USER;
      return next();
    }
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const extracted = authHeader.split(' ')[1];
    if (extracted && extracted !== 'null' && extracted !== 'undefined') {
      token = extracted;
    }
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/accessToken=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // Allow unauthenticated/guest in optional mode
    }
  }

  if (!req.user && env.NODE_ENV === 'development') {
    req.user = DEV_DEFAULT_USER;
  }

  next();
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated'));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}

