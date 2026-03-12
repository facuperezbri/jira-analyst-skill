# jira-analyst-kit

Instala la skill **Jira Solution Designer** en Claude Code y/o Cursor.

Analiza tickets de Jira y produce propuestas funcionales o técnicas escalando
por Jira, Confluence y código antes de preguntarte.

## Uso

```bash
npx jira-analyst-kit
```

o directamente desde el repositorio:

```bash
npx github:TU_ORG/jira-analyst-kit
```

El instalador te pregunta:

1. ¿En qué editores instalar? → Claude Code / Cursor / Ambos
2. ¿Configurar credenciales MCP ahora? → URLs + tokens
3. Jira, Confluence, Bitbucket (opcional)

Y genera los archivos necesarios en la carpeta actual.

## Prerrequisito

`uv` para el servidor MCP de Atlassian:

```bash
# Mac / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

## Archivos generados

| Archivo | Editor |
|---|---|
| `.claude/skills/jira-solution-designer/SKILL.md` | Claude Code |
| `.mcp.json` | Claude Code |
| `.cursor/rules/jira-analyst.mdc` | Cursor |
| `.cursor/mcp.json` | Cursor |

## Cómo usarlo luego

**Claude Code**
```
/jira-solution-designer PROJ-123
```

**Cursor**
```
Analiza el ticket PROJ-123
```
