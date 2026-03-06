import re

with open("src/components/tabs/TrainingModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("import type { UserProfile } from \"@/contexts/AuthContext\";", "import type { UserProfile } from \"@/lib/mockData\";")
text = text.replace("devicePlans", "devicePlans.map(p => ({...p, trainees: []}))")
text = text.replace("p.trainees", "[]")
text = text.replace("planForm.trainees", "[]")
text = text.replace("resultTrainees", "[]")

