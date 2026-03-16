import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../database/repositories/base.repository';
import { IRoleDocument } from '../../database/models/role.model';
import { IPermissionDocument } from '../../database/models/permission.model';
import { FindRoleInput } from './roles.types';

/**
 * Roles Repository
 * Відповідає за доступ до даних ролей та дозволів
 */
export class RolesRepository extends BaseRepository<IRoleDocument> {
  private roleModel: Model<IRoleDocument>;
  private permissionModel: Model<IPermissionDocument>;

  constructor(roleModel: Model<IRoleDocument>, permissionModel: Model<IPermissionDocument>) {
    super(roleModel);
    this.roleModel = roleModel;
    this.permissionModel = permissionModel;
  }

  // ==========================================
  // ROLE METHODS
  // ==========================================

  /**
   * Знайти роль за ID з дозволами
   */
  async findRoleById(input: FindRoleInput): Promise<IRoleDocument | null> {
    const query = this.roleModel.findById(input.id);

    if (input.includePermissions) {
      query.populate('permissions');
    }

    return query.exec();
  }

  /**
   * Знайти роль за назвою
   */
  async findRoleByName(name: string): Promise<IRoleDocument | null> {
    return this.roleModel.findOne({ name: name.toUpperCase(), deleted: false }).exec();
  }

  /**
   * Отримати всі ролі
   */
  async findAllRoles(includePermissions: boolean = false): Promise<IRoleDocument[]> {
    const query = this.roleModel.find({ deleted: false });

    if (includePermissions) {
      query.populate('permissions');
    }

    return query.exec();
  }

  /**
   * Створити роль
   */
  async createRole(name: string, description?: string, permissionIds?: string[]): Promise<IRoleDocument> {
    const role = new this.roleModel({
      name: name.toUpperCase(),
      description,
      permissions: permissionIds?.map((id) => new Types.ObjectId(id)),
    });
    return role.save();
  }

  /**
   * Оновити роль
   */
  async updateRole(id: string | Types.ObjectId, name?: string, description?: string): Promise<IRoleDocument | null> {
    const updateData: any = {};
    if (name) updateData.name = name.toUpperCase();
    if (description !== undefined) updateData.description = description;

    return this.roleModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  /**
   * Призначити дозволи ролі
   */
  async assignPermissions(roleId: string | Types.ObjectId, permissionIds: string[]): Promise<IRoleDocument | null> {
    return this.roleModel
      .findByIdAndUpdate(roleId, { permissions: permissionIds.map((id) => new Types.ObjectId(id)) }, { new: true })
      .populate('permissions')
      .exec();
  }

  /**
   * Додати дозвіл до ролі
   */
  async addPermissionToRole(roleId: string | Types.ObjectId, permissionId: string): Promise<IRoleDocument | null> {
    const role = await this.roleModel.findById(roleId);
    if (!role) return null;

    const permissionObjectId = new Types.ObjectId(permissionId);
    if (!role.permissions?.some((id) => id.equals(permissionObjectId))) {
      role.permissions = role.permissions || [];
      role.permissions.push(permissionObjectId);
      await role.save();
    }

    return (await role.populate('permissions')) as IRoleDocument;
  }

  /**
   * Видалити дозвіл з ролі
   */
  async removePermissionFromRole(roleId: string | Types.ObjectId, permissionId: string): Promise<IRoleDocument | null> {
    const role = await this.roleModel.findById(roleId);
    if (!role) return null;

    role.permissions = role.permissions?.filter((id) => !id.equals(new Types.ObjectId(permissionId)));
    await role.save();

    return (await role.populate('permissions')) as IRoleDocument;
  }

  // ==========================================
  // PERMISSION METHODS
  // ==========================================

  /**
   * Знайти дозвіл за ID
   */
  async findPermissionById(id: string | Types.ObjectId): Promise<IPermissionDocument | null> {
    return this.permissionModel.findById(id).exec();
  }

  /**
   * Знайти дозвіл за назвою
   */
  async findPermissionByName(name: string): Promise<IPermissionDocument | null> {
    return this.permissionModel.findOne({ name: name.toUpperCase(), deleted: false }).exec();
  }

  /**
   * Отримати всі дозволи
   */
  async findAllPermissions(): Promise<IPermissionDocument[]> {
    return this.permissionModel.find({ deleted: false }).exec();
  }

  /**
   * Отримати дозволи по ресурсу
   */
  async findPermissionsByResource(resource: string): Promise<IPermissionDocument[]> {
    return this.permissionModel.find({ resource: resource.toLowerCase(), deleted: false }).exec();
  }

  /**
   * Створити дозвіл
   */
  async createPermission(
    name: string,
    resource: string,
    action: string,
    description?: string,
  ): Promise<IPermissionDocument> {
    const permission = new this.permissionModel({
      name: name.toUpperCase(),
      resource: resource.toLowerCase(),
      action: action.toLowerCase(),
      description,
    });
    return permission.save();
  }

  /**
   * Оновити дозвіл
   */
  async updatePermission(
    id: string | Types.ObjectId,
    name?: string,
    description?: string,
  ): Promise<IPermissionDocument | null> {
    const updateData: any = {};
    if (name) updateData.name = name.toUpperCase();
    if (description !== undefined) updateData.description = description;

    return this.permissionModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  /**
   * Видалити дозвіл
   */
  async deletePermission(id: string | Types.ObjectId): Promise<IPermissionDocument | null> {
    return this.permissionModel.findByIdAndDelete(id).exec();
  }

  /**
   * Перевірити чи існує дозвіл
   */
  async permissionExists(resource: string, action: string): Promise<boolean> {
    const permission = await this.permissionModel.findOne({
      resource: resource.toLowerCase(),
      action: action.toLowerCase(),
      deleted: false,
    });
    return permission !== null;
  }
}

export default RolesRepository;
