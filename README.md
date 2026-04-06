# Sky Ace

Um jogo 3D de ação desenvolvido com TypeScript, Vite e Babylon.js. Controle um avião em combate aéreo e derrote inimigos!

## Pré-requisitos

- **Node.js** versão 16 ou superior
- **npm** (vem com Node.js)

## Instalação

1. Clone ou baixe o projeto
2. Navegue até a pasta do projeto:
   ```bash
   cd ts_3d
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

## Como Executar

### Modo Desenvolvimento

Para executar o jogo em modo desenvolvimento com hot-reload:

```bash
npm run dev
```

Isso iniciará um servidor de desenvolvimento. Abra seu navegador e acesse:
```
http://localhost:5173
```

O jogo carregará automaticamente e você poderá jogar!

### Build para Produção

Para compilar o projeto TypeScript e gerar a build otimizada:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### Preview da Build

Para visualizar a build de produção localmente:

```bash
npm run preview
```

Isso iniciará um servidor para que você possa testar a versão otimizada antes de fazer deploy.

## Estrutura do Projeto

```
.
├── src/                 # Código-fonte TypeScript
│   ├── main.ts         # Ponto de entrada da aplicação
│   ├── game.ts         # Lógica principal do jogo
│   ├── scene.ts        # Cena 3D do Babylon.js
│   ├── airplane.ts     # Controle do avião do jogador
│   ├── bird.ts         # Inimigos (pássaros)
│   ├── bullet.ts       # Sistema de projéteis
│   ├── hud.ts          # Interface de usuário
│   ├── world.ts        # Configuração do mundo
│   ├── counter.ts      # Sistema de contadores
│   ├── constants.ts    # Constantes do jogo
│   ├── style.css       # Estilos CSS
│   └── assets/         # Recursos do jogo
│
├── dist/               # Saída compilada (gerada após npm run build)
├── index.html          # Página HTML principal
├── package.json        # Configuração do projeto e dependências
├── tsconfig.json       # Configuração do TypeScript
└── vite.config.ts      # Configuração do Vite (se existir)
```

## Dependências

- **@babylonjs/core**: Engine gráfic 3D para renderização
- **@babylonjs/loaders**: Carregadores para modelos 3D
- **TypeScript**: Superconjunto de JavaScript com tipagem estática
- **Vite**: Build tool moderno e rápido

## Controles

O jogo é jogado no navegador. Use o mouse e teclado para controlar seu avião e combater os inimigos.

## Desenvolvimento

O projeto usa TypeScript para maior segurança de tipo. Ao executar `npm run dev`, as mudanças são refletidas instantaneamente no navegador.

## Licença

Consulte a licença do projeto para mais detalhes.
