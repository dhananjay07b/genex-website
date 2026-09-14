import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import RssFeedOutlinedIcon from '@mui/icons-material/RssFeedOutlined'
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined'
import MicOutlinedIcon from '@mui/icons-material/MicOutlined'
import BoltIcon from '@mui/icons-material/Bolt'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import GroupsIcon from '@mui/icons-material/Groups'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import ChatIcon from '@mui/icons-material/Chat'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import SolarPowerIcon from '@mui/icons-material/SolarPower'
import WindPowerIcon from '@mui/icons-material/WindPower'
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'
import EvStationIcon from '@mui/icons-material/EvStation'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MemoryIcon from '@mui/icons-material/Memory'
import StorageIcon from '@mui/icons-material/Storage'
import CloudIcon from '@mui/icons-material/Cloud'
import WifiIcon from '@mui/icons-material/Wifi'
import PsychologyIcon from '@mui/icons-material/Psychology'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BusinessIcon from '@mui/icons-material/Business'
import FactoryIcon from '@mui/icons-material/Factory'
import EngineeringIcon from '@mui/icons-material/Engineering'
import ScienceIcon from '@mui/icons-material/Science'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import HandshakeIcon from '@mui/icons-material/Handshake'
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects'
import TimelineIcon from '@mui/icons-material/Timeline'
import StarIcon from '@mui/icons-material/Star'
import WorkIcon from '@mui/icons-material/Work'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

/**
 * Maps every value in ICON_CHOICES (backend/pages/blocks.py) to its MUI icon component.
 * Shared by any CMS field using that same choice list (GeLearn tiles, deployment steps,
 * "why genex" cards, etc.) so each new block doesn't need its own ad hoc icon map.
 */
export const ICON_MAP: Record<string, ComponentType<SvgIconProps>> = {
  LanguageOutlined: LanguageOutlinedIcon,
  ShieldOutlined: ShieldOutlinedIcon,
  VerifiedOutlined: VerifiedOutlinedIcon,
  BoltOutlined: BoltOutlinedIcon,
  SecurityOutlined: SecurityOutlinedIcon,
  CheckCircleOutlined: CheckCircleOutlinedIcon,
  EngineeringOutlined: EngineeringOutlinedIcon,
  MemoryOutlined: MemoryOutlinedIcon,
  DescriptionOutlined: DescriptionOutlinedIcon,
  GavelOutlined: GavelOutlinedIcon,
  ArticleOutlined: ArticleOutlinedIcon,
  PlayCircleOutlined: PlayCircleOutlinedIcon,
  RssFeedOutlined: RssFeedOutlinedIcon,
  HelpOutlined: HelpOutlinedIcon,
  MicOutlined: MicOutlinedIcon,
  Bolt: BoltIcon,
  TrendingUp: TrendingUpIcon,
  Groups: GroupsIcon,
  LocationOn: LocationOnIcon,
  Phone: PhoneIcon,
  Email: EmailIcon,
  Chat: ChatIcon,
  ElectricBolt: ElectricBoltIcon,
  SolarPower: SolarPowerIcon,
  WindPower: WindPowerIcon,
  BatteryChargingFull: BatteryChargingFullIcon,
  EvStation: EvStationIcon,
  Analytics: AnalyticsIcon,
  Dashboard: DashboardIcon,
  Memory: MemoryIcon,
  Storage: StorageIcon,
  Cloud: CloudIcon,
  Wifi: WifiIcon,
  Psychology: PsychologyIcon,
  AutoAwesome: AutoAwesomeIcon,
  Business: BusinessIcon,
  Factory: FactoryIcon,
  Engineering: EngineeringIcon,
  Science: ScienceIcon,
  CurrencyRupee: CurrencyRupeeIcon,
  AccountBalance: AccountBalanceIcon,
  Handshake: HandshakeIcon,
  EmojiObjects: EmojiObjectsIcon,
  Timeline: TimelineIcon,
  Star: StarIcon,
  Work: WorkIcon,
  WorkspacePremiumOutlined: WorkspacePremiumOutlinedIcon,
  EmojiEventsOutlined: EmojiEventsOutlinedIcon,
  LinkedIn: LinkedInIcon,
}

export function getIcon(name: string | null | undefined, fallback: ComponentType<SvgIconProps> = BoltOutlinedIcon): ComponentType<SvgIconProps> {
  if (!name) return fallback
  return ICON_MAP[name] ?? fallback
}
