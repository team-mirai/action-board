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
  app_path             = "."  # リポジトリのルートディレクトリ
  trigger_branch       = var.trigger_branch

  # Supabase環境変数
  NEXT_PUBLIC_SUPABASE_URL     = var.NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY = var.NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY    = var.SUPABASE_SERVICE_ROLE_KEY
  
  # Cloud Build Service Account
  cloud_build_service_account_email = google_service_account.cloud_build.email
}

# Outputs
output "cloud_run_service_url" {
  description = "The URL of the deployed Cloud Run service"
  value       = module.nextjs_app.service_url
}

output "load_balancer_ip" {
  description = "The IP address of the load balancer"
  value       = google_compute_global_address.default.address
}

output "domain_name" {
  description = "The domain name for the application"
  value       = var.application_domain_name
}