import SettingsLayout from "./SettingsLayout";

// Account Settings Page
export function AccountSettings() {
  return (
    <SettingsLayout>
      <h2 className="text-xl font-semibold">Account Settings</h2>
      <p className="text-gray-600">Update your profile, email, and password.</p>
    </SettingsLayout>
  );
}