'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface RecentUser {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  role: string
  createdAt: Date
}

interface RecentTenant {
  id: string
  subdomain: string
  name: string
  status: string
  createdAt: Date
  owner: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

interface RecentApplication {
  id: string
  status: string
  updatedAt: Date
  tenant: {
    id: string
    name: string
    subdomain: string
  }
}

interface RecentActivityProps {
  recentUsers: RecentUser[]
  recentTenants: RecentTenant[]
  recentApplications: RecentApplication[]
}

const roleColors: Record<string, string> = {
  USER: 'bg-muted text-muted-foreground',
  ADMIN: 'bg-purple-500/20 text-purple-400',
}

const tenantStatusColors: Record<string, string> = {
  INACTIVE: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-green-500/20 text-green-400',
  SUSPENDED: 'bg-red-500/20 text-red-400',
}

const appStatusColors: Record<string, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  SUBMITTED: 'bg-yellow-500/20 text-yellow-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
}

function formatName(firstName: string | null, lastName: string | null, email: string) {
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  return email
}

export function RecentActivity({ recentUsers, recentTenants, recentApplications }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
              ) : (
                recentUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/users/${user.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatName(user.firstName, user.lastName, user.email)}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={roleColors[user.role] || 'bg-muted text-muted-foreground'}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="tenants" className="mt-4">
            <div className="space-y-3">
              {recentTenants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No tenants yet</p>
              ) : (
                recentTenants.map((tenant) => (
                  <Link
                    key={tenant.id}
                    href={`/tenants/${tenant.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{tenant.subdomain}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={tenantStatusColors[tenant.status] || 'bg-muted text-muted-foreground'}>
                        {tenant.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tenant.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <div className="space-y-3">
              {recentApplications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No applications yet</p>
              ) : (
                recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{app.tenant.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{app.tenant.subdomain}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={appStatusColors[app.status] || 'bg-muted text-muted-foreground'}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
