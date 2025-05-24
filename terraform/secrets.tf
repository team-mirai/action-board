# Secret Manager secret for Supabase Service Role Key
resource "google_secret_manager_secret" "supabase_service_role_key" {
  secret_id = "supabase-service-role-key"
  
  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

# Secret version for Supabase Service Role Key
resource "google_secret_manager_secret_version" "supabase_service_role_key" {
  secret      = google_secret_manager_secret.supabase_service_role_key.id
  secret_data = var.SUPABASE_SERVICE_ROLE_KEY
}

# IAM binding to allow Cloud Run service account to access the secret
resource "google_secret_manager_secret_iam_member" "supabase_service_role_key_access" {
  secret_id = google_secret_manager_secret.supabase_service_role_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${module.nextjs_app.service_account_email}"

  depends_on = [module.nextjs_app]
}