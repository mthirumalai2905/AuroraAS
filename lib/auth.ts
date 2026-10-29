export const SESSION_COOKIE = "aurora_session";

export const WRITE_ALLOWED_EMAILS = ["paal@synx.tools", "thiru@synx.tools"] as const;

export type Stakeholder = {
  id: string;
  name: string;
  entity: string;
  email: string;
  role: string;
  canWrite: boolean;
};

type StakeholderRecord = Omit<Stakeholder, "canWrite"> & { password: string };

export function canWriteDashboard(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (WRITE_ALLOWED_EMAILS as readonly string[]).includes(normalized);
}

// Demo accounts + authorized write accounts
const stakeholders: StakeholderRecord[] = [
  {
    id: "solberg",
    name: "Ingrid Solberg",
    entity: "Solberg Family Office",
    email: "ingrid@solberg.no",
    role: "Principal",
    password: "aurora2026",
  },
  {
    id: "pacific-crest",
    name: "Marcus Chen",
    entity: "Pacific Crest Pension Fund",
    email: "marcus.chen@pacificcrest.com",
    role: "Head of Private Markets",
    password: "aurora2026",
  },
];

function strip({ password: _password, ...rest }: StakeholderRecord): Stakeholder {
  return { ...rest, canWrite: canWriteDashboard(rest.email) };
}

export function verifyCredentials(email: string, password: string): Stakeholder | null {
  const user = stakeholders.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) return null;
  return strip(user);
}

export function getStakeholder(id: string | undefined): Stakeholder | null {
  if (!id) return null;
  const user = stakeholders.find((s) => s.id === id);
  return user ? strip(user) : null;
}

export function resolveClerkStakeholder(input: {
  email: string;
  fullName?: string | null;
  externalId?: string | null;
}): Stakeholder {
  const email = input.email.trim().toLowerCase();
  const byEmail = stakeholders.find((s) => s.email.toLowerCase() === email);
  if (byEmail) return strip(byEmail);

  const byExternal = input.externalId ? stakeholders.find((s) => s.id === input.externalId) : null;
  if (byExternal) return { ...strip(byExternal), email: input.email, canWrite: canWriteDashboard(email) };

  const canWrite = canWriteDashboard(email);
  if (email === "paal@synx.tools") {
    return {
      id: "solberg",
      name: input.fullName?.trim() || "Paal",
      entity: "SEMANTIC AS",
      email: input.email,
      role: "Registrar Admin · Write access",
      canWrite,
    };
  }
  if (email === "thiru@synx.tools") {
    return {
      id: "solberg",
      name: input.fullName?.trim() || "Thiru",
      entity: "Aurora Equity AS",
      email: input.email,
      role: "Registrar Admin · Write access",
      canWrite,
    };
  }

  return {
    id: "solberg",
    name: input.fullName?.trim() || input.email.split("@")[0] || "Stakeholder",
    entity: "Aurora Stakeholder",
    email: input.email,
    role: "Stakeholder · Read-only",
    canWrite,
  };
}

export const demoAccounts = stakeholders.map((s) => ({
  email: s.email,
  password: s.password,
  name: s.name,
  entity: s.entity,
}));
