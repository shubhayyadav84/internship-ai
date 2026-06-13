import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { studentsTable, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { RegisterStudentBody, LoginStudentBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parse = RegisterStudentBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { name, email, password, studentId } = parse.data;

  try {
    const existing = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [student] = await db
      .insert(studentsTable)
      .values({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash, studentId: studentId.trim() })
      .returning();

    const token = signToken({ id: student.id, role: "student" });
    res.status(201).json({
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        createdAt: student.createdAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  const parse = LoginStudentBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parse.data;

  try {
    // 1. Check if user is a student
    const [student] = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.email, email.toLowerCase()))
      .limit(1);

    if (student) {
      const valid = await bcrypt.compare(password, student.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Incorrect password." });
        return;
      }

      const token = signToken({ id: student.id, role: "student" });
      res.json({
        token,
        role: "student",
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          studentId: student.studentId,
          createdAt: student.createdAt.toISOString(),
        },
      });
      return;
    }

    // 2. Check if user is an admin
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, email.toLowerCase()))
      .limit(1);

    if (admin) {
      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Incorrect password." });
        return;
      }

      const token = signToken({ id: admin.id, role: "admin" });
      res.json({
        token,
        role: "admin",
        admin: {
          id: admin.id,
          email: admin.email,
        },
      });
      return;
    }

    res.status(401).json({ error: "No account found with this email." });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
