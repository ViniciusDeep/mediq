#!/usr/bin/env bash
set -euo pipefail

slug="${1:-web-onboarding-$(date +%Y%m%d-%H%M%S)}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
evidence_dir="$repo_root/evidence/$slug"

if [[ ! "$slug" =~ ^[a-z0-9][a-z0-9._-]*$ ]]; then
  echo "Use letras minúsculas, números, ponto, hífen ou underscore no identificador." >&2
  exit 2
fi

if [[ -e "$evidence_dir" ]]; then
  echo "A evidência já existe: $evidence_dir" >&2
  echo "Escolha outro identificador para não sobrescrever uma execução anterior." >&2
  exit 2
fi

mkdir -p "$evidence_dir"

(
  cd "$repo_root/web"
  EVIDENCE_DIR="$evidence_dir" pnpm evidence
)

video_path="$(find "$evidence_dir" -type f -name '*.webm' -print -quit)"

{
  echo "## Evidência de teste — onboarding web"
  echo
  echo "**Resultado:** ✅ fluxo concluído com sucesso"
  echo
  echo "**Comando:** \`pnpm evidence:web $slug\`"
  echo
  echo "### Cenário validado"
  echo
  echo "1. Preenchimento dos dados pessoais."
  echo "2. Definição das preferências de atendimento."
  echo "3. Confirmação da conclusão do cadastro."
  echo
  echo "### Capturas"
  echo
  echo "![Dados pessoais](01-dados-pessoais.png)"
  echo
  echo "![Preferências](02-preferencias.png)"
  echo
  echo "![Cadastro concluído](03-cadastro-concluido.png)"
  if [[ -n "$video_path" ]]; then
    echo
    echo "### Artefatos"
    echo
    echo "- [Vídeo completo do fluxo](${video_path#"$evidence_dir/"})"
  fi
} > "$evidence_dir/PR_EVIDENCE.md"

echo "Evidência criada em $evidence_dir/PR_EVIDENCE.md"
