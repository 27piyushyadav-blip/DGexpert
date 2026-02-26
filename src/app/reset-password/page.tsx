import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset Password | Mindnamo",
  description: "Create a new password for your expert account.",
};

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = params?.token;

  return (
    <div className="flex min-h-dvh w-full bg-white">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=2670&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/50 to-zinc-950/30"></div>

        <div className="relative z-10 p-16 text-white max-w-xl">
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Create Your <br/> New Password.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Choose a strong password to protect your expert profile and maintain secure access to your dashboard.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 py-12 lg:p-16">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}