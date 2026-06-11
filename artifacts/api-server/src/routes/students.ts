import { Router } from "express";
import { db } from "@workspace/db";
import { videoProgressTable, quizResultsTable, certificatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireStudent } from "../middlewares/auth";
import { MarkVideoWatchedBody, SubmitQuizBody } from "@workspace/api-zod";
import type { Request } from "express";

const router = Router();
const PASS_THRESHOLD = 0.6;
const SECTION_IDS = ["aaws", "brake", "control"];

async function buildProgress(studentId: number) {
  const [watched, quizzes, certs] = await Promise.all([
    db.select().from(videoProgressTable).where(eq(videoProgressTable.studentId, studentId)),
    db.select().from(quizResultsTable).where(eq(quizResultsTable.studentId, studentId)),
    db.select().from(certificatesTable).where(eq(certificatesTable.studentId, studentId)),
  ]);

  const sections = SECTION_IDS.map((sectionId) => {
    const sectionWatched = watched.filter((w) => w.sectionId === sectionId).map((w) => w.videoId);
    const latestQuiz = quizzes
      .filter((q) => q.sectionId === sectionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const cert = certs.find((c) => c.sectionId === sectionId);
    return {
      sectionId,
      watchedVideos: sectionWatched,
      quizScore: latestQuiz?.score ?? null,
      quizPassed: latestQuiz?.passed ?? false,
      certificateEarned: !!cert,
      certificateDate: cert?.awardedAt.toISOString() ?? null,
    };
  });

  return { sections };
}

router.get("/students/me/progress", requireStudent, async (req, res) => {
  const studentId = (req as Request & { studentId: number }).studentId;
  try {
    const progress = await buildProgress(studentId);
    res.json(progress);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/students/me/progress/video", requireStudent, async (req, res) => {
  const studentId = (req as Request & { studentId: number }).studentId;
  const parse = MarkVideoWatchedBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { videoId, sectionId } = parse.data;

  try {
    const existing = await db
      .select()
      .from(videoProgressTable)
      .where(
        and(
          eq(videoProgressTable.studentId, studentId),
          eq(videoProgressTable.videoId, videoId),
          eq(videoProgressTable.sectionId, sectionId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(videoProgressTable).values({ studentId, videoId, sectionId });
    }

    const progress = await buildProgress(studentId);
    res.json(progress);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/students/me/quiz", requireStudent, async (req, res) => {
  const studentId = (req as Request & { studentId: number }).studentId;
  const parse = SubmitQuizBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { sectionId, score, total } = parse.data;
  const passed = score / total >= PASS_THRESHOLD;

  try {
    await db.insert(quizResultsTable).values({ studentId, sectionId, score, total, passed });

    if (passed) {
      const existingCert = await db
        .select()
        .from(certificatesTable)
        .where(and(eq(certificatesTable.studentId, studentId), eq(certificatesTable.sectionId, sectionId)))
        .limit(1);

      if (existingCert.length === 0) {
        await db.insert(certificatesTable).values({ studentId, sectionId });
      }
    }

    const progress = await buildProgress(studentId);
    res.json(progress);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/students/me/certificates", requireStudent, async (req, res) => {
  const studentId = (req as Request & { studentId: number }).studentId;
  try {
    const certs = await db.select().from(certificatesTable).where(eq(certificatesTable.studentId, studentId));
    res.json(
      certs.map((c) => ({
        id: c.id,
        sectionId: c.sectionId,
        awardedAt: c.awardedAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
