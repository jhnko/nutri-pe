FRONTEND_VERSION := `jq < client/package.json .version -r`
BACKEND_VERSION := `jq < server/package.json .version -r`

FRONTEND_TAG := "nutripe/frontend:" + FRONTEND_VERSION
BACKEND_TAG := "nutripe/backend:" + FRONTEND_VERSION

build-backend:
    docker build --tag {{BACKEND_TAG}} -f backend.Dockerfile .

build-frontend:
    docker build --tag {{FRONTEND_TAG}} -f frontend.Dockerfile .
