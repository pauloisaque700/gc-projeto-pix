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
  default = "terraform-dev"
}

variable "backend_image" {
  type    = string
  default = "pix-backend:local"
}

variable "frontend_image" {
  type    = string
  default = "pix-frontend:local"
}

variable "mysql_image" {
  type    = string
  default = "mysql:8.4"
}

variable "backend_port" {
  type    = number
  default = 8080
}

variable "frontend_port" {
  type    = number
  default = 3000
}

variable "mysql_port" {
  type    = number
  default = 3306
}

variable "mysql_user" {
  type    = string
  default = "byebank"
}

variable "mysql_password" {
  type      = string
  sensitive = true
  default   = "byebank123"
}

variable "mysql_root_password" {
  type      = string
  sensitive = true
  default   = "rootpassword123"
}

resource "docker_network" "pix_net" {
  name = "pix-network-${var.env_name}"
}

resource "docker_volume" "mysql_data" {
  name = "pix-mysql-data-${var.env_name}"
}

resource "docker_image" "mysql" {
  name         = var.mysql_image
  keep_locally = true
}

resource "docker_container" "mysql" {
  name         = "pix-mysql-${var.env_name}"
  image        = docker_image.mysql.image_id
  wait         = true
  wait_timeout = 120
  env = [
    "MYSQL_DATABASE=byebank_db",
    "MYSQL_USER=${var.mysql_user}",
    "MYSQL_PASSWORD=${var.mysql_password}",
    "MYSQL_ROOT_PASSWORD=${var.mysql_root_password}",
  ]

  ports {
    internal = 3306
    external = var.mysql_port
    ip       = "127.0.0.1"
  }

  mounts {
    type   = "volume"
    source = docker_volume.mysql_data.name
    target = "/var/lib/mysql"
  }

  mounts {
    type      = "bind"
    source    = abspath("${path.module}/../init.sql")
    target    = "/docker-entrypoint-initdb.d/01-init.sql"
    read_only = true
  }

  healthcheck {
    test = [
      "CMD-SHELL",
      "mysql --protocol=TCP --host=127.0.0.1 --user=\"$MYSQL_USER\" --password=\"$MYSQL_PASSWORD\" --database=\"$MYSQL_DATABASE\" --execute=\"SELECT 1 FROM log_login LIMIT 0\"",
    ]
    interval = "5s"
    timeout  = "5s"
    retries  = 10
  }

  networks_advanced {
    name    = docker_network.pix_net.name
    aliases = ["mysql"]
  }
}

resource "docker_container" "backend" {
  name  = "pix-backend-${var.env_name}"
  image = var.backend_image
  env = [
    "SPRING_PROFILES_ACTIVE=mysql",
    "SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/byebank_db?serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false",
    "SPRING_DATASOURCE_USERNAME=${var.mysql_user}",
    "SPRING_DATASOURCE_PASSWORD=${var.mysql_password}",
  ]

  ports {
    internal = 8080
    external = var.backend_port
  }

  networks_advanced {
    name = docker_network.pix_net.name
  }

  depends_on = [docker_container.mysql]
}

resource "docker_container" "frontend" {
  name  = "pix-frontend-${var.env_name}"
  image = var.frontend_image

  ports {
    internal = 3000
    external = var.frontend_port
  }

  networks_advanced {
    name = docker_network.pix_net.name
  }

  depends_on = [docker_container.backend]
}
