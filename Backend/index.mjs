import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.mjs';
import taskRoutes from './routes/taskRoutes.js';
import landingRoutes from './routes/landingRoutes.mjs';
import { initDatabase } from './Config/initDb.mjs';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/database', (req, res) => {
  res.status(200).json({ ok: true, message: 'TaskFlow API sudah berjalan' });
});

app.use('/api', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/landing', landingRoutes);

initDatabase().catch(() => {});

app.listen(PORT, () => {
  console.log(`Server ini menyala disini Cihuyy!!! http://localhost:${PORT}`);
});
