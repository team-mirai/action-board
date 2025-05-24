# Supabase Database Password Secret
resource "google_secret_manager_secret" "supabase_db_password" {
  secret_id = "SUPABASE_DB_PASSWORD"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "supabase_db_password" {
  secret      = google_secret_manager_secret.supabase_db_password.id
  secret_data = var.SUPABASE_DB_PASSWORD
}

resource "google_secret_manager_secret" "supabase_service_role_key" {
  secret_id = "SUPABASE_SERVICE_ROLE_KEY"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "supabase_service_role_key" {
  secret      = google_secret_manager_secret.supabase_service_role_key.id
  secret_data = var.SUPABASE_SERVICE_ROLE_KEY
}

# Cloud Build サービスアカウントにシークレットアクセス権限を付与
resource "google_secret_manager_secret_iam_member" "supabase_db_password_accessor" {
  secret_id = google_secret_manager_secret.supabase_db_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "supabase_service_role_key_accessor" {
  secret_id = google_secret_manager_secret.supabase_service_role_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

