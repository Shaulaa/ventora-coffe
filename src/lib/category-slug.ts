export function categoryToSlug(category: string) {
  return category.toLowerCase().replace(/-/g, "");
}
