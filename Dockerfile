# Use an official nginx image as the base image
FROM nginx:alpine

# Copy the files from your repository to the container
COPY . /usr/share/nginx/html

# The nginx image will automatically start the web server when the container starts

FROM gcr.io/projectsigstore/cosign:v1.13.0 as cosign-bin

# Source: https://github.com/chainguard-images/static
FROM cgr.dev/chainguard/static:latest
COPY --from=cosign-bin /ko-app/cosign /usr/local/bin/cosign
ENTRYPOINT [ "cosign" ]