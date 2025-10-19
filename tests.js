/**
 * Genesis3 Module Test Configuration
 *
 * This file defines test scenarios for the Spring Boot module.
 * Genesis3 uses this to validate module functionality.
 */

module.exports = {
  moduleId: 'code-spring',
  moduleName: 'Spring Boot',

  scenarios: [
    {
      name: 'gradle-java21',
      description: 'Spring Boot with Gradle and Java 21',
      config: {
        moduleId: 'spring-gradle-21',
        kind: 'code',
        type: 'spring',
        layers: ['backend'],
        enabled: true,
        fieldValues: {
          javaVersion: '21',
          springBootVersion: '3.5.3',
          buildTool: 'gradle',
          packaging: 'jar'
        }
      },
      envConfigs: [
        {
          modules: ['spring-gradle-21'],
          key: 'spring.datasource.url',
          values: [
            { dev: 'jdbc:postgresql://localhost:5432/testdb' },
            { staging: 'jdbc:postgresql://staging-db:5432/stagingdb' },
            { prod: 'jdbc:postgresql://prod-db:5432/proddb' }
          ],
          isSecret: false
        },
        {
          modules: ['spring-gradle-21'],
          key: 'spring.datasource.password',
          values: [
            { dev: 'dev-password' },
            { staging: 'staging-password' },
            { prod: 'prod-password' }
          ],
          isSecret: true
        }
      ],
      expectedFiles: [
        'backend/build.gradle',
        'backend/settings.gradle',
        'backend/gradlew',
        'backend/gradlew.bat',
        'backend/src/main/resources/application.yaml',
        'backend/src/main/resources/application-dev.yaml',
        'backend/src/main/resources/application-staging.yaml',
        'backend/src/main/resources/application-prod.yaml'
      ],
      forbiddenFiles: [
        'backend/.env.dev',
        'backend/.env.staging',
        'backend/.env.prod',
        'backend/pom.xml'
      ],
      validations: [
        {
          file: 'backend/src/main/resources/application-dev.yaml',
          contains: ['spring:', 'datasource:', 'url:', 'jdbc:postgresql://localhost:5432/testdb', 'password: dev-password'],
          notContains: ['{}']
        },
        {
          file: 'backend/build.gradle',
          contains: ['spring-boot', 'java', '21']
        }
      ]
    },
    {
      name: 'maven-java17',
      description: 'Spring Boot with Maven and Java 17',
      config: {
        moduleId: 'spring-maven-17',
        kind: 'code',
        type: 'spring',
        layers: ['backend'],
        enabled: true,
        fieldValues: {
          javaVersion: '17',
          springBootVersion: '3.5.3',
          buildTool: 'maven',
          packaging: 'jar'
        }
      },
      expectedFiles: [
        'backend/pom.xml',
        'backend/mvnw',
        'backend/mvnw.cmd',
        'backend/src/main/resources/application.yaml'
      ],
      forbiddenFiles: [
        'backend/build.gradle',
        'backend/gradlew'
      ],
      validations: [
        {
          file: 'backend/pom.xml',
          contains: ['<java.version>17</java.version>', 'spring-boot-starter']
        }
      ]
    },
    {
      name: 'war-packaging',
      description: 'Spring Boot WAR packaging for Tomcat',
      config: {
        moduleId: 'spring-war',
        kind: 'code',
        type: 'spring',
        layers: ['backend'],
        enabled: true,
        fieldValues: {
          javaVersion: '21',
          springBootVersion: '3.5.3',
          buildTool: 'gradle',
          packaging: 'war'
        }
      },
      expectedFiles: [
        'backend/build.gradle'
      ],
      validations: [
        {
          file: 'backend/build.gradle',
          contains: ['war']
        }
      ]
    },
    {
      name: 'minimal-config',
      description: 'Spring Boot with no env configs',
      config: {
        moduleId: 'spring-minimal',
        kind: 'code',
        type: 'spring',
        layers: ['backend'],
        enabled: true,
        fieldValues: {
          javaVersion: '21',
          springBootVersion: '3.5.3',
          buildTool: 'gradle',
          packaging: 'jar'
        }
      },
      envConfigs: [],
      expectedFiles: [
        'backend/build.gradle',
        'backend/src/main/resources/application.yaml'
      ],
      validations: [
        {
          file: 'backend/src/main/resources/application.yaml',
          contains: ['spring:', 'application:'],
          notContains: ['{}']
        }
      ]
    }
  ]
};
