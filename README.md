# Ponte de USDC — Arc Testnet ↔ outras redes (CCTP V2)

Projeto pra farmar a Arc de forma "de verdade": em vez de só clicar no faucet,
você vai ter um projeto funcional que move USDC de teste entre redes usando o
Bridge Kit oficial da Circle (o mesmo protocolo, CCTP V2, que move bilhões de
dólares reais).

## O que esse projeto faz

1. Lista as redes que o Bridge Kit suporta hoje (`1-listar-redes.js`)
2. Estima o custo de uma transferência de USDC entre duas redes
3. Executa a transferência de verdade (com sua confirmação antes)
4. Mostra em tempo real cada etapa da ponte no terminal (aprovação → queima
   do token na origem → espera da atestação da Circle → criação do token no
   destino), com cores pra facilitar a leitura

## Pré-requisitos

- **Node.js 18 ou mais recente** instalado. Pra conferir, abra o terminal
  (PowerShell ou CMD no Windows) e rode:
  ```
  node -v
  ```
  Se não tiver, baixe em https://nodejs.org (baixe a versão "LTS").
- Uma carteira **nova, só de teste** (não use uma carteira com dinheiro
  real). Você pode criar uma rapidinho no MetaMask e exportar a chave
  privada dela — é só pra testnet, sem risco.

## Passo a passo

### 1. Baixe os arquivos e abra o terminal na pasta

No Windows, abra a pasta `ponte-usdc-arc`, clique com botão direito dentro
dela e escolha "Abrir no Terminal" (ou abra o PowerShell e use `cd` até a
pasta).

### 2. Instale as dependências

```
npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2 dotenv chalk viem
```

Isso baixa as bibliotecas necessárias (a da Circle pra fazer a ponte, e duas
auxiliares pra ler o arquivo de configuração e colorir o terminal).

### 3. Configure sua chave de teste

Copie o arquivo `.env.example` e renomeie a cópia para `.env`. Abra o `.env`
num editor de texto e cole a chave privada da sua carteira de teste em
`PRIVATE_KEY`.

### 4. Pegue USDC de teste

Vá em https://faucet.circle.com, selecione a rede **Arc Testnet**, cole o
endereço público da sua carteira de teste e peça os tokens. Espere confirmar.

### 5. Descubra os nomes exatos das redes

```
npm run listar-redes
```

Isso mostra uma tabela com todas as redes suportadas. Confira o nome exato
de **"Arc Testnet"** e da rede de destino que você quiser usar (recomendo
começar com **Base Sepolia**, que é rápida e bem suportada). Se o nome
exibido for diferente do que já está no arquivo `2-estimar-e-fazer-bridge.js`,
ajuste as variáveis `REDE_ORIGEM` e `REDE_DESTINO` lá dentro.

### 6. Rode a ponte

```
npm run bridge
```

O script vai:
- mostrar uma estimativa de custo
- pedir sua confirmação (digite `s` pra seguir)
- executar a transferência e mostrar cada etapa em tempo real

### 7. Confira no explorador

Depois de concluído, copie o hash da transação que aparece no resultado e
cole em https://testnet.arcscan.app (ou no explorer da rede de destino) pra
ver a transferência confirmada on-chain.

## Se der erro

A Circle mudou nomes de pacotes e métodos algumas vezes ao longo de 2026
(o Bridge Kit virou parte do "Arc App Kit" recentemente), então é possível
que algum nome de função tenha mudado de novo depois que este projeto foi
montado. Se aparecer um erro tipo `is not a function` ou `is not a
constructor`:

1. Copie a mensagem de erro completa
2. Me manda aqui que eu ajusto o script
3. Ou confira a doc atual em https://docs.arc.network/app-kit/bridge

## Depois que funcionar

Ideias pra fortalecer ainda mais sua posição pro farm da Arc:
- Rode a ponte algumas vezes por semana (dias ativos pesam mais que volume)
- Teste também Ethereum Sepolia e Arbitrum Sepolia como destino
- Publique o projeto no GitHub e mencione no Discord da Arc — pode contar
  pro papel de "Creator"
- Se quiser, depois a gente transforma isso num painel visual (com conexão
  MetaMask no navegador), no mesmo estilo dos seus outros dashboards
