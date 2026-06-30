# Controle de Equipamentos de Água

Aplicativo web para controle de entrada e saída de equipamentos de campo.

## Funcionalidades

- **Painel** — visão geral com métricas: total, em uso, devolvidos e em atraso
- **Saída** — registrar entrega de equipamento a um técnico com projeto, data e ensaios
- **Devolução** — listar equipamentos em uso e registrar retorno com um clique
- **Histórico** — tabela completa com filtros por status, equipamento e técnico
- **Exportar CSV** — exportar todos os registros para Excel/Google Sheets

Os dados ficam salvos localmente no navegador (localStorage).

---

## Como publicar no GitHub Pages

### Passo 1 — Criar o repositório

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"** (botão verde)
3. Dê um nome, ex: `controle-equipamentos`
4. Marque como **Public**
5. Clique em **"Create repository"**

### Passo 2 — Fazer upload dos arquivos

1. Na página do repositório criado, clique em **"uploading an existing file"**
2. Arraste ou selecione os 3 arquivos:
   - `index.html`
   - `style.css`
   - `app.js`
3. Clique em **"Commit changes"**

### Passo 3 — Ativar o GitHub Pages

1. No repositório, vá em **Settings** (aba no topo)
2. No menu lateral, clique em **Pages**
3. Em **"Branch"**, selecione `main` e pasta `/ (root)`
4. Clique em **Save**
5. Aguarde 1–2 minutos

Seu app ficará disponível em:
```
https://SEU-USUARIO.github.io/controle-equipamentos/
```

---

## Estrutura do projeto

```
controle-equipamentos/
├── index.html   # Estrutura da página
├── style.css    # Estilos
├── app.js       # Lógica do aplicativo
└── README.md    # Este arquivo
```

## Equipamentos cadastrados

**Medidores de pH (MP):** MP-002 a MP-022  
**Turbidímetros (TB):** TB-013 a TB-043  
**Dosadores de hidrogênio (DH):** DH-002, DH-006  
**Condutivímetros (CC):** CC-001 a CC-007  
**Borbulhadores (BB):** BB-001 a BB-007  
**Vaporizadores:** VAPOR-001 a VAPOR-004  

Para adicionar novos equipamentos ou técnicos, edite o arquivo `app.js` nas linhas iniciais (`TECNICOS` e `EQUIPAMENTOS`).
