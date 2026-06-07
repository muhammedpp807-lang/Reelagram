import { useState } from "react";
import { useStore } from "../store";

export function EditProfile() {
  const { currentUser, updateProfile, navigate } = useStore();
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [fullName, setFullName] = useState(currentUser?.fullName ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const onAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const error = updateProfile({ username, fullName, bio, avatar });
    if (error) { setErr(error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    setTimeout(() => navigate({ name: "profile", username }), 600);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-white">
      <h1 className="text-xl font-semibold mb-6">Edit profile</h1>

      <form onSubmit={submit} className="space-y-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <img src={avatar} alt="" className="w-16 h-16 rounded-full bg-zinc-800" />
          <div className="flex-1">
            <div className="text-sm font-semibold">{currentUser.username}</div>
            <div className="text-xs text-zinc-400">Update your photo</div>
          </div>
          <label className="text-sm font-semibold bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md cursor-pointer">
            Change
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])}
            />
          </label>
        </div>

        <Field label="Username" value={username} onChange={setUsername} />
        <Field label="Name" value={fullName} onChange={setFullName} />
        <Field label="Bio" value={bio} onChange={setBio} textarea maxLength={150} />

        {err && <p className="text-rose-400 text-sm">{err}</p>}
        {saved && <p className="text-emerald-400 text-sm">Saved!</p>}

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => navigate({ name: "profile", username: currentUser.username })}
            className="text-sm font-semibold px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button type="submit" className="text-sm font-semibold px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600">
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, textarea, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; maxLength?: number;
}) {
  return (
    <label className="grid md:grid-cols-[150px_1fr] gap-2 md:gap-6 md:items-start">
      <span className="text-sm font-semibold pt-2">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          maxLength={maxLength}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-600 resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-600"
        />
      )}
    </label>
  );
}
