# Use an official nginx image as the base image
FROM nginx:alpine

# Copy the files from your repository to the container
COPY . /usr/share/nginx/html

# The nginx image will automatically start the web server when the container starts