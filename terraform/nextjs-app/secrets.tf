# Secret Manager secret
resource "google_secret_manager_secret" "supabase_service_role_key" {
  secret_id = "${var.app_name}-${var.environment}-supabase-service-role-key"

  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "supabase_service_role_key" {
  secret         = google_secret_manager_secret.supabase_service_role_key.id
  secret_data_wo = var.SUPABASE_SERVICE_ROLE_KEY
}

resource "google_secret_manager_secret" "supabase_access_token" {
  secret_id = "${var.app_name}-${var.environment}-supabase-access-token"

  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "supabase_access_token" {
  secret         = google_secret_manager_secret.supabase_access_token.id
  secret_data_wo = var.SUPABASE_ACCESS_TOKEN
}

resource "google_secret_manager_secret" "supabase_db_password" {
  secret_id = "${var.app_name}-${var.environment}-supabase-db-password"

  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "supabase_db_password" {
  secret         = google_secret_manager_secret.supabase_db_password.id
  secret_data_wo = var.SUPABASE_DB_PASSWORD
}

resource "google_secret_manager_secret" "supabase_smtp_pass" {
  secret_id = "${var.app_name}-${var.environment}-supabase-smtp-password"

  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "supabase_smtp_pass" {
  secret         = google_secret_manager_secret.supabase_smtp_pass.id
  secret_data_wo = var.SUPABASE_SMTP_PASS
}

