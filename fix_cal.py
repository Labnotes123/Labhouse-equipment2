with open("src/components/tabs/CalibrationModal.tsx", "r") as f:
    text = f.read()

text = text.replace("executionUnit", "unit")

with open("src/components/tabs/CalibrationModal.tsx", "w") as f:
    f.write(text)
