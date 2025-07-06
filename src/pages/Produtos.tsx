
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Package,
  AlertTriangle,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle,
  DollarSign,
  Settings,
  Building2,
  Tag,
  Ruler,
  ShoppingCart
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/products/ProductForm';
import { CategoryManagement } from '@/components/products/CategoryManagement';
import { ProductPurchaseForm } from '@/components/products/ProductPurchaseForm';
import { UnitManagement } from '@/components/products/UnitManagement';
import { SupplierManagement } from '@/components/suppliers/SupplierManagement';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const Produtos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [showSupplierManagement, setShowSupplierManagement] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const { products, categories, loading, createProduct, updateProduct, deleteProduct, refreshCategories, refreshProducts } = useProducts();
  const { toast } = useToast();

  // Check URL params for filter
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    if (filter === 'low-stock') {
      setActiveFilter('low-stock');
    }
  }, []);

  const getStatusBadge = (product: Product) => {
    if (!product.active) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    if ((product.stock_quantity || 0) === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    }
    if ((product.stock_quantity || 0) <= (product.min_stock || 0)) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Estoque Baixo</Badge>;
    }
    return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
  };

  const getFilteredProducts = () => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (activeFilter === 'low-stock') {
      filtered = filtered.filter(p => (p.stock_quantity || 0) <= (p.min_stock || 0));
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => (p.stock_quantity || 0) <= (p.min_stock || 0)).length;
  const outOfStockProducts = products.filter(p => (p.stock_quantity || 0) === 0).length;
  const averageMargin = products.length > 0 
    ? products.reduce((acc, p) => {
        const margin = p.cost_price && p.cost_price > 0 
          ? ((p.price - p.cost_price) / p.price) * 100 
          : 0;
        return acc + margin;
      }, 0) / products.length
    : 0;

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      await deleteProduct(product.id);
    }
  };

  const handleSubmitProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await createProduct(productData);
    }
    setEditingProduct(null);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="catalogo" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="catalogo" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
          
          <TabsTrigger value="fornecedores" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Fornecedores
          </TabsTrigger>
          
          <TabsTrigger value="categorias" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorias
          </TabsTrigger>
          
          <TabsTrigger value="compras" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Compras
          </TabsTrigger>
          
          <TabsTrigger value="unidades" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Unidades
          </TabsTrigger>
        </TabsList>

        {/* Catálogo Tab */}
        <TabsContent value="catalogo" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Catálogo de Produtos</h2>
              <p className="text-muted-foreground">Gerencie seus produtos cadastrados</p>
            </div>
            <Button onClick={() => setShowProductForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">produtos cadastrados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.filter(p => p.active).length}</div>
                <p className="text-xs text-muted-foreground">produtos ativos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.filter(p => p.stock_quantity !== null && p.min_stock !== null && p.stock_quantity <= p.min_stock).length}
                </div>
                <p className="text-xs text-muted-foreground">produtos com estoque baixo</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {products.reduce((total, product) => {
                    const stockValue = (product.stock_quantity || 0) * (product.cost_price || 0);
                    return total + stockValue;
                  }, 0).toFixed(2).replace('.', ',')}
                </div>
                <p className="text-xs text-muted-foreground">valor total em estoque</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium">Produto</th>
                      <th className="text-left py-3 px-4 font-medium">SKU</th>
                      <th className="text-left py-3 px-4 font-medium">Preço</th>
                      <th className="text-left py-3 px-4 font-medium">Estoque</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{product.sku || '-'}</td>
                        <td className="py-3 px-4 font-medium">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <span className={`${
                              product.stock_quantity !== null && product.min_stock !== null && product.stock_quantity <= product.min_stock
                                ? 'text-red-600 font-medium'
                                : 'text-gray-600'
                            }`}>
                              {product.stock_quantity || 0}
                            </span>
                            <span className="text-gray-400">un</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          Nenhum produto encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fornecedores Tab */}
        <TabsContent value="fornecedores" className="space-y-6">
          <SupplierManagement />
        </TabsContent>

        {/* Categorias Tab */}
        <TabsContent value="categorias" className="space-y-6">
          <CategoryManagement categories={categories} onRefresh={refreshCategories} />
        </TabsContent>

        {/* Compras Tab */}
        <TabsContent value="compras" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Compras</CardTitle>
              <Button onClick={() => setShowPurchaseForm(true)} className="ml-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nova Compra
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Registre compras de produtos para atualizar o estoque automaticamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unidades Tab */}
        <TabsContent value="unidades" className="space-y-6">
          <UnitManagement />
        </TabsContent>
      </Tabs>

      {/* Forms and Dialogs */}
      <ProductPurchaseForm
        open={showPurchaseForm}
        onOpenChange={setShowPurchaseForm}
        onSuccess={() => {
          refreshProducts();
          toast({ title: "Compra registrada!", description: "Estoque atualizado com sucesso." });
        }}
      />

      <ProductForm
        open={showProductForm}
        onOpenChange={(open) => {
          setShowProductForm(open);
          if (!open) setEditingProduct(null);
        }}
        onSubmit={handleSubmitProduct}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
};

export default Produtos;
