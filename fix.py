with open("src/components/tabs/LiquidationModal.tsx", "r") as f:
    text = f.read()

text = text.replace("<FileDown,\n  Save", "<FileDown")

with open("src/components/tabs/LiquidationModal.tsx", "w") as f:
    f.write(text)
