variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for deploying resources"
  type        = string
}

variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "min_instance_count" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 0
}

variable "max_instance_count" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 2
}

variable "github_repository_id" {
  description = "GitHub repository ID"
  type        = string
}

variable "repository_name" {
  description = "Artifact Registry repository name"
  type        = string
}

variable "use_inline_build" {
  description = "Whether to use inline build steps instead of cloudbuild.yaml"
  type        = bool
  default     = false
}

variable "trigger_branch" {
  description = "Git branch pattern to trigger the build"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production, etc.)"
  type        = string
  default     = "dev"
}

# Supabase関連の変数
variable "NEXT_PUBLIC_SUPABASE_URL" {
  description = "Supabase URL (public)"
  type        = string
}

variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" {
  description = "Supabase Anonymous Key (public)"
  type        = string
}

variable "SUPABASE_SERVICE_ROLE_KEY" {
  description = "Supabase Service Role Key (sensitive)"
  type        = string
  sensitive   = true
}

variable "SUPABASE_ACCESS_TOKEN" {
  description = "Supabase Access Token (sensitive)"
  type        = string
  sensitive   = true
}

variable "SUPABASE_PROJECT_ID" {
  description = "Supabase Project ID"
  type        = string
}

variable "NEXT_PUBLIC_SENTRY_DSN" {
  description = "Sentry DSN for error tracking (public)"
  type        = string
}

variable "service_account" {
  description = "Cloud Build service account email"
  type        = string
}
