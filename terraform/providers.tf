terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Default provider
provider "aws" {
  region = "us-east-1"
}

# Additional provider configuration for us-east-1
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}