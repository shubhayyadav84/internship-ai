import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { getAdminStudent, getGetAdminStudentQueryKey } from "@workspace/api-client-react";
import { authHeader } from "@/lib/auth";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Mail, Hash, Calendar, Award, CheckCircle2, XCircle, PlayCircle, FileText } from "lucide-react";

const SECTION_NAMES: Record<string, string> = {
  "aaws": "AAWS",
  "brake": "Brake System",
  "control": "Control System"
};

const SECTION_VIDEOS: Record<string, number> = {
  "aaws": 3,
  "brake": 4,
  "control": 3
};

export default function StudentDetail() {
  const params = useParams();
  const studentId = Number(params.id);

  const { data: student, isLoading, isError } = useQuery({
    queryKey: getGetAdminStudentQueryKey(studentId),
    queryFn: () => getAdminStudent(studentId, { headers: authHeader() }),
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 md:col-span-1" />
          <Skeleton className="h-48 md:col-span-2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Student not found</h2>
        <p className="text-muted-foreground mb-6">The student you are looking for does not exist or has been removed.</p>
        <Link href="/students">
          <Button>Return to Students List</Button>
        </Link>
      </div>
    );
  }

  // Pre-fill missing sections if any
  const allSections = ["aaws", "brake", "control"];
  const progressBySection = allSections.map(sectionId => {
    const existing = student.progress?.sections?.find(s => s.sectionId === sectionId);
    return existing || {
      sectionId,
      watchedVideos: [],
      quizScore: null,
      quizPassed: false,
      certificateEarned: false,
      certificateDate: null
    };
  });

  const totalEarnedCerts = progressBySection.filter(s => s.certificateEarned).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-muted-foreground text-sm">Detailed progress report</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{student.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>{student.studentId}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {format(new Date(student.createdAt), "MMM d, yyyy")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Programme Status</CardTitle>
            <CardDescription>Overall completion of the training requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Certificates Earned</span>
                  <span className="text-sm font-bold">{totalEarnedCerts} / 3</span>
                </div>
                <Progress value={(totalEarnedCerts / 3) * 100} className="h-3" />
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Badge variant={totalEarnedCerts === 3 ? "default" : "secondary"} className="px-3 py-1">
                    {totalEarnedCerts === 3 ? "Ready for On-site" : "In Training"}
                  </Badge>
                </div>
                {totalEarnedCerts === 3 && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    All requirements met
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold tracking-tight pt-4">Module Breakdown</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {progressBySection.map((section) => {
          const totalVids = SECTION_VIDEOS[section.sectionId] || 3;
          const watchedCount = section.watchedVideos.length;
          const vidsComplete = watchedCount >= totalVids;
          
          return (
            <Card key={section.sectionId} className={section.certificateEarned ? "border-green-500/20 shadow-sm" : ""}>
              <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                <div>
                  <CardTitle>{SECTION_NAMES[section.sectionId] || section.sectionId}</CardTitle>
                  <CardDescription className="mt-1">
                    {section.certificateEarned 
                      ? `Completed on ${format(new Date(section.certificateDate || new Date()), "MMM d, yyyy")}`
                      : "Requirements pending"
                    }
                  </CardDescription>
                </div>
                {section.certificateEarned && (
                  <Award className="h-8 w-8 text-green-500" />
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Videos column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center font-medium">
                        <PlayCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        Video Training
                      </div>
                      <Badge variant={vidsComplete ? "outline" : "secondary"} className={vidsComplete ? "text-green-600 border-green-200" : ""}>
                        {watchedCount} / {totalVids}
                      </Badge>
                    </div>
                    <Progress value={(watchedCount / totalVids) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {vidsComplete ? "All required videos watched." : "Student must watch all videos before unlocking the quiz."}
                    </p>
                  </div>

                  {/* Quiz column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center font-medium">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        Knowledge Check
                      </div>
                      {section.quizScore !== null ? (
                        <Badge variant={section.quizPassed ? "outline" : "destructive"} className={section.quizPassed ? "text-green-600 border-green-200" : ""}>
                          {section.quizScore}%
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not taken</Badge>
                      )}
                    </div>
                    {section.quizScore !== null ? (
                      <div className="flex items-center gap-2 mt-2">
                        {section.quizPassed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="text-sm font-medium">
                          {section.quizPassed ? "Passed" : "Failed (Requires 80%)"}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">
                        Quiz becomes available after completing video training.
                      </p>
                    )}
                  </div>

                  {/* Status column */}
                  <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                    <div className="text-sm text-muted-foreground mb-1">Section Status</div>
                    {section.certificateEarned ? (
                      <div className="flex items-center text-green-600 font-semibold">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Certified
                      </div>
                    ) : (
                      <div className="flex items-center text-muted-foreground font-medium">
                        <Circle className="h-5 w-5 mr-2 opacity-50" />
                        Incomplete
                      </div>
                    )}
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

function Circle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}