data "aws_caller_identity" "current" {}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

# Create private subnets
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name        = "${var.project_name}-private-1"
    Environment = var.environment
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name        = "${var.project_name}-private-2"
    Environment = var.environment
  }
}

# Security Group for Lambda functions
resource "aws_security_group" "lambda_sg" {
  name_prefix = "${var.project_name}-lambda-sg"
  vpc_id      = aws_vpc.main.id

  # Allow HTTPS outbound (for DynamoDB and CloudWatch)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-lambda-sg"
    Environment = var.environment
  }
}

# VPC Endpoint for DynamoDB
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  vpc_endpoint_type = "Gateway"

  route_table_ids = [aws_route_table.private.id]

  tags = {
    Name        = "${var.project_name}-dynamodb-endpoint"
    Environment = var.environment
  }
}

# Route table for private subnets
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-private-rt"
    Environment = var.environment
  }
}

# Route table associations
resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}

# Get current region
data "aws_region" "current" {}

# DynamoDB table for quiz attempts
resource "aws_dynamodb_table" "quiz_attempts" {
  name           = "${var.project_name}-attempts"
  billing_mode   = "PAY_PER_REQUEST"  # Stays within free tier
  hash_key       = "ip_address"
  range_key      = "username"

  attribute {
    name = "ip_address"
    type = "S"
  }

  attribute {
    name = "username"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-attempts"
    Environment = var.environment
  }
}

# DynamoDB table for quiz results/leaderboard
resource "aws_dynamodb_table" "quiz_results" {
  name           = "${var.project_name}-results"
  billing_mode   = "PAY_PER_REQUEST"  # Stays within free tier
  hash_key       = "username"

  attribute {
    name = "username"
    type = "S"
  }

  # GSI for leaderboard sorting
  attribute {
    name = "score"
    type = "N"
  }

  global_secondary_index {
    name            = "LeaderboardIndex"
    hash_key        = "score"
    projection_type = "ALL"
    write_capacity  = 0
    read_capacity   = 0
  }

  tags = {
    Name        = "${var.project_name}-results"
    Environment = var.environment
  }
}

# S3 bucket for Lambda code
resource "aws_s3_bucket" "lambda_code" {
  bucket = "${var.project_name}-lambda-code-${random_string.suffix.result}"
}

# Random string to ensure unique S3 bucket name
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${var.project_name}-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.quiz_attempts.arn,
          aws_dynamodb_table.quiz_results.arn,
          "${aws_dynamodb_table.quiz_results.arn}/index/*"
        ]
      }
    ]
  })
}

# IAM policy for Lambda CloudWatch logs
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# IAM policy for Lambda VPC execution
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# API Gateway
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["Content-Type"]
    allow_methods     = ["GET", "POST", "OPTIONS"]
    allow_origins     = ["http://192.168.1.97:3000", "http://localhost:3000", "https://d3vhln997vukvf.cloudfront.net"]
    max_age          = 300
  }
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true
}

# Lambda functions
resource "aws_lambda_function" "handle_options" {
  filename      = "lambda/handle_options.zip"
  function_name = "${var.project_name}-handle-options"
  role         = aws_iam_role.lambda_role.arn
  handler      = "handle_options.handler"
  runtime      = "nodejs18.x"

  vpc_config {
    subnet_ids         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }
}

resource "aws_lambda_function" "validate_user" {
  filename      = "lambda/validate_user.zip"
  function_name = "${var.project_name}-validate-user"
  role         = aws_iam_role.lambda_role.arn
  handler      = "validate_user.handler"
  runtime      = "nodejs18.x"

  vpc_config {
    subnet_ids         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      ATTEMPTS_TABLE = aws_dynamodb_table.quiz_attempts.name
    }
  }
}

resource "aws_lambda_function" "get_leaderboard" {
  filename      = "lambda/get_leaderboard.zip"
  function_name = "${var.project_name}-get-leaderboard"
  role         = aws_iam_role.lambda_role.arn
  handler      = "get_leaderboard.handler"
  runtime      = "nodejs18.x"

  vpc_config {
    subnet_ids         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      RESULTS_TABLE = aws_dynamodb_table.quiz_results.name
    }
  }
}

resource "aws_lambda_function" "submit_quiz" {
  filename      = "lambda/submit_quiz.zip"
  function_name = "${var.project_name}-submit-quiz"
  role         = aws_iam_role.lambda_role.arn
  handler      = "submit_quiz.handler"
  runtime      = "nodejs18.x"

  vpc_config {
    subnet_ids         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      RESULTS_TABLE = aws_dynamodb_table.quiz_results.name
    }
  }
}

# API Gateway integrations
resource "aws_apigatewayv2_integration" "handle_options" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.handle_options.invoke_arn
}

resource "aws_apigatewayv2_integration" "validate_user" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.validate_user.invoke_arn
}

resource "aws_apigatewayv2_integration" "get_leaderboard" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.get_leaderboard.invoke_arn
}

resource "aws_apigatewayv2_integration" "submit_quiz" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.submit_quiz.invoke_arn
}

# API Gateway routes
resource "aws_apigatewayv2_route" "options" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "OPTIONS /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.handle_options.id}"
}

resource "aws_apigatewayv2_route" "validate_user" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /validate-user"
  target    = "integrations/${aws_apigatewayv2_integration.validate_user.id}"
}

resource "aws_apigatewayv2_route" "get_leaderboard" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /leaderboard"
  target    = "integrations/${aws_apigatewayv2_integration.get_leaderboard.id}"
}

resource "aws_apigatewayv2_route" "submit_quiz" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /submit-quiz"
  target    = "integrations/${aws_apigatewayv2_integration.submit_quiz.id}"
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "handle_options" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handle_options.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "validate_user" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.validate_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_leaderboard" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_leaderboard.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "submit_quiz" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submit_quiz.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# S3 bucket for website hosting
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-website-${random_string.suffix.result}"

  tags = {
    Name        = "${var.project_name}-website"
    Environment = var.environment
  }
}

# Enable versioning for the website bucket
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable website hosting on the S3 bucket
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${var.project_name}-website-oac"
  description                       = "OAC for ${var.project_name} website"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# S3 bucket policy for CloudFront
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })
}

# CloudFront Function for default directory index
resource "aws_cloudfront_function" "rewrite_uri" {
  name    = "rewrite-uri"
  runtime = "cloudfront-js-1.0"
  publish = true
  code    = <<-EOT
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check whether the URI is missing a file name.
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } 
    // Check whether the URI is missing a file extension.
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
}
EOT
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled    = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
    origin_id                = "S3Origin"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"
    compress         = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite_uri.arn
    }

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Custom error responses
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

aliases = ["cloudquiz.xyz", "www.cloudquiz.xyz"]

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  tags = {
    Name        = "${var.project_name}-distribution"
    Environment = var.environment
  }
}

# ACM Certificate for CloudFront
resource "aws_acm_certificate" "cert" {
  provider                  = aws.us-east-1  # Must be in us-east-1 for CloudFront
  domain_name              = "cloudquiz.xyz"
  subject_alternative_names = ["*.cloudquiz.xyz"]  # Covers subdomains
  validation_method        = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-certificate"
    Environment = var.environment
  }
}

# Output the validation details
output "acm_validation_records" {
  value = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  description = "The DNS records needed to validate the ACM certificate"
}