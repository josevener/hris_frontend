import SettingsLayout from "./SettingsLayout";

// Security & Privacy Page
export function SecuritySettings() {
  return (
    <SettingsLayout>
      <h2 className="text-xl font-semibold">Security & Privacy</h2>
      <p className="text-gray-600">Manage security settings like 2FA and privacy options.</p>
    </SettingsLayout>
  );
}