/**
 * Fake network layer. Every mock service call is routed through `request()`
 * so it behaves like a real fetch: async, latency, occasional rejection.
 * Swapping to a real backend later means replacing the body of `request`
 * with an actual fetch() — no call site changes required.
 */
const SIMULATED_LATENCY_MS = [220, 520];

function randomLatency() {
  const [min, max] = SIMULATED_LATENCY_MS;
  return Math.round(min + Math.random() * (max - min));
}

export function request(fn, { latency = randomLatency() } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, latency);
  });
}

export class ApiError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message);
    this.code = code;
  }
}
