import OrderDetails from "@/components/escrow/OrderDetails";

export default function OrdersPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#050505] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Order Details</h1>
          <p className="text-neutral-400">Track the state of your escrowed transaction in real-time.</p>
        </div>

        <OrderDetails />
      </div>
    </main>
  );
}
