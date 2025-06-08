# Next.js App Module
module "nextjs_app" {
  source = "./nextjs-app"

  project_id           = var.project_id
  region               = var.region
  app_name             = var.app_name
  environment          = var.environment
  min_instance_count   = var.min_instance_count
  max_instance_count   = var.max_instance_count
  github_repository_id = google_cloudbuildv2_repository.github_repository.id
  repository_name      = google_artifact_registry_repository.app.repository_id
  trigger_branch       = var.trigger_branch

  # Supabase環境変数
  NEXT_PUBLIC_SUPABASE_URL      = var.NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY = var.NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_SENTRY_DSN        = var.NEXT_PUBLIC_SENTRY_DSN
  NEXT_PUBLIC_GA_ID             = var.NEXT_PUBLIC_GA_ID
  NEXT_PUBLIC_APP_ORIGIN        = var.NEXT_PUBLIC_APP_ORIGIN
  SUPABASE_SERVICE_ROLE_KEY     = var.SUPABASE_SERVICE_ROLE_KEY
  SUPABASE_DB_PASSWORD          = var.SUPABASE_DB_PASSWORD
  SUPABASE_ACCESS_TOKEN         = var.SUPABASE_ACCESS_TOKEN
  SUPABASE_PROJECT_ID           = var.SUPABASE_PROJECT_ID
  SUPABASE_SMTP_HOST            = var.SUPABASE_SMTP_HOST
  SUPABASE_SMTP_USER            = var.SUPABASE_SMTP_USER
  SUPABASE_SMTP_PASS            = var.SUPABASE_SMTP_PASS
  SUPABASE_SMTP_ADMIN_EMAIL     = var.SUPABASE_SMTP_ADMIN_EMAIL
  SUPABASE_SMTP_SENDER_NAME     = var.SUPABASE_SMTP_SENDER_NAME
  SUPABASE_SITE_URL             = var.SUPABASE_SITE_URL
  SENTRY_AUTH_TOKEN             = var.SENTRY_AUTH_TOKEN
  BATCH_ADMIN_KEY               = var.BATCH_ADMIN_KEY
}
