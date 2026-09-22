import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.mjs';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const PORT = Number( 5000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'TaskFlow API is running' });
});

app.use('/api', userRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Server ini menyala disini Cihuyy!!! http://localhost:${PORT}`);
});
