output "load_balancer_ip" {
  description = "The IP address of the load balancer"
  value       = google_compute_global_address.default.address
}

output "domain_name" {
  description = "The domain name for the application"
  value       = var.application_domain_name
}
