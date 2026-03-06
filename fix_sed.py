with open("src/components/tabs/LiquidationModal.tsx", "r") as f:
    text = f.read()

text = text.replace("<FileDown,\n  Save", "<FileDown")
text = text.replace("import {\n  X,\n  Plus,\n  Edit,\n  Eye,\n  FileText,\n  Download,\n  Check,\n  Paperclip,\n  Trash2,\n  Calendar,\n  AlertTriangle,\n  FileDown,\n  Save\n} from \"lucide-react\";", 
'''import {
  X,
  Plus,
  Edit,
  Eye,
  FileText,
  Download,
  Check,
  Paperclip,
  Trash2,
  Calendar,
  AlertTriangle,
  FileDown,
  Save
} from "lucide-react";''')

with open("src/components/tabs/LiquidationModal.tsx", "w") as f:
    f.write(text)

