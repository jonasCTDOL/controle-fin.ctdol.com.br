Pull request para 'apply-local' -> 'main'

Descrição:
- Contém `backend/requirements.txt` criado a partir do virtualenv do servidor.
- Atualiza `deploy/uvicorn-controle-fin.service` para usar o usuário `ctdolc07`.

Como criar o PR via web:
1. Vá para https://github.com/jonasCTDOL/controle-fin.ctdol.com.br
2. Clique em "Compare & pull request" para a branch `apply-local` ou crie um novo PR com base `main` <- `apply-local`.

Como criar o PR via API (exemplo com curl). Substitua GITHUB_TOKEN por um token com scope `repo`:

```bash
curl -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/jonasCTDOL/controle-fin.ctdol.com.br/pulls \
  -d '{"title":"chore(deploy): requirements + systemd unit user","head":"apply-local","base":"main","body":"Add backend requirements and update systemd unit user to ctdolc07."}'
```

Notas:
- Não inclua seu token em locais públicos.
- Se preferir, eu posso criar o PR aqui se você fornecer um token (ou instalar a CLI `gh`).
