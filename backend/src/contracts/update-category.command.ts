export interface UpdateCategoryPatch {
  name?: string;
  // null — осознанный сброс оформления («без цвета» / «без иконки»);
  // undefined — поле не трогаем. Оба поля в схеме nullable.
  color?: string | null;
  icon?: string | null;
}

export class UpdateCategoryCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly patch: UpdateCategoryPatch,
  ) {}
}
