## O que muda

<!-- O problema e a solução, em poucas linhas. -->

## Como testar

<!-- Passos para conferir a mudança, além dos testes automatizados. -->

## Checklist

- [ ] Testes cobrem a mudança (para bug: o teste falhava antes da correção)
- [ ] `npm run lint` e `npm run format:check` passam
- [ ] Mudança de schema tem migration nova; nenhuma migration publicada foi alterada
- [ ] Variável de ambiente nova está em `backend/config.js` e no `.env.example`
- [ ] README atualizado, se a mudança afeta uso, deploy ou API
- [ ] Mudança incompatível marcada com `!` e `BREAKING CHANGE:` no commit
