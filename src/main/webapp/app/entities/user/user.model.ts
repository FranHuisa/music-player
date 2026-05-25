export interface IUser {
  id: number;
  login?: string | null;
  authorities?: string[];
  firstName?: string | null;
  lastName?: string | null;
}
