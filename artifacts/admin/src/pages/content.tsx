import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSections, getGetSectionsQueryKey, addVideo, deleteVideo } from "@workspace/api-client-react";
import { authHeader, getToken } from "@/lib/auth";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Video, Upload, Link, AlertCircle, Film } from "lucide-react";

interface AddVideoForm {
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  uploadTab: "url" | "file";
  file: File | null;
  uploading: boolean;
  uploadProgress: number;
}

const SECTION_COLORS: Record<string, string> = {
  aaws: "#1D4ED8",
  pis: "#7C3AED",
  apc: "#DC2626",
  cvvrs: "#059669",
  etbu: "#D97706",
};

export default function ContentPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addDialog, setAddDialog] = useState<{ open: boolean; sectionId: string; sectionTitle: string }>({
    open: false,
    sectionId: "",
    sectionTitle: "",
  });

  const [form, setForm] = useState<AddVideoForm>({
    title: "",
    description: "",
    duration: "",
    videoUrl: "",
    uploadTab: "url",
    file: null,
    uploading: false,
    uploadProgress: 0,
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; videoId: string; videoTitle: string }>({
    open: false,
    videoId: "",
    videoTitle: "",
  });

  const { data: sections, isLoading, isError } = useQuery({
    queryKey: getGetSectionsQueryKey(),
    queryFn: () => getSections(),
    enabled: !!getToken(),
  });

  const addVideoMutation = useMutation({
    mutationFn: (body: { sectionId: string; title: string; description: string; videoUrl: string; duration: string }) =>
      addVideo(body, { headers: authHeader() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() });
      setAddDialog({ open: false, sectionId: "", sectionTitle: "" });
      resetForm();
      toast({ title: "Video added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add video", variant: "destructive" });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id: number) => deleteVideo(id, { headers: authHeader() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() });
      setDeleteDialog({ open: false, videoId: "", videoTitle: "" });
      toast({ title: "Video deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete video", variant: "destructive" });
    },
  });

  function resetForm() {
    setForm({
      title: "",
      description: "",
      duration: "",
      videoUrl: "",
      uploadTab: "url",
      file: null,
      uploading: false,
      uploadProgress: 0,
    });
  }

  function openAddDialog(sectionId: string, sectionTitle: string) {
    resetForm();
    setAddDialog({ open: true, sectionId, sectionTitle });
  }

  async function handleUploadFile(file: File): Promise<string> {
    setForm((f) => ({ ...f, uploading: true, uploadProgress: 10 }));
    try {
      const token = getToken();
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = (await urlRes.json()) as { uploadURL: string; objectPath: string };

      setForm((f) => ({ ...f, uploadProgress: 40 }));

      await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setForm((f) => ({ ...f, uploadProgress: 100 }));

      const uuid = objectPath.replace("/objects/", "");
      return `${window.location.origin}/api/storage/objects/${uuid}`;
    } finally {
      setForm((f) => ({ ...f, uploading: false }));
    }
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    let videoUrl = form.videoUrl;

    if (form.uploadTab === "file") {
      if (!form.file) {
        toast({ title: "Please select a video file", variant: "destructive" });
        return;
      }
      try {
        videoUrl = await handleUploadFile(form.file);
      } catch {
        toast({ title: "Upload failed. Please try again.", variant: "destructive" });
        return;
      }
    } else {
      if (!videoUrl.trim()) {
        toast({ title: "Video URL is required", variant: "destructive" });
        return;
      }
    }

    addVideoMutation.mutate({
      sectionId: addDialog.sectionId,
      title: form.title.trim(),
      description: form.description.trim(),
      videoUrl,
      duration: form.duration.trim(),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !sections) {
    return (
      <div className="p-6 text-center border rounded-lg bg-destructive/10 text-destructive border-destructive/20">
        <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-semibold">Failed to load content</h3>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  const sectionColor = SECTION_COLORS[addDialog.sectionId] ?? "#1D4ED8";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground mt-1">Manage training videos for each module.</p>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="pb-3" style={{ borderLeft: `4px solid ${SECTION_COLORS[section.id] ?? "#6366F1"}` }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <Badge variant="outline" className="text-xs font-normal">
                      {section.videos.length} video{section.videos.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <CardDescription className="mt-0.5">{section.fullTitle}</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => openAddDialog(section.id, section.title)}
                  className="shrink-0"
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Add Video
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {section.videos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Film className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No videos uploaded yet.</p>
                  <p className="text-xs mt-1">Click "Add Video" to upload the first video.</p>
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {section.videos.map((video, idx) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group"
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white text-xs font-bold"
                        style={{ backgroundColor: SECTION_COLORS[section.id] ?? "#6366F1" }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                        {video.duration && (
                          <p className="text-xs text-muted-foreground">{video.duration}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-opacity"
                        onClick={() => setDeleteDialog({ open: true, videoId: video.id, videoTitle: video.title })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Video Dialog */}
      <Dialog open={addDialog.open} onOpenChange={(open) => { if (!open) { setAddDialog({ open: false, sectionId: "", sectionTitle: "" }); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sectionColor }} />
              Add Video to {addDialog.sectionTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="vid-title">Title *</Label>
              <Input
                id="vid-title"
                placeholder="e.g. Introduction to AAWS"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vid-desc">Description</Label>
              <Input
                id="vid-desc"
                placeholder="Brief description of the video"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vid-dur">Duration</Label>
              <Input
                id="vid-dur"
                placeholder="e.g. 12:30"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Video Source *</Label>
              <Tabs
                value={form.uploadTab}
                onValueChange={(v) => setForm((f) => ({ ...f, uploadTab: v as "url" | "file", videoUrl: "", file: null }))}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="url" className="flex-1">
                    <Link className="h-3.5 w-3.5 mr-1.5" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex-1">
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload File
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-2">
                  <Input
                    placeholder="https://example.com/video.mp4"
                    value={form.videoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Paste a direct link to an MP4 video file.</p>
                </TabsContent>
                <TabsContent value="file" className="mt-2">
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {form.file ? (
                      <div>
                        <Film className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-medium truncate">{form.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(form.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to select a video file</p>
                        <p className="text-xs text-muted-foreground mt-0.5">MP4, MOV, WebM supported</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm((f) => ({ ...f, file }));
                    }}
                  />
                  {form.uploading && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${form.uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-center">Uploading... {form.uploadProgress}%</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddDialog({ open: false, sectionId: "", sectionTitle: "" }); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addVideoMutation.isPending || form.uploading}
            >
              {addVideoMutation.isPending || form.uploading ? "Saving..." : "Add Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, videoId: "", videoTitle: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{deleteDialog.videoTitle}</strong>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteVideoMutation.mutate(parseInt(deleteDialog.videoId))}
              disabled={deleteVideoMutation.isPending}
            >
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
