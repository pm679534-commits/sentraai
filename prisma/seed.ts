import {
  PrismaClient,
  type Action,
  type Severity,
  type Employee,
} from "@prisma/client";
import { hash } from "bcryptjs";
const db = new PrismaClient();
const ownerPassword = process.env.SEED_OWNER_PASSWORD;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@sentraai.example";
if (
  !ownerPassword ||
  !adminPassword ||
  ownerPassword.length < 12 ||
  adminPassword.length < 12
)
  throw new Error(
    "Set SEED_OWNER_PASSWORD and SEED_ADMIN_PASSWORD to strong values before seeding.",
  );

async function main() {
  const org = await db.organization.upsert({
    where: { slug: "caspian-meridian-demo" },
    update: {},
    create: {
      name: "Caspian Meridian Group",
      slug: "caspian-meridian-demo",
      industry: "Financial services",
      teamSize: "501-2000",
      plan: "BUSINESS",
      status: "ACTIVE",
    },
  });
  await db.user.upsert({
    where: { email: "owner@caspianmeridian.example" },
    update: { passwordHash: await hash(ownerPassword!, 12) },
    create: {
      email: "owner@caspianmeridian.example",
      name: "Leyla Mammadova",
      passwordHash: await hash(ownerPassword!, 12),
      role: "OWNER",
      organizationId: org.id,
    },
  });
  await db.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: await hash(adminPassword!, 12),
      role: "INTERNAL_ADMIN",
      organizationId: null,
    },
    create: {
      email: adminEmail,
      name: "SentraAI Operations",
      passwordHash: await hash(adminPassword!, 12),
      role: "INTERNAL_ADMIN",
    },
  });
  const people = [
    ["Aysel Aliyeva", "aysel.aliyeva", "Finance", 32, 184],
    ["Murad Huseynov", "murad.huseynov", "Engineering", 12, 312],
    ["Nigar Karimova", "nigar.karimova", "Legal", 48, 97],
    ["Rashad Ismayilov", "rashad.ismayilov", "Operations", 18, 231],
    ["Sabina Rahimova", "sabina.rahimova", "Customer Support", 56, 421],
    ["Elvin Safarov", "elvin.safarov", "Risk & Compliance", 21, 144],
    ["Gunel Abbasova", "gunel.abbasova", "Human Resources", 34, 108],
    ["Tural Guliyev", "tural.guliyev", "Finance", 62, 156],
  ] as const;
  const employees: Employee[] = [];
  for (const [name, handle, department, riskScore, requestCount] of people)
    employees.push(
      await db.employee.upsert({
        where: {
          organizationId_email: {
            organizationId: org.id,
            email: `${handle}@caspianmeridian.example`,
          },
        },
        update: { riskScore, requestCount },
        create: {
          organizationId: org.id,
          name,
          email: `${handle}@caspianmeridian.example`,
          department,
          riskScore,
          requestCount,
        },
      }),
    );
  const categories = [
    "CARD",
    "AZ_FIN",
    "EMAIL",
    "PHONE",
    "SECRET",
    "IBAN",
    "FINANCIAL",
    "CONFIDENTIAL",
  ];
  for (const category of categories)
    await db.policyRule.upsert({
      where: { organizationId_category: { organizationId: org.id, category } },
      update: {},
      create: {
        organizationId: org.id,
        category,
        action:
          category === "SECRET" || category === "CARD"
            ? "BLOCK"
            : category === "FINANCIAL"
              ? "ALERT"
              : "MASK",
      },
    });
  if ((await db.incident.count({ where: { organizationId: org.id } })) === 0) {
    const tools = ["ChatGPT", "Claude", "Gemini", "DeepSeek"];
    const actions: Action[] = ["MASK", "BLOCK", "MASK", "ALERT"];
    const severities: Severity[] = ["MEDIUM", "HIGH", "LOW", "CRITICAL"];
    const rows = Array.from({ length: 84 }, (_, i) => ({
      organizationId: org.id,
      employeeId: employees[i % employees.length].id,
      tool: tools[i % tools.length],
      category: categories[(i * 3) % categories.length],
      action: actions[i % actions.length],
      severity: severities[(i * 7) % severities.length],
      status: i % 5 === 0 ? ("REVIEWED" as const) : ("OPEN" as const),
      matchCount: i % 9 === 0 ? 2 : 1,
      occurredAt: new Date(Date.now() - (i * 8 + (i % 4)) * 60 * 60_000),
      source: "gateway",
    }));
    await db.incident.createMany({ data: rows });
  }
  if ((await db.scanEvent.count({ where: { organizationId: org.id } })) === 0) {
    const scans = Array.from({ length: 720 }, (_, i) => ({
      organizationId: org.id,
      tool: ["ChatGPT", "Claude", "Gemini", "DeepSeek"][i % 4],
      findingCount: i % 8 === 0 ? 1 : 0,
      blocked: i % 29 === 0,
      masked: i % 8 === 0,
      createdAt: new Date(Date.now() - (i * 60 + (i % 7) * 13) * 60_000),
    }));
    await db.scanEvent.createMany({ data: scans });
  }
  console.log(
    `Seeded ${org.name}; demo accounts: owner@caspianmeridian.example and ${adminEmail}`,
  );
}
main().finally(() => db.$disconnect());
