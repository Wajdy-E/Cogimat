const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');

const withReactNativeIAP = (config) => {
  // Add Kotlin JVM target to project build.gradle
  config = withProjectBuildGradle(config, (config) => {
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

  // Add missingDimensionStrategy to app build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("missingDimensionStrategy 'store'")) {
      return config;
    }

    // Add missingDimensionStrategy after buildConfigField
    config.modResults.contents = config.modResults.contents.replace(
      /buildConfigField\s+"String",\s+"REACT_NATIVE_RELEASE_LEVEL"[^\n]+\n/,
      (match) => `${match}        missingDimensionStrategy 'store', 'play'\n`
    );

    return config;
  });

  return config;
};

module.exports = withReactNativeIAP;
