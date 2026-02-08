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
import {
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  ShoppingCart,
  FileText,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { tenantUrl } from '@/lib/url'
import { updateTenantStatusAction } from '@/app/actions/admin-tenants'
import { toast } from 'sonner'

interface TenantDetail {
  id: string
  subdomain: string
  name: string
  businessEmail: string
  businessPhone: string
  contactEmail: string | null
  contactPhone: string | null
  sameAsBusinessContact: boolean
  status: string
  createdAt: Date
  owner: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    role: string
  }
  application: {
    id: string
    status: string
    currentStep: number
    submittedAt: Date | null
    reviewNotes: string | null
    notes: {
      id: string
      note: string
      createdAt: Date
      user: {
        id: string
        firstName: string | null
        lastName: string | null
        email: string
      }
    }[]
  } | null
  events: {
    id: string
    name: string
    status: string
    startDate: Date
    venueName: string
  }[]
  orders: {
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: Date
    event: { name: string }
  }[]
  _count: { events: number; orders: number }
}

interface TenantDetailViewProps {
  tenant: TenantDetail
}

const statusColors: Record<string, string> = {
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

const eventStatusColors: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PUBLISHED: 'bg-green-500/20 text-green-400',
  ARCHIVED: 'bg-yellow-500/20 text-yellow-400',
}

const orderStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  REFUNDED: 'bg-muted text-muted-foreground',
  PARTIALLY_REFUNDED: 'bg-orange-500/20 text-orange-400',
}

const roleColors: Record<string, string> = {
  USER: 'bg-muted text-muted-foreground',
  ADMIN: 'bg-purple-500/20 text-purple-400',
}

export function TenantDetailView({ tenant }: TenantDetailViewProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const ownerName = tenant.owner.firstName && tenant.owner.lastName
    ? `${tenant.owner.firstName} ${tenant.owner.lastName}`
    : tenant.owner.email

  const handleStatusChange = async () => {
    if (!selectedStatus) return
    setIsLoading(true)
    const result = await updateTenantStatusAction(
      tenant.id,
      selectedStatus as 'INACTIVE' | 'ACTIVE' | 'SUSPENDED'
    )
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Status updated to ${selectedStatus}`)
      setSelectedStatus('')
      router.refresh()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tenant Info */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Tenant Information</CardTitle>
                <CardDescription>Organization details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subdomain</p>
                  <p className="mt-1 font-mono text-sm font-semibold">{tenant.subdomain}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                  <p className="mt-1 text-sm font-semibold">{tenant.name}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Email</p>
                    <p className="mt-1 text-sm">{tenant.businessEmail}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Phone</p>
                    <p className="mt-1 text-sm">{tenant.businessPhone}</p>
                  </div>
                </div>
                {tenant.contactEmail && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact Email</p>
                    <p className="mt-1 text-sm">{tenant.contactEmail}</p>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</p>
                    <p className="mt-1 text-sm">{format(new Date(tenant.createdAt), 'PPP')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Owner</CardTitle>
                <CardDescription>Tenant owner details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Link
              href={`/users/${tenant.owner.id}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{ownerName}</p>
                <p className="text-xs text-muted-foreground">{tenant.owner.email}</p>
              </div>
              <Badge className={roleColors[tenant.owner.role] || ''}>{tenant.owner.role}</Badge>
            </Link>
          </CardContent>
        </Card>

        {/* Application */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Application</CardTitle>
                <CardDescription>Organizer application status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!tenant.application ? (
              <p className="text-sm text-muted-foreground text-center py-4">No application submitted</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={appStatusColors[tenant.application.status] || ''}>
                      {tenant.application.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Step {tenant.application.currentStep}/3
                    </span>
                  </div>
                  <Link href={`/applications/${tenant.application.id}`}>
                    <Button variant="outline" size="sm">
                      View Application
                    </Button>
                  </Link>
                </div>
                {tenant.application.submittedAt && (
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(tenant.application.submittedAt), { addSuffix: true })}
                  </p>
                )}
                {tenant.application.reviewNotes && (
                  <div className="p-3 rounded-lg bg-muted border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Review Notes</p>
                    <p className="text-sm">{tenant.application.reviewNotes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Events</CardTitle>
                <CardDescription>{tenant._count.events} events</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {tenant.events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No events</p>
            ) : (
              <div className="space-y-3">
                {tenant.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.venueName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={eventStatusColors[event.status] || ''}>
                        {event.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.startDate), 'PP')}
                      </span>
                    </div>
                  </div>
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
                <CardDescription>Last 10 orders for this tenant</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {tenant.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders</p>
            ) : (
              <div className="space-y-3">
                {tenant.orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-mono font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.event.name}</p>
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
              <span className="text-muted-foreground">Status</span>
              <Badge className={statusColors[tenant.status] || ''}>{tenant.status}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Events
              </span>
              <span className="font-medium">{tenant._count.events}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Orders
              </span>
              <span className="font-medium">{tenant._count.orders}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Management */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Status Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Status</p>
              <Badge className={`${statusColors[tenant.status] || ''} text-sm px-3 py-1`}>
                {tenant.status}
              </Badge>
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>

            {selectedStatus && selectedStatus !== tenant.status && (
              <Button
                onClick={handleStatusChange}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : `Change to ${selectedStatus}`}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {tenant.application && (
              <Link href={`/applications/${tenant.application.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Application
                </Button>
              </Link>
            )}
            <Link href={`/users/${tenant.owner.id}`} className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                View Owner
              </Button>
            </Link>
            <a href={tenantUrl(tenant.subdomain)} className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Tenant ID */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Tenant ID</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {tenant.id.slice(0, 12)}...
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
