# Sunshine Muscle - App Android

Este é o aplicativo Android para a loja Sunshine Muscle, construído com WebView para carregar o site existente.

## 🚀 Como executar

### 1. Pré-requisitos
- Android Studio (versão mais recente)
- SDK Android 21+ (Android 5.0+)
- Emulador Android ou dispositivo físico

### 2. Importar o projeto
1. Abra o Android Studio
2. Clique em "Open" ou "Open an existing Android Studio project"
3. Navegue até a pasta `android-app` e selecione
4. Aguarde o Gradle Sync completar

### 3. Configurar servidor local (para teste com site dinâmico)

#### Para Emulador Android:
- O app está configurado para `http://10.0.2.2:8000/index.html`
- Inicie o servidor na pasta do site: `python -m http.server 8000`
- O emulador acessa sua máquina via `10.0.2.2`

#### Para Dispositivo Físico:
1. Descubra o IP da sua máquina: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Edite `app/src/main/res/values/config.xml`:
   ```xml
   <string name="server_url">http://SEU_IP:8000/index.html</string>
   ```
3. Exemplo: `http://192.168.1.100:8000/index.html`

### 4. Modo Offline (sem servidor)
- Todos os arquivos do site já estão em `app/src/main/assets/`
- Se o servidor não estiver disponível, o app automaticamente usa os assets locais
- URL de fallback: `file:///android_asset/index.html`

### 5. Executar o app
1. Conecte um dispositivo Android ou inicie um emulador
2. Clique no botão "Run" (▶️) no Android Studio
3. Selecione o dispositivo/emulador
4. O app será instalado e executado automaticamente

## 📱 Funcionalidades

### ✅ Implementadas
- WebView com JavaScript habilitado
- Navegação entre páginas do site
- Suporte a localStorage e sessionStorage
- Fallback automático (servidor → assets offline)
- Botão voltar do Android funcional
- Links externos abrem no navegador
- Links de email/telefone abrem apps nativos

### 🔧 Configurações
- **Arquivo de config**: `app/src/main/res/values/config.xml`
- **Assets offline**: `app/src/main/assets/`
- **Permissões**: Internet (para servidor local/remoto)
- **Network Security**: Permite HTTP para localhost e 10.0.2.2

## 🐛 Solução de problemas

### Erro de conexão
- Verifique se o servidor está rodando na porta 8000
- Para dispositivo físico, confirme o IP da máquina
- O app tentará assets offline automaticamente se falhar

### Gradle Sync falha
- Verifique conexão com internet
- Tente "File → Invalidate Caches / Restart"
- Confirme que tem Android SDK 34 instalado

### App não carrega
- Verifique logs no Android Studio (Logcat)
- Teste primeiro no emulador, depois dispositivo físico
- Confirme que `python -m http.server 8000` está rodando

## 📂 Estrutura do projeto

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── assets/          # Site offline (HTML, CSS, JS)
│   │   ├── java/            # Código Kotlin (MainActivity)
│   │   ├── res/
│   │   │   ├── layout/      # Layout da tela (WebView)
│   │   │   ├── values/      # Configurações (URLs)
│   │   │   └── xml/         # Network security config
│   │   └── AndroidManifest.xml
│   └── build.gradle         # Dependências do app
├── build.gradle             # Configuração do projeto
└── settings.gradle          # Configuração do Gradle
```

## 🔄 Atualizações

Para atualizar o conteúdo do app:
1. Modifique os arquivos do site na pasta principal
2. Copie para `app/src/main/assets/`: `Copy-Item *.html,*.css,*.js android-app/app/src/main/assets/`
3. Rebuild o app no Android Studio

---

**Desenvolvido para Sunshine Muscle** 💪