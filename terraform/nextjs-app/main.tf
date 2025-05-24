# Cloud Run Service Account
resource "google_service_account" "cloud_run" {
  account_id   = "${var.app_name}-${var.environment}-sa-cr"
  display_name = "Service Account for ${var.app_name} ${var.environment} Cloud Run"
}

# Cloud Run service
resource "google_cloud_run_v2_service" "default" {
  name     = "${var.app_name}-${var.environment}"
  location = var.region

  # Public access (no IAP)
  ingress = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      ports {
        container_port = 3000 # Next.jsのデフォルトポート
      }
      # Initial dummy image
      image = "gcr.io/cloudrun/hello"

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      # Supabase環境変数
      env {
        name  = "NEXT_PUBLIC_SUPABASE_URL"
        value = var.NEXT_PUBLIC_SUPABASE_URL
      }

      env {
        name  = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        value = var.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }

      env {
        name = "SUPABASE_SERVICE_ROLE_KEY"
        value_source {
          secret_key_ref {
            secret  = "supabase-service-role-key"
            version = "latest"
          }
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }

    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }

    service_account = google_service_account.cloud_run.email
  }

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].containers[0].image,
    ]
  }
}

# Allow unauthenticated access to the Cloud Run service
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.default.location
  service  = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output values
output "service_name" {
  description = "The name of the Cloud Run service"
  value       = "${var.app_name}-${var.environment}"
}

output "service_location" {
  description = "The location of the Cloud Run service"
  value       = var.region
}

output "service_url" {
  description = "The URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.default.uri
}

output "service_account_email" {
  description = "The email of the Cloud Run service account"
  value       = google_service_account.cloud_run.email
}
