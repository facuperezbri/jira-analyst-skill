# Agent Skills

Colección de skills para Claude Code y Cursor.

## Instalación

```bash
npx skills add facuperezbri/jira-analyst-skill
```

Pregunta en qué editores instalar → Claude Code, Cursor, o ambos.

## Skills

| Skill | Descripción |
|-------|-------------|
| [jira-analyst-skill](skills/jira-analyst-skill/SKILL.md) | Analiza tickets de Jira y produce propuestas funcionales o técnicas |

## Configuración MCP

Después de instalar, configurar las credenciales:

```bash
# Mac / Linux
chmod +x setup/mcp-setup.sh && ./setup/mcp-setup.sh

# Windows
.\setup\mcp-setup.ps1
```

Requiere `uv` para el servidor MCP de Atlassian:

```bash
# Mac / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

## Uso

**Claude Code**
```
/jira-analyst-skill PROJ-123
```

**Cursor**
```
Analiza el ticket PROJ-123
```
