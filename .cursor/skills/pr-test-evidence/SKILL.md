---
name: pr-test-evidence
description: Execute testes relevantes e produza evidências auditáveis para pull requests, com screenshots, vídeo ou trace. Use quando o usuário pedir prova de teste, evidência visual, snapshot ou vídeo para anexar à descrição de um PR.
---

# Evidência de teste para PR

Produza evidência suficiente para um revisor entender o cenário, confirmar o resultado e repetir o teste. Não declare sucesso sem executar o comando registrado.

## Escolha da evidência

- Prefira screenshots em pontos de decisão e no estado final para mudanças de interface.
- Acrescente vídeo quando a sequência, animação ou interação for importante.
- Use trace de falha para diagnóstico; não o apresente como prova de sucesso.
- Para mudanças sem interface, registre comando, resultado e resumo das asserções em Markdown; não crie imagens artificiais.

## Onboarding web deste repositório

Execute na raiz:

```bash
pnpm evidence:web <identificador-do-pr>
```

O script executa Playwright contra o Next.js, intercepta somente as APIs necessárias ao cenário e grava em `evidence/<identificador-do-pr>/`:

- `PR_EVIDENCE.md`, pronto para copiar na descrição do PR;
- screenshots dos checkpoints;
- vídeo WebM da execução;
- trace e screenshot automáticos se o teste falhar.

Use um identificador estável e sem dados sensíveis, como `pr-42-onboarding`. Revise as capturas antes de adicioná-las ao Git ou fazer upload. Nunca exponha tokens, CPF real, dados clínicos, segredos ou `.env`.

## Entrega

Informe o comando executado e o resultado. Aponte para `PR_EVIDENCE.md` e os artefatos gerados. Não publique, faça upload, edite o PR ou adicione arquivos ao commit sem autorização explícita do usuário.
