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

## API do onboarding de paciente

- `POST /v1/patients/onboarding/personal`: cria o perfil e inicia uma sessão autenticada.
- `GET /v1/patients/me`: retorna o perfil da sessão atual.
- `PUT /v1/patients/me/preferences`: salva a segunda etapa e conclui o onboarding.

O CPF é validado no cliente e no servidor. O banco armazena somente um hash com pepper para unicidade e os quatro últimos dígitos para identificação. Configure `AUTH_SECRET` e `CPF_PEPPER` com valores longos e diferentes em produção.

O frontend usa `NEXT_PUBLIC_API_URL` para localizar a API e assume `http://localhost:3333` em desenvolvimento.

## Convenções

- JavaScript com ES modules.
- Datas e horários serão persistidos em UTC; o fuso é aplicado na interface.
- Dados clínicos e documentos não fazem parte deste primeiro recorte.
