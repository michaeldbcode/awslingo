# variables.tf
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "aws-quiz-app"
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
  default     = "dev"
}

variable "lambda_function_paths" {
  description = "Map of Lambda function names to their zip file paths"
  type = map(string)
  default = {
    validate_user   = "lambda/validate_user.zip"
    get_leaderboard = "lambda/get_leaderboard.zip"
  }
}