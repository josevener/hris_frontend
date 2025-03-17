import SettingsLayout from "./SettingsLayout";

// Integrations Settings Page
export function IntegrationsSettings() {
  return (
    <SettingsLayout>
      <h2 className="text-xl font-semibold">Integrations</h2>
      <p className="text-gray-600">Manage third-party integrations and API keys.</p>
    </SettingsLayout>
  );
}