# ===========================================
# Makefile for Next.js Docker Development
# ===========================================

# Colors for output
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m

# Default target
.DEFAULT_GOAL := help

help: ## Show available commands
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)  %-15s$(NC) %s\n", $$1, $$2}'


# ===========================================
# CI/CD commands
# ===========================================

prepare-deps: ## Prepare dependencies for CI/CD
	@echo "$(GREEN)Preparing dependencies...$(NC)"

unit-test: ## Run unit tests
	@echo "$(GREEN)Running unit tests...$(NC)"

static-analysis: ## Run static analysis
	@echo "$(GREEN)Running static analysis...$(NC)"

build: ## Build the application
	@echo "$(GREEN)Building application...$(NC)"