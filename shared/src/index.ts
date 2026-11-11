const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const isUtfprEmail = (email: string): boolean => {
  if (!email) return false;

  const normalizedEmail = normalizeEmail(email);
  return (
    normalizedEmail.endsWith("@utfpr.edu.br") ||
    normalizedEmail.endsWith("@alunos.utfpr.edu.br")
  );
};

export const isUtfprStudentEmail = (email: string): boolean => {
  if (!email) return false;

  return normalizeEmail(email).endsWith("@alunos.utfpr.edu.br");
};
