export default interface UserMeResInterface {
  me: {
    id: string
    name: string
    email: string
    course: string
    campus: string
    avatarUrl: string | null
    bio: string
    defaultUserPrompt: string
    isVerified: boolean
    role: 'admin' | 'client'
  }
}
