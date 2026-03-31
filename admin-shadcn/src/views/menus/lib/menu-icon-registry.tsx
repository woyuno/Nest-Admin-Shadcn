import type { ComponentType, ReactNode } from 'react'
import {
  AlarmClock,
  Archive,
  ArrowLeftRight,
  Bell,
  BookText,
  BriefcaseBusiness,
  Building2,
  ChartArea,
  ChartBar,
  CheckCheck,
  CircleDollarSign,
  CircleHelp,
  ClipboardList,
  Clock3,
  Cloud,
  Cog,
  Command,
  Compass,
  ContactRound,
  CreditCard,
  Database,
  FileBarChart2,
  FileCog,
  FileSearch,
  FolderTree,
  Globe,
  HardDrive,
  HeartHandshake,
  House,
  IdCard,
  KeySquare,
  LayoutDashboard,
  LibraryBig,
  LockKeyhole,
  Logs,
  Mail,
  MenuSquare,
  MessageSquareText,
  MonitorCog,
  MoonStar,
  NotebookTabs,
  Package2,
  PanelsTopLeft,
  ReceiptText,
  Route,
  ScrollText,
  ServerCog,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  SquareChartGantt,
  SquareTerminal,
  SunMedium,
  Tags,
  Ticket,
  TimerReset,
  Trash2,
  TreePine,
  Truck,
  UserCog,
  UserRound,
  UserRoundCog,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react'

export type MenuIconComponent = ComponentType<{ className?: string }>

type MenuIconRegistryItem = {
  key: string
  label: string
  icon: MenuIconComponent
  keywords?: string[]
}

const menuIconRegistry: MenuIconRegistryItem[] = [
  { key: 'house', label: '首页', icon: House, keywords: ['home', 'index', 'dashboard'] },
  { key: 'dashboard', label: '仪表盘', icon: LayoutDashboard, keywords: ['dashboard'] },
  { key: 'layout', label: '布局', icon: PanelsTopLeft },
  { key: 'system', label: '系统', icon: Settings },
  { key: 'cog', label: '配置', icon: Cog, keywords: ['gear'] },
  { key: 'user', label: '用户', icon: Users },
  { key: 'user-round', label: '个人', icon: UserRound, keywords: ['profile'] },
  { key: 'user-cog', label: '用户设置', icon: UserCog, keywords: ['member', 'account'] },
  { key: 'role', label: '角色', icon: Shield },
  { key: 'shield-check', label: '安全', icon: ShieldCheck, keywords: ['permission', 'auth'] },
  { key: 'dept', label: '部门', icon: Building2 },
  { key: 'post', label: '岗位', icon: BriefcaseBusiness },
  { key: 'menu', label: '菜单', icon: MenuSquare },
  { key: 'dict', label: '字典', icon: BookText },
  { key: 'library', label: '资料库', icon: LibraryBig, keywords: ['knowledge'] },
  { key: 'config', label: '参数', icon: FileCog },
  { key: 'file-search', label: '查询文件', icon: FileSearch, keywords: ['search', 'document'] },
  { key: 'file-chart', label: '报表文件', icon: FileBarChart2, keywords: ['report'] },
  { key: 'notice', label: '通知', icon: Bell },
  { key: 'message', label: '消息', icon: MessageSquareText, keywords: ['chat'] },
  { key: 'mail', label: '邮件', icon: Mail, keywords: ['email'] },
  { key: 'monitor', label: '监控', icon: MonitorCog },
  { key: 'online', label: '在线', icon: UserRoundCog },
  { key: 'operlog', label: '操作日志', icon: ScrollText },
  { key: 'logininfor', label: '登录日志', icon: NotebookTabs },
  { key: 'job', label: '定时任务', icon: Clock3 },
  { key: 'alarm-clock', label: '闹钟', icon: AlarmClock, keywords: ['schedule'] },
  { key: 'timer-reset', label: '重试任务', icon: TimerReset, keywords: ['retry'] },
  { key: 'server', label: '服务', icon: ServerCog },
  { key: 'cache', label: '缓存', icon: Database },
  { key: 'hard-drive', label: '存储', icon: HardDrive, keywords: ['disk'] },
  { key: 'cloud', label: '云服务', icon: Cloud, keywords: ['cloud'] },
  { key: 'tool', label: '工具', icon: SquareTerminal },
  { key: 'gen', label: '代码生成', icon: FolderTree },
  { key: 'command', label: '命令', icon: Command, keywords: ['terminal'] },
  { key: 'wrench', label: '维护工具', icon: Wrench, keywords: ['tool'] },
  { key: 'tags', label: '标签', icon: Tags, keywords: ['tag'] },
  { key: 'ticket', label: '工单', icon: Ticket, keywords: ['ticket'] },
  { key: 'clipboard-list', label: '清单', icon: ClipboardList, keywords: ['todo', 'list'] },
  { key: 'route', label: '路由', icon: Route, keywords: ['router', 'path'] },
  { key: 'tree', label: '树形', icon: TreePine, keywords: ['tree'] },
  { key: 'gantt', label: '流程', icon: SquareChartGantt, keywords: ['gantt', 'process'] },
  { key: 'chart-bar', label: '柱状图', icon: ChartBar, keywords: ['chart', 'stats'] },
  { key: 'chart-area', label: '趋势图', icon: ChartArea, keywords: ['analytics'] },
  { key: 'wallet', label: '钱包', icon: Wallet, keywords: ['finance'] },
  { key: 'credit-card', label: '银行卡', icon: CreditCard, keywords: ['payment'] },
  { key: 'dollar', label: '金额', icon: CircleDollarSign, keywords: ['money', 'price'] },
  { key: 'receipt', label: '单据', icon: ReceiptText, keywords: ['bill', 'invoice'] },
  { key: 'shopping-cart', label: '购物车', icon: ShoppingCart, keywords: ['cart'] },
  { key: 'package', label: '包裹', icon: Package2, keywords: ['package', 'box'] },
  { key: 'truck', label: '物流', icon: Truck, keywords: ['delivery'] },
  { key: 'archive', label: '归档', icon: Archive, keywords: ['archive'] },
  { key: 'contact', label: '联系人', icon: ContactRound, keywords: ['contact'] },
  { key: 'id-card', label: '身份', icon: IdCard, keywords: ['identity'] },
  { key: 'key-square', label: '权限密钥', icon: KeySquare, keywords: ['key', 'permission'] },
  { key: 'lock', label: '锁定', icon: LockKeyhole, keywords: ['lock', 'secure'] },
  { key: 'compass', label: '导航', icon: Compass, keywords: ['guide'] },
  { key: 'globe', label: '站点', icon: Globe, keywords: ['web', 'site'] },
  { key: 'heart-handshake', label: '服务协作', icon: HeartHandshake, keywords: ['support'] },
  { key: 'logs', label: '日志集合', icon: Logs, keywords: ['logs'] },
  { key: 'swap', label: '交换', icon: ArrowLeftRight, keywords: ['switch', 'sync'] },
  { key: 'check-check', label: '审核通过', icon: CheckCheck, keywords: ['approve'] },
  { key: 'trash', label: '删除', icon: Trash2, keywords: ['delete'] },
  { key: 'sun', label: '亮色', icon: SunMedium, keywords: ['light'] },
  { key: 'moon', label: '暗色', icon: MoonStar, keywords: ['dark'] },
]

const fallbackIcon = CircleHelp

export const menuIconOptions = menuIconRegistry.map((item) => ({
  key: item.key,
  label: item.label,
  keywords: item.keywords ?? [],
}))

export function resolveMenuIcon(iconKey?: string) {
  if (!iconKey) {
    return undefined
  }

  const normalizedKey = iconKey.trim().toLowerCase()
  const matchedIcon = menuIconRegistry.find((item) => item.key === normalizedKey)
  return matchedIcon?.icon ?? fallbackIcon
}

export function renderMenuIcon(iconKey?: string, className?: string): ReactNode {
  const Icon = resolveMenuIcon(iconKey)
  return Icon ? <Icon className={className} /> : null
}

export function getMenuIconLabel(iconKey?: string) {
  if (!iconKey) {
    return ''
  }

  const normalizedKey = iconKey.trim().toLowerCase()
  return menuIconRegistry.find((item) => item.key === normalizedKey)?.label ?? iconKey.trim()
}
