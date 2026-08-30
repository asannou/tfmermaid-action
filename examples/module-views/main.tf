module "blue" {
  source = "./service"
  name   = "blue"
}

module "green" {
  source = "./service"
  name   = "green"
}

resource "terraform_data" "gateway" {
  input = [module.blue.id, module.green.id]
}

output "service_ids" {
  value = terraform_data.gateway.output
}
