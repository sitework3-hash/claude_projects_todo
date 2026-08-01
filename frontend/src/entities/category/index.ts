export type { Category, CreateCategoryInput, UpdateCategoryInput } from './model/types';
export { categoryFormSchema, type CategoryFormValues } from './model/schema';
export { CATEGORY_COLORS, CATEGORY_ICON_NAMES, resolveCategoryIcon } from './config/appearance';
export { getCategories } from './api/get-categories';
export { createCategory } from './api/create-category';
export { updateCategory } from './api/update-category';
export { deleteCategory } from './api/delete-category';
export { CategoryBadge } from './ui/category-badge';
export { CategoryAppearancePicker } from './ui/category-appearance-picker';
