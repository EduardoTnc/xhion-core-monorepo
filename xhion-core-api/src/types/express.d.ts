/**
 * Extends Express Request type to include user property
 * Added by JWT authentication middleware
 */
declare namespace Express {
    interface Request {
        user?: {
            userId: string;
            email?: string;
            [key: string]: unknown;
        };
    }
}
