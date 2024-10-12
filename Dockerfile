# Use an Alpine image that supports ARM64
FROM node:20-alpine

# Set environment variables for the Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools

# Install required packages and Android SDK
RUN apk add --no-cache bash curl unzip openjdk11 && \
    curl -o android-sdk.zip https://dl.google.com/android/repository/commandlinetools-linux-7583922_latest.zip && \
    mkdir -p /opt/android-sdk/cmdline-tools && \
    unzip android-sdk.zip -d /opt/android-sdk/cmdline-tools && \
    mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest && \
    rm android-sdk.zip && \
    yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk "platform-tools" "platforms;android-30" && \
    /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk --licenses

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Install additional backend dependencies (optional, if you need Express, MongoDB, etc.)
RUN npm install express mongoose bcryptjs jsonwebtoken body-parser

# Copy the rest of the application files
COPY . .

# Expose the Metro bundler port
EXPOSE 8081

# Start Metro bundler
CMD ["npx", "react-native", "start"]
