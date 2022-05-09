dev:
	docker-compose up -d

dev-down:
	docker-compose down

dev-down-volume:
	docker-compose down

migrate:
	rm -rf build && yarn build && yarn typeorm migration:generate ./src/migrations/added-active -d ./src/utils/data-source.ts
	

db-push:
	yarn build && yarn typeorm migrate:run