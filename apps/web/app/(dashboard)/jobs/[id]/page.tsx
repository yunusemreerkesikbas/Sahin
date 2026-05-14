import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Job {id}</h1>
        <p className="text-sm text-muted-foreground">
          Detail view: description, score breakdown, proposal draft.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job detail</CardTitle>
          <CardDescription>Coming in Phase 1.2 — full evaluation, score breakdown, and proposal draft.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder for job <code className="font-mono">{id}</code>.
        </CardContent>
      </Card>
    </div>
  );
}
