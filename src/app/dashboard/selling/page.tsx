import MultiStepForm from "@/components/selling/MultiStepForm";

export default function SellingDashboard() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">List an Asset</h1>
          <p className="text-neutral-400">Configure your asset metadata, escrow terms, and pricing.</p>
        </div>
        
        <MultiStepForm />
      </div>
    </main>
  );
}
