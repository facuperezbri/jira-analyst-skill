#!/usr/bin/env bash
# Configura las credenciales MCP para las skills de este repositorio.
# Genera .mcp.json (Claude Code) y .cursor/mcp.json (Cursor).
set -e

BOLD="\033[1m"; GREEN="\033[32m"; YELLOW="\033[33m"; GRAY="\033[90m"; R="\033[0m"

echo ""; echo -e "${BOLD}MCP Setup — Agent Skills${R}"; echo ""
echo -e "Genera los archivos de configuración con tus credenciales."
echo -e "${GRAY}Los archivos generados están en .gitignore y no se suben al repo.${R}"; echo ""

ask()  { read -p "  $1: " v; printf '%s' "$v"; }
askS() { read -s -p "  $1: " v; echo ""; printf '%s' "$v"; }
askO() { read -p "  $1 ${GRAY}(Enter para saltar)${R}: " v; printf '%s' "$v"; }

echo -e "${BOLD}Jira${R}"
JIRA_URL=$(ask "URL  (ej: https://miempresa.atlassian.net/)")
JIRA_USER=$(ask "Email")
JIRA_TOKEN=$(askS "API Token  → id.atlassian.com/manage-api-tokens")

echo ""; echo -e "${BOLD}Confluence${R}"
read -p "  ¿Mismos datos que Jira? [Y/n]: " SAME
SAME="${SAME:-Y}"
if [[ "$SAME" =~ ^[Yy]$ ]]; then
  CONF_URL="$JIRA_URL"; CONF_USER="$JIRA_USER"; CONF_TOKEN="$JIRA_TOKEN"
else
  CONF_URL=$(ask "URL  (ej: https://miempresa.atlassian.net/)")
  CONF_USER=$(ask "Email")
  CONF_TOKEN=$(askS "API Token")
fi

echo ""; echo -e "${BOLD}Bitbucket${R} ${GRAY}(opcional)${R}"
BB_URL=$(askO "URL  (ej: https://bitbucket.miempresa.com)")
if [ -n "$BB_URL" ]; then
  BB_TOKEN=$(askS "Personal Access Token")
  BB_PROJ=$(ask  "Proyecto por defecto  (ej: PC)")
fi

# ── Genera el JSON ──────────────────────────────────────────────────────────
build_config() {
  local base
  base=$(cat <<JSON
{
  "mcp-atlassian": {
    "type": "stdio",
    "command": "uvx",
    "args": ["mcp-atlassian"],
    "env": {
      "JIRA_URL":             "$JIRA_URL",
      "JIRA_USERNAME":        "$JIRA_USER",
      "JIRA_API_TOKEN":       "$JIRA_TOKEN",
      "CONFLUENCE_URL":       "$CONF_URL",
      "CONFLUENCE_USERNAME":  "$CONF_USER",
      "CONFLUENCE_API_TOKEN": "$CONF_TOKEN"
    }
  }
}
JSON
)
  if [ -n "$BB_URL" ]; then
    # Insertar bitbucket antes del cierre del objeto raíz
    echo "${base%\}}" | sed '$ d'
    cat <<JSON
  ,
  "bitbucket": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "bitbucket-server-mcp"],
    "env": {
      "BITBUCKET_URL":             "$BB_URL",
      "BITBUCKET_TOKEN":           "$BB_TOKEN",
      "BITBUCKET_DEFAULT_PROJECT": "$BB_PROJ"
    }
  }
}
JSON
  else
    echo "$base"
  fi
}

echo ""; echo -e "${BOLD}Generando...${R}"; echo ""
CONFIG=$(build_config)

echo "$CONFIG" > .mcp.json
echo -e "  ${GREEN}✓${R} .mcp.json  (Claude Code)"

mkdir -p .cursor
echo "$CONFIG" > .cursor/mcp.json
echo -e "  ${GREEN}✓${R} .cursor/mcp.json  (Cursor)"

echo ""
echo -e "${BOLD}Listo.${R} Abrí esta carpeta en Claude Code o Cursor."
echo ""
