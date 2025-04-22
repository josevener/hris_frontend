export default interface Company {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
}
