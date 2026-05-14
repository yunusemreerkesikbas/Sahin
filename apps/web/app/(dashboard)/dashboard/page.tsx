import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          High-level radar status — counts, recent scrapes, and quick wins.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Jobs scraped today</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Coming in Phase 1.1 (Armut MVP).
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>High-score matches</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Coming in Phase 1.2 (Scoring).
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Proposals drafted</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Coming in Phase 1.3 (Proposals).
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
