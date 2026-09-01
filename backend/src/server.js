import cors from '@fastify/cors';
import Fastify from 'fastify';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000'
});

app.get('/health', async () => ({
  status: 'ok',
  service: 'mediq-api'
}));

app.get('/v1/roles', async () => ({
  roles: ['patient', 'doctor', 'organization']
}));

const port = Number(process.env.PORT ?? 3333);

await app.listen({ host: '0.0.0.0', port });
