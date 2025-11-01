'use client'

import { useAuth } from '@/src/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

// Move these types to a shared file later
interface LlmKey {
  id: string
  name: string
  provider: string
  isEnabled: boolean
  createdAt: string
  apiKey: string
}

export default function LlmKeysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [keys, setKeys] = useState<LlmKey[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<LlmKey | null>(null)

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchKeys()
    }
  }, [user])

  async function fetchKeys() {
    const response = await fetch('/api/llm-keys')
    const data = await response.json()
    setKeys(data.docs)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())

    const url = selectedKey ? `/api/llm-keys` : '/api/llm-keys'
    const method = selectedKey ? 'PUT' : 'POST'

    const body = selectedKey
      ? { ...selectedKey, ...data }
      : { ...data, isEnabled: data.isEnabled === 'on' }

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    await fetchKeys()
    setIsFormOpen(false)
    setSelectedKey(null)
  }

  async function handleDelete(id: string) {
    await fetch('/api/llm-keys', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })

    await fetchKeys()
  }

  if (isLoading || user?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>LLM Key Management</CardTitle>
          <CardDescription>
            Add, edit, and delete the LLM API keys used by the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-right">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedKey(null)}>Add New Key</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedKey ? 'Edit' : 'Add'} LLM Key</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" defaultValue={selectedKey?.name} />
                    </div>
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input id="apiKey" name="apiKey" defaultValue={selectedKey?.apiKey} />
                    </div>
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Select name="provider" defaultValue={selectedKey?.provider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="google_ai">Google AI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isEnabled" name="isEnabled" defaultChecked={selectedKey?.isEnabled} />
                      <Label htmlFor="isEnabled">Enabled</Label>
                    </div>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map(key => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell>{key.provider}</TableCell>
                  <TableCell>
                    <Badge variant={key.isEnabled ? 'default' : 'destructive'}>
                      {key.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        setSelectedKey(key)
                        setIsFormOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(key.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
