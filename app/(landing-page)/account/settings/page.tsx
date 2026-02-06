import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/profile/profile-form'
import { PasswordForm } from '@/components/profile/password-form'
import { User, Lock } from 'lucide-react'

async function getUserDetails(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  })
}

export default async function SettingsPage() {
  noStore()
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/account/settings')
  }

  const userDetails = await getUserDetails(user.id)

  if (!userDetails) {
    redirect('/auth/signin?callbackUrl=/account/settings')
  }

  const defaultProfileValues = {
    firstName: userDetails.firstName || '',
    lastName: userDetails.lastName || '',
    email: userDetails.email,
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm defaultValues={defaultProfileValues} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
