/** Категория расходов/доходов (форма ответа GET /categories). */
export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}
