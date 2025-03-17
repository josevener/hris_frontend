import SettingsLayout from "./SettingsLayout";

// Notifications Settings Page
export function NotificationsSettings() {
  return (
    <SettingsLayout>
      <h2 className="text-xl font-semibold">Notifications</h2>
      <p className="text-gray-600">Customize your email and push notifications.</p>
    </SettingsLayout>
  );
}