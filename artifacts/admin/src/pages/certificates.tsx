import { useQuery } from "@tanstack/react-query";
import { getListAdminCertificatesQueryKey, listAdminCertificates } from "@workspace/api-client-react";
import { authHeader, getToken } from "@/lib/auth";
import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Award, Calendar, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SECTION_NAMES: Record<string, string> = {
  "aaws": "AAWS",
  "brake": "Brake System",
  "control": "Control System"
};

export default function Certificates() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: certificates, isLoading } = useQuery({
    queryKey: getListAdminCertificatesQueryKey(),
    queryFn: () => listAdminCertificates({ headers: authHeader() }),
    enabled: !!getToken(),
  });

  const filteredCertificates = certificates?.filter(cert => 
    cert.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (SECTION_NAMES[cert.sectionId] || cert.sectionId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mt-1">Log of all issued safety training certificates.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student or module..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0 border-b">
          <CardTitle className="text-lg pb-4">Certificate Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCertificates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Award className="h-8 w-8 opacity-20" />
                      <p>No certificates found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates?.map((cert) => (
                  <TableRow key={cert.id} className="group">
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      #{cert.id.toString().padStart(5, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <Link href={`/students/${cert.student.id}`} className="font-medium hover:underline">
                            {cert.student.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">{cert.student.studentId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal bg-muted/50">
                        {SECTION_NAMES[cert.sectionId] || cert.sectionId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(cert.awardedAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 hover:text-green-800 border-green-500/20">
                        Valid
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}