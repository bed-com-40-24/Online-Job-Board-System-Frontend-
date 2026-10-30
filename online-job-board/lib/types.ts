export type { Job } from './data';

export type Page = 'dashboard' | 'jobs' | 'create' | 'profile';

export type Account = {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  industry?: string;
  website?: string;
  address?: string;
  bio?: string;
  avatar?: string;
};
