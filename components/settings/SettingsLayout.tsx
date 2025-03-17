export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
}