#!/usr/bin/env node
'use strict';

const prompts = require('prompts');
const fs = require('fs');
const path = require('path');

// ─── Colors ──────────────────────────────────────────────────────────────────
const c = {
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  gray:   s => `\x1b[90m${s}\x1b[0m`,
};

const ok   = msg => console.log(`  ${c.green('✓')} ${msg}`);
const hint = msg => console.log(`  ${c.gray('→')} ${msg}`);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function buildMcpJson(creds) {
  const config = {
    'mcp-atlassian': {
      type: 'stdio',
      command: 'uvx',
      args: ['mcp-atlassian'],
      env: {
        JIRA_URL:             creds?.jiraUrl        || 'TU_JIRA_URL',
        JIRA_USERNAME:        creds?.jiraUser       || 'TU_JIRA_EMAIL',
        JIRA_API_TOKEN:       creds?.jiraToken      || 'TU_JIRA_API_TOKEN',
        CONFLUENCE_URL:       creds?.confluenceUrl  || 'TU_CONFLUENCE_URL',
        CONFLUENCE_USERNAME:  creds?.confluenceUser || 'TU_CONFLUENCE_EMAIL',
        CONFLUENCE_API_TOKEN: creds?.confluenceToken|| 'TU_CONFLUENCE_API_TOKEN',
      },
    },
  };

  if (creds?.bitbucketUrl) {
    config.bitbucket = {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'bitbucket-server-mcp'],
      env: {
        BITBUCKET_URL:             creds.bitbucketUrl,
        BITBUCKET_TOKEN:           creds.bitbucketToken   || '',
        BITBUCKET_DEFAULT_PROJECT: creds.bitbucketProject || '',
      },
    };
  }

  return JSON.stringify(config, null, 2);
}

// ─── Installers ──────────────────────────────────────────────────────────────
const TEMPLATES = path.join(__dirname, '..', 'templates');

function installClaude(cwd, creds) {
  const skillDest = path.join(cwd, '.claude', 'skills', 'jira-solution-designer', 'SKILL.md');
  copyFile(path.join(TEMPLATES, 'skill', 'SKILL.md'), skillDest);
  ok('.claude/skills/jira-solution-designer/SKILL.md');

  writeFile(path.join(cwd, '.mcp.json'), buildMcpJson(creds));
  ok('.mcp.json');
}

function installCursor(cwd, creds) {
  const ruleDest = path.join(cwd, '.cursor', 'rules', 'jira-analyst.mdc');
  copyFile(path.join(TEMPLATES, 'cursor', 'jira-analyst.mdc'), ruleDest);
  ok('.cursor/rules/jira-analyst.mdc');

  writeFile(path.join(cwd, '.cursor', 'mcp.json'), buildMcpJson(creds));
  ok('.cursor/mcp.json');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const onCancel = () => { console.log('\n  Cancelado.\n'); process.exit(0); };

  console.log('');
  console.log(c.bold('  Jira Analyst Kit'));
  console.log(c.dim('  Instala la skill "Jira Solution Designer" para Claude Code y/o Cursor'));
  console.log('');

  // ── 1. Editores ─────────────────────────────────────────────────────────
  const { editors } = await prompts({
    type: 'multiselect',
    name: 'editors',
    message: '¿En qué editores querés instalar?',
    choices: [
      { title: 'Claude Code', value: 'claude', selected: true },
      { title: 'Cursor',      value: 'cursor', selected: true },
    ],
    min: 1,
    hint: 'Espacio para seleccionar · Enter para confirmar',
  }, { onCancel });

  // ── 2. Credenciales MCP ──────────────────────────────────────────────────
  const { configureMcp } = await prompts({
    type: 'confirm',
    name: 'configureMcp',
    message: '¿Configurar las credenciales MCP ahora?',
    initial: true,
  }, { onCancel });

  let creds = null;

  if (configureMcp) {
    console.log('');
    console.log(c.bold('  Jira'));

    const jira = await prompts([
      {
        type: 'text',
        name: 'url',
        message: 'URL',
        hint: 'ej: https://miempresa.atlassian.net/',
        validate: v => (v.startsWith('http') ? true : 'Debe ser una URL válida'),
      },
      {
        type: 'text',
        name: 'user',
        message: 'Email',
      },
      {
        type: 'password',
        name: 'token',
        message: `API Token ${c.gray('→ id.atlassian.com/manage-api-tokens')}`,
      },
    ], { onCancel });

    console.log('');
    console.log(c.bold('  Confluence'));

    const { sameAsjira } = await prompts({
      type: 'confirm',
      name: 'sameAsjira',
      message: '¿Misma URL y credenciales que Jira?',
      initial: true,
    }, { onCancel });

    let confluence = { url: jira.url, user: jira.user, token: jira.token };

    if (!sameAsjira) {
      confluence = await prompts([
        {
          type: 'text',
          name: 'url',
          message: 'URL',
          hint: 'ej: https://miempresa.atlassian.net/',
          validate: v => (v.startsWith('http') ? true : 'Debe ser una URL válida'),
        },
        { type: 'text',     name: 'user',  message: 'Email' },
        { type: 'password', name: 'token', message: 'API Token' },
      ], { onCancel });
    }

    console.log('');
    console.log(c.bold('  Bitbucket') + c.dim('  (Enter para saltar)'));

    const bitbucket = await prompts([
      {
        type: 'text',
        name: 'url',
        message: 'URL',
        hint: 'ej: https://bitbucket.miempresa.com',
      },
      { type: 'password', name: 'token',   message: 'Personal Access Token' },
      { type: 'text',     name: 'project', message: 'Proyecto por defecto', hint: 'ej: PC' },
    ], { onCancel });

    creds = {
      jiraUrl:          jira.url,
      jiraUser:         jira.user,
      jiraToken:        jira.token,
      confluenceUrl:    confluence.url,
      confluenceUser:   confluence.user,
      confluenceToken:  confluence.token,
      bitbucketUrl:     bitbucket.url     || null,
      bitbucketToken:   bitbucket.token   || null,
      bitbucketProject: bitbucket.project || null,
    };
  }

  // ── 3. Instalación ───────────────────────────────────────────────────────
  const cwd = process.cwd();
  console.log('');
  console.log(c.bold('  Instalando...'));
  console.log('');

  if (editors.includes('claude')) installClaude(cwd, creds);
  if (editors.includes('cursor')) installCursor(cwd, creds);

  // ── 4. Éxito ─────────────────────────────────────────────────────────────
  console.log('');
  console.log(c.bold('  ¡Listo!') + ' Abrí esta carpeta en tu editor.');
  console.log('');

  if (!configureMcp) {
    console.log(c.yellow('  Las credenciales quedaron como placeholder.'));
    if (editors.includes('claude')) hint('Editá .mcp.json antes de usar la skill');
    if (editors.includes('cursor')) hint('Editá .cursor/mcp.json antes de usar la skill');
    console.log('');
  }

  if (editors.includes('claude')) {
    hint(`Claude Code: escribí ${c.cyan('/jira-solution-designer PROJ-123')} en el chat`);
  }
  if (editors.includes('cursor')) {
    hint(`Cursor: escribí ${c.cyan('Analiza el ticket PROJ-123')} en el chat`);
  }

  console.log('');
}

main().catch(err => { console.error(err); process.exit(1); });
