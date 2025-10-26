import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "health-concierge-app",
  slug: "health-concierge-app",
  experiments: {
    typedRoutes: true,
    staticRendering: false, // ✅ only keep this
  },
});
