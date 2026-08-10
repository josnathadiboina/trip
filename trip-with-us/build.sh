#!/bin/sh
# Vercel build script for TRIP-WITH-US (Spring Boot + Maven Wrapper).
# Vercel runs a Linux runtime, so we use the `./mvnw` wrapper (not mvnw.cmd).
set -e

echo "---- Building with Maven wrapper ----"
# Use `sh mvnw` so no executable bit is required (robust on any checkout).
sh mvnw -B -DskipTests clean package

echo "---- Build complete ----"
ls -la target/*.jar
