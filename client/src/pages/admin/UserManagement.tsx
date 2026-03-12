import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, User } from '@/features/users/usersApi';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/Table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/Dialog';
import { UserForm } from './UserForm';
import { DeleteDialog } from '@/shared/components/DeleteDialog';
import { Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton } from '@/shared/components/IconButton';
import { AdminLayout } from '@/shared/layout/AdminLayout';

export const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersApi.getAll(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteOpen(false);
      toast.success('Користувача видалено');
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.error || 'Помилка видалення');
    },
  });

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleCreate = () => {
    setIsCreateOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    setEditingUser(null);
    setIsCreateOpen(false);
  };

  return (
    <AdminLayout
      title="Користувачі"
      description="Управління користувачами системи"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Додати користувача
          </Button>
        </div>
      </div>

      {/* Фільтри */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Пошук за email..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
          />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.role}
            onChange={(e) =>
              setFilters({ ...filters, role: e.target.value, page: 1 })
            }
          >
            <option value="">Всі ролі</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Таблиця користувачів */}
      <div className="bg-card rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Підтверджено</TableHead>
                <TableHead>Створено</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <p className="text-muted-foreground">
                      Користувачів не знайдено
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✗</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          icon={Eye}
                          variant="icon"
                          onClick={() => setViewingUser(user)}
                          aria-label="Переглянути"
                        />
                        <IconButton
                          icon={Pencil}
                          variant="icon"
                          onClick={() => handleEdit(user)}
                          aria-label="Редагувати"
                        />
                        <IconButton
                          icon={Trash2}
                          variant="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(user)}
                          aria-label="Видалити"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Пагінація */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({ ...filters, page: filters.page - 1 })
            }
            disabled={filters.page === 1}
          >
            Попередня
          </Button>
          <span className="text-sm text-muted-foreground">
            Сторінка {filters.page} з {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setFilters({ ...filters, page: filters.page + 1 })
            }
            disabled={filters.page === data.pagination.totalPages}
          >
            Наступна
          </Button>
        </div>
      )}

      {/* Діалогові вікна */}
      {viewingUser && (
        <Dialog open onOpenChange={() => setViewingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Перегляд користувача</DialogTitle>
              <DialogDescription>
                Детальна інформація про користувача
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <p className="text-sm">{viewingUser.email}</p>
              </div>
              <div>
                <Label>Роль</Label>
                <p className="text-sm capitalize">{viewingUser.role}</p>
              </div>
              <div>
                <Label>Підтверджено</Label>
                <p className="text-sm">
                  {viewingUser.emailVerified ? 'Так' : 'Ні'}
                </p>
              </div>
              <div>
                <Label>Створено</Label>
                <p className="text-sm">
                  {new Date(viewingUser.createdAt).toLocaleDateString('uk-UA')}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewingUser(null)}>
                  Закрити
                </Button>
                <Button onClick={() => { setViewingUser(null); setEditingUser(viewingUser); }}>
                  Редагувати
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editingUser && (
        <Dialog open onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редагування користувача</DialogTitle>
              <DialogDescription>
                Змініть дані користувача та натисніть "Зберегти"
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={editingUser}
              onClose={() => setEditingUser(null)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      )}

      {isCreateOpen && (
        <Dialog open onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Створення користувача</DialogTitle>
              <DialogDescription>
                Заповніть дані для створення нового користувача
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onClose={() => setIsCreateOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      )}

      {isDeleteOpen && (
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={confirmDelete}
          title="Видалити користувача?"
          description={`Ви дійсно хочете видалити користувача ${userToDelete?.email}? Цю дію не можна скасувати.`}
        />
      )}
    </AdminLayout>
  );
};

export default UserManagement;
