import { Registry, collectDefaultMetrics, Histogram } from 'prom-client';

// Create a Registry which registers the metrics
const register = new Registry();
collectDefaultMetrics({ register });

const requestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'request duration histogram',
  labelNames: ['handler', 'method', 'statuscode'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Register the histogram
register.registerMetric(requestDuration);

export const measureRequestDuration = (req, res, next) => {
  const start = Date.now();
  res.once('finish', () => {
    const duration = Date.now() - start;
    requestDuration
      .labels(req.url, req.method, res.statusCode)
      .observe(duration);
  });

  next();
};

export const registerPromMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
};