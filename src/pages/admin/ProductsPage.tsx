// pages/admin/ProductsPage.tsx - Add vibration/animation effect
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, Trash2, Edit, Package, Loader2,
  Tag, Layers, DollarSign, Image as ImageIcon, 
  Grid, Hash, TrendingUp, Star, Check, AlertCircle,
  Upload, X
} from 'lucide-react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { productsAPI, categoriesAPI } from '@/lib/api';

interface Product {
  id: number;
  title: string;
  description: string;
  img: string;
  price: number;
  discountPrice: number | null;
  categoryId: number | null;
  inStock: boolean;
  featured: boolean;
  attributes: Record<string, string[]>;
  stockByVariant: Record<string, number>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // For frontend compatibility
  _id?: string;
  desc?: string;
}

interface Category {
  id: number;
  name: string;
}

interface AttributeField {
  name: string;
  values: string;
}

interface Variant {
  key: string;
  attributes: Record<string, string>;
  stock: number;
  price?: number;
  sku?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animateRowId, setAnimateRowId] = useState<number | null>(null);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    img: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    inStock: true,
    featured: false,
    tags: '',
  });

  const [attributeFields, setAttributeFields] = useState<AttributeField[]>([
    { name: 'size', values: 'S, M, L, XL' },
    { name: 'color', values: 'Red, Blue, Black' }
  ]);

  const [variants, setVariants] = useState<Variant[]>([]);

  // Fetch data
  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.categoryId?.toString() === categoryFilter
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, products]);

  // Generate variants from attributes
  const generateVariants = () => {
    if (attributeFields.length === 0) {
      setVariants([{
        key: 'default',
        attributes: {},
        stock: 0
      }]);
      return;
    }

    const attributes: Record<string, string[]> = {};
    attributeFields.forEach(field => {
      if (field.name.trim()) {
        attributes[field.name.trim()] = field.values
          .split(',')
          .map(v => v.trim())
          .filter(v => v);
      }
    });

    const attributeNames = Object.keys(attributes);
    
    if (attributeNames.length === 0) {
      setVariants([]);
      return;
    }

    const generateCombinations = (index: number, current: Record<string, string>): Variant[] => {
      if (index === attributeNames.length) {
        const key = Object.values(current).join('_');
        const existingVariant = variants.find(v => v.key === key);
        return [{
          key,
          attributes: { ...current },
          stock: existingVariant?.stock || 0,
          price: existingVariant?.price,
          sku: existingVariant?.sku
        }];
      }

      const attrName = attributeNames[index];
      const values = attributes[attrName];
      const combinations: Variant[] = [];

      values.forEach(value => {
        current[attrName] = value;
        combinations.push(...generateCombinations(index + 1, current));
        delete current[attrName];
      });

      return combinations;
    };

    const newVariants = generateCombinations(0, {});
    setVariants(newVariants);
  };

  useEffect(() => {
    generateVariants();
  }, [attributeFields]);

  // Animation effect
  const triggerRowAnimation = (id: number) => {
    setAnimateRowId(id);
    setTimeout(() => setAnimateRowId(null), 1000);
  };

  // Dialog handlers
  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      img: '',
      price: '',
      discountPrice: '',
      categoryId: 'none', // FIXED: Changed from '' to 'none'
      inStock: true,
      featured: false,
      tags: '',
    });
    setAttributeFields([
      { name: 'size', values: 'S, M, L, XL' },
      { name: 'color', values: 'Red, Blue, Black' }
    ]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      img: product.img || '',
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() || '',
      categoryId: product.categoryId?.toString() || 'none', // FIXED: Changed from '' to 'none'
      inStock: product.inStock,
      featured: product.featured || false,
      tags: product.tags?.join(', ') || '',
    });

    // Convert attributes to form fields
    if (product.attributes) {
      const attributeArray: AttributeField[] = [];
      Object.entries(product.attributes).forEach(([name, values]) => {
        attributeArray.push({
          name,
          values: Array.isArray(values) ? values.join(', ') : values
        });
      });
      setAttributeFields(attributeArray);
    }

    // Set variants
    if (product.stockByVariant) {
      const variantArray: Variant[] = [];
      Object.entries(product.stockByVariant).forEach(([key, stock]) => {
        const attributes: Record<string, string> = {};
        const parts = key.split('_');
        attributeFields.forEach((field, index) => {
          if (parts[index]) {
            attributes[field.name] = parts[index];
          }
        });
        variantArray.push({
          key,
          attributes,
          stock
        });
      });
      setVariants(variantArray);
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const attributes: Record<string, string[]> = {};
      attributeFields.forEach(field => {
        if (field.name.trim()) {
          attributes[field.name.trim()] = field.values
            .split(',')
            .map(v => v.trim())
            .filter(v => v);
        }
      });

      const stockByVariant: Record<string, number> = {};
      variants.forEach(variant => {
        stockByVariant[variant.key] = variant.stock;
      });

      // FIXED: Convert 'none' to null
      const categoryId = formData.categoryId === 'none' ? null : parseInt(formData.categoryId);

      const productData = {
        title: formData.title,
        description: formData.description,
        img: formData.img,
        price: parseFloat(formData.price) || 0,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        categoryId: categoryId,
        inStock: formData.inStock,
        featured: formData.featured,
        attributes,
        stockByVariant,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        toast({
          title: 'Product updated',
          description: 'Product has been updated successfully',
        });
        triggerRowAnimation(editingProduct.id);
      } else {
        const newProduct = await productsAPI.create(productData);
        toast({
          title: 'Product created',
          description: 'New product has been added successfully',
        });
        triggerRowAnimation(newProduct.id);
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      await productsAPI.delete(deleteProductId);
      toast({
        title: 'Product deleted',
        description: 'Product has been removed successfully',
      });
      setProducts(products.filter(p => p.id !== deleteProductId));
      setDeleteProductId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const updateVariantStock = (key: string, stock: number) => {
    setVariants(variants.map(variant =>
      variant.key === key ? { ...variant, stock } : variant
    ));
  };

  const calculateTotalStock = () => {
    return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={openAddDialog} className="relative group">
            <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
            Add Product
            <span className="absolute -top-1 -right-1 h-3 w-3">
              <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative h-3 w-3 rounded-full bg-green-500"></span>
            </span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <h3 className="text-2xl font-bold">{products.length}</h3>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                  <h3 className="text-2xl font-bold">
                    {products.filter(p => p.inStock).length}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/50 to-green-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <h3 className="text-2xl font-bold">
                    {products.filter(p => !p.inStock).length}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/50 to-red-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="animate-pulse">
                {filteredProducts.length} products
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const totalStock = Object.values(product.stockByVariant || {}).reduce((a, b) => a + b, 0);
                  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                  
                  return (
                    <TableRow 
                      key={product.id}
                      className={`
                        transition-all duration-300 hover:bg-accent/50
                        ${animateRowId === product.id ? 'animate-[vibration_0.3s_ease-in-out] bg-green-50 dark:bg-green-950/20' : ''}
                      `}
                    >
                      <TableCell>
                        <div className="relative group">
                          {product.img ? (
                            <img
                              src={product.img}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded transition-transform group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/48x48?text=Product';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center group-hover:bg-accent transition-colors">
                              <Package className="w-6 h-6 text-muted-foreground group-hover:text-accent-foreground" />
                            </div>
                          )}
                          {animateRowId === product.id && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 animate-ping"></div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium group">
                            {product.title}
                            <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TrendingUp className="w-3 h-3 inline" />
                            </span>
                          </div>
                          {product.featured && (
                            <Badge variant="outline" className="text-xs animate-pulse">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {product.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.categoryId ? (
                          <Badge variant="outline" className="hover:bg-accent transition-colors">
                            {categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            €{product.price.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                €{product.discountPrice?.toFixed(2)}
                              </span>
                              <Badge variant="destructive" className="text-xs animate-bounce">
                                Sale
                              </Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={totalStock > 0 ? "default" : "secondary"}
                            className={totalStock > 0 ? "animate-pulse" : ""}
                          >
                            {totalStock} in stock
                          </Badge>
                          {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Layers className="w-3 h-3 mr-1" />
                              {Object.keys(product.stockByVariant || {}).length} variants
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.inStock ? "default" : "secondary"}
                          className={product.inStock ? "animate-pulse" : ""}
                        >
                          {product.inStock ? 'Active' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteProductId(product.id)}
                            className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingProduct ? (
                  <>
                    <Edit className="w-5 h-5" />
                    Edit Product
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add New Product
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product information' : 'Create a new product'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Name *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* FIXED: Using "none" instead of empty string */}
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="img">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="img"
                      value={formData.img}
                      onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                      placeholder="https://..."
                      className="focus:ring-2 focus:ring-primary"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discount Price (€)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      className="data-[state=checked]:bg-yellow-500"
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                </div>
              </div>
              
              {/* Attributes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Product Attributes
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAttributeFields([...attributeFields, { name: '', values: '' }])}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attribute
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {attributeFields.map((field, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-accent transition-colors">
                      <Input
                        placeholder="Attribute name (e.g., size, color)"
                        value={field.name}
                        onChange={(e) => {
                          const newFields = [...attributeFields];
                          newFields[index].name = e.target.value;
                          setAttributeFields(newFields);
                        }}
                        className="flex-1 focus:ring-2 focus:ring-primary"
                      />
                      <Input
                        placeholder="Values (comma separated)"
                        value={field.values}
                        onChange={(e) => {
                          const newFields = [...attributeFields];
                          newFields[index].values = e.target.value;
                          setAttributeFields(newFields);
                        }}
                        className="flex-1 focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newFields = attributeFields.filter((_, i) => i !== index);
                          setAttributeFields(newFields);
                        }}
                        className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Grid className="w-5 h-5" />
                    Product Variants
                    <Badge variant="outline" className="animate-pulse">
                      {variants.length} variants
                    </Badge>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Total stock: <span className="font-bold">{calculateTotalStock()}</span>
                    </span>
                  </div>
                </div>
                
                {variants.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                      <div className="col-span-6">Variant</div>
                      <div className="col-span-3">SKU</div>
                      <div className="col-span-3">Stock</div>
                    </div>
                    
                    {variants.map((variant) => (
                      <div key={variant.key} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-accent rounded transition-colors">
                        <div className="col-span-6">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                                {key}: {value}
                              </Badge>
                            ))}
                            {Object.keys(variant.attributes).length === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Default variant
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="col-span-3">
                          <Input
                            placeholder="SKU"
                            value={variant.sku || ''}
                            onChange={(e) => {
                              setVariants(variants.map(v =>
                                v.key === variant.key ? { ...v, sku: e.target.value } : v
                              ));
                            }}
                            className="text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        
                        <div className="col-span-3">
                          <Input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariantStock(variant.key, parseInt(e.target.value) || 0)}
                            className="text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-lg hover:border-primary transition-colors">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No variants generated. Add attributes to create variants.</p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="hover:bg-accent transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </span>
                      <span className="absolute inset-0 bg-primary/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Delete Product
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? 
                This will also remove all associated order items.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-accent transition-colors">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}