# Cloud Build Service Account data source
data "google_service_account" "cloud_build" {
  account_id = "${var.service_name}-sa-cb"
  project    = var.project_id
}

