# Cloud Build trigger
resource "google_cloudbuild_trigger" "build_and_deploy" {
  name            = "build-and-deploy-${var.app_name}-${var.environment}"
  description     = "Build and deploy ${var.app_name} ${var.environment} to Cloud Run"
  location        = var.region
  service_account = var.service_account

  repository_event_config {
    repository = var.github_repository_id
    push {
      branch = var.trigger_branch
    }
  }

  included_files = [
    "cloudbuild.yaml",
    "Dockerfile",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "postcss.config.js",
    "tailwind.config.ts",
    "middleware.ts",
    "app/**",
    "components/**",
    "lib/**",
    "utils/**",
    "public/**",
    "supabase/**"
  ]

  ignored_files = [
    "README.md",
    "LICENSE",
    ".dockerignore",
    ".gitignore",
    ".env",
    ".env.*",
    ".git/**",
    ".github/**",
    "tests/**",
    "playwright.config.ts",
    "reviewrules.toml",
    "terraform/**",
    "stories/**",
    "vitest.config.ts",
    "biome.json",
  ]

  filename = "cloudbuild.yaml"

  substitutions = {
    _REGION                        = var.region
    _SERVICE_NAME                  = "${var.app_name}-${var.environment}"
    _REPOSITORY_NAME               = var.repository_name
    _NEXT_PUBLIC_SUPABASE_URL      = var.NEXT_PUBLIC_SUPABASE_URL
    _NEXT_PUBLIC_SUPABASE_ANON_KEY = var.NEXT_PUBLIC_SUPABASE_ANON_KEY
    _NEXT_PUBLIC_SENTRY_DSN        = var.NEXT_PUBLIC_SENTRY_DSN
    _SUPABASE_PROJECT_ID           = var.SUPABASE_PROJECT_ID
  }
}
