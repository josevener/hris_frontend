import SettingsLayout from "./SettingsLayout";

// Appearance Settings Page
export function AppearanceSettings() {
  return (
    <SettingsLayout>
      <h2 className="text-xl font-semibold">Appearance</h2>
      <p className="text-gray-600">Change theme and UI preferences.</p>
    </SettingsLayout>
  );
}