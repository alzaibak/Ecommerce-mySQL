import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit, FolderOpen } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

// Mock categories for localhost (no backend API for categories)
const initialCategories: Category[] = [
  { _id: '1', name: 'Femmes', slug: 'femmes', description: 'Collection pour femmes', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f' },
  { _id: '2', name: 'Hommes', slug: 'hommes', description: 'Collection pour hommes', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
  { _id: '3', name: 'Enfants', slug: 'enfants', description: 'Collection pour enfants', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term.toLowerCase()) ||
        cat.slug.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', image: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const categoryData = {
      _id: editingCategory?._id || Date.now().toString(),
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || undefined,
      image: formData.image || undefined,
    };

    if (editingCategory) {
      const updated = categories.map((cat) =>
        cat._id === editingCategory._id ? categoryData : cat
      );
      setCategories(updated);
      setFilteredCategories(updated);
      toast({
        title: 'Category updated',
        description: 'Category has been updated successfully (local mode)',
      });
    } else {
      const updated = [...categories, categoryData];
      setCategories(updated);
      setFilteredCategories(updated);
      toast({
        title: 'Category created',
        description: 'New category has been added successfully (local mode)',
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteCategoryId) return;

    const updated = categories.filter((c) => c._id !== deleteCategoryId);
    setCategories(updated);
    setFilteredCategories(updated);
    toast({
      title: 'Category deleted',
      description: 'Category has been removed successfully (local mode)',
    });
    setDeleteCategoryId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage product categories (local mode)</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filteredCategories.length} categories</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCategoryId(category._id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category information' : 'Create a new category'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated-from-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
