import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductFormData {
  image_url: string | null;
}

interface ProductImageUploadProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export function ProductImageUpload({ formData, setFormData }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro no upload",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro no upload",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Por enquanto, vamos usar um preview local até implementar o storage do Supabase
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, image_url: event.target?.result as string }));
        toast({
          title: "Imagem carregada com sucesso!",
          description: "Salve o produto para confirmar as alterações.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: null }));
  };

  return (
    <div className="space-y-4">
      <Label>Imagem do Produto</Label>
      
      {formData.image_url ? (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <img
              src={formData.image_url}
              alt="Preview do produto"
              className="w-16 h-16 object-cover rounded border"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Imagem carregada</p>
              <p className="text-xs text-gray-500">Clique em remover para alterar</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Escolher Imagem'}
                </span>
              </Button>
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF até 5MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}