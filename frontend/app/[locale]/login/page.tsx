import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Left side: Brand / Logo Area */}
      <div className="relative hidden flex-col items-center justify-center text-white lg:flex" style={{ backgroundColor: '#2c3e5a' }}>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(0,0,0,0.05),rgba(0,0,0,0.3))] z-0" />
        
        <div className="relative z-10 flex flex-col items-center p-10 text-center">
          <div className="mb-8 rounded-2xl bg-white p-4 shadow-2xl transition-transform hover:scale-105">
            <img 
              src="/images/insalogo.jpeg" 
              alt="Insa FMs" 
              className="h-32 w-32 object-contain" 
            />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Feedback Management
          </h1>
          <p className="max-w-md text-lg text-blue-100 opacity-90">
            Welcome to the INSA Feedback Management System. Streamlining responses and analytics in one place.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex flex-col items-center justify-center bg-panel dark:bg-slate-950 p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
