with open("src/components/tabs/TrainingModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("max-w-6xl", "max-w-[98vw] xl:max-w-[1600px]")
text = text.replace("min-h-[80vh]", "min-h-[90vh]")

text = text.replace("import {\n  X,\n  Plus,\n  ChevronRight,\n  ChevronLeft,\n  ChevronDown,\n  ChevronUp,\n  Edit,\n  Eye,\n  FileText,\n  Download,\n  Upload,\n  Settings,\n  Search,\n  Filter,\n  Check,\n  XCircle,\n  Clock,\n  Users,\n  BookOpen,\n  GraduationCap,\n  FileSpreadsheet,\n  Paperclip,\n  Printer,\n  RefreshCw,\n  AlertCircle,\n  CheckCircle,\n  AlertTriangle,\n} from \"lucide-react\";", "import {\n  X,\n  Plus,\n  ChevronRight,\n  ChevronLeft,\n  ChevronDown,\n  ChevronUp,\n  Edit,\n  Eye,\n  FileText,\n  Download,\n  Upload,\n  Settings,\n  Search,\n  Filter,\n  Check,\n  XCircle,\n  Clock,\n  Users,\n  BookOpen,\n  GraduationCap,\n  FileSpreadsheet,\n  Paperclip,\n  Printer,\n  RefreshCw,\n  AlertCircle,\n  CheckCircle,\n  AlertTriangle,\n} from \"lucide-react\";\nimport { SmartTable, Column } from \"@/components/SmartTable\";")

# Find table structure and replace it with SmartTable

with open("src/components/tabs/TrainingModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

