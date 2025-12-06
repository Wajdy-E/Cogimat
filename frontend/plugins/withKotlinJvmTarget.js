const { withProjectBuildGradle } = require('@expo/config-plugins');

const withKotlinJvmTarget = (config) => {
  // Add Kotlin JVM target to project build.gradle
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('jvmTarget')) {
      return config;
    }

    // Add Kotlin JVM target configuration
    config.modResults.contents = config.modResults.contents.replace(
      /allprojects\s*\{/,
      `allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            jvmTarget = "17"
        }
    }
`
    );

    return config;
  });
};

module.exports = withKotlinJvmTarget;
