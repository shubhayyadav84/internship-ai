import { useQuery } from "@tanstack/react-query";
import { getAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { authHeader, getToken } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, PlayCircle, FileCheck, Award, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: getGetAdminStatsQueryKey(),
    queryFn: () => getAdminStats({ headers: authHeader() }),
    enabled: !!getToken(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full mt-6" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-6 text-center border rounded-lg bg-destructive/10 text-destructive border-destructive/20">
        <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-semibold">Failed to load dashboard data</h3>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      description: "Active enrollees",
    },
    {
      title: "Videos Watched",
      value: stats.totalVideosWatched,
      icon: PlayCircle,
      description: "Across all modules",
    },
    {
      title: "Quizzes Passed",
      value: stats.totalQuizzesPassed,
      icon: FileCheck,
      description: "Successful completions",
    },
    {
      title: "Certificates Issued",
      value: stats.totalCertificates,
      icon: Award,
      description: "Ready for on-site",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your training programme progress.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Completion Rate</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Overall programme success</p>
            </div>
            <div className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>{Math.round(stats.completionRate)}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={stats.completionRate} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.sectionStats.map((section) => {
          const completionPercentage = section.studentsStarted > 0 
            ? (section.studentsCompleted / section.studentsStarted) * 100 
            : 0;

          return (
            <Card key={section.sectionId} className="flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{Math.round(completionPercentage)}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-2xl font-semibold">{section.studentsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold">{section.studentsStarted}</div>
                      <div className="text-xs text-muted-foreground">Started</div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="text-sm text-muted-foreground">Average Score</div>
                    <div className="text-xl font-medium mt-1">
                      {section.avgScore ? `${Math.round(section.avgScore)}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}