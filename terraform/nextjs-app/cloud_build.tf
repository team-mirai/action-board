# Cloud Build trigger
resource "google_cloudbuild_trigger" "build_and_deploy" {
  name            = "build-and-deploy-${var.app_name}-${var.environment}"
  description     = "Build and deploy ${var.app_name} ${var.environment} to Cloud Run"
  location        = var.region
  service_account = var.cloud_build_service_account_email

  repository_event_config {
    repository = var.github_repository_id
    push {
      branch = var.trigger_branch
    }
  }

  included_files = [
    "cloudbuild.yaml",
    "Dockerfile",
    "app/**",
    "package.json",
    "package-lock.json"
  ]

  filename = "cloudbuild.yaml"

  substitutions = {
    _REGION                        = var.region
    _SERVICE_NAME                  = "${var.app_name}-${var.environment}"
    _REPOSITORY_NAME               = var.repository_name
    _NEXT_PUBLIC_SUPABASE_URL      = var.NEXT_PUBLIC_SUPABASE_URL
    _NEXT_PUBLIC_SUPABASE_ANON_KEY = var.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}
