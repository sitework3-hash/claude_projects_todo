'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import Link from 'next/link';

import { HttpError } from '@/shared/api';
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/ui';
import { useSession } from '@/entities/session';
import { login } from '../api/login';
import { loginSchema, type LoginValues } from '../model/schema';

/** Куда отправлять пользователя после успешного входа. */
const REDIRECT_TO = '/';

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useSession();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', agreement: false },
  });

  async function onSubmit(values: LoginValues) {
    try {
      const result = await login(values);
      signIn(result);
      toast.success('С возвращением!');
      router.push(REDIRECT_TO);
    } catch (error) {
      const message =
        error instanceof HttpError ? error.message : 'Не удалось войти. Попробуйте позже.';
      toast.error(message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agreement"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <FormLabel className="text-muted-foreground text-[11px] font-normal leading-snug">
                  Согласен с{' '}
                  <Link
                    href="/terms"
                    className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                    target="_blank"
                  >
                    пользовательским соглашением
                  </Link>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Вход…' : 'Войти'}
        </Button>
      </form>
    </Form>
  );
}
