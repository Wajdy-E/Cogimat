const { withAppBuildGradle } = require('@expo/config-plugins');

const withReactNativeIAP = (config) => {
  return withAppBuildGradle(config, (config) => {
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
};

module.exports = withReactNativeIAP;
