# Spring Boot Backend

This module creates a bare minimum Spring Boot REST API application. Spring Boot is a popular Java framework for building web applications and APIs.

## What This Creates

A basic Spring Boot application with:
- REST API endpoints
- Health check endpoint
- OpenAPI/Swagger documentation
- Build configuration (Gradle or Maven)
- Testing framework

---

## Configuration Fields

### Java Version `javaVersion`
**What it is**: The version of the Java programming language to use for your project.

**Options**:
- `17` - LTS (Long Term Support) version, stable
- `21` - Latest LTS version, recommended for new projects

**When to choose**:

**Java 21** (recommended):
- New projects starting in 2024/2025
- Want latest language features (virtual threads, pattern matching)
- Best performance
- Supported until 2031

**Java 17**:
- Need compatibility with older libraries
- Corporate policy requires LTS-1
- Supported until 2029

**Note**: Java 21 is recommended unless you have a specific reason to use Java 17.

---

### Spring Boot Version `springBootVersion`
**What it is**: The version of the Spring Boot framework.

**Options**:
- `3.4.1` - Older stable version
- `3.5.3` - Latest stable version (recommended)

**When to choose**:

**3.5.3** (recommended):
- New projects
- Want latest features and bug fixes
- Best security patches

**3.4.1**:
- Need compatibility with specific libraries
- Existing project uses this version
- Corporate standardization

**Note**: Always use the latest stable version for new projects unless you have compatibility requirements.

---

### Build Tool `buildTool`
**What it is**: The tool used to compile, test, and package your application.

**Options**:
- `gradle` - Modern, flexible build tool (recommended)
- `maven` - Traditional, widely-used build tool

**When to choose**:

**Gradle** (recommended):
- Faster builds
- More flexible configuration
- Groovy or Kotlin DSL (easier to read)
- Better incremental builds
- Modern approach

**Maven**:
- More common in enterprise
- Stricter, more opinionated
- Larger ecosystem of plugins
- XML configuration
- Better IDE support in some cases

**If unsure**: Choose Gradle for new projects.

**Build files**:
- Gradle: `build.gradle`
- Maven: `pom.xml`

---

### Packaging `packaging`
**What it is**: How your application is packaged for deployment.

**Options**:
- `jar` - Java Archive, self-contained executable (recommended)
- `war` - Web Application Archive, for traditional application servers

**When to choose**:

**JAR** (recommended):
- Modern deployment (Docker, Cloud, standalone)
- Self-contained with embedded Tomcat
- Simpler to deploy
- Better for microservices
- Can run with: `java -jar myapp.jar`

**WAR**:
- Traditional application servers (Apache Tomcat, WildFly, WebLogic)
- Corporate requirement for app server deployment
- Need to deploy multiple apps on same server
- Legacy infrastructure

**If unsure**: Choose JAR. It's the modern standard.

---

## What Gets Created

### Project Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   │       ├── Application.java          # Main application class
│   │   │       └── controller/
│   │   │           └── HealthController.java # Health check endpoint
│   │   └── resources/
│   │       ├── application.yaml              # Application configuration
│   │       └── application-{env}.yaml        # Environment-specific config
│   └── test/                                 # Test files
├── build.gradle (or pom.xml)                 # Build configuration
└── Dockerfile                                # Docker configuration
```

### Endpoints Created
- `GET /` - Root endpoint (returns application info)
- `GET /actuator/health` - Health check (for load balancers)
- `/swagger-ui.html` - API documentation UI
- `/v3/api-docs` - OpenAPI specification

---

## Runtime Configuration

### App Name `APP_NAME`
**What it is**: The name of your application (displayed in logs, health checks, etc.).

**Default**: Your project name from initial setup

**Example**: `myapp`, `customer-api`, `inventory-service`

---

### Backend API Base URL `APP_ENV_HOST`
**What it is**: The full URL where your backend API is accessible.

**Format**: `https://{projectName}-api[-{environment}].{domain}`

**Examples**:
- Production: `https://myapp-api.example.com`
- Staging: `https://myapp-api-staging.example.com`
- Development: `http://localhost:8080`

**Why it matters**: Used for CORS configuration, redirect URLs, and API documentation.

---

### Frontend Application URL `APP_ENV_UI`
**What it is**: The full URL where your frontend application is accessible.

**Format**: `https://{projectName}[-{environment}].{domain}`

**Examples**:
- Production: `https://myapp.example.com`
- Staging: `https://myapp-staging.example.com`
- Development: `http://localhost:5173`

**Why it matters**: Used for CORS configuration to allow frontend to call backend API.

---

## Common Commands

### Run Application

**Gradle**:
```bash
./gradlew bootRun
```

**Maven**:
```bash
./mvnw spring-boot:run
```

### Build JAR

**Gradle**:
```bash
./gradlew build
```

**Maven**:
```bash
./mvnw package
```

### Run Tests

**Gradle**:
```bash
./gradlew test
```

**Maven**:
```bash
./mvnw test
```

### Run Built JAR
```bash
java -jar build/libs/myapp.jar  # Gradle
java -jar target/myapp.jar      # Maven
```

---

## Common Issues

### "Port 8080 Already in Use"
**Problem**: Another application is using port 8080.

**Solutions**:
- Stop the other application
- Change port in `application.yaml`: `server.port: 8081`
- Find and kill process: `lsof -i :8080` then `kill -9 <PID>`

### "Java Version Mismatch"
**Problem**: Wrong Java version installed.

**Solutions**:
- Check version: `java -version`
- Install correct version: https://adoptium.net/
- Set JAVA_HOME environment variable
- Use SDKMan: `sdk install java 21-tem`

### "Build Failed"
**Problem**: Compilation or build errors.

**Solutions**:
- Run `./gradlew clean build` (Gradle) or `./mvnw clean install` (Maven)
- Check Java version matches configuration
- Ensure all dependencies can be downloaded
- Check network/proxy settings if behind corporate firewall

### "Tests Failed"
**Problem**: Unit or integration tests failing.

**Solutions**:
- Read test output carefully
- Check database is running (if using database tests)
- Verify test configuration in `application-test.yaml`
- Run tests individually to isolate issue

---

## Best Practices

1. **Always use latest LTS Java version** (currently Java 21)
2. **Use Gradle unless you have a reason to use Maven**
3. **Package as JAR for modern deployments**
4. **Keep Spring Boot version up to date** (security patches)
5. **Use profiles for different environments** (dev, test, production)

---

## Additional Resources

- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **Spring Guides**: https://spring.io/guides
- **Baeldung Spring Tutorials**: https://www.baeldung.com/spring-tutorial
- **Spring Boot Reference**: https://docs.spring.io/spring-boot/docs/current/reference/html/
