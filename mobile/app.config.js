module.exports = ({ config }) => {
  const isOfficer = process.env.APP_VARIANT === 'officer' || process.env.APP_VARIANT === 'admin';

  if (isOfficer) {
    return {
      ...config,
      name: "Ogere Remo Field Command",
      slug: "ogere-remo-field-officer",
      scheme: "ogere-officer",
      icon: "./assets/officer-icon.png",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#140a08",
      },
      android: {
        ...config.android,
        package: "com.ogeremo.fieldofficer",
        adaptiveIcon: {
          foregroundImage: "./assets/officer-adaptive-icon.png",
          backgroundColor: "#140a08",
        },
      },
      extra: {
        ...config.extra,
        appVariant: "officer",
      },
    };
  }

  return {
    ...config,
    name: "Ogere Remo Civic Portal",
    slug: "ogere-remo-portal",
    scheme: "ogere-portal",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#064e3b",
    },
    android: {
      ...config.android,
      package: "com.ogeremo.civicportal",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#064e3b",
      },
    },
    extra: {
      ...config.extra,
      appVariant: "citizen",
    },
  };
};
