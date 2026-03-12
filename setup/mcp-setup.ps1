# MCP Setup — Agent Skills (Windows PowerShell)
# Ejecutar: .\setup\mcp-setup.ps1

$ErrorActionPreference = "Stop"

function Get-Value($label) { Read-Host "  $label" }
function Get-Secret($label) {
  $s = Read-Host "  $label" -AsSecureString
  [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
}

Write-Host "`nMCP Setup - Agent Skills" -ForegroundColor White
Write-Host "Genera los archivos de configuracion con tus credenciales."
Write-Host "Los archivos generados estan en .gitignore y no se suben al repo.`n" -ForegroundColor Gray

Write-Host "Jira" -ForegroundColor Cyan
$JIRA_URL   = Get-Value "URL  (ej: https://miempresa.atlassian.net/)"
$JIRA_USER  = Get-Value "Email"
$JIRA_TOKEN = Get-Secret "API Token  -> id.atlassian.com/manage-api-tokens"

Write-Host "`nConfluence" -ForegroundColor Cyan
$same = Read-Host "  Mismos datos que Jira? [Y/n]"
if ($same -eq "" -or $same -match "^[Yy]$") {
  $CONF_URL = $JIRA_URL; $CONF_USER = $JIRA_USER; $CONF_TOKEN = $JIRA_TOKEN
} else {
  $CONF_URL   = Get-Value "URL  (ej: https://miempresa.atlassian.net/)"
  $CONF_USER  = Get-Value "Email"
  $CONF_TOKEN = Get-Secret "API Token"
}

Write-Host "`nBitbucket (opcional)" -ForegroundColor Cyan
$BB_URL = Read-Host "  URL  (ej: https://bitbucket.miempresa.com) - Enter para saltar"

$bbBlock = ""
if ($BB_URL -ne "") {
  $BB_TOKEN = Get-Secret "Personal Access Token"
  $BB_PROJ  = Get-Value  "Proyecto por defecto  (ej: PC)"
  $bbBlock = @"
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
"@
}

$config = @"
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
  }$bbBlock
}
"@

Write-Host "`nGenerando..." -ForegroundColor White
$config | Set-Content ".mcp.json" -Encoding UTF8
Write-Host "  [OK] .mcp.json  (Claude Code)" -ForegroundColor Green

New-Item -ItemType Directory -Force -Path ".cursor" | Out-Null
$config | Set-Content ".cursor\mcp.json" -Encoding UTF8
Write-Host "  [OK] .cursor\mcp.json  (Cursor)" -ForegroundColor Green

Write-Host "`nListo. Abri esta carpeta en Claude Code o Cursor.`n" -ForegroundColor White
