# Face Monitor Dashboard

Este é o **Face Monitor Dashboard**, um projeto desenvolvido com Next.js, React 19, Tailwind CSS e Firebase, utilizando bibliotecas modernas como `radix-ui`, `react-hook-form`, `zod` e `face-api.js` para criação de uma interface responsiva e dinâmica.

---

## 📋 Descrição

O projeto visa oferecer um painel de monitoramento facial utilizando `face-api.js` e integração com o Firebase para autenticação, banco de dados e armazenamento. O dashboard é responsivo, moderno e escalável, utilizando componentes reutilizáveis e animações suaves com Tailwind CSS.

---

## 📁 Configuração do Ambiente

Antes de iniciar o projeto, você precisa criar um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

### `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxxxxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxxxxxxxxxxx
```

> Substitua os valores `xxxxxxxx` pelas credenciais reais do seu projeto Firebase Cloud Firestore.

---

## 💾 Instalação

Siga os passos abaixo para clonar e executar o projeto localmente:

```bash
git clone https://github.com/LuanS9/face-monitor-dashboard-step-three.git
cd face-monitor-dashboard
npm install --force
npm run dev
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Scripts disponíveis

- `npm run dev` — Inicia o servidor de desenvolvimento.
- `npm run build` — Cria a versão de produção do projeto.
- `npm start` — Inicia o servidor com a versão de produção.
- `npm run lint` — Executa a análise de lint nos arquivos do projeto.

---

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## ✨ Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.
