<template>
  <div class="min-h-screen flex bg-slate-950">
    <!-- ─── Left Panel — Branding ──────────────────────────────────────── -->
    <div
      class="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden"
      style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1a36 100%)"
    >
      <!-- Grid pattern overlay -->
      <div
        class="absolute inset-0 opacity-[0.04]"
        style="
          background-image:
            linear-gradient(#94a3b8 1px, transparent 1px),
            linear-gradient(to right, #94a3b8 1px, transparent 1px);
          background-size: 40px 40px;
        "
      />

      <!-- Glow blobs -->
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style="background: radial-gradient(circle, #0ea5e9, transparent)"
      />
      <div
        class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
        style="background: radial-gradient(circle, #6366f1, transparent)"
      />

      <!-- Logo -->
      <div class="relative flex items-center gap-3 z-10">
        <div
          class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30"
        >
          <ZapIcon class="w-5 h-5 text-white" />
        </div>
        <span class="text-white font-bold text-xl tracking-tight">Nexora</span>
      </div>

      <!-- Hero text -->
      <div class="relative z-10 space-y-6">
        <div class="space-y-3">
          <p class="text-primary-400 text-sm font-semibold uppercase tracking-widest">
            Enterprise SaaS Platform
          </p>
          <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Manage your business<br />
            <span class="text-primary-400">with confidence.</span>
          </h1>
          <p class="text-slate-400 text-lg leading-relaxed max-w-md">
            Unified multi-tenant platform for product management, analytics, and operational
            control.
          </p>
        </div>

        <!-- Feature list -->
        <div class="space-y-3 pt-2">
          <div
            v-for="feature in features"
            :key="feature"
            class="flex items-center gap-3 text-slate-300 text-sm"
          >
            <div
              class="w-5 h-5 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shrink-0"
            >
              <CheckIcon class="w-3 h-3 text-primary-400" />
            </div>
            {{ feature }}
          </div>
        </div>
      </div>

      <!-- Footer note -->
      <p class="relative z-10 text-slate-600 text-xs">
        © {{ new Date().getFullYear() }} Nexora Inc. Enterprise Edition.
      </p>
    </div>

    <!-- ─── Right Panel — Login Form ──────────────────────────────────── -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="flex items-center gap-2.5 mb-10 lg:hidden">
          <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <ZapIcon class="w-4 h-4 text-white" />
          </div>
          <span class="text-slate-900 font-bold text-lg">Nexora</span>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p class="text-slate-500 text-sm mt-1.5">
            Enter your credentials to access your workspace.
          </p>
        </div>

        <!-- Error alert -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="authStore.error"
            class="mb-6 flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          >
            <AlertCircleIcon class="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{{ authStore.error }}</span>
          </div>
        </Transition>

        <!-- Form -->
        <form class="space-y-5" @submit.prevent="handleLogin">
          <!-- Email -->
          <div class="space-y-1.5">
            <label for="email" class="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MailIcon class="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                placeholder="you@company.com"
                class="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                :class="{
                  'border-red-300 focus:ring-red-500/20 focus:border-red-400':
                    authStore.error || validationErrors.email,
                }"
              />
            </div>
            <p v-if="validationErrors.email" class="text-xs text-red-600">
              {{ validationErrors.email }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium text-slate-700">
                Password
              </label>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockIcon class="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                class="block w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                :class="{
                  'border-red-300 focus:ring-red-500/20 focus:border-red-400': authStore.error,
                }"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                @click="showPassword = !showPassword"
              >
                <EyeOffIcon v-if="showPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="validationErrors.password" class="text-xs text-red-600">
              {{ validationErrors.password }}
            </p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Loader2Icon v-if="authStore.loading" class="w-4 h-4 animate-spin" />
            <span>{{ authStore.loading ? 'Signing in…' : 'Sign in' }}</span>
            <ArrowRightIcon v-if="!authStore.loading" class="w-4 h-4" />
          </button>
        </form>

        <!-- Footer -->
        <p class="mt-8 text-center text-xs text-slate-400">
          Access is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import {
  Zap as ZapIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Loader2 as Loader2Icon,
  ArrowRight as ArrowRightIcon,
  AlertCircle as AlertCircleIcon,
  Check as CheckIcon,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const validationErrors = reactive({
  email: '',
  password: '',
})

const features = [
  'JWT-authenticated multi-tenant isolation',
  'Real-time product catalog management',
  'Role-based access control (RBAC)',
  'Enterprise-grade audit logging',
]
const validateForm = () => {
  validationErrors.email = ''
  validationErrors.password = ''

  let isValid = true

  // EMAIL REQUIRED
  if (!form.email.trim()) {
    validationErrors.email = 'Email is required'

    isValid = false
  }

  // EMAIL FORMAT
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    validationErrors.email = 'Enter a valid email address'

    isValid = false
  }

  // PASSWORD REQUIRED
  if (!form.password.trim()) {
    validationErrors.password = 'Password is required'

    isValid = false
  }

  return isValid
}
const handleLogin = async () => {
  // CLEAR OLD STORE ERROR
  authStore.error = ''

  // VALIDATE FIRST
  if (!validateForm()) {
    return
  }

  try {
    const response = await authStore.login(form)

    if (response?.accessToken) {
      router.push('/dashboard')
    }
  } catch {
    // handled in store
  }
}
</script>
