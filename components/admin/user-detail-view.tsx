'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, formatDistanceToNow } from 'date-fns'
import { Mail, Calendar, Building2, ShoppingCart, Ticket, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { updateUserRoleAction } from '@/app/actions/admin-users'
import { toast } from 'sonner'

interface UserDetail {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  role: string
  createdAt: Date
  tenants: {
    id: string
    subdomain: string
    name: string
    status: string
    application: { id: string; status: string } | null
    _count: { events: number }
  }[]
  orders: {
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: Date
    event: { name: string }
    tenant: { name: string }
  }[]
  _count: { orders: number; ownedTickets: number; tenants: number }
}

interface UserDetailViewProps {
  user: UserDetail
  currentUserId: string
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

const orderStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  REFUNDED: 'bg-muted text-muted-foreground',
  PARTIALLY_REFUNDED: 'bg-orange-500/20 text-orange-400',
}

export function UserDetailView({ user, currentUserId }: UserDetailViewProps) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const isSelf = currentUserId === user.id
  const userName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.email

  const handleRoleChange = async () => {
    if (!selectedRole) return
    setIsLoading(true)
    const result = await updateUserRoleAction(user.id, selectedRole as 'USER' | 'ADMIN')
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Role updated to ${selectedRole}`)
      setSelectedRole('')
      router.refresh()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>User Information</CardTitle>
            <CardDescription>Account details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                  <p className="mt-1 text-sm font-semibold">{userName}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="mt-1 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</p>
                  <Badge className={`mt-1 ${roleColors[user.role] || ''}`}>{user.role}</Badge>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Joined</p>
                    <p className="mt-1 text-sm">{format(new Date(user.createdAt), 'PPP')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Tenants</CardTitle>
                <CardDescription>Organizations owned by this user</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {user.tenants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tenants</p>
            ) : (
              <div className="space-y-3">
                {user.tenants.map((tenant) => (
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
                      <Badge className={tenantStatusColors[tenant.status] || ''}>
                        {tenant.status}
                      </Badge>
                      {tenant.application && (
                        <Badge className={appStatusColors[tenant.application.status] || ''}>
                          {tenant.application.status.replace('_', ' ')}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {tenant._count.events} events
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Last 10 orders by this user</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {user.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders</p>
            ) : (
              <div className="space-y-3">
                {user.orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-mono font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.event.name} - {order.tenant.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={orderStatusColors[order.status] || ''}>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        PHP {(order.total / 100).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right sidebar */}
      <div className="space-y-6 h-fit sticky top-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Tenants
              </span>
              <span className="font-medium">{user._count.tenants}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Orders
              </span>
              <span className="font-medium">{user._count.orders}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Ticket className="h-4 w-4" /> Tickets
              </span>
              <span className="font-medium">{user._count.ownedTickets}</span>
            </div>
          </CardContent>
        </Card>

        {/* Role Management */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Role Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Role</p>
              <Badge className={`${roleColors[user.role] || ''} text-sm px-3 py-1`}>
                {user.role}
              </Badge>
            </div>

            {isSelf && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                <p className="text-xs text-yellow-500">This is your account. You cannot change your own role.</p>
              </div>
            )}

            {!isSelf && (
              <>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>

                {selectedRole && selectedRole !== user.role && (
                  <Button
                    onClick={handleRoleChange}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Updating...' : `Change to ${selectedRole}`}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* User ID */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">User ID</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {user.id.slice(0, 12)}...
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
