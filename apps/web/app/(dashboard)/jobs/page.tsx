import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function JobsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted-foreground">
          All scraped jobs across Armut and Upwork, with score and status.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job list</CardTitle>
          <CardDescription>Coming in Phase 1.2 — table view with filters, score column, status pills.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder — the real table will land once scoring is wired up.
        </CardContent>
      </Card>
    </div>
  );
}
