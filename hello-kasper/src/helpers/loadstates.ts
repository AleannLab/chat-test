export const NOT_LOADED = "NOT_LOADED";
export const LOADED = "LOADED";
export const LOADING = "LOADING";
export const COMPLETED = "COMPLETED";
export const REFRESHING = "REFRESHING";
export const ERROR = "ERROR";

export function startLoading(currentState: any) {
  if (currentState === COMPLETED) return REFRESHING;
  return LOADING;
}

export function endLoading(currentState: any) {
  return COMPLETED;
}

export function isLoaded(state: any) {
  if (state === COMPLETED || state === REFRESHING) return true;
  return false;
}

export function isLoading(state: any) {
  if (state === LOADING || state === REFRESHING) return true;
  return false;
}
