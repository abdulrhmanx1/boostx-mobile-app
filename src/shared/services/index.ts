import { supabase } from '../api/supabase';
import type { 
  UserProfile, HomeBanner, 
  Story, Category, Offer, Product, Partner, Order, Notification 
} from '../types';

// Helper function to write to the audit_logs table
export const logAuditAction = async (
  actorId: string,
  actorRole: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE',
  entityType: string,
  entityId: string,
  oldValue?: any,
  newValue?: any
): Promise<void> => {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: actorId,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Audit Logger] Safe warning: failed to write audit log:', err);
  }
};

// 1. Auth Service
export const authService = {
  getCurrentUser: async () => {
    return await supabase.auth.getUser();
  },
  signUp: async (phone: string, email?: string) => {
    return await supabase.auth.signUp({ phone, email });
  },
  signInWithOtp: async (phone: string) => {
    return await supabase.auth.signInWithOtp({ phone });
  },
  verifyOtp: async (phone: string, token: string) => {
    return await supabase.auth.verifyOtp({ phone, token, type: 'whatsapp' });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  }
};

// 2. User Service
export const userService = {
  getProfile: async (userId: string) => {
    return await supabase.from('user_profiles').select('*').eq('id', userId).single();
  },
  updateProfile: async (userId: string, data: Partial<UserProfile>, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
    const response = await supabase.from('user_profiles').update(data).eq('id', userId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'UPDATE', 'user_profiles', userId, oldVal, data);
    }
    return response;
  }
};

// 3. Partner Service
export const partnerService = {
  list: async () => {
    return await supabase.from('partners').select('*');
  },
  get: async (partnerId: string) => {
    return await supabase.from('partners').select('*').eq('id', partnerId).single();
  },
  create: async (data: Omit<Partner, 'id' | 'created_at'>, actorId: string, actorRole: string) => {
    const response = await supabase.from('partners').insert(data);
    if (!response.error && response.data) {
      const inserted = Array.isArray(response.data) ? response.data[0] : response.data;
      await logAuditAction(actorId, actorRole, 'CREATE', 'partners', inserted.id, null, inserted);
    }
    return response;
  },
  update: async (partnerId: string, data: Partial<Partner>, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('partners').select('*').eq('id', partnerId).single();
    const response = await supabase.from('partners').update(data).eq('id', partnerId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'UPDATE', 'partners', partnerId, oldVal, data);
    }
    return response;
  },
  updateStatus: async (partnerId: string, status: 'approved' | 'rejected', actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('partners').select('*').eq('id', partnerId).single();
    const response = await supabase.from('partners').update({ status }).eq('id', partnerId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'STATUS_CHANGE', 'partners', partnerId, oldVal, { status });
    }
    return response;
  }
};

// 4. Category Service
export const categoryService = {
  list: async () => {
    return await supabase.from('categories').select('*').order('sort_order');
  },
  create: async (data: Omit<Category, 'id'>, actorId: string, actorRole: string) => {
    const response = await supabase.from('categories').insert(data);
    if (!response.error && response.data) {
      const inserted = Array.isArray(response.data) ? response.data[0] : response.data;
      await logAuditAction(actorId, actorRole, 'CREATE', 'categories', inserted.id, null, inserted);
    }
    return response;
  },
  update: async (categoryId: string, data: Partial<Category>, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('categories').select('*').eq('id', categoryId).single();
    const response = await supabase.from('categories').update(data).eq('id', categoryId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'UPDATE', 'categories', categoryId, oldVal, data);
    }
    return response;
  },
  deactivate: async (categoryId: string, actorId: string, actorRole: string) => {
    return await categoryService.update(categoryId, { is_active: false }, actorId, actorRole);
  }
};

// 5. Banner Service
export const bannerService = {
  list: async () => {
    return await supabase.from('home_banners').select('*').order('sort_order');
  },
  create: async (data: Omit<HomeBanner, 'id' | 'created_at'>, actorId: string, actorRole: string) => {
    const response = await supabase.from('home_banners').insert(data);
    if (!response.error && response.data) {
      const inserted = Array.isArray(response.data) ? response.data[0] : response.data;
      await logAuditAction(actorId, actorRole, 'CREATE', 'home_banners', inserted.id, null, inserted);
    }
    return response;
  },
  update: async (bannerId: string, data: Partial<HomeBanner>, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('home_banners').select('*').eq('id', bannerId).single();
    const response = await supabase.from('home_banners').update(data).eq('id', bannerId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'UPDATE', 'home_banners', bannerId, oldVal, data);
    }
    return response;
  },
  deactivate: async (bannerId: string, actorId: string, actorRole: string) => {
    return await bannerService.update(bannerId, { is_active: false }, actorId, actorRole);
  }
};

// 6. Story Service
export const storyService = {
  list: async () => {
    return await supabase.from('stories').select('*').order('created_at');
  },
  create: async (data: Omit<Story, 'id' | 'created_at'>, actorId: string, actorRole: string) => {
    const response = await supabase.from('stories').insert(data);
    if (!response.error && response.data) {
      const inserted = Array.isArray(response.data) ? response.data[0] : response.data;
      await logAuditAction(actorId, actorRole, 'CREATE', 'stories', inserted.id, null, inserted);
    }
    return response;
  },
  update: async (storyId: string, data: Partial<Story>, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('stories').select('*').eq('id', storyId).single();
    const response = await supabase.from('stories').update(data).eq('id', storyId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'UPDATE', 'stories', storyId, oldVal, data);
    }
    return response;
  },
  deactivate: async (storyId: string, actorId: string, actorRole: string) => {
    return await storyService.update(storyId, { is_active: false }, actorId, actorRole);
  }
};

// 7. Offer Service
export const offerService = {
  list: async () => {
    return await supabase.from('offers').select('*').order('created_at');
  },
  create: async (data: Omit<Offer, 'id' | 'created_at'>, actorId: string, actorRole: string) => {
    const response = await supabase.from('offers').insert(data);
    if (!response.error && response.data) {
      const inserted = Array.isArray(response.data) ? response.data[0] : response.data;
      await logAuditAction(actorId, actorRole, 'CREATE', 'offers', inserted.id, null, inserted);
    }
    return response;
  },
  update: async (offerId: string, data: Partial<Offer>, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('offers').select('*').eq('id', offerId).single();
    const response = await supabase.from('offers').update(data).eq('id', offerId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'UPDATE', 'offers', offerId, oldVal, data);
    }
    return response;
  },
  deactivate: async (offerId: string, actorId: string, actorRole: string) => {
    return await offerService.update(offerId, { is_active: false }, actorId, actorRole);
  }
};

// 8. Product Service
export const productService = {
  list: async (partnerId?: string) => {
    let query = supabase.from('partner_items').select('*');
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }
    return await query;
  },
  create: async (data: Omit<Product, 'id' | 'created_at'>, actorId: string, actorRole: string) => {
    const response = await supabase.from('partner_items').insert(data);
    if (!response.error && response.data) {
      const inserted = Array.isArray(response.data) ? response.data[0] : response.data;
      await logAuditAction(actorId, actorRole, 'CREATE', 'partner_items', inserted.id, null, inserted);
    }
    return response;
  },
  update: async (productId: string, data: Partial<Product>, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('partner_items').select('*').eq('id', productId).single();
    const response = await supabase.from('partner_items').update(data).eq('id', productId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'UPDATE', 'partner_items', productId, oldVal, data);
    }
    return response;
  },
  deactivate: async (productId: string, actorId: string, actorRole: string) => {
    return await productService.update(productId, { is_available: false }, actorId, actorRole);
  }
};

// 9. Order Service
export const orderService = {
  list: async (filters?: { customerId?: string; partnerId?: string; status?: string }) => {
    let query = supabase.from('orders').select('*');
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.partnerId) query = query.eq('partner_id', filters.partnerId);
    if (filters?.status) query = query.eq('status', filters.status);
    return await query.order('created_at', { ascending: false });
  },
  create: async (data: Omit<Order, 'id' | 'created_at'>, actorId: string, actorRole: string) => {
    const response = await supabase.from('orders').insert(data);
    if (!response.error && response.data) {
      const inserted = Array.isArray(response.data) ? response.data[0] : response.data;
      await logAuditAction(actorId, actorRole, 'CREATE', 'orders', inserted.id, null, inserted);
    }
    return response;
  },
  updateStatus: async (orderId: string, status: Order['status'], actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('orders').select('*').eq('id', orderId).single();
    const response = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'STATUS_CHANGE', 'orders', orderId, oldVal, { status });
    }
    return response;
  }
};

// 10. Notification Service
export const notificationService = {
  list: async (userId: string) => {
    return await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  },
  create: async (data: Omit<Notification, 'id' | 'created_at'>) => {
    return await supabase.from('notifications').insert(data);
  },
  markAsRead: async (notificationId: string) => {
    return await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  }
};

// 11. Settings Service
export const settingsService = {
  list: async () => {
    return await supabase.from('app_settings').select('*');
  },
  get: async (key: string) => {
    return await supabase.from('app_settings').select('*').eq('key', key).single();
  },
  update: async (key: string, value: string, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('app_settings').select('*').eq('key', key).single();
    const response = await supabase.from('app_settings').update({ value }).eq('key', key);
    if (!response.error) {
      const entityId = oldVal?.id || key;
      await logAuditAction(actorId, actorRole, 'UPDATE', 'app_settings', entityId, oldVal, { value });
    }
    return response;
  },
  listSections: async () => {
    return await supabase.from('home_sections').select('*').order('sort_order');
  },
  updateSectionOrder: async (sectionId: string, sortOrder: number, isActive: boolean, actorId: string, actorRole: string) => {
    const { data: oldVal } = await supabase.from('home_sections').select('*').eq('id', sectionId).single();
    const response = await supabase.from('home_sections').update({ sort_order: sortOrder, is_active: isActive }).eq('id', sectionId);
    if (!response.error) {
      await logAuditAction(actorId, actorRole, 'UPDATE', 'home_sections', sectionId, oldVal, { sort_order: sortOrder, is_active: isActive });
    }
    return response;
  }
};
