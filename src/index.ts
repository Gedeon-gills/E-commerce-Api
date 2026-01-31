import app from './app';
import connectDB from './config/db';
import { env } from './config/env';

const startServer = async () => {
  await connectDB();
  
  const port = env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${port}`);
    console.log(`📜 API Documentation: http://localhost:${port}/api-docs`);
  });
};

startServer();
