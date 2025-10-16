import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Redirect to public profiles page
  redirect('/profiles')
}