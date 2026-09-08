import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { CheckoutOutcome } from "@/components/CheckoutOutcome";

export default async function CheckoutFailedPage({ searchParams }: PageProps<"/checkout/failed">) {
  const params = await searchParams;
  const referenceId = typeof params.order === "string" ? params.order : undefined;

  return (
    <>
      <Header />
      {await CheckoutOutcome({ referenceId, fallbackStatus: "failed" })}
      <MobileDock />
    </>
  );
}
