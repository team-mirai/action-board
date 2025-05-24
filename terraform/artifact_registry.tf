# Artifact Registry Repository
resource "google_artifact_registry_repository" "app" {
  location      = var.region
  repository_id = var.app_name
  description   = "Docker repository for ${var.app_name} application"
  format        = "DOCKER"

  depends_on = [
    google_project_service.required_apis
  ]
}
