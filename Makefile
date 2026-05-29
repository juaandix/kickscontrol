.PHONY: db dev full build test seed logs clean help

# Levantar solo la base de datos (desarrollo local)
db:
	docker compose --profile db up -d
	@echo "PostgreSQL ready on localhost:5432"

# Levantar BD + backend en modo desarrollo (hot reload con maven)
dev: db
	cd kickscontrol-backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Levantar todo el stack en Docker
full:
	docker compose --profile full up --build -d
	@echo "Stack running: http://localhost:3000 | API: http://localhost:8080 | Swagger: http://localhost:8080/swagger-ui.html"

# Construir imágenes sin levantar
build:
	docker compose --profile full build

# Ejecutar tests del backend
test:
	cd kickscontrol-backend && ./mvnw verify

# Resetear la BD y recargar el seed (elimina datos existentes)
seed:
	docker compose --profile db up -d
	@sleep 3
	docker exec kickscontrol-db psql -U kickscontrol_user -d kickscontrol -f /docker-entrypoint-initdb.d/02-seed.sql
	@echo "Seed data loaded"

# Ver logs de todos los servicios
logs:
	docker compose --profile full logs -f

# Ver logs de un servicio específico: make logs-backend
logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f postgres

# Parar todos los contenedores y eliminar volúmenes
clean:
	docker compose --profile full down -v
	@echo "All containers stopped and volumes removed"

# Parar sin eliminar volúmenes
stop:
	docker compose --profile full down

help:
	@echo ""
	@echo "KicksControl - Available commands:"
	@echo "  make db          Start PostgreSQL only (local development)"
	@echo "  make dev         Start DB + backend with hot reload"
	@echo "  make full        Start full stack in Docker"
	@echo "  make build       Build Docker images"
	@echo "  make test        Run backend tests"
	@echo "  make seed        Reload seed data"
	@echo "  make logs        Tail all service logs"
	@echo "  make clean       Stop all + delete volumes"
	@echo "  make stop        Stop all (keep volumes)"
	@echo ""
