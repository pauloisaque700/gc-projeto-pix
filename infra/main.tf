terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {}

variable "env_name" {
  type    = string
  default = "dev"
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "backend_port" {
  type    = number
  default = 8080
}

variable "frontend_port" {
  type    = number
  default = 3000
}

resource "docker_network" "pix_net" {
  name = "pix-network-${var.env_name}"
}

resource "docker_container" "backend" {
  name  = "pix-backend-${var.env_name}"
  image = "ghcr.io/pauloisaque700/gc-projeto-pix-backend:${var.image_tag}"
  env   = ["SPRING_PROFILES_ACTIVE=${var.env_name}"]

  ports {
    internal = 8080
    external = var.backend_port
  }

  networks_advanced {
    name = docker_network.pix_net.name
  }
}

resource "docker_container" "frontend" {
  name  = "pix-frontend-${var.env_name}"
  image = "ghcr.io/pauloisaque700/gc-projeto-pix-frontend:${var.image_tag}"

  ports {
    internal = 3000
    external = var.frontend_port
  }

  networks_advanced {
    name = docker_network.pix_net.name
  }

  depends_on = [docker_container.backend]
}
