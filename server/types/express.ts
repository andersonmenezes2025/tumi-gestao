declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        company_id: string | null;
        full_name?: string;
      };
    }
  }
}

export {};