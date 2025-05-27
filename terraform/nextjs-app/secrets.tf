# Secret Manager secret
resource "google_secret_manager_secret" "supabase_service_role_key" {
  secret_id = "${var.app_name}-${var.environment}-supabase-service-role-key"

  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "supabase_service_role_key" {
  secret      = google_secret_manager_secret.supabase_service_role_key.id
  secret_data = var.SUPABASE_SERVICE_ROLE_KEY
}

resource "google_secret_manager_secret" "supabase_access_token" {
  secret_id = "${var.app_name}-${var.environment}-supabase-access-token"

  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "supabase_access_token" {
  secret      = google_secret_manager_secret.supabase_access_token.id
  secret_data = var.SUPABASE_ACCESS_TOKEN
}

resource "google_secret_manager_secret" "supabase_db_password" {
  secret_id = "${var.app_name}-${var.environment}-SUPABASE_DB_PASSWORD"

  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "supabase_db_password" {
  secret      = google_secret_manager_secret.supabase_db_password.id
  secret_data = var.SUPABASE_DB_PASSWORD
}

