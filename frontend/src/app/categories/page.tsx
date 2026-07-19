import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>🏷️ Категории</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Раздел в разработке</p>
        </CardContent>
      </Card>
    </main>
  );
}
