import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend.d";
import {
  useAddProduct,
  useAdminProducts,
  useUpdateProduct,
} from "../../hooks/useQueries";
import { formatCurrency } from "../../utils/format";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

export function AdminProductsPage() {
  const { data: products = [], isLoading } = useAdminProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });
  const [editActive, setEditActive] = useState(true);

  const resetForm = () =>
    setForm({ name: "", description: "", price: "", imageUrl: "" });

  const handleAdd = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    try {
      await addProduct.mutateAsync({
        name: form.name,
        description: form.description,
        price: BigInt(Math.round(Number(form.price))),
        imageUrl: form.imageUrl,
      });
      toast.success("Product added!");
      setAddOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleEdit = async () => {
    if (!editProduct || !form.name || !form.price) {
      toast.error("Name and price required");
      return;
    }
    try {
      await updateProduct.mutateAsync({
        productId: editProduct.id,
        name: form.name,
        description: form.description,
        price: BigInt(Math.round(Number(form.price))),
        imageUrl: form.imageUrl,
        isActive: editActive,
      });
      toast.success("Product updated!");
      setEditProduct(null);
      resetForm();
    } catch {
      toast.error("Failed to update product");
    }
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      imageUrl: p.imageUrl,
    });
    setEditActive(p.isActive);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Products
          </h1>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {products.length}
          </Badge>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="admin.products.open_modal_button"
              className="gold-gradient text-primary-foreground rounded-xl h-9 px-4 text-sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent
            data-ocid="admin.products.add.dialog"
            className="bg-card border-border max-w-md"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground font-display">
                Add Product
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-foreground/80 text-sm mb-1.5 block">
                  Name
                </Label>
                <Input
                  data-ocid="admin.products.name_input"
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80 text-sm mb-1.5 block">
                  Description
                </Label>
                <Textarea
                  data-ocid="admin.products.description_input"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="bg-input border-border text-foreground"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-foreground/80 text-sm mb-1.5 block">
                  Price (₹)
                </Label>
                <Input
                  data-ocid="admin.products.price_input"
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80 text-sm mb-1.5 block">
                  Image URL
                </Label>
                <Input
                  data-ocid="admin.products.image_input"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  resetForm();
                }}
                className="border-border"
                data-ocid="admin.products.add.cancel_button"
              >
                Cancel
              </Button>
              <Button
                data-ocid="admin.products.add.submit_button"
                className="gold-gradient text-primary-foreground"
                onClick={handleAdd}
                disabled={addProduct.isPending}
              >
                {addProduct.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}{" "}
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          data-ocid="admin.products.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          No products yet. Add your first product!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <div
              key={p.id?.toString()}
              data-ocid={`admin.products.item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-4 card-glow"
            >
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {p.name}
                  </p>
                  <p className="text-primary font-bold">
                    {formatCurrency(p.price)}
                  </p>
                </div>
                <Badge
                  className={
                    p.isActive
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }
                >
                  {p.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {p.description}
              </p>
              <Button
                data-ocid={`admin.products.edit_button.${i + 1}`}
                size="sm"
                variant="outline"
                className="w-full border-border text-foreground h-8 rounded-lg text-xs"
                onClick={() => openEdit(p)}
              >
                <Edit2 className="h-3 w-3 mr-1" /> Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editProduct}
        onOpenChange={(o) => {
          if (!o) {
            setEditProduct(null);
            resetForm();
          }
        }}
      >
        <DialogContent
          data-ocid="admin.products.edit.dialog"
          className="bg-card border-border max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-foreground/80 text-sm mb-1.5 block">
                Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground/80 text-sm mb-1.5 block">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="bg-input border-border text-foreground"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-foreground/80 text-sm mb-1.5 block">
                Price (₹)
              </Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground/80 text-sm mb-1.5 block">
                Image URL
              </Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={editActive}
                onCheckedChange={setEditActive}
                data-ocid="admin.products.active.switch"
              />
              <Label className="text-foreground/80 text-sm">Active</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditProduct(null);
                resetForm();
              }}
              className="border-border"
              data-ocid="admin.products.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.products.edit.save_button"
              className="gold-gradient text-primary-foreground"
              onClick={handleEdit}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}{" "}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
