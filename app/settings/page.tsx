'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/glass-card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import authService from '@/lib/services/auth-service'
import {
  User,
  Bell,
  Lock,
  Trash2,
  Save,
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('john@example.com')
  const [fullName, setFullName] = useState('John Doe')
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
  })

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      
      if (!fullName.trim()) {
        toast({
          title: 'Error',
          description: 'Full name is required',
          variant: 'destructive',
        })
        return
      }
      
      if (!email.trim()) {
        toast({
          title: 'Error',
          description: 'Email is required',
          variant: 'destructive',
        })
        return
      }

      await authService.updateProfile({
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' '),
        email,
      })

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        variant: 'default',
      })
    } catch (error) {
      console.error('Update profile error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true)

      if (!currentPassword.trim()) {
        toast({
          title: 'Error',
          description: 'Current password is required',
          variant: 'destructive',
        })
        return
      }

      if (newPassword.length < 8) {
        toast({
          title: 'Error',
          description: 'New password must be at least 8 characters',
          variant: 'destructive',
        })
        return
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        })
        return
      }

      await authService.changePassword({
        currentPassword,
        newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      toast({
        title: 'Success',
        description: 'Password changed successfully',
        variant: 'default',
      })
    } catch (error) {
      console.error('Change password error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure? This action cannot be undone. Your account and all data will be permanently deleted.'
    )

    if (!confirmed) return

    try {
      setIsDeletingAccount(true)

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      }).then(r => {
        if (!r.ok) throw new Error('Failed to delete account')
        return r.json()
      })

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted',
        variant: 'default',
      })

      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Delete account error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete account',
        variant: 'destructive',
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 px-6 py-8 lg:pl-80">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 mt-6">
            <GlassCard>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <Button 
                      className="gap-2"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold mb-4">Account Tier</h3>
                  <GlassCard className="bg-secondary/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Free Plan</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          3 resumes • Basic templates • Limited AI suggestions
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: 'Coming Soon',
                            description: 'Premium plans will be available soon',
                          })
                        }}
                      >
                        Upgrade
                      </Button>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <GlassCard>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive resume tips and feature updates via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified about important updates in the app
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Learn about new features and special offers
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, marketing: checked })
                      }
                    />
                  </div>
                </div>

                <Button 
                  className="gap-2"
                  onClick={() => console.log('Save notification preferences')}
                >
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-6">
            <GlassCard>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isChangingPassword}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isChangingPassword}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isChangingPassword}
                      />
                    </div>

                    <Button 
                      className="gap-2"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      <Lock className="h-4 w-4" />
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>

                  <GlassCard className="border-red-500/20 bg-red-500/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-red-600">Delete Account</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeletingAccount ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
