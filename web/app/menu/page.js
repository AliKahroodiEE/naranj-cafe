import { Suspense } from "react";
import { getMenu } from "@/lib/server-api";
import MenuView from "./MenuView";
import MenuSkeleton from "./MenuSkeleton";

export const metadata = {
  title: "منو",
};

export default function MenuPage({ searchParams }) {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <Menu searchParams={searchParams} />
    </Suspense>
  );
}

// Each table's QR code links to /menu?table=N so staff know where an order comes from.
async function Menu({ searchParams }) {
  const [{ table }, menu] = await Promise.all([searchParams, getMenu()]);
  const tableNumber = /^\d{1,3}$/.test(table ?? "") ? Number(table) : null;
  return <MenuView initialMenu={menu} table={tableNumber} />;
}
