import { useState } from "react";
import { useStore } from "../store";

export function AuthPage() {
  const { login, signup } = useStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [identifier, setIdentifier] = useState("you");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "login") {
      const err = login(identifier, password);
      if (err) setError(err);
    } else {
      const err = signup({ username, email, password, fullName });
      if (err) setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-serif italic text-5xl mb-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent select-none">
          Reelgram
        </h1>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <form onSubmit={submit} className="space-y-2.5">
            {mode === "signup" && (
              <>
                <Field value={email} onChange={setEmail} placeholder="Email" type="email" required />
                <Field value={fullName} onChange={setFullName} placeholder="Full Name" required />
                <Field value={username} onChange={setUsername} placeholder="Username" required />
              </>
            )}
            {mode === "login" && (
              <Field value={identifier} onChange={setIdentifier} placeholder="Username or email" required />
            )}
            <Field value={password} onChange={setPassword} placeholder="Password" type="password" required />

            <button
              type="submit"
              className="w-full mt-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold text-sm transition"
            >
              {mode === "login" ? "Log in" : "Sign up"}
            </button>

            {error && (
              <p className="text-center text-rose-400 text-xs pt-2">{error}</p>
            )}
          </form>

          {mode === "login" && (
            <p className="text-center text-xs text-zinc-400 mt-5">
              Demo accounts: <span className="text-white">you</span>, <span className="text-white">maya.creates</span>, <span className="text-white">leo.travels</span>
            </p>
          )}
        </div>

        <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-center text-sm">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(null); }} className="text-blue-400 font-semibold">Sign up</button>
            </>
          ) : (
            <>Have an account?{" "}
              <button onClick={() => { setMode("login"); setError(null); }} className="text-blue-400 font-semibold">Log in</button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          © {new Date().getFullYear()} Reelgram · A demo Instagram-style clone
        </p>
      </div>
    </div>
  );
}

function Field({
  value, onChange, placeholder, type = "text", required,
}: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string; required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      required={required}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
    />
  );
}
