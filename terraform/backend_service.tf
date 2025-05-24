# Global IP address
resource "google_compute_global_address" "default" {
  name = "${var.app_name}-address"
}

# SSL Certificate
resource "google_compute_managed_ssl_certificate" "default" {
  name = "${var.app_name}-cert"
  managed {
    domains = [var.application_domain_name]
  }
}

# Serverless NEG for Cloud Run
resource "google_compute_region_network_endpoint_group" "cloud_run_neg" {
  name                  = "${var.app_name}-cloud-run-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = module.nextjs_app.service_name
  }
}

# Backend Service (without IAP)
resource "google_compute_backend_service" "cloud_run" {
  name = "${var.app_name}-backend"

  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.cloud_run_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }

  # IAP is not enabled as per requirements
}


# URL Map - すべてのトラフィックをCloud Runに転送
resource "google_compute_url_map" "default" {
  name            = "${var.app_name}-url-map"
  default_service = google_compute_backend_service.cloud_run.id

  depends_on = [
    module.nextjs_app
  ]
}

# HTTPS Proxy
resource "google_compute_target_https_proxy" "default" {
  name             = "${var.app_name}-https-proxy"
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

# Forwarding Rule
resource "google_compute_global_forwarding_rule" "https" {
  name       = "${var.app_name}-https-rule"
  target     = google_compute_target_https_proxy.default.id
  port_range = "443"
  ip_address = google_compute_global_address.default.address
}

# HTTP to HTTPS redirect
resource "google_compute_url_map" "https_redirect" {
  name = "${var.app_name}-https-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "https_redirect" {
  name    = "${var.app_name}-http-proxy"
  url_map = google_compute_url_map.https_redirect.id
}

resource "google_compute_global_forwarding_rule" "https_redirect" {
  name       = "${var.app_name}-http-rule"
  target     = google_compute_target_http_proxy.https_redirect.id
  port_range = "80"
  ip_address = google_compute_global_address.default.address
}
