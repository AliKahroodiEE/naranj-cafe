import { Suspense } from "react";
import ItemForm from "@/components/admin/ItemForm";

export const metadata = { title: "ویرایش آیتم" };

export default function EditItemPage({ params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-paper" aria-busy="true" />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }) {
  const { id } = await params;
  return <ItemForm id={Number(id)} />;
}
