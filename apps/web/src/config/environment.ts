const DEMO = "demo";
const PRODUCTION = "production";

const STORAGE_KEY = "environment";

export type Environment =
  | typeof DEMO
  | typeof PRODUCTION;

export function getEnvironment(): Environment {
  const value = localStorage.getItem(
    STORAGE_KEY,
  );

  if (value === PRODUCTION) {
    return PRODUCTION;
  }

  return DEMO;
}

export function setEnvironment(
  environment: Environment,
) {
  localStorage.setItem(
    STORAGE_KEY,
    environment,
  );
}

export function getApiBaseUrl() {
  if (getEnvironment() === PRODUCTION) {
    return import.meta.env
      .VITE_PRODUCTION_API_URL;
  }

  return import.meta.env
    .VITE_DEMO_API_URL;
}

export function getProductionApiUrl() {
  return import.meta.env
    .VITE_PRODUCTION_API_URL;
}

export function resetToDemo() {
  setEnvironment(DEMO);
}