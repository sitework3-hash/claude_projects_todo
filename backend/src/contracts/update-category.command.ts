export interface UpdateCategoryPatch {
  name?: string;
  color?: string;
  icon?: string;
}

export class UpdateCategoryCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly patch: UpdateCategoryPatch,
  ) {}
}
