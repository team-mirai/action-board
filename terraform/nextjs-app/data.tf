# Cloud Build Service Account data source
data "google_service_account" "cloud_build" {
  account_id = "${var.service_name}-sa-cloud-build"
  project    = var.project_id
}