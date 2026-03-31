import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/views/auth/sign-in'
import { useAuthStore } from '@/stores/auth-store'
import { getPostLoginRedirect } from '@/views/auth/lib/auth-contract'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: ({ search }) => {
    const auth = useAuthStore.getState().auth

    if (auth.accessToken) {
      throw redirect({ to: getPostLoginRedirect(search.redirect) })
    }
  },
  component: SignIn,
  validateSearch: searchSchema,
})

