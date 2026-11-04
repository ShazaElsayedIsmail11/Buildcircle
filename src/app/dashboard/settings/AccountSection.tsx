export default function AccountSection({ profile }: { profile: any }) {
  return (
    <div>
      <p className="text-base font-medium mb-1">Account</p>
      <p className="text-text-muted text-xs mb-5">Manage your basic account information.</p>

      <div className="space-y-4">
        <div>
          <p className="text-text-muted text-xs mb-1">Full name</p>
          <p className="text-sm">{profile?.full_name}</p>
        </div>
        <div>
          <p className="text-text-muted text-xs mb-1">Email</p>
          <p className="text-sm">{profile?.email}</p>
        </div>
        <div>
          <p className="text-text-muted text-xs mb-1">Role</p>
          <span className="bg-accent-bg text-accent-text text-xs px-2.5 py-1 rounded-full capitalize">
            {profile?.role}
          </span>
        </div>
      </div>
    </div>
  )
}