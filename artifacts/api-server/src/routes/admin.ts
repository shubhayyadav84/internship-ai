import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminsTable, studentsTable, videoProgressTable, quizResultsTable, certificatesTable, sectionsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { requireAdmin } from "../middlewares/auth";
import { LoginAdminBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

async function seedAdminIfNeeded() {
  try {
    const existing = await db.select().from(adminsTable).limit(1);
    if (existing.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await db.insert(adminsTable).values({ email: "admin@interntrain.com", passwordHash: hash });
      logger.info("Default admin created — email: admin@interntrain.com, password: admin123");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed default admin");
  }
}
seedAdminIfNeeded();

async function buildStudentProgress(studentId: number, sectionIds?: string[]) {
  const [watched, quizzes, certs, dbSections] = await Promise.all([
    db.select().from(videoProgressTable).where(eq(videoProgressTable.studentId, studentId)),
    db.select().from(quizResultsTable).where(eq(quizResultsTable.studentId, studentId)),
    db.select().from(certificatesTable).where(eq(certificatesTable.studentId, studentId)),
    sectionIds
      ? Promise.resolve(sectionIds.map((id) => ({ sectionId: id })))
      : db.select({ sectionId: sectionsTable.sectionId }).from(sectionsTable).orderBy(asc(sectionsTable.sortOrder)),
  ]);

  const sections = dbSections.map(({ sectionId }) => {
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

router.post("/admin/auth/login", async (req, res) => {
  const parse = LoginAdminBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parse.data;

  try {
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, email.toLowerCase()))
      .limit(1);

    if (!admin) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }
    const token = signToken({ id: admin.id, role: "admin" });
    res.json({ token });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [students, allWatched, allQuizzes, allCerts] = await Promise.all([
      db.select().from(studentsTable),
      db.select().from(videoProgressTable),
      db.select().from(quizResultsTable),
      db.select().from(certificatesTable),
    ]);

    const totalStudents = students.length;
    const totalVideosWatched = allWatched.length;
    const totalQuizzesPassed = allQuizzes.filter((q) => q.passed).length;
    const totalCertificates = allCerts.length;
    const sections = await db
      .select({ sectionId: sectionsTable.sectionId, title: sectionsTable.title })
      .from(sectionsTable)
      .orderBy(asc(sectionsTable.sortOrder));

    const numSections = Math.max(sections.length, 1);
    const completionRate = totalStudents > 0 ? allCerts.length / (totalStudents * numSections) : 0;

    const sectionStats = sections.map(({ sectionId, title }) => {
      const studentsStarted = new Set(allWatched.filter((w) => w.sectionId === sectionId).map((w) => w.studentId))
        .size;
      const studentsCompleted = new Set(allCerts.filter((c) => c.sectionId === sectionId).map((c) => c.studentId))
        .size;
      const sectionQuizzes = allQuizzes.filter((q) => q.sectionId === sectionId);
      const avgScore =
        sectionQuizzes.length > 0
          ? sectionQuizzes.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / sectionQuizzes.length
          : 0;

      return {
        sectionId,
        title,
        studentsStarted,
        studentsCompleted,
        avgScore: Math.round(avgScore * 10) / 10,
      };
    });

    res.json({ totalStudents, totalVideosWatched, totalQuizzesPassed, totalCertificates, completionRate, sectionStats });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/students", requireAdmin, async (req, res) => {
  try {
    const students = await db.select().from(studentsTable);
    const result = await Promise.all(
      students.map(async (s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        studentId: s.studentId,
        createdAt: s.createdAt.toISOString(),
        progress: await buildStudentProgress(s.id),
      })),
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/students/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const progress = await buildStudentProgress(student.id);
    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      createdAt: student.createdAt.toISOString(),
      progress,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/students/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    await db.delete(videoProgressTable).where(eq(videoProgressTable.studentId, id));
    await db.delete(quizResultsTable).where(eq(quizResultsTable.studentId, id));
    await db.delete(certificatesTable).where(eq(certificatesTable.studentId, id));
    await db.delete(studentsTable).where(eq(studentsTable.id, id));

    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/certificates", requireAdmin, async (req, res) => {
  try {
    const certs = await db.select().from(certificatesTable);
    const result = await Promise.all(
      certs.map(async (c) => {
        const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, c.studentId)).limit(1);
        return {
          id: c.id,
          sectionId: c.sectionId,
          awardedAt: c.awardedAt.toISOString(),
          student: student
            ? {
                id: student.id,
                name: student.name,
                email: student.email,
                studentId: student.studentId,
                createdAt: student.createdAt.toISOString(),
              }
            : null,
        };
      }),
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
