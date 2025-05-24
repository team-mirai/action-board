# Cloud Build Service Account data source
data "google_service_account" "cloud_build" {
  account_id = "${var.app_name}-${var.environment}-sa-cb"
  project    = var.project_id
}

