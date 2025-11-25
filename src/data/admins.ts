export const ADMIN_EMAILS = [
    'weber900127@gmail.com'
];

export const isAdmin = (email?: string | null) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
};
