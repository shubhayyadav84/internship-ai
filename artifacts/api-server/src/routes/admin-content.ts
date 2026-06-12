import { Router } from "express";
import { db } from "@workspace/db";
import { sectionsTable, videosTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.post("/admin/videos", requireAdmin, async (req, res) => {
  const { sectionId, title, description = "", videoUrl, duration = "" } = req.body as {
    sectionId?: string;
    title?: string;
    description?: string;
    videoUrl?: string;
    duration?: string;
  };

  if (!sectionId || !title || !videoUrl) {
    res.status(400).json({ error: "sectionId, title, and videoUrl are required" });
    return;
  }

  try {
    const [section] = await db
      .select()
      .from(sectionsTable)
      .where(eq(sectionsTable.sectionId, sectionId))
      .limit(1);

    if (!section) {
      res.status(400).json({ error: "Section not found" });
      return;
    }

    const existing = await db
      .select({ sortOrder: videosTable.sortOrder })
      .from(videosTable)
      .where(eq(videosTable.sectionId, sectionId))
      .orderBy(desc(videosTable.sortOrder))
      .limit(1);

    const sortOrder = existing.length > 0 ? existing[0].sortOrder + 1 : 0;

    const [video] = await db
      .insert(videosTable)
      .values({ sectionId, title, description, videoUrl, duration, sortOrder })
      .returning();

    res.status(201).json({
      id: String(video.id),
      sectionId: video.sectionId,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      duration: video.duration,
      sortOrder: video.sortOrder,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/videos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { title, description, videoUrl, duration } = req.body as {
    title?: string;
    description?: string;
    videoUrl?: string;
    duration?: string;
  };

  try {
    const [existing] = await db
      .select()
      .from(videosTable)
      .where(eq(videosTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Video not found" });
      return;
    }

    const updates: Partial<typeof videosTable.$inferInsert> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (videoUrl !== undefined) updates.videoUrl = videoUrl;
    if (duration !== undefined) updates.duration = duration;

    const [updated] = await db
      .update(videosTable)
      .set(updates)
      .where(eq(videosTable.id, id))
      .returning();

    res.json({
      id: String(updated.id),
      sectionId: updated.sectionId,
      title: updated.title,
      description: updated.description,
      videoUrl: updated.videoUrl,
      duration: updated.duration,
      sortOrder: updated.sortOrder,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/videos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(videosTable)
      .where(eq(videosTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Video not found" });
      return;
    }

    await db.delete(videosTable).where(eq(videosTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
