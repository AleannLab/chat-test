export const NOT_LOADED = 'NOT_LOADED';
export const LOADED = 'LOADED';
export const LOADING = 'LOADING';
export const COMPLETED = 'COMPLETED';
export const REFRESHING = 'REFRESHING';
export const ERROR = 'ERROR';

export function startLoading(currentState) {
  if (currentState === COMPLETED) return REFRESHING;
  return LOADING;
}

export function endLoading(currentState) {
  return COMPLETED;
}

export function isLoaded(state) {
  if (state === COMPLETED || state === REFRESHING) return true;
  return false;
}

export function isLoading(state) {
  if (state === LOADING || state === REFRESHING) return true;
  return false;
}
