# Use the Jekyll image as the base image
FROM jekyll/jekyll:latest

# Set the working directory
WORKDIR /srv/jekyll

# Copy the website source code to the container
COPY . .

# Install the necessary dependencies
RUN bundle install

# Build the website
RUN jekyll build

# Expose the website on port 4000
EXPOSE 4000

# Start the server
CMD ["jekyll", "serve", "--host", "0.0.0.0"]