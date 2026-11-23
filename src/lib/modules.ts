import {
  LayoutDashboard,
  Sparkles,
  Bot,
  Search,
  BookOpen,
  FileText,
  Workflow,
  Users,
  Building2,
  TrendingUp,
  KeyRound,
  Mail,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type ModuleGroup = "Principal" | "Conhecimento" | "Negócios" | "Gestão";

export interface AppModule {
  slug: string;
  label: string;
  description: string;
  group: ModuleGroup;
  phase: string;
  icon: LucideIcon;
}

export const groups: ModuleGroup[] = [
  "Principal",
  "Conhecimento",
  "Negócios",
  "Gestão",
];

export const modules: AppModule[] = [
  { slug: "dashboard", label: "Dashboard", description: "Visão geral da operação da imobiliária.", group: "Principal", phase: "Fase 5", icon: LayoutDashboard },
  { slug: "workspace", label: "AI Workspace", description: "Ambiente de trabalho com IA para a sua equipe.", group: "Principal", phase: "Fase 3", icon: Sparkles },
  { slug: "agents", label: "AI Agents", description: "Agentes especializados coordenados por um orquestrador central.", group: "Principal", phase: "Fase 6", icon: Bot },
  { slug: "research", label: "AI Research", description: "Pesquisa de mercado e análise com apoio de IA.", group: "Principal", phase: "Fase 3", icon: Search },
  { slug: "knowledge", label: "Knowledge Base", description: "Base de conhecimento da sua imobiliária.", group: "Conhecimento", phase: "Fase 4", icon: BookOpen },
  { slug: "documents", label: "Document Intelligence", description: "Leitura e análise inteligente de documentos e contratos.", group: "Conhecimento", phase: "Fase 4", icon: FileText },
  { slug: "automation", label: "Workflow Automation", description: "Automação de rotinas, com aprovação humana em ações sensíveis.", group: "Conhecimento", phase: "Fase 7", icon: Workflow },
  { slug: "crm", label: "CRM", description: "Gestão de clientes e leads.", group: "Negócios", phase: "Fase 5", icon: Users },
  { slug: "properties", label: "Property Management", description: "Cadastro e gestão de imóveis.", group: "Negócios", phase: "Fase 5", icon: Building2 },
  { slug: "sales", label: "Sales Management", description: "Funil e acompanhamento de vendas.", group: "Negócios", phase: "Fase 5", icon: TrendingUp },
  { slug: "rentals", label: "Rental Management", description: "Contratos e gestão de locações.", group: "Negócios", phase: "Fase 5", icon: KeyRound },
  { slug: "communications", label: "Communications", description: "Central de comunicação com clientes.", group: "Negócios", phase: "Fase 7", icon: Mail },
  { slug: "admin", label: "Administration", description: "Usuários, papéis e permissões.", group: "Gestão", phase: "Fase 2", icon: ShieldCheck },
  { slug: "settings", label: "Organization Settings", description: "Configurações da sua organização.", group: "Gestão", phase: "Fase 2", icon: Settings },
];
