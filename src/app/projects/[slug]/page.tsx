import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectSlugRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/experience/${slug}`);
}
