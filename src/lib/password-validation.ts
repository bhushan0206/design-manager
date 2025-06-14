export interface PasswordStrengthRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number;
  requirements: Array<PasswordStrengthRequirement & { met: boolean }>;
  strength: 'Weak' | 'Medium' | 'Strong';
  color: string;
}

export const PASSWORD_REQUIREMENTS: PasswordStrengthRequirement[] = [
  {
    id: 'length',
    label: '8+ characters',
    validator: (password: string) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Uppercase letter',
    validator: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Lowercase letter',
    validator: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Number',
    validator: (password: string) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'Special character',
    validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.validator(password),
  }));

  const score = requirements.filter(req => req.met).length;
  const isValid = score >= 4; // Require at least 4 out of 5 criteria

  let strength: 'Weak' | 'Medium' | 'Strong';
  let color: string;

  if (score < 2) {
    strength = 'Weak';
    color = 'text-red-600';
  } else if (score < 4) {
    strength = 'Medium';
    color = 'text-yellow-600';
  } else {
    strength = 'Strong';
    color = 'text-green-600';
  }

  return {
    isValid,
    score,
    requirements,
    strength,
    color,
  };
}

export function getPasswordStrengthColor(score: number): string {
  if (score < 2) return "bg-red-500";
  if (score < 4) return "bg-yellow-500";
  return "bg-green-500";
}
