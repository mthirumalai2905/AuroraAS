export const SESSION_COOKIE = "aurora_session";

export type Stakeholder = {
  id: string;
  name: string;
  entity: string;
  email: string;
  role: string;
};

type StakeholderRecord = Stakeholder & { password: string };

// Demo accounts only. Replace with a real identity provider before production.
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
  return rest;
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

export const demoAccounts = stakeholders.map((s) => ({ email: s.email, password: s.password, name: s.name, entity: s.entity }));
