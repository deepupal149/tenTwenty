import { LoginForm } from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Left: form */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="mb-8 text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <LoginForm />
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden flex-1 flex-col justify-center bg-primary-600 px-12 py-16 text-white md:flex">
        <h2 className="text-4xl font-bold">ticktock</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90">
          Introducing ticktock, our cutting-edge timesheet web application
          designed to revolutionize how you manage employee work hours. With
          ticktock, you can effortlessly track and monitor employee attendance
          and productivity from anywhere, anytime, using any internet-connected
          device.
        </p>
      </div>
    </main>
  );
}
