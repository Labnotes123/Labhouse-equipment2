with open("src/components/tabs/DeviceProfileTab.tsx", "r", encoding="utf-8") as f:
    text = f.read()

injection = """  useEffect(() => { setDevices(contextDevices); }, [contextDevices]);

  // Listen for bypass event
  useEffect(() => {
    const handleOpenIncident = (e: any) => {
      const { deviceId } = e.detail;
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        setSelectedDeviceForAction(device);
        setActiveModal("incident");
      }
    };
    window.addEventListener("openIncidentReport", handleOpenIncident);
    return () => window.removeEventListener("openIncidentReport", handleOpenIncident);
  }, [devices]);"""

text = text.replace("  useEffect(() => { setDevices(contextDevices); }, [contextDevices]);", injection)

with open("src/components/tabs/DeviceProfileTab.tsx", "w", encoding="utf-8") as f:
    f.write(text)

