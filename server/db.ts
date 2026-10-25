import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import initSqlJs, { Database, SqlValue } from 'sql.js';
import { CourseModule, PromptCard, SiteSettings, UserRecord, VideoLesson } from '../src/types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'database.sqlite');
const INITIAL_ZEUS_PORTRAIT = '/src/assets/images/zeus_mentor_portrait_1792940298413.jpg';

export class SQLiteDatabaseService {
  private static instance: SQLiteDatabaseService;
  private db!: Database;
  private isInitialized = false;

  private constructor() {
    this.ensureDirectoryExists();
  }

  public static getInstance(): SQLiteDatabaseService {
    if (!SQLiteDatabaseService.instance) {
      SQLiteDatabaseService.instance = new SQLiteDatabaseService();
    }
    return SQLiteDatabaseService.instance;
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const videosDir = path.join(uploadsDir, 'videos');
    const imagesDir = path.join(uploadsDir, 'images');
    if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const SQL = await initSqlJs();

    if (fs.existsSync(SQLITE_FILE)) {
      try {
        const fileBuffer = fs.readFileSync(SQLITE_FILE);
        this.db = new SQL.Database(fileBuffer);
        this.isInitialized = true;
        this.createTablesIfNotExist();
        return;
      } catch (err) {
        console.error('Failed reading existing sqlite db, creating new:', err);
      }
    }

    // Create fresh SQLite database
    this.db = new SQL.Database();
    this.isInitialized = true;
    this.createTablesIfNotExist();
    this.seedInitialData();
    this.persist();
  }

  private persist() {
    if (!this.db) return;
    try {
      const binaryArray = this.db.export();
      const buffer = Buffer.from(binaryArray);
      const tempPath = `${SQLITE_FILE}.tmp`;
      fs.writeFileSync(tempPath, buffer);
      fs.renameSync(tempPath, SQLITE_FILE);
    } catch (err) {
      console.error('Failed persisting SQLite to disk:', err);
    }
  }

  private createTablesIfNotExist() {
    // 1. Users Table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // 2. Site Settings Table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        platform_name TEXT NOT NULL,
        main_title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        welcome_text TEXT NOT NULL,
        zeus_image TEXT NOT NULL,
        conclusion_title TEXT NOT NULL,
        conclusion_text TEXT NOT NULL,
        support_email TEXT NOT NULL,
        primary_color TEXT NOT NULL,
        accent_color TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 3. Modules Table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        step_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        badge TEXT,
        full_content TEXT NOT NULL,
        practical_task TEXT NOT NULL,
        expected_result TEXT NOT NULL,
        table_data TEXT,
        packages TEXT,
        sort_order INTEGER NOT NULL,
        is_published INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 4. Prompts Table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        segment_name TEXT NOT NULL,
        description TEXT NOT NULL,
        prompt_content TEXT NOT NULL,
        icon_name TEXT,
        sort_order INTEGER NOT NULL,
        is_published INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 5. Videos Table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        file_path TEXT,
        file_type TEXT NOT NULL,
        duration TEXT,
        uploaded_at TEXT NOT NULL,
        is_published INTEGER NOT NULL
      );
    `);
  }

  private seedInitialData() {
    const userCountRes = this.db.exec('SELECT COUNT(*) as count FROM users');
    const userCount = (userCountRes[0]?.values[0]?.[0] as number) || 0;

    if (userCount === 0) {
      const salt = bcrypt.genSaltSync(10);
      const brasilHash = bcrypt.hashSync('Brasil123', salt);
      const admHash = bcrypt.hashSync('Adm888', salt);
      const now = new Date().toISOString();

      this.db.run(
        'INSERT INTO users (id, username, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['usr-brasil', 'Brasil', brasilHash, 'aluno', 'ativo', now]
      );

      this.db.run(
        'INSERT INTO users (id, username, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['usr-admin', 'Adm', admHash, 'admin', 'ativo', now]
      );
    }

    const settingsCountRes = this.db.exec('SELECT COUNT(*) as count FROM site_settings');
    const settingsCount = (settingsCountRes[0]?.values[0]?.[0] as number) || 0;

    if (settingsCount === 0) {
      const now = new Date().toISOString();
      const welcome = `Bem-vindo ao Zeus Sites IA. Neste curso, você vai aprender um método prático para identificar empresas locais que precisam de um site, utilizar ferramentas de inteligência artificial para criar páginas profissionais e oferecer esse serviço para conquistar seus primeiros clientes.

Você não precisa começar sendo um programador experiente. O objetivo é aprender o processo, praticar, desenvolver um portfólio e abordar empresas de maneira profissional.

A inteligência artificial será sua ferramenta de trabalho. Você aprenderá a utilizá-la para acelerar a criação dos sites, enquanto você cuida da qualidade, da comunicação com os clientes e da entrega final.`;

      const conclusion = `Obrigado por fazer parte do Zeus Sites IA!

Agora você conhece as etapas fundamentais para encontrar oportunidades no mercado local, utilizar inteligência artificial na criação de sites, personalizar projetos, apresentar propostas e entregar um serviço profissional.

O próximo passo é colocar o conhecimento em prática. Escolha um segmento, crie seu primeiro projeto demonstrativo, organize seu portfólio e comece a pesquisar empresas que possam se beneficiar do seu trabalho.

Não espere dominar tudo para começar a praticar. Aprimore suas habilidades a cada projeto, seja transparente com seus clientes e mantenha a qualidade como prioridade.

Lembre-se: a inteligência artificial é uma ferramenta poderosa, mas é a sua dedicação, sua capacidade de resolver problemas e a qualidade do serviço que construirão sua reputação.

Obrigado por adquirir o Zeus Sites IA. Desejamos muito sucesso na sua jornada!`;

      this.db.run(
        `INSERT INTO site_settings (id, platform_name, main_title, subtitle, welcome_text, zeus_image, conclusion_title, conclusion_text, support_email, primary_color, accent_color, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'settings-1',
          'ZEUS SITES IA',
          'Transforme Inteligência Artificial em Oportunidades',
          'Aprenda a criar sites profissionais com IA e oferecê-los para empresas locais',
          welcome,
          INITIAL_ZEUS_PORTRAIT,
          'VOCÊ CHEGOU AO FIM DA JORNADA, MAS SUA HISTÓRIA ESTÁ APENAS COMEÇANDO!',
          conclusion,
          'contato@zeussitesia.com',
          '#7028E8',
          '#A855F7',
          now
        ]
      );
    }

    const modCountRes = this.db.exec('SELECT COUNT(*) as count FROM modules');
    const modCount = (modCountRes[0]?.values[0]?.[0] as number) || 0;

    if (modCount === 0) {
      const now = new Date().toISOString();
      const modulesSeed = [
        {
          id: 'modulo-1',
          stepNumber: 1,
          title: 'Encontre Empresas que Precisam de um Site',
          description: 'Aprenda a identificar oportunidades reais de venda de sites na sua cidade mapeando pequenos negócios no Google Maps.',
          badge: 'Prospecção Local',
          fullContent: `Muitos pequenos negócios locais possuem ficha cadastrada no Google Maps, mas não possuem um site próprio ou apresentam uma página desatualizada, confusa, quebrada no celular ou pouco profissional. Isso representa uma janela de oportunidade imediata para você oferecer uma solução de valor real.

### Os 6 Passos Práticos para Mapear Empresas Locais:

1. **Abra o Google Maps** na sua região ou em bairros comerciais próximos.
2. **Pesquise categorias essenciais de negócios**, tais como barbearias, restaurantes, oficinas mecânicas, salões de beleza, lojas de roupas, clínicas e academias.
3. **Analise os resultados cuidadosamente**: filtre empresas que não possuem link de site cadastrado ou cujo link aponta para redes sociais desatualizadas.
4. **Visite o perfil comercial**: confira o volume de avaliações, fotos dos produtos ou serviços, telefone público e endereço físico.
5. **Crie uma lista organizada de possíveis clientes**: monte uma planilha ou bloco de notas estruturado.
6. **Registre as informações fundamentais**: nome da empresa, segmento, contato comercial público, presença de site e oportunidades claras de melhoria identificadas.

> **Importante**: Ter um site simples ou não ter um site não significa automaticamente que a empresa deseja comprar um hoje. Nosso trabalho ético e profissional consiste em mapear a oportunidade e descobrir se existe interesse genuíno do empresário.`,
          practicalTask: 'Abra o Google Maps, selecione 10 empresas locais na sua região e registre em uma lista quais delas poderiam se beneficiar expressivamente de um novo site profissional.',
          expectedResult: 'Uma lista inicial com pelo menos 10 potenciais clientes documentados com nome, nicho, contato público e melhorias visuais sugeridas.',
          tableData: JSON.stringify([
            { niche: 'Barbearia', highlights: 'Sistema visual de agendamento, catálogo de cortes e barbas, tabela de preços e mapa de localização com botão WhatsApp.' },
            { niche: 'Restaurante', highlights: 'Cardápio digital organizado por categorias, horários de funcionamento, endereço exato e links para pedidos.' },
            { niche: 'Oficina Mecânica', highlights: 'Lista de serviços mecânicos, marcas atendidas, botão rápido de solicitação de orçamento e fotos da oficina.' },
            { niche: 'Salão de Beleza', highlights: 'Galeria com portfólio de cortes e coloração, apresentação da equipe e agendamento direto.' },
            { niche: 'Loja de Roupas', highlights: 'Catálogo visual das novas coleções, grade de tamanhos, endereço físico e atendimento no WhatsApp.' }
          ]),
          packages: null
        },
        {
          id: 'modulo-2',
          stepNumber: 2,
          title: 'Defina o que Você vai Vender',
          description: 'Transforme a ideia genérica de criar sites em três pacotes de serviço claros, objetivos e fáceis de entender pelo cliente.',
          badge: 'Oferta Irresistível',
          fullContent: `O empresário local não compra linhas de código nem 'layouts bonitos'. Ele contrata uma ferramenta comercial para apresentar o seu negócio, facilitar o contato imediato com novos clientes, valorizar seus serviços e transmitir autoridade e confiança.

Para simplificar a tomada de decisão do seu cliente, trabalhe sempre com opções claras de contratação:

### Cuidados com Custos Extras e Precificação Ética:
- Custos de registro de domínio (ex: .com.br) e hospedagem mensal devem ser claramente descritos e separados do valor do seu serviço de criação.
- Não prometa ganhos financeiros garantidos nem 'vendas automáticas'.
- Defina seus honorários considerando o seu tempo estimado de dedicação, os custos de ferramentas, a complexidade técnica do projeto e a realidade econômica do comércio da sua região.`,
          practicalTask: 'Escolha um segmento comercial específico da sua cidade e elabore uma proposta de serviço com escopo detalhado, prazo de entrega realista e preço justo.',
          expectedResult: 'Uma apresentação de serviço concisa que você consiga explicar para qualquer proprietário em menos de 2 minutos.',
          tableData: null,
          packages: JSON.stringify([
            {
              name: 'Plano Essencial',
              description: 'Ideal para profissionais autônomos e pequenos negócios que precisam de uma presença digital rápida e assertiva.',
              features: [
                'Página profissional de apresentação única (One-Page)',
                'Apresentação clara da empresa e proposta de valor',
                'Lista dos principais serviços com destaques',
                'Endereço integrado ao mapa e horários de funcionamento',
                'Botão flutuante de contato direto via WhatsApp',
                'Layout 100% responsivo e otimizado para celulares'
              ]
            },
            {
              name: 'Plano Profissional',
              description: 'A solução mais recomendada para estabelecimentos consolidados que desejam se destacar dos concorrentes.',
              features: [
                'Todas as funcionalidades do Plano Essencial',
                'Múltiplas seções personalizadas para o nicho',
                'Galeria de fotos de alta qualidade e instalações',
                'Seção de Perguntas Frequentes (FAQ) interativa',
                'Depoimentos reais e autorizados de clientes',
                'Melhor organização e detalhamento dos serviços'
              ]
            },
            {
              name: 'Plano Avançado',
              description: 'Para empresas com ampla gama de produtos ou necessidades sob medida.',
              features: [
                'Estrutura multi-páginas quando o projeto exigir',
                'Catálogo digital estruturado de produtos ou serviços',
                'Formulários inteligentes de contato e orçamento',
                'Recursos adicionais sob demanda e filtros de busca',
                'Integrações avançadas compatíveis com a plataforma'
              ]
            }
          ])
        },
        {
          id: 'modulo-3',
          stepNumber: 3,
          title: 'Escolha a Ferramenta de Inteligência Artificial',
          description: 'Aprenda os critérios técnicos para selecionar ferramentas de IA que aceleram a criação sem comprometer a estabilidade do site.',
          badge: 'Tecnologia & IA',
          fullContent: `Ferramentas de Inteligência Artificial gerativa e construtores assistidos por IA são capazes de produzir layouts, textos persuasivos, estruturas completas e componentes funcionais a partir de prompts bem elaborados. No entanto, é fundamental dominar os critérios técnicos de escolha.

### Checklist de 7 Pontos para Avaliar Ferramentas de IA:

1. **Defina o tipo exato de site necessário**: landing page institucional, catálogo comercial ou aplicação com área de membros.
2. **Escolha uma ferramenta compatível com o projeto**: que suporte código limpo (HTML/CSS/JS, React ou plataformas no-code consolidadas).
3. **Verifique se a ferramenta permite publicar**: confira se há publicação em domínio próprio sem amarras invisíveis.
4. **Confira os custos reais**: analise taxas de assinatura, hospedagem contínua e certificados SSL.
5. **Verifique se é possível transferir o projeto**: certifique-se de que você consegue entregar os acessos definitivos ao cliente final.
6. **Confira as regras de uso comercial**: verifique se os termos de serviço autorizam expressamente a revenda para terceiros.
7. **Teste exaustivamente antes de vender**: nunca use o cliente real como cobaia do seu primeiro teste com uma ferramenta nova.

> **Atenção**: Uma ferramenta que gera uma interface visual atraente nem sempre oferece banco de dados persistente, formulários integrados, login ou publicação descomplicada. Verifique essas capacidades antes de prometer ao cliente.`,
          practicalTask: 'Selecione uma ferramenta de criação com IA e gere um projeto completo de testes para um negócio fictício da sua escolha.',
          expectedResult: 'Uma ferramenta de trabalho homologada por você e a compreensão clara das suas capacidades e limitações práticas.',
          tableData: null,
          packages: null
        },
        {
          id: 'modulo-4',
          stepNumber: 4,
          title: 'Crie o Primeiro Site com um Prompt',
          description: 'Aprenda a fornecer comandos estruturados para a IA produzir páginas modernas, persuasivas e prontas para uso.',
          badge: 'Engenharia de Prompt',
          fullContent: `O segredo para extrair resultados profissionais de qualquer ferramenta de Inteligência Artificial reside na precisão e completude das instruções. Seu prompt deve fornecer contexto, segmento, público-alvo, diretrizes de identidade visual, estrutura de seções e regras estritas de conformidade.

### Prompt de Exemplo para Estudo e Aplicação:

\`\`\`text
"Crie um site profissional, moderno e responsivo para uma barbearia fictícia chamada Barbearia Imperial. Utilize uma identidade visual preta e dourada, com aparência elegante e masculina. Crie uma página inicial com título chamativo, apresentação da barbearia, lista de serviços, preços ilustrativos claramente identificados como exemplos, galeria de imagens, horário de funcionamento, endereço fictício, perguntas frequentes e botão de contato pelo WhatsApp. Organize as informações de forma clara, priorizando a experiência em celulares. Utilize textos em português brasileiro. Não invente avaliações reais, certificações ou informações comerciais verificadas. Utilize dados fictícios claramente identificados como demonstração. Garanta que os botões funcionem e que o layout seja acessível, rápido e fácil de navegar."
\`\`\`

### Ciclo de 7 Etapas para Refinar o Resultado Gerado:

1. **Gere a primeira versão** com base no prompt estruturado.
2. **Confira a visualização em celulares e computadores** para checar a responsividade.
3. **Solicite melhorias pontuais para a IA** (ex: espaçamentos, tipografia, contraste de botões).
4. **Revise minuciosamente os textos**, garantindo português brasileiro impecável e tom profissional.
5. **Verifique todos os links e botões**, assegurando que os cliques realizem a ação esperada.
6. **Substitua os dados de demonstração** pelas informações oficiais autorizadas pelo cliente.
7. **Realize o teste final de navegação** antes da apresentação oficial.`,
          practicalTask: 'Copie o prompt estruturado da Barbearia Imperial, gere uma versão na sua ferramenta de preferência e execute o ciclo de 7 etapas de refinamento.',
          expectedResult: 'Um primeiro modelo de demonstração de alto nível para compor seu portfólio inicial de apresentação.',
          tableData: null,
          packages: null
        },
        {
          id: 'modulo-5',
          stepNumber: 5,
          title: 'Personalize o Site para Cada Empresa',
          description: 'Como adaptar modelos base para as necessidades e identidade exclusivas de cada empresa atendida.',
          badge: 'Customização',
          fullContent: `Copiar exatamente o mesmo modelo e trocar apenas o título empobrece seu serviço e afasta clientes. Cada segmento de mercado possui dores, expectativas e fluxos de atendimento específicos.

### Elementos Essenciais que Devem ser Personalizados:
- **Nome e Identidade Visual**: cores oficiais, tipografia alinhada ao posicionamento e logotipo original.
- **Serviços e Especialidades**: descrição detalhada das soluções reais que a empresa oferece.
- **Imagens Reais e Autorizadas**: fotos do ambiente de trabalho, da equipe e dos produtos.
- **Endereço e Horários de Pico**: informações geográficas precisas e horários reais de atendimento.
- **Canais de Contato**: números comerciais de WhatsApp, e-mails corporativos e links sociais.
- **Perguntas Frequentes (FAQ)**: dúvidas que os clientes reais daquela empresa mais costumam fazer.

### Comparativo Prático entre Segmentos:
- **Oficina Mecânica**: destaque para serviços preventivos e corretivos, marcas e montadoras atendidas, mapa de localização de fácil acesso para guincho e botão direto para pedir orçamento emergencial.
- **Restaurante ou Hamburgueria**: destaque para fotos apetitosas dos pratos autorizadas, cardápio digital por seções, horários de almoço/jantar e botões de pedidos via delivery ou reserva de mesa.

> **Regra de Ouro da Ética Profissional**: Nunca invente preços, depoimentos de clientes que não existem, certificações falsas ou garantias que o proprietário não autorizou por escrito.`,
          practicalTask: 'Pegue o modelo demonstrativo que você refinou na Etapa 4 e personalize-o inteiramente para um segundo nicho comercial (ex: restaurante ou clínica estética).',
          expectedResult: 'Um segundo projeto personalizado com identidade visual, paleta de cores e seções ajustadas ao público daquele nicho.',
          tableData: null,
          packages: null
        },
        {
          id: 'modulo-6',
          stepNumber: 6,
          title: 'Aborde Empresas e Ofereça seu Serviço',
          description: 'Aprenda a apresentar sua proposta de maneira consultiva, respeitosa, ética e sem pressionar o empresário.',
          badge: 'Abordagem Comercial',
          fullContent: `Mapear a empresa no Google Maps é apenas o primeiro passo. A abordagem precisa ser consultiva e centrada nas vantagens que a empresa terá ao melhorar sua apresentação digital.

### Modelo de Mensagem Consultiva para Primeiro Contato:

\`\`\`text
"Olá! Tudo bem? Encontrei a empresa de vocês no Google e gostaria de apresentar uma ideia. Trabalho com criação de sites profissionais e pensei em algumas maneiras de facilitar a apresentação dos serviços e o contato com os clientes pelo celular. Posso mostrar um exemplo de como ficaria um site para o seu segmento? Se não for um bom momento, sem problemas."
\`\`\`

### As 8 Diretrizes de Prospecção Ética:

1. **Personalize a mensagem para cada negócio**: cite o nome da empresa e um ponto positivo que você notou no trabalho deles.
2. **Utilize exclusivamente canais comerciais públicos** disponibilizados pela própria empresa (ex: WhatsApp comercial).
3. **Seja transparente sobre sua experiência**: explique que desenvolveu um modelo demonstrativo focado no nicho deles.
4. **Nunca dispare mensagens em massa** ou listas frias de spam.
5. **Respeite imediatamente qualquer recusa**: se disserem que não têm interesse, agradeça cordialmente e encerre o contato.
6. **Nunca finja ser cliente fictício**, funcionário ou parceiro do Google.
7. **Apresente o orçamento e o escopo detalhado** antes de iniciar qualquer etapa do trabalho.
8. **Formalize prazos, formas de pagamento, revisões e custos de hospedagem** sempre por escrito.

### Como Agir na Abordagem Presencial:
Se for visitar a empresa pessoalmente, vá em horários de menor movimento, apresente-se com postura profissional, peça para conversar brevemente com o responsável pelas decisões e mostre o modelo demonstrativo funcionando fluido na tela do seu próprio celular. Se perguntarem o preço de imediato, responda: *"O valor varia conforme as funcionalidades que sua empresa precisa, mas trabalhamos com opções essenciais a partir de [Valor Base] até projetos completos sob medida. Posso entender suas necessidades para montar uma proposta exata?"*`,
          practicalTask: 'Prepare uma apresentação curta e personalizada para 3 estabelecimentos comerciais da sua cidade, adaptando a mensagem para cada nicho.',
          expectedResult: 'Três mensagens de abordagem prontas, éticas e consultivas para dar início às suas primeiras conversas comerciais.',
          tableData: null,
          packages: null
        },
        {
          id: 'modulo-7',
          stepNumber: 7,
          title: 'Negocie, Entregue e Receba pelo Projeto',
          description: 'Como conduzir a negociação, formalizar a proposta comercial, gerenciar revisões e entregar com excelência.',
          badge: 'Fechamento & Contrato',
          fullContent: `O fechamento de um projeto de site profissional precisa seguir um fluxo previsível e seguro tanto para você quanto para o contratante.

### O Fluxo Comercial Completo em 10 Passos:

1. Entender as necessidades e prioridades da empresa.
2. Definir o escopo exato do que será entregue (páginas, botões, seções).
3. Apresentar a proposta comercial com clareza.
4. Combinar prazo de entrega, condições de pagamento (ex: 50% de entrada e 50% na aprovação final) e número de rodadas de revisão permitidas.
5. Formalizar o acordo em documento escrito.
6. Solicitar fotos em alta resolução, logotipo e dados oficiais do negócio.
7. Desenvolver a versão funcional e testar em múltiplos dispositivos.
8. Apresentar o link de homologação para aprovação do cliente.
9. Executar pontualmente os ajustes previstos no escopo combinado.
10. Conectar o domínio oficial, publicar e entregar as chaves de acesso.

### Modelo de Estrutura de Proposta Comercial:
- **Cliente**: Razão Social ou Nome Fantasia e Responsável.
- **Descrição do Projeto**: Apresentação da solução desenvolvida.
- **Escopo e Funcionalidades**: Relação detalhada de cada seção e botão incluído.
- **Prazo Estimado**: Tempo total em dias úteis após o recebimento dos materiais.
- **Investimento Total**: Valor fechado da criação.
- **Condições de Pagamento**: Sinal de entrada + saldo na entrega.
- **Custos Recorrentes**: Custos de domínio e hospedagem de responsabilidade do cliente.
- **Revisões**: Limite estipulado de rodadas de ajustes antes de custos adicionais.
- **Responsabilidades Mútuas**: Prazos de envio de materiais e aprovação.
- **Entrega e Suporte**: Período de garantia e tira-dúvidas pós-publicação.

### Renda Recorrente com Manutenção Mensal:
Além da taxa única de criação do site, ofereça um plano opcional de manutenção mensal. Esse pacote pode incluir pequenas alterações de texto, atualização de cardápios ou preços, inclusão de novas fotos, monitoramento de funcionamento e suporte básico via WhatsApp.`,
          practicalTask: 'Preencha o modelo de proposta comercial completo simulando o atendimento a um pequeno comércio da sua região com escopo, prazos e condições financeiras.',
          expectedResult: 'Uma proposta comercial profissional salva em formato pronto para envio a novos clientes.',
          tableData: null,
          packages: null
        },
        {
          id: 'modulo-8',
          stepNumber: 8,
          title: 'Escale sua Operação e Conquiste Novos Clientes',
          description: 'Construa um método de trabalho escalável, gerencie seu funil de prospecção e amplie seu faturamento de forma consistente.',
          badge: 'Escala & Gestão',
          fullContent: `Para transformar o aprendizado em um negócio sustentável e lucrativo, você precisa de processos repetíveis e controle sistemático de cada oportunidade gerada.

### O Processo de Trabalho em 10 Etapas Contínuas:

1. Escolher um segmento prioritário por semana ou quinzena.
2. Pesquisar sistematicamente empresas locais no Google Maps.
3. Registrar os dados em seu funil de prospecção.
4. Realizar os primeiros contatos consultivos e personalizados.
5. Identificar empresários abertos a conhecer sua solução.
6. Apresentar a demonstração e enviar propostas detalhadas.
7. Desenvolver com rapidez e padrão de excelência os sites contratados.
8. Entregar os sites no prazo combinado e comemorar com o cliente.
9. Solicitar autorização formal para expor o projeto no seu portfólio.
10. Pedir indicações de outros amigos empresários e fechar contratos de manutenção recorrente.

### As 6 Etapas do Funil de Controle (CRM):
Mantenha uma planilha simples ou aplicativo de gestão organizado com as seguintes colunas:
1. **Empresa Identificada**
2. **Contato Realizado**
3. **Interessado / Demonstração Agendada**
4. **Proposta Enviada**
5. **Projeto Contratado (Em Execução)**
6. **Entregue & Em Manutenção**

> **Lembrete de Integridade**: Não existem ganhos garantidos ou 'fórmulas mágicas'. O seu sucesso dependerá diretamente da qualidade técnica dos seus sites, da regularidade dos seus contatos diários, da postura profissional nos atendimentos e da satisfação dos seus primeiros clientes atendidos.`,
          practicalTask: 'Monte sua planilha de prospecção com as 6 colunas do funil e estruture uma meta para os próximos 30 dias contendo metas de contatos semanais.',
          expectedResult: 'Um plano de ação de 30 dias estruturado com metas práticas de pesquisa, abordagens, propostas e aperfeiçoamento constante.',
          tableData: null,
          packages: null
        }
      ];

      for (const m of modulesSeed) {
        this.db.run(
          `INSERT INTO modules (id, step_number, title, description, badge, full_content, practical_task, expected_result, table_data, packages, sort_order, is_published, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id,
            m.stepNumber,
            m.title,
            m.description,
            m.badge,
            m.fullContent,
            m.practicalTask,
            m.expectedResult,
            m.tableData,
            m.packages,
            m.stepNumber,
            1,
            now
          ]
        );
      }
    }

    const prmCountRes = this.db.exec('SELECT COUNT(*) as count FROM prompts');
    const prmCount = (prmCountRes[0]?.values[0]?.[0] as number) || 0;

    if (prmCount === 0) {
      const now = new Date().toISOString();
      const promptsSeed = [
        {
          id: 'prompt-1',
          segmentName: 'Barbearia',
          description: 'Site moderno com estética masculina sofisticada, serviços, tabela de preços e agendamento rápido.',
          iconName: 'Scissors',
          promptContent: 'Crie um site moderno e profissional para uma barbearia. Utilize uma identidade visual masculina, com cores elegantes e excelente apresentação no celular. Inclua página inicial, apresentação da barbearia, serviços, preços fornecidos pelo proprietário, galeria de fotos autorizadas, localização, horário de funcionamento, perguntas frequentes e botão de contato pelo WhatsApp. Organize o conteúdo para facilitar a descoberta dos serviços e o contato. Utilize português brasileiro e não invente avaliações, endereços ou informações comerciais.'
        },
        {
          id: 'prompt-2',
          segmentName: 'Restaurante',
          description: 'Cardápio digital por categorias, horários de funcionamento, galeria gastronômica e botão para pedidos.',
          iconName: 'Utensils',
          promptContent: 'Crie um site responsivo para um restaurante, com identidade visual alinhada ao tipo de culinária. Inclua apresentação do estabelecimento, cardápio com preços fornecidos pelo cliente, fotos autorizadas, horário de funcionamento, endereço, formas de pedido disponíveis e botão de contato. Organize o cardápio por categorias e garanta que as informações sejam fáceis de encontrar no celular. Não invente pratos, preços ou avaliações.'
        },
        {
          id: 'prompt-3',
          segmentName: 'Oficina Mecânica',
          description: 'Visual confiável e técnico com serviços preventivos, marcas atendidas e botão para orçamento.',
          iconName: 'Wrench',
          promptContent: 'Crie um site profissional para uma oficina mecânica. Inclua apresentação da empresa, serviços oferecidos, solicitação de orçamento, horário de funcionamento, endereço, perguntas frequentes e botão de contato pelo WhatsApp. Utilize um visual confiável, organizado e adaptado para dispositivos móveis. Apresente somente serviços e especialidades confirmados pelo proprietário.'
        },
        {
          id: 'prompt-4',
          segmentName: 'Salão de Beleza',
          description: 'Design sofisticado e elegante com portfólio de cortes e penteados, serviços e agendamentos.',
          iconName: 'Sparkles',
          promptContent: 'Crie um site elegante para um salão de beleza, com apresentação dos profissionais, serviços, preços fornecidos pelo salão, galeria autorizada, localização, horários e formas de agendamento disponíveis. Utilize uma identidade visual sofisticada, navegação simples e botões de contato destacados. Não invente profissionais, certificados ou avaliações.'
        },
        {
          id: 'prompt-5',
          segmentName: 'Loja de Roupas',
          description: 'Catálogo visual das novidades, grade de tamanhos, endereço físico e integração com atendimento.',
          iconName: 'ShoppingBag',
          promptContent: 'Crie um site moderno para uma loja de roupas. Inclua apresentação da marca, categorias de produtos, catálogo visual, informações fornecidas sobre tamanhos e disponibilidade, localização e formas de contato ou compra realmente disponíveis. Utilize imagens autorizadas, design responsivo e navegação clara. Não simule pagamentos nem apresente estoque fictício como real.'
        },
        {
          id: 'prompt-6',
          segmentName: 'Clínica de Estética',
          description: 'Identidade visual limpa, tratamentos autorizados, equipe qualificada e agendamento de avaliação.',
          iconName: 'HeartPulse',
          promptContent: 'Crie um site profissional para uma clínica de estética. Inclua apresentação, tratamentos efetivamente oferecidos, equipe com informações autorizadas, perguntas frequentes, localização, horários e contato para agendamento. Utilize uma identidade visual limpa, elegante e responsiva. Não faça promessas de resultados clínicos, não invente qualificações profissionais e não utilize depoimentos falsos.'
        },
        {
          id: 'prompt-7',
          segmentName: 'Academia',
          description: 'Layout energético e dinâmico com modalidades, horários de aulas, planos e contato para matrícula.',
          iconName: 'Dumbbell',
          promptContent: 'Crie um site moderno para uma academia. Inclua apresentação, modalidades disponíveis, estrutura, horários, planos e preços fornecidos pelo proprietário, localização e botão para solicitar informações sobre matrícula. Utilize um design energético, organizado e adaptado para celulares. Não invente instalações, equipamentos ou condições comerciais.'
        },
        {
          id: 'prompt-8',
          segmentName: 'Pet Shop',
          description: 'Design acolhedor e simpático com serviços de banho & tosa, produtos confirmados e localização.',
          iconName: 'PawPrint',
          promptContent: 'Crie um site acolhedor e profissional para um pet shop. Inclua apresentação, produtos e serviços confirmados, informações sobre banho e tosa quando oferecidos, localização, horários e contato. Utilize imagens autorizadas e uma identidade visual amigável. Organize as informações para que os clientes encontrem facilmente os serviços e as formas de atendimento.'
        }
      ];

      promptsSeed.forEach((p, idx) => {
        this.db.run(
          `INSERT INTO prompts (id, segment_name, description, prompt_content, icon_name, sort_order, is_published, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.id, p.segmentName, p.description, p.promptContent, p.iconName, idx + 1, 1, now]
        );
      });
    }

    const vidCountRes = this.db.exec('SELECT COUNT(*) as count FROM videos');
    const vidCount = (vidCountRes[0]?.values[0]?.[0] as number) || 0;

    if (vidCount === 0) {
      const now = new Date().toISOString();
      this.db.run(
        `INSERT INTO videos (id, title, description, file_path, file_type, duration, uploaded_at, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'video-1',
          'Aula Principal — Aprenda na Prática o Método Completo',
          'Agora que você conhece as oito etapas, chegou a hora de acompanhar o processo na prática. Nesta aula, você poderá observar como pesquisar empresas no Google Maps, identificar oportunidades, utilizar a inteligência artificial para criar um site, personalizar o resultado e apresentar uma proposta comercial. Assista com atenção e aplique cada etapa no seu próprio projeto.',
          null,
          'video/mp4',
          '32:45',
          now,
          1
        ]
      );
    }
  }

  // --- Users Operations (SQL) ---
  public getUsers(): UserRecord[] {
    const res = this.db.exec('SELECT id, username, password_hash, role, status, created_at FROM users');
    if (!res[0]) return [];
    return res[0].values.map((v) => ({
      id: v[0] as string,
      username: v[1] as string,
      passwordHash: v[2] as string,
      role: v[3] as any,
      status: v[4] as any,
      createdAt: v[5] as string
    }));
  }

  public getUserByUsername(username: string): UserRecord | undefined {
    const stmt = this.db.prepare('SELECT id, username, password_hash, role, status, created_at FROM users WHERE LOWER(username) = LOWER(?)');
    stmt.bind([username.trim()]);
    if (stmt.step()) {
      const row = stmt.get();
      stmt.free();
      return {
        id: row[0] as string,
        username: row[1] as string,
        passwordHash: row[2] as string,
        role: row[3] as any,
        status: row[4] as any,
        createdAt: row[5] as string
      };
    }
    stmt.free();
    return undefined;
  }

  public getUserById(id: string): UserRecord | undefined {
    const stmt = this.db.prepare('SELECT id, username, password_hash, role, status, created_at FROM users WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.get();
      stmt.free();
      return {
        id: row[0] as string,
        username: row[1] as string,
        passwordHash: row[2] as string,
        role: row[3] as any,
        status: row[4] as any,
        createdAt: row[5] as string
      };
    }
    stmt.free();
    return undefined;
  }

  public createUser(username: string, plainPassword: string, role: 'aluno' | 'admin'): UserRecord {
    const existing = this.getUserByUsername(username);
    if (existing) throw new Error('Usuário já existe no banco de dados');

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(plainPassword, salt);
    const now = new Date().toISOString();
    const id = `usr-${Date.now()}`;

    this.db.run(
      'INSERT INTO users (id, username, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, username.trim(), passwordHash, role, 'ativo', now]
    );
    this.persist();

    return {
      id,
      username: username.trim(),
      passwordHash,
      role,
      status: 'ativo',
      createdAt: now
    };
  }

  public updateUser(id: string, updates: Partial<Pick<UserRecord, 'role' | 'status'>>): UserRecord {
    const user = this.getUserById(id);
    if (!user) throw new Error('Usuário não encontrado');

    const newRole = updates.role || user.role;
    const newStatus = updates.status || user.status;

    this.db.run('UPDATE users SET role = ?, status = ? WHERE id = ?', [newRole, newStatus, id]);
    this.persist();

    user.role = newRole;
    user.status = newStatus;
    return user;
  }

  public resetUserPassword(id: string, newPlainPassword: string): void {
    const user = this.getUserById(id);
    if (!user) throw new Error('Usuário não encontrado');
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPlainPassword, salt);

    this.db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, id]);
    this.persist();
  }

  public deleteUser(id: string): void {
    const user = this.getUserById(id);
    if (!user) throw new Error('Usuário não encontrado');
    if (user.username.toLowerCase() === 'adm') {
      throw new Error('A conta administradora principal não pode ser excluída');
    }
    this.db.run('DELETE FROM users WHERE id = ?', [id]);
    this.persist();
  }

  // --- Site Settings Operations (SQL) ---
  public getSettings(): SiteSettings {
    const res = this.db.exec('SELECT * FROM site_settings WHERE id = "settings-1"');
    if (!res[0] || !res[0].values[0]) {
      throw new Error('Configurações não encontradas');
    }
    const row = res[0].values[0];
    return {
      id: row[0] as string,
      platformName: row[1] as string,
      mainTitle: row[2] as string,
      subtitle: row[3] as string,
      welcomeText: row[4] as string,
      zeusImage: row[5] as string,
      conclusionTitle: row[6] as string,
      conclusionText: row[7] as string,
      supportEmail: row[8] as string,
      primaryColor: row[9] as string,
      accentColor: row[10] as string,
      updatedAt: row[11] as string
    };
  }

  public updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    const current = this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.db.run(
      `UPDATE site_settings
       SET platform_name = ?, main_title = ?, subtitle = ?, welcome_text = ?, zeus_image = ?, conclusion_title = ?, conclusion_text = ?, support_email = ?, primary_color = ?, accent_color = ?, updated_at = ?
       WHERE id = "settings-1"`,
      [
        updated.platformName,
        updated.mainTitle,
        updated.subtitle,
        updated.welcomeText,
        updated.zeusImage,
        updated.conclusionTitle,
        updated.conclusionText,
        updated.supportEmail,
        updated.primaryColor,
        updated.accentColor,
        updated.updatedAt
      ]
    );
    this.persist();
    return updated;
  }

  // --- Modules Operations (SQL) ---
  public getModules(onlyPublished = false): CourseModule[] {
    const query = onlyPublished
      ? 'SELECT * FROM modules WHERE is_published = 1 ORDER BY sort_order ASC'
      : 'SELECT * FROM modules ORDER BY sort_order ASC';
    const res = this.db.exec(query);
    if (!res[0]) return [];

    return res[0].values.map((v) => ({
      id: v[0] as string,
      stepNumber: v[1] as number,
      title: v[2] as string,
      description: v[3] as string,
      badge: (v[4] as string) || undefined,
      fullContent: v[5] as string,
      practicalTask: v[6] as string,
      expectedResult: v[7] as string,
      tableData: v[8] ? JSON.parse(v[8] as string) : undefined,
      packages: v[9] ? JSON.parse(v[9] as string) : undefined,
      sortOrder: v[10] as number,
      isPublished: Boolean(v[11]),
      updatedAt: v[12] as string
    }));
  }

  public getModuleById(id: string): CourseModule | undefined {
    const stmt = this.db.prepare('SELECT * FROM modules WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const v = stmt.get();
      stmt.free();
      return {
        id: v[0] as string,
        stepNumber: v[1] as number,
        title: v[2] as string,
        description: v[3] as string,
        badge: (v[4] as string) || undefined,
        fullContent: v[5] as string,
        practicalTask: v[6] as string,
        expectedResult: v[7] as string,
        tableData: v[8] ? JSON.parse(v[8] as string) : undefined,
        packages: v[9] ? JSON.parse(v[9] as string) : undefined,
        sortOrder: v[10] as number,
        isPublished: Boolean(v[11]),
        updatedAt: v[12] as string
      };
    }
    stmt.free();
    return undefined;
  }

  public createModule(data: Omit<CourseModule, 'id' | 'updatedAt'>): CourseModule {
    const id = `modulo-${Date.now()}`;
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO modules (id, step_number, title, description, badge, full_content, practical_task, expected_result, table_data, packages, sort_order, is_published, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.stepNumber,
        data.title,
        data.description,
        data.badge || null,
        data.fullContent,
        data.practicalTask,
        data.expectedResult,
        data.tableData ? JSON.stringify(data.tableData) : null,
        data.packages ? JSON.stringify(data.packages) : null,
        data.sortOrder,
        data.isPublished ? 1 : 0,
        now
      ]
    );
    this.persist();

    return {
      ...data,
      id,
      updatedAt: now
    };
  }

  public updateModule(id: string, data: Partial<CourseModule>): CourseModule {
    const existing = this.getModuleById(id);
    if (!existing) throw new Error('Módulo não encontrado no banco de dados');

    const updated: CourseModule = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.db.run(
      `UPDATE modules
       SET step_number = ?, title = ?, description = ?, badge = ?, full_content = ?, practical_task = ?, expected_result = ?, table_data = ?, packages = ?, sort_order = ?, is_published = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.stepNumber,
        updated.title,
        updated.description,
        updated.badge || null,
        updated.fullContent,
        updated.practicalTask,
        updated.expectedResult,
        updated.tableData ? JSON.stringify(updated.tableData) : null,
        updated.packages ? JSON.stringify(updated.packages) : null,
        updated.sortOrder,
        updated.isPublished ? 1 : 0,
        updated.updatedAt,
        id
      ]
    );
    this.persist();
    return updated;
  }

  public deleteModule(id: string): void {
    this.db.run('DELETE FROM modules WHERE id = ?', [id]);
    this.persist();
  }

  public reorderModules(orderIds: string[]): void {
    orderIds.forEach((id, index) => {
      this.db.run('UPDATE modules SET sort_order = ?, step_number = ? WHERE id = ?', [
        index + 1,
        index + 1,
        id
      ]);
    });
    this.persist();
  }

  // --- Prompts Operations (SQL) ---
  public getPrompts(onlyPublished = false): PromptCard[] {
    const query = onlyPublished
      ? 'SELECT * FROM prompts WHERE is_published = 1 ORDER BY sort_order ASC'
      : 'SELECT * FROM prompts ORDER BY sort_order ASC';
    const res = this.db.exec(query);
    if (!res[0]) return [];

    return res[0].values.map((v) => ({
      id: v[0] as string,
      segmentName: v[1] as string,
      description: v[2] as string,
      promptContent: v[3] as string,
      iconName: (v[4] as string) || undefined,
      sortOrder: v[5] as number,
      isPublished: Boolean(v[6]),
      updatedAt: v[7] as string
    }));
  }

  public getPromptById(id: string): PromptCard | undefined {
    const stmt = this.db.prepare('SELECT * FROM prompts WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const v = stmt.get();
      stmt.free();
      return {
        id: v[0] as string,
        segmentName: v[1] as string,
        description: v[2] as string,
        promptContent: v[3] as string,
        iconName: (v[4] as string) || undefined,
        sortOrder: v[5] as number,
        isPublished: Boolean(v[6]),
        updatedAt: v[7] as string
      };
    }
    stmt.free();
    return undefined;
  }

  public createPrompt(data: Omit<PromptCard, 'id' | 'updatedAt'>): PromptCard {
    const id = `prompt-${Date.now()}`;
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO prompts (id, segment_name, description, prompt_content, icon_name, sort_order, is_published, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.segmentName,
        data.description,
        data.promptContent,
        data.iconName || null,
        data.sortOrder,
        data.isPublished ? 1 : 0,
        now
      ]
    );
    this.persist();

    return {
      ...data,
      id,
      updatedAt: now
    };
  }

  public updatePrompt(id: string, data: Partial<PromptCard>): PromptCard {
    const existing = this.getPromptById(id);
    if (!existing) throw new Error('Prompt não encontrado no banco de dados');

    const updated: PromptCard = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.db.run(
      `UPDATE prompts
       SET segment_name = ?, description = ?, prompt_content = ?, icon_name = ?, sort_order = ?, is_published = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.segmentName,
        updated.description,
        updated.promptContent,
        updated.iconName || null,
        updated.sortOrder,
        updated.isPublished ? 1 : 0,
        updated.updatedAt,
        id
      ]
    );
    this.persist();
    return updated;
  }

  public deletePrompt(id: string): void {
    this.db.run('DELETE FROM prompts WHERE id = ?', [id]);
    this.persist();
  }

  public reorderPrompts(orderIds: string[]): void {
    orderIds.forEach((id, index) => {
      this.db.run('UPDATE prompts SET sort_order = ? WHERE id = ?', [index + 1, id]);
    });
    this.persist();
  }

  // --- Videos Operations (SQL) ---
  public getVideo(): VideoLesson {
    const res = this.db.exec('SELECT * FROM videos WHERE id = "video-1"');
    if (!res[0] || !res[0].values[0]) {
      throw new Error('Vídeo não encontrado');
    }
    const v = res[0].values[0];
    return {
      id: v[0] as string,
      title: v[1] as string,
      description: v[2] as string,
      filePath: (v[3] as string) || null,
      fileType: v[4] as string,
      duration: (v[5] as string) || undefined,
      uploadedAt: v[6] as string,
      isPublished: Boolean(v[7])
    };
  }

  public updateVideo(data: Partial<VideoLesson>): VideoLesson {
    const existing = this.getVideo();
    const updated: VideoLesson = {
      ...existing,
      ...data,
      uploadedAt: new Date().toISOString()
    };

    this.db.run(
      `UPDATE videos
       SET title = ?, description = ?, file_path = ?, file_type = ?, duration = ?, uploaded_at = ?, is_published = ?
       WHERE id = "video-1"`,
      [
        updated.title,
        updated.description,
        updated.filePath || null,
        updated.fileType,
        updated.duration || null,
        updated.uploadedAt,
        updated.isPublished ? 1 : 0
      ]
    );
    this.persist();
    return updated;
  }

  public deleteVideoFile(): void {
    const video = this.getVideo();
    if (video.filePath && fs.existsSync(video.filePath)) {
      try {
        fs.unlinkSync(video.filePath);
      } catch (err) {
        console.error('Error removing video file:', err);
      }
    }
    this.db.run('UPDATE videos SET file_path = NULL WHERE id = "video-1"');
    this.persist();
  }
}

export const dbService = SQLiteDatabaseService.getInstance();
