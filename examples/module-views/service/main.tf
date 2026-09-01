variable "name" {
  type = string
}

resource "terraform_data" "service" {
  input = var.name
}

output "id" {
  value = terraform_data.service.id
}
