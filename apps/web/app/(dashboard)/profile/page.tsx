import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          CV summary, skill list, hourly rate floor, and embeddings used for matching.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>CV & preferences</CardTitle>
          <CardDescription>Coming in Phase 1.2 — editable profile with skills and rate, plus embedding refresh.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder — populated once the scoring algorithm reads from the profile row.
        </CardContent>
      </Card>
    </div>
  );
}
