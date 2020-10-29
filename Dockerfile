FROM node:14.12.0

# Set the working directory to root
WORKDIR /

# copy package.json into the container at /facerecognition-autotest/
COPY package*.json /facerecognition-autotest/

# Install packages
RUN npm install

# Copy the current directory contents into the container at /facerecognition-autotest/
COPY . /facerecognition-autotest/

# Make port 3002 available outside the container
EXPOSE 3002

# Run the API tests when the container launches
CMD ["npm", "run startDocker"]