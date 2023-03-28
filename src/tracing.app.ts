import * as express from 'express';
import { measureRequestDuration, registerPromMetrics } from './monitoring';

const PORT: number = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/metrics', registerPromMetrics);
app.use(measureRequestDuration);

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
