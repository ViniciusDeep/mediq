# Mediq

Plataforma de agendamento médico para pacientes, profissionais e clínicas/hospitais.

## Estrutura

- `backend/`: API Node.js (Fastify) e integração com PostgreSQL.
- `web/`: portal Next.js para descoberta, agendamento e gestão.
- `mobile/`: aplicativo React Native/Expo para pacientes e profissionais.
- `docker-compose.yml`: PostgreSQL local.

## Pré-requisitos

- Node.js 22+
- Docker Desktop (para PostgreSQL)

## Início rápido

```bash
pnpm install
cp backend/.env.example backend/.env
docker compose up -d db
pnpm dev:backend
```

Em outros terminais:

```bash
pnpm dev:web
pnpm dev:mobile
```

## MVP de agendamento

1. Paciente busca especialidade, profissional ou clínica por localidade.
2. Médico configura locais de atendimento e blocos de disponibilidade.
3. Clínica/hospital organiza unidades, profissionais e agenda.
4. Paciente escolhe um horário e recebe confirmação; lembretes entram no próximo incremento.

## Convenções

- JavaScript com ES modules.
- Datas e horários serão persistidos em UTC; o fuso é aplicado na interface.
- Dados clínicos e documentos não fazem parte deste primeiro recorte.
