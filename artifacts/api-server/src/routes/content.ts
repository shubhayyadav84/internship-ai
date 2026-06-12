import { Router } from "express";
import { db } from "@workspace/db";
import { sectionsTable, videosTable, quizQuestionsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

async function seedContentIfNeeded() {
  try {
    const existing = await db.select().from(sectionsTable).limit(1);
    if (existing.length > 0) return;

    await db.insert(sectionsTable).values([
      {
        sectionId: "aaws",
        title: "AAWS",
        fullTitle: "Advanced Auxiliary Warning System",
        description:
          "Learn about the Advanced Auxiliary Warning System used to alert crew and passengers of potential hazards on the line.",
        color: "#1D4ED8",
        iconName: "bell",
        sortOrder: 0,
      },
      {
        sectionId: "pis",
        title: "PIS",
        fullTitle: "Passenger Information System",
        description:
          "Understand the Passenger Information System for delivering real-time travel and safety information to passengers.",
        color: "#7C3AED",
        iconName: "monitor",
        sortOrder: 1,
      },
      {
        sectionId: "apc",
        title: "APC",
        fullTitle: "Automatic Phase Changer",
        description:
          "Master the Automatic Phase Changer system that manages electrical phase transitions on the overhead line.",
        color: "#DC2626",
        iconName: "zap",
        sortOrder: 2,
      },
      {
        sectionId: "cvvrs",
        title: "CVVRS",
        fullTitle: "Crew Voice and Video Recording System",
        description:
          "Explore the Crew Voice and Video Recording System for operational safety monitoring and incident investigation.",
        color: "#059669",
        iconName: "video",
        sortOrder: 3,
      },
      {
        sectionId: "etbu",
        title: "ETBU",
        fullTitle: "Emergency Talk Back Unit",
        description:
          "Learn about the Emergency Talk Back Unit enabling direct passenger-to-crew communication in emergencies.",
        color: "#D97706",
        iconName: "phone-call",
        sortOrder: 4,
      },
    ]);

    await db.insert(quizQuestionsTable).values([
      // AAWS
      { sectionId: "aaws", question: "What is the primary function of the Advanced Auxiliary Warning System (AAWS)?", options: ["To control train speed automatically", "To alert crew and passengers of potential hazards", "To manage passenger boarding", "To monitor engine performance"], correctIndex: 1, explanation: "The AAWS is designed to alert crew and passengers of potential hazards on the line ahead.", sortOrder: 0 },
      { sectionId: "aaws", question: "Which type of sensor is typically used in an AAWS to detect obstacles?", options: ["Infrared sensor", "Radar sensor", "Optical fibre sensor", "Pressure sensor"], correctIndex: 1, explanation: "Radar sensors are commonly used in AAWS for obstacle detection due to their all-weather reliability.", sortOrder: 1 },
      { sectionId: "aaws", question: "What action should the crew take when an AAWS level-2 alert is triggered?", options: ["Continue at normal speed", "Increase speed to pass quickly", "Reduce speed and prepare to stop", "Activate emergency brakes immediately"], correctIndex: 2, explanation: "A level-2 alert requires the crew to reduce speed and prepare for a potential stop ahead.", sortOrder: 2 },
      { sectionId: "aaws", question: "How often should AAWS functional tests be conducted?", options: ["Once per year", "Before every service run", "Once per month", "Every 6 months"], correctIndex: 1, explanation: "AAWS must be functionally tested before every service run to ensure operational reliability.", sortOrder: 3 },
      { sectionId: "aaws", question: "What does the AAWS do if a fault is detected in its sensors?", options: ["Continues in degraded mode", "Triggers a system alert and logs the fault", "Shuts down all warning functions", "Increases alert frequency to compensate"], correctIndex: 1, explanation: "A sensor fault triggers an immediate alert to the crew and logs the fault for maintenance review.", sortOrder: 4 },
      // PIS
      { sectionId: "pis", question: "What is the primary purpose of a Passenger Information System (PIS)?", options: ["To control train speed", "To provide real-time travel information to passengers", "To monitor crew activities", "To regulate air conditioning"], correctIndex: 1, explanation: "The PIS primary purpose is to provide passengers with real-time journey and safety information.", sortOrder: 0 },
      { sectionId: "pis", question: "Which communication protocol is commonly used for data transmission in modern PIS?", options: ["RS-232", "CAN bus", "TCP/IP over Ethernet", "Bluetooth"], correctIndex: 2, explanation: "Modern PIS uses TCP/IP over Ethernet for high-speed, reliable data transmission throughout the train.", sortOrder: 1 },
      { sectionId: "pis", question: "What type of display is most commonly used in current PIS installations?", options: ["CRT monitors", "LED matrix boards", "Plasma screens", "Holographic projectors"], correctIndex: 1, explanation: "LED matrix boards are the most common PIS display type due to their high visibility and low power consumption.", sortOrder: 2 },
      { sectionId: "pis", question: "In the event of a PIS network failure, what is the standard fallback procedure?", options: ["Shut down all displays", "Display a static emergency screen", "Switch to manual announcements only", "Restart the entire system remotely"], correctIndex: 2, explanation: "When the PIS network fails, the fallback is to switch to manual crew announcements only.", sortOrder: 3 },
      { sectionId: "pis", question: "Which department is responsible for updating PIS content in real time?", options: ["Mechanical engineering", "Operations control centre", "Passenger services", "IT infrastructure"], correctIndex: 1, explanation: "The Operations Control Centre is responsible for pushing real-time journey updates to the PIS.", sortOrder: 4 },
      // APC
      { sectionId: "apc", question: "What is the primary purpose of the Automatic Phase Changer (APC)?", options: ["To change passenger cabin lighting phases", "To automatically switch the train's power supply phase", "To manage brake pressure phases", "To control door opening sequences"], correctIndex: 1, explanation: "The APC automatically switches the train's electrical supply between different phase sections of the overhead line.", sortOrder: 0 },
      { sectionId: "apc", question: "When does the APC system typically activate on an electrified railway?", options: ["At the start of every journey", "When crossing a phase separation section", "During emergency braking", "When speed exceeds 100 km/h"], correctIndex: 1, explanation: "The APC activates when the train crosses a phase separation section on the electrified line.", sortOrder: 1 },
      { sectionId: "apc", question: "What happens to traction power during an APC transition?", options: ["Power increases briefly", "Power is momentarily cut to protect equipment", "Power switches to battery backup", "Power remains constant throughout"], correctIndex: 1, explanation: "During APC transition, traction power is momentarily cut to prevent equipment damage from phase bridging.", sortOrder: 2 },
      { sectionId: "apc", question: "What is the main risk if the APC fails to operate at a phase gap?", options: ["Passenger discomfort", "Potential damage to traction equipment", "Loss of door control", "Activation of fire suppression"], correctIndex: 1, explanation: "If APC fails, bridging two different electrical phases can cause severe damage to traction equipment.", sortOrder: 3 },
      { sectionId: "apc", question: "What indication does the driver receive when an APC zone is approaching?", options: ["A verbal announcement", "A trackside sign and cab display warning", "An automated speed reduction", "A vibration alert"], correctIndex: 1, explanation: "APC zones are indicated by a trackside neutral section sign and a corresponding cab display warning.", sortOrder: 4 },
      // CVVRS
      { sectionId: "cvvrs", question: "What is the primary purpose of the Crew Voice and Video Recording System (CVVRS)?", options: ["To entertain crew during shifts", "To record operational audio and video for safety and investigation", "To broadcast information to passengers", "To monitor fuel consumption"], correctIndex: 1, explanation: "CVVRS captures operational audio and video data primarily for safety monitoring and accident investigation.", sortOrder: 0 },
      { sectionId: "cvvrs", question: "How long is recorded data typically retained on the CVVRS before overwriting?", options: ["24 hours", "48 hours", "72 hours", "7 days"], correctIndex: 1, explanation: "CVVRS systems typically retain a 48-hour rolling buffer of recordings before older data is overwritten.", sortOrder: 1 },
      { sectionId: "cvvrs", question: "What type of storage medium is primarily used in modern CVVRS?", options: ["Magnetic tape", "Optical disc", "Solid-state memory (flash storage)", "Hard disk drive"], correctIndex: 2, explanation: "Modern CVVRS uses solid-state flash storage for reliability, shock resistance and fast data access.", sortOrder: 2 },
      { sectionId: "cvvrs", question: "Who is authorised to access and review CVVRS recordings?", options: ["Any member of the train crew", "Authorised personnel for safety investigations only", "Passengers upon request", "Any railway employee"], correctIndex: 1, explanation: "Access to CVVRS recordings is restricted to authorised personnel conducting official safety investigations.", sortOrder: 3 },
      { sectionId: "cvvrs", question: "What should a crew member do if the CVVRS indicator light is not active before departure?", options: ["Ignore it and continue", "Report the fault to control centre before departing", "Replace the recording media immediately", "Restart the system manually"], correctIndex: 1, explanation: "A non-active CVVRS indicator must be reported to the control centre and the fault logged before departure.", sortOrder: 4 },
      // ETBU
      { sectionId: "etbu", question: "What is the purpose of the Emergency Talk Back Unit (ETBU)?", options: ["To allow passengers to communicate with crew in emergencies", "To control the train's emergency brakes", "To announce delays over the PA system", "To provide backup power to critical systems"], correctIndex: 0, explanation: "The ETBU provides passengers with a direct communication link to the train crew or control centre in emergencies.", sortOrder: 0 },
      { sectionId: "etbu", question: "Where are ETBUs typically installed on a train?", options: ["In the driver's cab only", "In every passenger saloon and vestibule area", "On the roof of each carriage", "At station platforms only"], correctIndex: 1, explanation: "ETBUs are installed throughout passenger saloons and vestibule areas to ensure accessibility for all passengers.", sortOrder: 1 },
      { sectionId: "etbu", question: "What happens when a passenger activates the ETBU?", options: ["The train stops automatically", "A direct communication link is established with the driver or control centre", "An alarm sounds throughout the train", "The nearest door opens automatically"], correctIndex: 1, explanation: "Pressing the ETBU establishes an immediate two-way voice link with the driver or control centre.", sortOrder: 2 },
      { sectionId: "etbu", question: "What is the minimum audibility requirement for an ETBU in high-noise environments?", options: ["65 dB SPL", "72 dB SPL", "80 dB SPL", "90 dB SPL"], correctIndex: 1, explanation: "In high-noise environments, ETBU audio must meet a minimum of 72 dB SPL to ensure passenger comprehension.", sortOrder: 3 },
      { sectionId: "etbu", question: "How often should ETBUs be tested to ensure operational readiness?", options: ["Monthly by maintenance staff", "Before every service run", "Annually during major overhaul", "Every 6 months"], correctIndex: 0, explanation: "ETBUs must be functionally tested monthly by maintenance staff as part of scheduled preventative maintenance.", sortOrder: 4 },
    ]);

    logger.info("Sections and quiz questions seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed content");
  }
}

seedContentIfNeeded();

router.get("/sections", async (req, res) => {
  try {
    const sections = await db
      .select()
      .from(sectionsTable)
      .orderBy(asc(sectionsTable.sortOrder));

    const result = await Promise.all(
      sections.map(async (s) => {
        const [videos, quiz] = await Promise.all([
          db
            .select()
            .from(videosTable)
            .where(eq(videosTable.sectionId, s.sectionId))
            .orderBy(asc(videosTable.sortOrder)),
          db
            .select()
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.sectionId, s.sectionId))
            .orderBy(asc(quizQuestionsTable.sortOrder)),
        ]);

        return {
          id: s.sectionId,
          title: s.title,
          fullTitle: s.fullTitle,
          description: s.description,
          color: s.color,
          iconName: s.iconName,
          sortOrder: s.sortOrder,
          videos: videos.map((v) => ({
            id: String(v.id),
            sectionId: v.sectionId,
            title: v.title,
            description: v.description,
            videoUrl: v.videoUrl,
            duration: v.duration,
            sortOrder: v.sortOrder,
          })),
          quiz: quiz.map((q) => ({
            id: String(q.id),
            question: q.question,
            options: q.options as string[],
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          })),
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
