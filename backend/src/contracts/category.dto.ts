export interface CategoryDto {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
