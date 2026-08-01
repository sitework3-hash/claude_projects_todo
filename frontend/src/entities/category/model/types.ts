/** Категория расходов/доходов (форма ответа GET /categories). */
export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

/** Тело POST /categories. */
export interface CreateCategoryInput {
  name: string;
  color?: string | null;
  icon?: string | null;
}

/** Тело PATCH /categories/:id — любое подмножество полей. */
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
