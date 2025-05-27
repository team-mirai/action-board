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
