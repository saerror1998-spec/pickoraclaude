import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { CheckoutOutcome } from "@/components/CheckoutOutcome";

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const params = await searchParams;
  const referenceId = typeof params.order === "string" ? params.order : undefined;

  return (
    <>
      <Header />
      {await CheckoutOutcome({ referenceId, fallbackStatus: "paid" })}
      <MobileDock />
    </>
  );
}
