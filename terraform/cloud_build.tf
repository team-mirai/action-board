# Cloud Build Service Account
resource "google_service_account" "cloud_build" {
  account_id   = "${var.app_name}-${var.environment}-sa-cb"
  display_name = "Service Account for ${var.app_name} ${var.environment} Cloud Build"
}

# Grant Cloud Build roles
resource "google_project_iam_member" "cloudbuild_iam" {
  for_each = toset([
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/secretmanager.secretAccessor",
    "roles/secretmanager.secretVersionManager",
    "roles/logging.logWriter",
    "roles/artifactregistry.writer",
  ])
  role   = each.key
  member = "serviceAccount:${google_service_account.cloud_build.email}"

  project = var.project_id
}

# GitHub Connection
resource "google_cloudbuildv2_connection" "github_connection" {
  location = var.region
  name     = "github-connection"

  github_config {
    app_installation_id = var.github_app_installation_id
    authorizer_credential {
      oauth_token_secret_version = var.github_oauth_token_secret_version
    }
  }
}

# GitHub Repository
resource "google_cloudbuildv2_repository" "github_repository" {
  name              = "${var.app_name}-${var.environment}-repo"
  parent_connection = google_cloudbuildv2_connection.github_connection.id
  remote_uri        = var.github_repository_remote_uri
}
