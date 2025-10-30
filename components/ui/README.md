# ShadCN UI Components

This directory contains ShadCN UI components configured for use with Tailwind CSS v4.

## Installed Components

All required components have been installed and configured:

- ✅ **Button** - Multiple variants (default, secondary, outline, ghost, destructive, link) and sizes
- ✅ **Input** - Form input with validation states
- ✅ **Card** - Card container with header, title, description, content, and footer
- ✅ **Form** - Form components with react-hook-form integration
- ✅ **Dialog** - Modal dialog with overlay
- ✅ **Tabs** - Tabbed interface with triggers and content
- ✅ **Badge** - Status badges with variants
- ✅ **Skeleton** - Loading skeleton placeholder
- ✅ **Label** - Form label component

## Configuration

### Tailwind CSS v4

The project uses Tailwind CSS v4 with the new `@import` syntax. Configuration is in `app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
```

### Theme Variables

Custom theme variables are defined using the `@theme inline` directive with CSS custom properties for:
- Colors (background, foreground, primary, secondary, etc.)
- Border radius
- Dark mode support

### Component Variants

Components use `class-variance-authority` (CVA) for variant management, providing:
- Type-safe variant props
- Consistent styling patterns
- Easy customization

## Usage Examples

### Button

```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Input

```tsx
import { Input } from "@/components/ui/input";

<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>
```

### Form (with react-hook-form)

```tsx
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const form = useForm();

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Dialog

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-12 w-full" />
<Skeleton className="h-4 w-[250px]" />
```

## Styling

All components use the `cn()` utility from `@/lib/utils` for className merging:

```typescript
import { cn } from "@/lib/utils";

// Combines clsx and tailwind-merge for optimal className handling
```

## Accessibility

Components are built on Radix UI primitives, providing:
- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

## Dark Mode

Dark mode is fully supported through CSS custom properties. Toggle dark mode by adding the `dark` class to the root element.

## Requirements Satisfied

This implementation satisfies:
- **Requirement 12.1**: Responsive layouts using Tailwind CSS breakpoints
- **Requirement 12.2**: Interactive elements appropriately sized for touch interfaces
