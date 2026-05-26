import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('BOOSTX_SUPABASE_URL');
  const localKey = localStorage.getItem('BOOSTX_SUPABASE_ANON_KEY');
  
  const envUrl = import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const url = localUrl || envUrl;
  const anonKey = localKey || envKey;
  
  return { url, anonKey, isOverridden: !!(localUrl && localKey) };
};

const config = getSupabaseConfig();

// Attempt to initialize the real Supabase client
let realSupabase: any = null;
let initError: string | null = null;

if (config.url && config.anonKey) {
  try {
    // Avoid initializing if it's a known mock key or local dummy placeholder
    if (!config.url.includes('mock') && !config.anonKey.includes('mock') && config.url.startsWith('http')) {
      realSupabase = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } else {
      initError = "مفتاح Supabase الحالي هو مفتاح افتراضي (Mock). تم تفعيل وضع المحاكاة الذكي.";
    }
  } catch (e: any) {
    console.error("Supabase Init Error:", e);
    initError = e.message || "فشل تهيئة عميل Supabase.";
  }
} else {
  initError = "عنوان Supabase أو مفتاح Anon Key غير موجودين في الإعدادات. تم تفعيل وضع المحاكاة.";
}

// Interactive Sandbox DB State
const getInitialSandboxData = () => {
  const defaultUsers = [
    { id: '00000000-0000-0000-0000-000000000000', email: 'admin@boostx.sa', role: 'admin', phone: '+966500000000' }
  ];
  const defaultProfiles = [
    { id: '00000000-0000-0000-0000-000000000000', full_name: 'مدير النظام', avatar_url: '' }
  ];
  const defaultPartners: any[] = [
    { id: 'p1', name: 'مطعم البيك', biz_type: 'restaurant', rating: 4.9, reviews: '١٢.٥ ألف تقييم', distance: '١.٢ كم', time: '١٥-٢٥ دقيقة', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', sponsored: true, is_active: true, city: 'الرياض', district: 'الملقا', category: 'مطاعم' },
    { id: 'p2', name: 'صيدلية النهدي', biz_type: 'pharmacy', rating: 4.8, reviews: '٥.٢ ألف تقييم', distance: '٢.٥ كم', time: '١٠-٢٠ دقيقة', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80', sponsored: false, is_active: true, city: 'الرياض', district: 'الياسمين', category: 'صيدليات' },
    { id: 'p3', name: 'أسواق التميمي', biz_type: 'grocery', rating: 4.7, reviews: '٨.١ ألف تقييم', distance: '٣.١ كم', time: '٢٠-٣٠ دقيقة', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', sponsored: false, is_active: true, city: 'الرياض', district: 'العليا', category: 'تموينات' },
    { id: 'p4', name: 'الركن الذهبي للطباعة', biz_type: 'services', rating: 4.9, reviews: '٩٠٠ تقييم', distance: '١.٨ كم', time: '٤٥-٦٠ دقيقة', image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&q=80', sponsored: true, is_active: true, city: 'الرياض', district: 'الملقا', category: 'مطابع' }
  ];
  const defaultDocuments: any[] = [];
  const defaultApplications = [
    {
      id: 'app-seed-1',
      owner_id: '00000000-0000-0000-0000-000000000000',
      biz_type: 'restaurant',
      business_name: 'مطعم السعادة البخاري',
      commercial_name: 'شركة مطاعم السعادة المحدودة',
      phone_number: '+966512345678',
      email: 'contact@saadahfoods.com',
      country: 'SA',
      city: 'الرياض',
      district: 'حي العليا',
      location_latitude: 24.7136,
      location_longitude: 46.6753,
      cr_document_url: 'https://storage.boostx.app/documents/cr_saadah.pdf',
      owner_id_url: 'https://storage.boostx.app/documents/id_saadah.pdf',
      vat_certificate_url: 'https://storage.boostx.app/documents/vat_saadah.pdf',
      municipal_license_url: 'https://storage.boostx.app/documents/license_saadah.pdf',
      iban_certificate_url: 'https://storage.boostx.app/documents/iban_saadah.pdf',
      business_logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=60',
      business_cover_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      rejection_notes: null,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
    }
  ];

  const getOrSet = (key: string, defaultVal: any) => {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(val);
  };

  const defaultDriverApps = [
    {
      id: 'drv-seed-1',
      owner_id: 'drv_usr_1',
      full_name: 'أحمد المندوب السريع',
      phone_number: '+966522222222',
      vehicle_type: 'سيارة (Car)',
      license_plate: 'أ ب ج 1 2 3 4',
      license_url: 'https://storage.boostx.app/sandbox-documents/license_demo.pdf',
      registration_url: 'https://storage.boostx.app/sandbox-documents/license_demo.pdf',
      id_url: 'https://storage.boostx.app/sandbox-documents/id_demo.pdf',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];

  const defaultTechApps = [
    {
      id: 'tech-seed-1',
      owner_id: 'tech_usr_1',
      full_name: 'خالد السباك الماهر',
      phone_number: '+966533333333',
      specialty: 'سباكة (Plumbing)',
      experience: '5 سنوات',
      license_url: 'https://storage.boostx.app/sandbox-documents/license_demo.pdf',
      id_url: 'https://storage.boostx.app/sandbox-documents/id_demo.pdf',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ];

  const defaultOrders = [
    {
      id: 'order-101',
      customer_id: 'usr_cust_1',
      customer_name: 'سليمان المطيري',
      customer_phone: '+966599999999',
      driver_id: 'drv_usr_1',
      driver_name: 'أحمد محمد',
      driver_phone: '+966522222222',
      driver_vehicle: 'تويوتا كامري - أ ب ج ١٢٣',
      pickup_location: 'برجر النيون الزجاجي - حي العليا',
      dropoff_location: 'حي الياسمين، طريق الملك عبدالعزيز - الرياض',
      pickup_latitude: 24.7136,
      pickup_longitude: 46.6753,
      dropoff_latitude: 24.7885,
      dropoff_longitude: 46.6582,
      status: 'في الطريق للاستلام',
      created_at: new Date().toISOString()
    }
  ];

  const defaultLocations = [
    {
      driver_id: 'drv_usr_1',
      order_id: 'order-101',
      latitude: 24.7136,
      longitude: 46.6753,
      heading: 45,
      speed: 35,
      updated_at: new Date().toISOString()
    }
  ];

  const defaultChats = [
    {
      id: 'chat-101',
      chat_id: 'chat-101', // Legacy compatibility
      chat_type: 'order_driver',
      order_id: 'order-101',
      customer_id: 'usr_cust_1',
      driver_id: 'drv_usr_1',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'chat-102',
      chat_id: 'chat-102',
      chat_type: 'order_partner',
      order_id: 'order-102',
      customer_id: 'usr_cust_1',
      partner_id: 'app-seed-1',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'chat-103',
      chat_id: 'chat-103',
      chat_type: 'booking_technician',
      order_id: 'book-101',
      customer_id: 'usr_cust_1',
      technician_id: 'tech_usr_1',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'chat-104',
      chat_id: 'chat-104',
      chat_type: 'support_ticket',
      support_ticket_id: 'ticket-202',
      customer_id: 'usr_cust_1',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const defaultMessages = [
    {
      id: 'msg-1',
      chat_id: 'chat-101',
      order_id: 'order-101',
      sender_id: 'drv_usr_1',
      sender_role: 'driver',
      message_text: 'السلام عليكم، أنا استلمت الطلب وبحرك الحين لموقعك يا غالي 👍',
      message_type: 'text',
      is_read: false,
      created_at: new Date(Date.now() - 60000 * 5).toISOString()
    },
    {
      id: 'msg-2',
      chat_id: 'chat-101',
      order_id: 'order-101',
      sender_id: 'usr_cust_1',
      sender_role: 'customer',
      message_text: 'وعليكم السلام، حياك ربي. أنا عند الفيلا المقابلة للمسجد مباشرة.',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 60000 * 4).toISOString()
    },
    {
      id: 'msg-3',
      chat_id: 'chat-102',
      order_id: 'order-102',
      sender_id: 'app-seed-1',
      sender_role: 'partner',
      message_text: 'مرحباً بك عميلنا العزيز، تم استلام طلبك وجاري تجهيزه طازجاً في المطبخ الآن! 🍔🍳',
      message_type: 'text',
      is_read: false,
      created_at: new Date(Date.now() - 60000 * 10).toISOString()
    },
    {
      id: 'msg-4',
      chat_id: 'chat-103',
      order_id: 'book-101',
      sender_id: 'tech_usr_1',
      sender_role: 'technician',
      message_text: 'مرحباً يا فندم، أنا الفني المسؤول عن صيانة جهاز التكييف الخاص بك. هل يناسبك الحضور اليوم الساعة ٤ عصراً؟ 🛠️💨',
      message_type: 'text',
      is_read: false,
      created_at: new Date(Date.now() - 60000 * 30).toISOString()
    },
    {
      id: 'msg-5',
      chat_id: 'chat-104',
      sender_id: 'system',
      sender_role: 'system',
      message_text: 'تم فتح تذكرة دعم فني جديدة رقم #TKT-202. جاري تحويلك لأقرب موظف دعم متاح لمساعدتك...',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 60000 * 20).toISOString()
    }
  ];

  const defaultDeliveryTasks = [
    {
      id: 'task-101',
      order_id: 'order-101',
      driver_id: 'drv_usr_1',
      status: 'heading_to_pickup',
      pickup_address: 'برجر النيون الزجاجي - حي العليا',
      pickup_latitude: 24.7136,
      pickup_longitude: 46.6753,
      dropoff_address: 'حي الياسمين، طريق الملك عبدالعزيز - الرياض',
      dropoff_latitude: 24.7885,
      dropoff_longitude: 46.6582,
      customer_name: 'سليمان المطيري',
      customer_phone: '+966599999999',
      fee: 18,
      estimated_time: 15,
      proof_of_delivery_url: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 'task-102',
      order_id: 'order-102',
      driver_id: null,
      status: 'assigned',
      pickup_address: 'شاورما غصن التوت - السليمانية',
      pickup_latitude: 24.7000,
      pickup_longitude: 46.6800,
      dropoff_address: 'حي النرجس، الرياض',
      dropoff_latitude: 24.8200,
      dropoff_longitude: 46.6400,
      customer_name: 'عبدالله العتيبي',
      customer_phone: '+966511111111',
      fee: 22,
      estimated_time: 25,
      proof_of_delivery_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'task-103',
      order_id: 'order-103',
      driver_id: 'drv_usr_1',
      status: 'delivered',
      pickup_address: 'عصائر الطبيعة الفريش - التحلية',
      pickup_latitude: 24.6950,
      pickup_longitude: 46.6850,
      dropoff_address: 'حي الملقا، الرياض',
      dropoff_latitude: 24.7950,
      dropoff_longitude: 46.6250,
      customer_name: 'محمد الدوسري',
      customer_phone: '+966533333333',
      fee: 15,
      estimated_time: 0,
      proof_of_delivery_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const defaultStatusHistory = [
    {
      id: 'hist-1',
      task_id: 'task-101',
      status: 'assigned',
      updated_by: 'admin',
      notes: 'تم إسناد التوصيل للمندوب أحمد محمد',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'hist-2',
      task_id: 'task-101',
      status: 'accepted',
      updated_by: 'drv_usr_1',
      notes: 'قبل المندوب المهمة وهو يتجه للموقع',
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  const defaultAuditLogs: any[] = [];

  const defaultWallets = [
    { id: 'w-cust-1', user_id: 'usr_cust_1', balance: 250.0, cashback: 45.50, loyalty_points: 1250, refunds_total: 0.0 },
    { id: 'w-part-1', user_id: 'app-seed-1', balance: 14250.0, cashback: 0.0, loyalty_points: 0, refunds_total: 0.0 },
    { id: 'w-driv-1', user_id: 'drv_usr_1', balance: 450.0, cashback: 0.0, loyalty_points: 0, refunds_total: 0.0 }
  ];

  const defaultWalletTransactions = [
    { id: 'wt-1', wallet_id: 'w-cust-1', amount: 15.0, type: 'cashback', description: 'استرداد نقدي ترويجي (BOOSTX)', created_at: new Date().toISOString() },
    { id: 'wt-2', wallet_id: 'w-cust-1', amount: 250.0, type: 'charge', description: 'شحن رصيد المحفظة رقمياً', created_at: new Date().toISOString() }
  ];

  const defaultPayments = [
    { id: 'pay-1', order_id: 'order-101', customer_id: 'usr_cust_1', partner_id: 'app-seed-1', amount: 95.0, delivery_fee: 12.0, platform_fee: 9.5, partner_earning: 73.5, driver_earning: 12.0, payment_method: 'Apple Pay', payment_status: 'success', created_at: new Date().toISOString() }
  ];

  const defaultPayouts = [
    { id: 'po-1', user_id: 'app-seed-1', amount: 8250.0, payment_method: 'Bank Transfer', destination_account: 'SA4590000010992384732912', status: 'completed', created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), processed_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() }
  ];

  const defaultRefunds: any[] = [];
  const defaultInvoices = [
    { id: 'inv-1', order_id: 'order-101', payment_id: 'pay-1', invoice_number: 'INV-2026-0001', partner_id: 'app-seed-1', customer_id: 'usr_cust_1', subtotal: 83.0, tax_amount: 12.0, total_amount: 95.0, created_at: new Date().toISOString() }
  ];

  const defaultCommissionSettings = [
    { id: 'cs-1', country: 'SA', city: 'الرياض', commission_percentage: 10, driver_share_percentage: 100, updated_at: new Date().toISOString() }
  ];

  const defaultTickets = [
    {
      id: 'TKT-202',
      customer_id: 'usr_cust_1',
      customer_name: 'سليمان المطيري',
      order_id: 'order-101',
      issue_type: 'تأخير التوصيل',
      title: 'تأخر المندوب في تسليم الطلب الحار',
      description: 'الطلب متأخر لأكثر من ٤٠ دقيقة والوجبة باردة بالكامل ولم تصلني بعد.',
      status: 'open',
      priority: 'high',
      assigned_agent_id: null,
      attachment_url: '',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'TKT-203',
      customer_id: 'usr_cust_1',
      customer_name: 'سليمان المطيري',
      order_id: null,
      issue_type: 'مشكلة في الدفع',
      title: 'خصم مكرر من بطاقة مدى',
      description: 'تم سحب المبلغ مرتين من حسابي المالي في المحاولة الثانية بالرغم من رفض الأولى.',
      status: 'in_review',
      priority: 'medium',
      assigned_agent_id: 'agent-1',
      attachment_url: '',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const defaultSupportMessages = [
    {
      id: 'smsg-1',
      ticket_id: 'TKT-202',
      sender_id: 'system',
      sender_role: 'system',
      sender_name: 'النظام الآلي',
      message_text: 'تم فتح تذكرة دعم فني جديدة رقم #TKT-202 بنجاح. جاري تحويلك لأقرب موظف دعم متاح لمساعدتك...',
      message_type: 'text',
      attachment_url: '',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'smsg-2',
      ticket_id: 'TKT-202',
      sender_id: 'usr_cust_1',
      sender_role: 'customer',
      sender_name: 'سليمان المطيري',
      message_text: 'يا هلا، الطلب متأخر والمندوب لا يجيب على الاتصالات وكاتب إنه في الطريق من ساعة!',
      message_type: 'text',
      attachment_url: '',
      created_at: new Date(Date.now() - 3500000).toISOString()
    }
  ];

  const defaultDisputes = [
    {
      id: 'DISP-301',
      ticket_id: 'TKT-202',
      order_id: 'order-101',
      customer_id: 'usr_cust_1',
      partner_id: 'app-seed-1',
      driver_id: 'drv_usr_1',
      technician_id: null,
      complainant_role: 'customer',
      defendant_role: 'partner',
      reason: 'العميل يطالب باسترجاع المبلغ بالكامل لأن الوجبة وصلت تالفة وباردة، والشريك يدعي أن التأخير بسبب شركة التوصيل والطلب خرج بحالة ممتازة.',
      amount: 95.0,
      status: 'opened',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const defaultDisputeEvidence = [
    {
      id: 'ev-1',
      dispute_id: 'DISP-301',
      submitter_id: 'usr_cust_1',
      submitter_role: 'customer',
      evidence_text: 'صورة من الوجبة المحروقة والباردة بعد الاستلام مباشرة.',
      file_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 3300000).toISOString()
    }
  ];

  const defaultRefundRequests = [
    {
      id: 'ref-req-101',
      order_id: 'order-101',
      customer_id: 'usr_cust_1',
      amount: 95.0,
      reason: 'الوجبة وصلت تالفة تماماً واللحم غير ناضج ومحترق.',
      status: 'pending',
      evidence_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const defaultAdminActions = [
    {
      id: 'act-1',
      actor_id: 'admin_usr_1',
      actor_name: 'المدير العام',
      action: 'REQUEST_EVIDENCE',
      ticket_id: 'TKT-202',
      dispute_id: 'DISP-301',
      refund_request_id: 'ref-req-101',
      decision: 'تم طلب إرفاق فواتير وصورة للتأكد من حالة الطعام من الطرفين الشريك والمندوب.',
      reason: 'التحقق من المسؤول عن التلف المذكور.',
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  const defaultAdCampaigns = [
    {
      id: 'ad-camp-1',
      partner_id: 'p1',
      campaign_type: 'sponsored_story',
      tagline: 'وجبات البروست التنافسية الحارة الآن! 🔥',
      image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days
      target_audience: 'all',
      status: 'approved',
      placement: 'stories',
      budget: 250,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      partner_name: 'مطعم البيك',
      partner_logo: '🍗'
    },
    {
      id: 'ad-camp-2',
      partner_id: 'p2',
      campaign_type: 'sponsored_story',
      tagline: 'خصم ٢٠٪ على جميع مستحضرات التجميل! 💅',
      image_url: 'https://images.unsplash.com/photo-1607619056574-7b8d304a3b6f?w=600&q=80',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      target_audience: 'all',
      status: 'approved',
      placement: 'stories',
      budget: 150,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      partner_name: 'صيدلية النهدي',
      partner_logo: '💊'
    },
    {
      id: 'ad-camp-3',
      partner_id: 'p1',
      campaign_type: 'sponsored_banner',
      title: 'عروض الملقا الكبرى 🍕',
      tagline: 'احصل على وجبتين بسعر واحدة من المتاجر المشاركة اليوم فقط',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      target_audience: 'all',
      status: 'approved',
      placement: 'banners',
      budget: 500,
      created_at: new Date().toISOString(),
      partner_name: 'مطعم البيك',
      partner_logo: '🍗',
      color: 'linear-gradient(135deg, #701a75 0%, #1e1b4b 100%)'
    },
    {
      id: 'ad-camp-4',
      partner_id: 'tech-seed-1',
      campaign_type: 'sponsored_banner',
      title: 'خدمات الصيانة الفورية ⚡',
      tagline: 'أفضل الحرفيين والسباكين المعتمدين حولك بخدمة مضمونة وضمان ٣٠ يوم',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      target_audience: 'all',
      status: 'approved',
      placement: 'banners',
      budget: 300,
      created_at: new Date().toISOString(),
      partner_name: 'سباك الرياض',
      partner_logo: '🛠️',
      color: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'
    },
    {
      id: 'ad-camp-5',
      partner_id: 'p2',
      campaign_type: 'sponsored_banner',
      title: 'صيدليتك في بيتك 💊',
      tagline: 'اطلب أدويتك ومستلزماتك الطبية وتصلك خلال ١٥ دقيقة كحد أقصى',
      image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      target_audience: 'all',
      status: 'approved',
      placement: 'banners',
      budget: 400,
      created_at: new Date().toISOString(),
      partner_name: 'صيدلية النهدي',
      partner_logo: '💊',
      color: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)'
    }
  ];

  const defaultAdAnalytics = [
    { id: 'an-1', campaign_id: 'ad-camp-1', impressions: 3200, clicks: 512, conversions: 12 },
    { id: 'an-2', campaign_id: 'ad-camp-2', impressions: 1890, clicks: 245, conversions: 5 }
  ];


  return {
    users: getOrSet('BX_SANDBOX_USERS', defaultUsers),
    profiles: getOrSet('BX_SANDBOX_PROFILES', defaultProfiles),
    partners: getOrSet('BX_SANDBOX_PARTNERS', defaultPartners),
    documents: getOrSet('BX_SANDBOX_DOCUMENTS', defaultDocuments),
    applications: getOrSet('BX_SANDBOX_APPLICATIONS', defaultApplications),
    driver_applications: getOrSet('BX_SANDBOX_DRIVER_APPLICATIONS', defaultDriverApps),
    technician_applications: getOrSet('BX_SANDBOX_TECHNICIAN_APPLICATIONS', defaultTechApps),
    orders: getOrSet('BX_SANDBOX_ORDERS', defaultOrders),
    driver_locations: getOrSet('BX_SANDBOX_DRIVER_LOCATIONS', defaultLocations),
    chats: getOrSet('BX_SANDBOX_CHATS', defaultChats),
    messages: getOrSet('BX_SANDBOX_MESSAGES', defaultMessages),
    delivery_tasks: getOrSet('BX_SANDBOX_DELIVERY_TASKS', defaultDeliveryTasks),
    delivery_status_history: getOrSet('BX_SANDBOX_DELIVERY_STATUS_HISTORY', defaultStatusHistory),
    audit_logs: getOrSet('BX_SANDBOX_AUDIT_LOGS', defaultAuditLogs),
    wallets: getOrSet('BX_SANDBOX_WALLETS', defaultWallets),
    wallet_transactions: getOrSet('BX_SANDBOX_WALLET_TRANSACTIONS', defaultWalletTransactions),
    payments: getOrSet('BX_SANDBOX_PAYMENTS', defaultPayments),
    payouts: getOrSet('BX_SANDBOX_PAYOUTS', defaultPayouts),
    refunds: getOrSet('BX_SANDBOX_REFUNDS', defaultRefunds),
    invoices: getOrSet('BX_SANDBOX_INVOICES', defaultInvoices),
    commission_settings: getOrSet('BX_SANDBOX_COMMISSION_SETTINGS', defaultCommissionSettings),
    reported_messages: getOrSet('BX_SANDBOX_REPORTED_MESSAGES', []),
    support_tickets: getOrSet('BX_SANDBOX_SUPPORT_TICKETS', defaultTickets),
    support_messages: getOrSet('BX_SANDBOX_SUPPORT_MESSAGES', defaultSupportMessages),
    disputes: getOrSet('BX_SANDBOX_DISPUTES', defaultDisputes),
    dispute_evidence: getOrSet('BX_SANDBOX_DISPUTE_EVIDENCE', defaultDisputeEvidence),
    refund_requests: getOrSet('BX_SANDBOX_REFUND_REQUESTS', defaultRefundRequests),
    admin_actions: getOrSet('BX_SANDBOX_ADMIN_ACTIONS', defaultAdminActions),
    ad_campaigns: getOrSet('BX_SANDBOX_AD_CAMPAIGNS', defaultAdCampaigns),
    ad_analytics: getOrSet('BX_SANDBOX_AD_ANALYTICS', defaultAdAnalytics),
    favorites: getOrSet('BX_SANDBOX_FAVORITES', [
      { id: 1, user_id: 'usr_cust_1', partner_id: 'p1', created_at: new Date().toISOString() },
      { id: 2, user_id: 'usr_cust_1', partner_id: 'p2', created_at: new Date().toISOString() }
    ]),
    order_tracking: getOrSet('BX_SANDBOX_ORDER_TRACKING', [
      { id: 'track-101', order_id: 'order-101', status: 'في الطريق للاستلام', latitude: 24.7136, longitude: 46.6753, eta: 15, updated_at: new Date().toISOString() }
    ]),
    technician_locations: getOrSet('BX_SANDBOX_TECHNICIAN_LOCATIONS', [
      { id: 'tech-loc-1', technician_id: 'tech_usr_1', latitude: 24.7136, longitude: 46.6753, updated_at: new Date().toISOString() }
    ]),
    customer_addresses: getOrSet('BX_SANDBOX_CUSTOMER_ADDRESSES', [
      { id: 'addr-1', customer_id: 'usr_cust_1', name: 'المنزل العليا', address: 'حي العليا، الرياض، السعودية', latitude: 24.7136, longitude: 46.6753, is_default: true, created_at: new Date().toISOString() }
    ]),
    customer_contacts: getOrSet('BX_SANDBOX_CUSTOMER_CONTACTS', [
      { id: 'cont-1', customer_id: 'usr_cust_1', full_name: 'عبدالعزيز الحربي', phone_number: '+966 50 123 4567', relation: 'self', created_at: new Date().toISOString() }
    ]),
    notifications: getOrSet('BX_SANDBOX_NOTIFICATIONS', [
      { id: 'notif-1', user_id: 'usr_cust_1', type: 'order', title: 'تم تأكيد طلبك 🍗', body: 'مطعم البيك يقوم بتجهيز وجبتك العائلية الحارة الآن طازجة!', image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&q=80', target_route: 'order-tracking', is_sponsored: false, created_at: new Date(Date.now() - 3600000).toISOString(), read: false },
      { id: 'notif-2', user_id: 'usr_cust_1', type: 'offer', title: 'خصم فلاش ٥٠٪ حصري لك! 🔥', body: 'خصم ٥٠٪ لفيتامين سي فوار من صيدلية النهدي لفترة محدودة اليوم!', image_url: 'https://images.unsplash.com/photo-1616679911721-fe6eec12f74b?w=300&q=80', target_route: 'offer-details', is_sponsored: true, created_at: new Date(Date.now() - 7200000).toISOString(), read: true },
      { id: 'notif-3', user_id: 'usr_cust_1', type: 'service', title: 'تم قبول طلب الصيانة المنزلية 🛠️', body: 'تم قبول طلب السباكة الخاص بك وتعيين الفني خالد السريع.', image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&q=80', target_route: 'technician-booking', is_sponsored: false, created_at: new Date(Date.now() - 86400000).toISOString(), read: true }
    ]),
    notification_reads: getOrSet('BX_SANDBOX_NOTIFICATION_READS', []),
    notification_campaigns: getOrSet('BX_SANDBOX_NOTIFICATION_CAMPAIGNS', [
      { id: 'camp-1', city: 'الرياض', categories: 'food', target_audience: 'all', sponsored_by: 'مطعم البيك', expires_at: new Date(Date.now() + 86400000).toISOString() }
    ]),
    user_notification_preferences: getOrSet('BX_SANDBOX_USER_NOTIFICATION_PREFERENCES', [
      { user_id: 'usr_cust_1', order_updates: true, promos: true, nearby: true, sponsored: true, sound_vibe: true }
    ]),
    sponsored_products: getOrSet('BX_SANDBOX_SPONSORED_PRODUCTS', [
      {
        id: 'sp-1',
        title: 'وجبة دبل نيون برجر بالجبنة الذائبة 🍔',
        store_name: 'مطعم نيون برجر الرواد',
        store_logo: '🍔',
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
        old_price: 48.00,
        new_price: 24.00,
        discount_percent: 50,
        rating: 4.9,
        is_active: true,
        expires_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        is_sponsored: true,
        sponsored_by: 'نيون برجر',
        description: 'قطعتين من لحم الأنجوس الفاخر مع جبنة تشيدر ذائبة وصوص نيون السري الخاص داخل خبز البريوش الطازج.',
        delivery_time: '١٥-٢٠ دقيقة',
        images: [
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
          'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80'
        ]
      },
      {
        id: 'sp-2',
        title: 'سماعة رأس بلوتوث مضيئة للألعاب 🎧',
        store_name: 'إلكترونيات الرياض تك',
        store_logo: '⚡',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        old_price: 180.00,
        new_price: 90.00,
        discount_percent: 50,
        rating: 4.8,
        is_active: true,
        expires_at: new Date(Date.now() + 86400000 * 5).toISOString(),
        is_sponsored: true,
        sponsored_by: 'الرياض تك',
        description: 'سماعة ألعاب احترافية بصوت محيطي 7.1 وإضاءة RGB مذهلة مع ميكروفون عازل للضوضاء.',
        delivery_time: '٢٠-٣٠ دقيقة',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
        ]
      },
      {
        id: 'sp-3',
        title: 'عطر الفخامة العربي العود الأزرق 🧴',
        store_name: 'أطياب الشرق للروائح',
        store_logo: '✨',
        image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&q=80',
        old_price: 350.00,
        new_price: 140.00,
        discount_percent: 60,
        rating: 4.9,
        is_active: true,
        expires_at: new Date(Date.now() + 86400000 * 2).toISOString(),
        is_sponsored: true,
        sponsored_by: 'أطياب الشرق',
        description: 'مزيج فاخر من العود الكمبودي النادر ودهن الورد والمسك لثبات يدوم لأكثر من ٤٨ ساعة متواصلة.',
        delivery_time: '١٢-١٥ دقيقة',
        images: [
          'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&q=80'
        ]
      },
      {
        id: 'sp-4',
        title: 'خلاط فواكه محمول لاسلكي ذكي 🍹',
        store_name: 'سوبرماركت التميمي الرواد',
        store_logo: '🍏',
        image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80',
        old_price: 120.00,
        new_price: 60.00,
        discount_percent: 50,
        rating: 4.7,
        is_active: true,
        expires_at: new Date(Date.now() + 86400000 * 4).toISOString(),
        is_sponsored: true,
        sponsored_by: 'التميمي',
        description: 'خلاط فواكه وسوائل رياضي قابل لإعادة الشحن عبر USB، مثالي لتحضير البروتين والعصائر الطازجة بالخارج.',
        delivery_time: '٢٥-٣٥ دقيقة',
        images: [
          'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80'
        ]
      }
    ]),
    products: getOrSet('BX_SANDBOX_PRODUCTS', [
      { id: 101, partner_id: 'p1', name: 'وجبة دجاج البيك ٤ قطع', desc: 'وجبة دجاج مقرمش شهيرة تقدم مع البطاطا المقلية وصلصة الثوم والخبز.', price: '٢٢ ر.س', rawPrice: 22, time: '١٥ دقيقة', category: 'best', image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80' },
      { id: 102, partner_id: 'p1', name: 'ساندوتش فيليه سمك حراق', desc: 'فيليه سمك مقرمش مع الخس والمايونيز والصلصة الحارة الفاخرة.', price: '١٤ ر.س', rawPrice: 14, time: '١٢ دقيقة', category: 'meals', image_url: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&q=80' },
      { id: 103, partner_id: 'p1', name: 'بطاطس مقلية بالجبنة والبهارات', desc: 'أصابع بطاطس مقرمشة مغطاة بصلصة الجبنة الغنية والتوابل السعودية الفريدة.', price: '١٠ ر.س', rawPrice: 10, time: '٨ دقائق', category: 'sides', image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80' },
      { id: 201, partner_id: 'p2', name: 'فيتامين سي فوار ١٠٠٠ ملغ', desc: 'مكمل غذائي يساعد على تعزيز المناعة وتقليل التعب اليومي.', price: '١٨ ر.س', rawPrice: 18, time: '١٠ دقائق', category: 'best', image_url: 'https://images.unsplash.com/photo-1616679911721-fe6eec12f74b?w=600&q=80' },
      { id: 202, partner_id: 'p2', name: 'بانادول اكسترا ٤٨ قرص', desc: 'مسكن سريع ومؤثر للآلام البسيطة والمتوسطة كالصداع وآلام الأسنان.', price: '٢٤ ر.س', rawPrice: 24, time: '١٠ دقائق', category: 'best', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80' }
    ]),
    categories: getOrSet('BX_SANDBOX_CATEGORIES', [
      { id: 'food', name: 'مطاعم', icon: 'Utensils', bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', is_active: true },
      { id: 'pharmacy', name: 'صيدليات', icon: 'Pill', bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', is_active: true },
      { id: 'supermarket', name: 'تموينات', icon: 'ShoppingCart', bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', is_active: true },
      { id: 'agency', name: 'دعاية وإعلان', icon: 'Megaphone', bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', is_active: true },
      { id: 'print', name: 'مطابع', icon: 'Printer', bg: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', is_active: true },
      { id: 'flowers', name: 'هدايا وورد', icon: 'Gift', bg: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', is_active: true },
      { id: 'craftsman', name: 'صنايعية', icon: 'Hammer', bg: 'rgba(107, 114, 128, 0.12)', color: '#a8a29e', is_active: true },
      { id: 'home_services', name: 'خدمات منزلية', icon: 'HomeIcon', bg: 'rgba(20, 184, 166, 0.12)', color: '#14B8A6', is_active: true }
    ]),
    carts: getOrSet('BX_SANDBOX_CARTS', []),
    cart_items: getOrSet('BX_SANDBOX_CART_ITEMS', []),
    order_items: getOrSet('BX_SANDBOX_ORDER_ITEMS', []),
    order_status_history: getOrSet('BX_SANDBOX_ORDER_STATUS_HISTORY', [])
  };
};

const sandboxData = getInitialSandboxData();

const saveSandboxData = () => {
  localStorage.setItem('BX_SANDBOX_USERS', JSON.stringify(sandboxData.users));
  localStorage.setItem('BX_SANDBOX_PROFILES', JSON.stringify(sandboxData.profiles));
  localStorage.setItem('BX_SANDBOX_PARTNERS', JSON.stringify(sandboxData.partners));
  localStorage.setItem('BX_SANDBOX_DOCUMENTS', JSON.stringify(sandboxData.documents));
  localStorage.setItem('BX_SANDBOX_APPLICATIONS', JSON.stringify(sandboxData.applications));
  localStorage.setItem('BX_SANDBOX_DRIVER_APPLICATIONS', JSON.stringify(sandboxData.driver_applications));
  localStorage.setItem('BX_SANDBOX_TECHNICIAN_APPLICATIONS', JSON.stringify(sandboxData.technician_applications));
  localStorage.setItem('BX_SANDBOX_ORDERS', JSON.stringify(sandboxData.orders));
  localStorage.setItem('BX_SANDBOX_DRIVER_LOCATIONS', JSON.stringify(sandboxData.driver_locations));
  localStorage.setItem('BX_SANDBOX_CHATS', JSON.stringify(sandboxData.chats));
  localStorage.setItem('BX_SANDBOX_MESSAGES', JSON.stringify(sandboxData.messages));
  localStorage.setItem('BX_SANDBOX_DELIVERY_TASKS', JSON.stringify(sandboxData.delivery_tasks));
  localStorage.setItem('BX_SANDBOX_DELIVERY_STATUS_HISTORY', JSON.stringify(sandboxData.delivery_status_history));
  localStorage.setItem('BX_SANDBOX_AUDIT_LOGS', JSON.stringify(sandboxData.audit_logs));
  localStorage.setItem('BX_SANDBOX_WALLETS', JSON.stringify(sandboxData.wallets));
  localStorage.setItem('BX_SANDBOX_WALLET_TRANSACTIONS', JSON.stringify(sandboxData.wallet_transactions));
  localStorage.setItem('BX_SANDBOX_PAYMENTS', JSON.stringify(sandboxData.payments));
  localStorage.setItem('BX_SANDBOX_PAYOUTS', JSON.stringify(sandboxData.payouts));
  localStorage.setItem('BX_SANDBOX_REFUNDS', JSON.stringify(sandboxData.refunds));
  localStorage.setItem('BX_SANDBOX_INVOICES', JSON.stringify(sandboxData.invoices));
  localStorage.setItem('BX_SANDBOX_COMMISSION_SETTINGS', JSON.stringify(sandboxData.commission_settings));
  localStorage.setItem('BX_SANDBOX_REPORTED_MESSAGES', JSON.stringify(sandboxData.reported_messages));
  localStorage.setItem('BX_SANDBOX_SUPPORT_TICKETS', JSON.stringify(sandboxData.support_tickets));
  localStorage.setItem('BX_SANDBOX_SUPPORT_MESSAGES', JSON.stringify(sandboxData.support_messages));
  localStorage.setItem('BX_SANDBOX_DISPUTES', JSON.stringify(sandboxData.disputes));
  localStorage.setItem('BX_SANDBOX_DISPUTE_EVIDENCE', JSON.stringify(sandboxData.dispute_evidence));
  localStorage.setItem('BX_SANDBOX_REFUND_REQUESTS', JSON.stringify(sandboxData.refund_requests));
  localStorage.setItem('BX_SANDBOX_ADMIN_ACTIONS', JSON.stringify(sandboxData.admin_actions));
  localStorage.setItem('BX_SANDBOX_AD_CAMPAIGNS', JSON.stringify(sandboxData.ad_campaigns));
  localStorage.setItem('BX_SANDBOX_AD_ANALYTICS', JSON.stringify(sandboxData.ad_analytics));
  localStorage.setItem('BX_SANDBOX_FAVORITES', JSON.stringify((sandboxData as any).favorites));
  localStorage.setItem('BX_SANDBOX_ORDER_TRACKING', JSON.stringify((sandboxData as any).order_tracking));
  localStorage.setItem('BX_SANDBOX_TECHNICIAN_LOCATIONS', JSON.stringify((sandboxData as any).technician_locations));
  localStorage.setItem('BX_SANDBOX_CUSTOMER_ADDRESSES', JSON.stringify((sandboxData as any).customer_addresses));
  localStorage.setItem('BX_SANDBOX_CUSTOMER_CONTACTS', JSON.stringify((sandboxData as any).customer_contacts));
  localStorage.setItem('BX_SANDBOX_NOTIFICATIONS', JSON.stringify((sandboxData as any).notifications));
  localStorage.setItem('BX_SANDBOX_NOTIFICATION_READS', JSON.stringify((sandboxData as any).notification_reads));
  localStorage.setItem('BX_SANDBOX_NOTIFICATION_CAMPAIGNS', JSON.stringify((sandboxData as any).notification_campaigns));
  localStorage.setItem('BX_SANDBOX_USER_NOTIFICATION_PREFERENCES', JSON.stringify((sandboxData as any).user_notification_preferences));
  localStorage.setItem('BX_SANDBOX_SPONSORED_PRODUCTS', JSON.stringify((sandboxData as any).sponsored_products));
  localStorage.setItem('BX_SANDBOX_PRODUCTS', JSON.stringify((sandboxData as any).products));
  localStorage.setItem('BX_SANDBOX_CATEGORIES', JSON.stringify((sandboxData as any).categories));
  localStorage.setItem('BX_SANDBOX_CARTS', JSON.stringify((sandboxData as any).carts));
  localStorage.setItem('BX_SANDBOX_CART_ITEMS', JSON.stringify((sandboxData as any).cart_items));
  localStorage.setItem('BX_SANDBOX_ORDER_ITEMS', JSON.stringify((sandboxData as any).order_items));
  localStorage.setItem('BX_SANDBOX_ORDER_STATUS_HISTORY', JSON.stringify((sandboxData as any).order_status_history));
};

// Console Log interface for UI visualization
export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'query';
  title: string;
  details: string;
  rlsChecked?: string;
  rlsPassed?: boolean;
}

const listeners: ((logs: LogMessage[]) => void)[] = [];
let logs: LogMessage[] = [];

export const addLog = (type: LogMessage['type'], title: string, details: string, rlsChecked?: string, rlsPassed?: boolean) => {
  const newLog: LogMessage = {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toLocaleTimeString('ar-SA'),
    type,
    title,
    details,
    rlsChecked,
    rlsPassed
  };
  logs = [newLog, ...logs].slice(0, 100);
  listeners.forEach(cb => cb(logs));
  console.log(`[Supabase Sandbox Log] [${type.toUpperCase()}] ${title}:`, details);
};

export const subscribeToLogs = (cb: (logs: LogMessage[]) => void) => {
  listeners.push(cb);
  cb(logs);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

export const clearSandboxLogs = () => {
  logs = [];
  listeners.forEach(cb => cb([]));
};

// User session storage in sandbox
let sandboxSession: any = (() => {
  const stored = localStorage.getItem('BX_SANDBOX_SESSION');
  return stored ? JSON.parse(stored) : null;
})();

// Create the simulated/intercepted mock client
const sandboxClient = {
  auth: {
    signUp: async (params: { phone?: string; email?: string; password?: string }) => {
      addLog('query', 'Auth: signUp()', JSON.stringify(params, null, 2));
      
      const email = params.email || `${params.phone}@boostx.sa`;
      const phone = params.phone || '';
      
      // Check if user exists
      const existingUser = sandboxData.users.find((u: any) => u.phone === phone || u.email === email);
      if (existingUser) {
        addLog('error', 'Auth Error', `المستخدم موجود بالفعل: ${email}`);
        return { data: { user: null, session: null }, error: { message: 'User already exists' } };
      }

      const newUser = {
        id: Math.random().toString(36).substring(2, 17) + '-' + Math.random().toString(36).substring(2, 17),
        email,
        phone,
        role: 'partner',
        created_at: new Date().toISOString()
      };

      sandboxData.users.push(newUser);
      saveSandboxData();

      addLog('success', 'Auth: تم إنشاء الحساب بنجاح', `تم إنشاء مستخدم جديد بمعرف: ${newUser.id}`);
      return { data: { user: newUser, session: null }, error: null };
    },

    signInWithOtp: async (params: { phone: string }) => {
      addLog('query', 'Auth: signInWithOtp()', JSON.stringify(params, null, 2));
      
      // Generate a dynamic 4-digit code
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Save it temporarily in localstorage for verification
      localStorage.setItem(`BX_WHATSAPP_PENDING_OTP_${params.phone}`, otpCode);
      
      const msgText = `🚀 رمز التحقق (OTP) الخاص بك لمنصة BoostX هو: *${otpCode}*\n\nالرمز صالح للاستخدام مرة واحدة فقط.`;
      
      // Send it via WhatsApp (real or mock depending on toggle)
      const sent = await sendWhatsAppMessage(params.phone, msgText);
      
      if (!sent) {
        addLog('warning', 'تحذير إرسال الرمز', `لم نتمكن من إرسال الرمز تلقائياً. رمز المرور المولد لـ ${params.phone} هو: ${otpCode}`);
      } else {
        addLog('info', 'رمز الدخول النشط', `رمز المرور لـ ${params.phone} هو: ${otpCode} (تم إرساله أو محاكاته بنجاح).`);
      }
      
      return { data: true, error: null };
    },

    verifyOtp: async (params: { phone: string; token: string; type: 'sms' | 'whatsapp' }) => {
      addLog('query', 'Auth: verifyOtp()', JSON.stringify(params, null, 2));

      const cachedOtp = localStorage.getItem(`BX_WHATSAPP_PENDING_OTP_${params.phone}`);
      
      // Allow developer bypass with 1234 or matching cached code
      const isValid = params.token === cachedOtp || params.token === '1234';

      if (!isValid) {
        addLog('error', 'Auth OTP Error', `رمز التحقق غير صحيح. الرمز المولد هو ${cachedOtp || '1234'}.`);
        return { data: { session: null, user: null }, error: { message: 'Invalid OTP code' } };
      }

      // Check if user exists, if not create one
      let user = sandboxData.users.find((u: any) => u.phone === params.phone);
      if (!user) {
        user = {
          id: 'usr_' + Math.random().toString(36).substring(2, 12),
          email: `${params.phone}@boostx.sa`,
          phone: params.phone,
          role: 'partner',
          created_at: new Date().toISOString()
        };
        sandboxData.users.push(user);
        saveSandboxData();
      }

      const session = {
        access_token: 'sandbox-jwt-' + Math.random().toString(36).substring(2, 15),
        user
      };

      sandboxSession = session;
      localStorage.setItem('BX_SANDBOX_SESSION', JSON.stringify(session));
      
      // Clean up cached OTP
      localStorage.removeItem(`BX_WHATSAPP_PENDING_OTP_${params.phone}`);

      addLog('success', 'Auth: تم التحقق وتسجيل الدخول بنجاح', `مرحباً بك! تم تسجيل الدخول بمعرف: ${user.id}`);
      return { data: { session, user }, error: null };
    },

    signOut: async () => {
      addLog('query', 'Auth: signOut()', 'تسجيل خروج المستخدم الحالي.');
      sandboxSession = null;
      localStorage.removeItem('BX_SANDBOX_SESSION');
      addLog('success', 'Auth: تم تسجيل الخروج', 'تمت إزالة الجلسة بنجاح.');
      return { error: null };
    },

    getUser: async () => {
      return { data: { user: sandboxSession?.user || null }, error: null };
    },

    getSession: async () => {
      return { data: { session: sandboxSession }, error: null };
    },

    signInWithOAuth: async (params: { provider: string; options?: { redirectTo?: string } }) => {
      addLog('query', `Auth: signInWithOAuth()`, JSON.stringify(params, null, 2));
      
      const mockGoogleUser = {
        id: 'usr_g_' + Math.random().toString(36).substring(2, 12),
        email: `google-user-${Math.random().toString(36).substring(2, 6)}@gmail.com`,
        phone: '',
        role: 'partner',
        created_at: new Date().toISOString()
      };
      
      sandboxData.users.push(mockGoogleUser);
      saveSandboxData();
      
      const session = {
        access_token: 'sandbox-google-jwt-' + Math.random().toString(36).substring(2, 15),
        user: mockGoogleUser
      };
      
      sandboxSession = session;
      localStorage.setItem('BX_SANDBOX_SESSION', JSON.stringify(session));
      
      addLog('success', 'Auth: تم الدخول بواسطة جوجل (محاكاة)', `مرحباً بك! تم تسجيل الدخول بمعرف جوجل: ${mockGoogleUser.id}`);
      return { data: { provider: params.provider, session, user: mockGoogleUser }, error: null };
    }
  },

  from: (tableName: string) => {
    return {
      select: (columns: string = '*') => {
        addLog('query', `Database: SELECT FROM "${tableName}"`, `Columns: ${columns}`);
        
        let queryData: any[] = [];
        let rlsRule = "";
        let rlsPassed = true;
        const currentUserId = sandboxSession?.user?.id;

        // Apply RLS checking logic
        if (tableName === 'users') {
          rlsRule = "auth.uid() = id";
          queryData = sandboxData.users;
          if (currentUserId) {
            queryData = queryData.filter(u => u.id === currentUserId || sandboxSession?.user?.role === 'admin');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'user_profiles') {
          rlsRule = "auth.uid() = id";
          queryData = sandboxData.profiles;
          if (currentUserId) {
            queryData = queryData.filter(p => p.id === currentUserId || sandboxSession?.user?.role === 'admin');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'partners') {
          rlsRule = "Anyone can view approved, owner can view all";
          queryData = sandboxData.partners;
          // In real RLS: SELECT FROM partners WHERE status = 'approved' OR owner_id = auth.uid()
          queryData = queryData.filter(p => p.status === 'approved' || p.owner_id === currentUserId || sandboxSession?.user?.role === 'admin');
        } else if (tableName === 'partner_documents') {
          rlsRule = "auth.uid() = partner_id (owner)";
          queryData = sandboxData.documents;
          if (currentUserId) {
            queryData = queryData.filter(d => d.partner_id === currentUserId || sandboxSession?.user?.role === 'admin');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'partner_applications') {
          rlsRule = "auth.uid() = owner_id OR role = 'admin'";
          queryData = sandboxData.applications;
          if (currentUserId) {
            queryData = queryData.filter(a => a.owner_id === currentUserId || sandboxSession?.user?.role === 'admin');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'driver_applications') {
          rlsRule = "auth.uid() = owner_id OR role = 'admin'";
          queryData = sandboxData.driver_applications;
          if (currentUserId) {
            queryData = queryData.filter(a => a.owner_id === currentUserId || sandboxSession?.user?.role === 'admin');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'technician_applications') {
          rlsRule = "auth.uid() = owner_id OR role = 'admin'";
          queryData = sandboxData.technician_applications;
          if (currentUserId) {
            queryData = queryData.filter(a => a.owner_id === currentUserId || sandboxSession?.user?.role === 'admin');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'orders') {
          rlsRule = "Only assigned customer, driver, or admin can access";
          queryData = sandboxData.orders || [];
        } else if (tableName === 'driver_locations') {
          rlsRule = "Only active order participants can track";
          queryData = sandboxData.driver_locations || [];
        } else if (tableName === 'chats') {
          rlsRule = "Only order participants can access chat room";
          queryData = sandboxData.chats || [];
        } else if (tableName === 'messages') {
          rlsRule = "Only chat participants can read messages";
          queryData = sandboxData.messages || [];
        } else if (tableName === 'delivery_tasks') {
          rlsRule = "Only customer, assigned driver, or admin can access";
          queryData = sandboxData.delivery_tasks || [];
        } else if (tableName === 'delivery_status_history') {
          rlsRule = "Only relevant driver or admin can access";
          queryData = sandboxData.delivery_status_history || [];
        } else if (tableName === 'audit_logs') {
          rlsRule = "Only administrators can read audit logs";
          queryData = sandboxData.audit_logs || [];
        } else if (tableName === 'wallets') {
          rlsRule = "auth.uid() = user_id OR role = 'admin'";
          queryData = sandboxData.wallets || [];
          if (currentUserId) {
            queryData = queryData.filter(w => w.user_id === currentUserId || sandboxSession?.user?.role === 'admin' || sandboxSession?.user?.role === 'superadmin' || w.user_id === 'usr_cust_1' || w.user_id === 'app-seed-1' || w.user_id === 'drv_usr_1');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'wallet_transactions') {
          rlsRule = "wallet_id in (select id from wallets where user_id = auth.uid()) OR role = 'admin'";
          queryData = sandboxData.wallet_transactions || [];
          if (currentUserId) {
            const myWalletIds = (sandboxData.wallets || []).filter((w: any) => w.user_id === currentUserId || w.user_id === 'usr_cust_1' || w.user_id === 'app-seed-1' || w.user_id === 'drv_usr_1').map((w: any) => w.id);
            queryData = queryData.filter(wt => myWalletIds.includes(wt.wallet_id) || sandboxSession?.user?.role === 'admin' || sandboxSession?.user?.role === 'superadmin');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'payments') {
          rlsRule = "customer_id = auth.uid() OR partner_id = auth.uid() OR role = 'admin'";
          queryData = sandboxData.payments || [];
          if (currentUserId) {
            queryData = queryData.filter(p => p.customer_id === currentUserId || p.partner_id === currentUserId || sandboxSession?.user?.role === 'admin' || sandboxSession?.user?.role === 'superadmin' || p.customer_id === 'usr_cust_1' || p.partner_id === 'app-seed-1');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'payouts') {
          rlsRule = "user_id = auth.uid() OR role = 'admin'";
          queryData = sandboxData.payouts || [];
          if (currentUserId) {
            queryData = queryData.filter(p => p.user_id === currentUserId || sandboxSession?.user?.role === 'admin' || sandboxSession?.user?.role === 'superadmin' || p.user_id === 'app-seed-1' || p.user_id === 'drv_usr_1');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'refunds') {
          rlsRule = "customer_id = auth.uid() OR role = 'admin'";
          queryData = sandboxData.refunds || [];
          if (currentUserId) {
            queryData = queryData.filter(r => r.customer_id === currentUserId || sandboxSession?.user?.role === 'admin' || sandboxSession?.user?.role === 'superadmin');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'invoices') {
          rlsRule = "customer_id = auth.uid() OR partner_id = auth.uid() OR role = 'admin'";
          queryData = sandboxData.invoices || [];
          if (currentUserId) {
            queryData = queryData.filter(i => i.customer_id === currentUserId || i.partner_id === currentUserId || sandboxSession?.user?.role === 'admin' || sandboxSession?.user?.role === 'superadmin' || i.customer_id === 'usr_cust_1' || i.partner_id === 'app-seed-1');
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'commission_settings') {
          rlsRule = "Anyone can read commission settings";
          queryData = sandboxData.commission_settings || [];
        } else if (tableName === 'reported_messages') {
          rlsRule = "Only administrators can view reported messages";
          queryData = sandboxData.reported_messages || [];
        } else if (tableName === 'support_tickets') {
          rlsRule = "Owner, linked role, or support/admin can view tickets";
          queryData = sandboxData.support_tickets || [];
          if (currentUserId) {
            queryData = queryData.filter(t => 
              t.customer_id === currentUserId || 
              sandboxSession?.user?.role === 'admin' || 
              sandboxSession?.user?.role === 'superadmin' || 
              sandboxSession?.user?.role === 'support_agent' ||
              t.customer_id === 'usr_cust_1' || 
              (sandboxSession?.user?.role === 'partner' && t.order_id === 'order-101')
            );
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'support_messages') {
          rlsRule = "Participants of ticket can view messages";
          queryData = sandboxData.support_messages || [];
        } else if (tableName === 'disputes') {
          rlsRule = "Complaint parties or admin can view disputes";
          queryData = sandboxData.disputes || [];
          if (currentUserId) {
            queryData = queryData.filter(d => 
              d.customer_id === currentUserId || 
              d.partner_id === currentUserId || 
              d.driver_id === currentUserId || 
              d.technician_id === currentUserId || 
              sandboxSession?.user?.role === 'admin' || 
              sandboxSession?.user?.role === 'superadmin' || 
              d.customer_id === 'usr_cust_1' || 
              d.partner_id === 'app-seed-1'
            );
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'dispute_evidence') {
          rlsRule = "Complaint parties can view evidence";
          queryData = sandboxData.dispute_evidence || [];
        } else if (tableName === 'refund_requests') {
          rlsRule = "Customer, partner, or admin can view refund requests";
          queryData = sandboxData.refund_requests || [];
          if (currentUserId) {
            queryData = queryData.filter(r => 
              r.customer_id === currentUserId || 
              sandboxSession?.user?.role === 'admin' || 
              sandboxSession?.user?.role === 'superadmin' || 
              r.customer_id === 'usr_cust_1'
            );
          } else {
            rlsPassed = false;
            queryData = [];
          }
        } else if (tableName === 'admin_actions') {
          rlsRule = "Administrators or participants can view actions";
          queryData = sandboxData.admin_actions || [];
        } else if (tableName === 'ad_campaigns') {
          rlsRule = "Partners can view their own, Admin views all, Customers view active/approved";
          queryData = sandboxData.ad_campaigns || [];
          if (currentUserId && sandboxSession?.user?.role === 'customer') {
            queryData = queryData.filter(c => c.status === 'approved' || c.status === 'active');
          } else if (currentUserId && (sandboxSession?.user?.role === 'partner' || sandboxSession?.user?.role === 'driver')) {
            queryData = queryData.filter(c => c.partner_id === currentUserId || c.partner_id === 'app-seed-1');
          }
          // Admin sees all
        } else if (tableName === 'ad_analytics') {
          rlsRule = "Partners can view their own analytics, Admin views all";
          queryData = sandboxData.ad_analytics || [];
        } else if (tableName === 'notifications') {
          rlsRule = "auth.uid() = user_id";
          queryData = sandboxData.notifications || [];
        } else if (tableName === 'notification_reads') {
          rlsRule = "auth.uid() = user_id";
          queryData = sandboxData.notification_reads || [];
        } else if (tableName === 'notification_campaigns') {
          rlsRule = "Anyone can read active campaigns";
          queryData = sandboxData.notification_campaigns || [];
        } else if (tableName === 'user_notification_preferences') {
          rlsRule = "auth.uid() = user_id";
          queryData = sandboxData.user_notification_preferences || [];
        } else if (tableName === 'sponsored_products') {
          rlsRule = "Anyone can read active sponsored products";
          queryData = (sandboxData as any).sponsored_products || [];
        } else if (tableName === 'products') {
          rlsRule = "Anyone can read products";
          queryData = (sandboxData as any).products || [];
        } else if (tableName === 'categories') {
          rlsRule = "Anyone can read categories";
          queryData = (sandboxData as any).categories || [];
        } else if (tableName === 'favorites') {
          rlsRule = "auth.uid() = user_id";
          queryData = sandboxData.favorites || [
            { id: 1, user_id: 'usr_cust_1', partner_id: 'p1', created_at: new Date().toISOString() },
            { id: 2, user_id: 'usr_cust_1', partner_id: 'p2', created_at: new Date().toISOString() }
          ];
        } else if (tableName === 'order_tracking') {
          rlsRule = "Only active participants can track";
          queryData = sandboxData.order_tracking || [
            { id: 'track-101', order_id: 'order-101', status: 'في الطريق للاستلام', latitude: 24.7136, longitude: 46.6753, eta: 15, updated_at: new Date().toISOString() }
          ];
        } else if (tableName === 'technician_locations') {
          rlsRule = "Only assigned customer or admin can track";
          queryData = sandboxData.technician_locations || [
            { id: 'tech-loc-1', technician_id: 'tech_usr_1', latitude: 24.7136, longitude: 46.6753, updated_at: new Date().toISOString() }
          ];
        } else if (tableName === 'customer_addresses') {
          rlsRule = "auth.uid() = customer_id";
          queryData = sandboxData.customer_addresses || [
            { id: 'addr-1', customer_id: 'usr_cust_1', name: 'المنزل العليا', address: 'حي العليا، الرياض، السعودية', latitude: 24.7136, longitude: 46.6753, is_default: true, created_at: new Date().toISOString() }
          ];
        } else if (tableName === 'customer_contacts') {
          rlsRule = "auth.uid() = customer_id";
          queryData = sandboxData.customer_contacts || [
            { id: 'cont-1', customer_id: 'usr_cust_1', full_name: 'عبدالعزيز الحربي', phone_number: '+966 50 123 4567', relation: 'self', created_at: new Date().toISOString() }
          ];
        } else if (tableName === 'carts') {
          rlsRule = "auth.uid() = customer_id";
          queryData = (sandboxData as any).carts || [];
        } else if (tableName === 'cart_items') {
          rlsRule = "cart_id exists";
          queryData = (sandboxData as any).cart_items || [];
        } else if (tableName === 'order_items') {
          rlsRule = "order_id exists";
          queryData = (sandboxData as any).order_items || [];
        } else if (tableName === 'order_status_history') {
          rlsRule = "order_id exists";
          queryData = (sandboxData as any).order_status_history || [];
        } else {
          queryData = [];
        }

        if (!rlsPassed) {
          addLog('error', 'RLS Violation 🛡️', `تم رفض استعلام SELECT على جدول ${tableName}. لم يتم تمرير سياسة RLS: ${rlsRule}`, rlsRule, false);
          return {
            data: null,
            error: { message: `new Row Level Security violation on table ${tableName}` }
          };
        }

        addLog('success', 'Database Query Passed ✅', `تم استرجاع ${queryData.length} سجل من جدول ${tableName}.`, rlsRule, true);

        // Chainable filter functions
        const chain: any = {
          data: queryData,
          error: null,
          eq: (column: string, value: any) => {
            chain.data = chain.data.filter((item: any) => item[column] === value);
            return chain;
          },
          order: (column: string, { ascending = true } = {}) => {
            chain.data = [...chain.data].sort((a: any, b: any) => {
              if (a[column] < b[column]) return ascending ? -1 : 1;
              if (a[column] > b[column]) return ascending ? 1 : -1;
              return 0;
            });
            return chain;
          },
          single: () => {
            return { data: chain.data[0] || null, error: chain.data.length === 0 ? { message: 'No rows found' } : null };
          },
          then: (resolve: any) => resolve({ data: chain.data, error: chain.error })
        };
        return chain;
      },

      insert: (payload: any) => {
        addLog('query', `Database: INSERT INTO "${tableName}"`, JSON.stringify(payload, null, 2));

        let rlsRule = "";
        let rlsPassed = true;
        const currentUserId = sandboxSession?.user?.id;

        if (tableName === 'users' || tableName === 'user_profiles') {
          rlsRule = "auth.uid() = id";
          const rows = Array.isArray(payload) ? payload : [payload];
          if (!currentUserId || (rows.some(r => r.id !== currentUserId) && sandboxSession?.user?.role !== 'admin')) {
            rlsPassed = false;
          }
        } else if (tableName === 'partners') {
          rlsRule = "auth.uid() = owner_id";
          const rows = Array.isArray(payload) ? payload : [payload];
          if (!currentUserId || (rows.some(r => r.owner_id !== currentUserId) && sandboxSession?.user?.role !== 'admin')) {
            rlsPassed = false;
          }
        } else if (tableName === 'partner_documents') {
          rlsRule = "auth.uid() = partner_id";
          const rows = Array.isArray(payload) ? payload : [payload];
          if (!currentUserId || (rows.some(r => r.partner_id !== currentUserId) && sandboxSession?.user?.role !== 'admin')) {
            rlsPassed = false;
          }
        } else if (tableName === 'partner_applications') {
          rlsRule = "auth.uid() = owner_id";
          const rows = Array.isArray(payload) ? payload : [payload];
          if (!currentUserId || (rows.some(r => r.owner_id !== currentUserId) && sandboxSession?.user?.role !== 'admin')) {
            rlsPassed = false;
          }
        } else if (tableName === 'driver_applications') {
          rlsRule = "auth.uid() = owner_id";
          const rows = Array.isArray(payload) ? payload : [payload];
          if (!currentUserId || (rows.some(r => r.owner_id !== currentUserId) && sandboxSession?.user?.role !== 'admin')) {
            rlsPassed = false;
          }
        } else if (tableName === 'technician_applications') {
          rlsRule = "auth.uid() = owner_id";
          const rows = Array.isArray(payload) ? payload : [payload];
          if (!currentUserId || (rows.some(r => r.owner_id !== currentUserId) && sandboxSession?.user?.role !== 'admin')) {
            rlsPassed = false;
          }
        }

        if (!rlsPassed) {
          addLog('error', 'RLS Violation 🛡️', `تم رفض عملية INSERT على جدول ${tableName}. لم يتم تمرير سياسة RLS: ${rlsRule}`, rlsRule, false);
          return {
            data: null,
            error: { message: `Row Level Security policy violation for insert on table ${tableName}` }
          };
        }

        // Execute inserting
        const rowsToInsert = Array.isArray(payload) ? payload : [payload];
        const insertedRows = rowsToInsert.map(row => {
          const newRow = {
            id: row.id || 'row_' + Math.random().toString(36).substring(2, 12),
            created_at: new Date().toISOString(),
            ...row
          };

          if (tableName === 'users') sandboxData.users.push(newRow);
          else if (tableName === 'user_profiles') sandboxData.profiles.push(newRow);
          else if (tableName === 'partners') sandboxData.partners.push(newRow);
          else if (tableName === 'partner_documents') sandboxData.documents.push(newRow);
          else if (tableName === 'partner_applications') sandboxData.applications.push(newRow);
          else if (tableName === 'driver_applications') sandboxData.driver_applications.push(newRow);
          else if (tableName === 'technician_applications') sandboxData.technician_applications.push(newRow);
          else if (tableName === 'orders') { if (!sandboxData.orders) sandboxData.orders = []; sandboxData.orders.push(newRow); }
          else if (tableName === 'driver_locations') { if (!sandboxData.driver_locations) sandboxData.driver_locations = []; sandboxData.driver_locations.push(newRow); }
          else if (tableName === 'chats') { 
            if (!sandboxData.chats) sandboxData.chats = []; 
            sandboxData.chats.push(newRow); 
          }
          else if (tableName === 'reported_messages') {
            if (!sandboxData.reported_messages) sandboxData.reported_messages = [];
            sandboxData.reported_messages.push(newRow);
          }
          else if (tableName === 'messages') { 
            if (!sandboxData.messages) sandboxData.messages = []; 
            
            // --- Moderation Filters & Triggers ---
            let text = newRow.message_text || '';
            const phonePattern = /(05\d{8}|\+966\d{9}|\d{7,12})/g;
            const hasPhone = phonePattern.test(text);
            if (hasPhone) {
              text = text.replace(phonePattern, '[تم الحجب لسلامتك 🛡️]');
            }

            const paymentLinkPattern = /(stripe\.com|paypal\.me|paylink\.sa|moyasar\.com|checkout\.|pay\.)/gi;
            const hasPaymentLink = paymentLinkPattern.test(text);
            if (hasPaymentLink) {
              text = text.replace(paymentLinkPattern, '[حُجب لمنع الدفع الخارجي 🚫]');
            }

            newRow.message_text = text;
            sandboxData.messages.push(newRow);

            // 1. Dispatch Security Warnings if needed
            if (hasPhone || hasPaymentLink) {
              const warningRow = {
                id: 'msg-warning-' + Math.random().toString(36).substring(2, 12),
                chat_id: newRow.chat_id,
                order_id: newRow.order_id,
                sender_id: 'system',
                sender_role: 'system',
                message_text: '🛡️ نظام التحذير الآلي: تم الكشف عن مشاركة معلومات اتصال أو دفع خارجية. يرجى إتمام جميع المعاملات والمكالمات داخل منصة BoostX لسلامتك وضمان حقوقك.',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() + 100).toISOString()
              };
              sandboxData.messages.push(warningRow);
              window.dispatchEvent(new CustomEvent('BX_REALTIME_CHANGE', { detail: { table: 'messages', action: 'INSERT', record: warningRow } }));
            }

            // 2. Abusive words filter & Auto-Report
            const abusiveWords = ['كلب', 'حمار', 'غبي', 'حقير', 'تفه', 'وسخ'];
            const hasAbusive = abusiveWords.some(word => text.includes(word));
            if (hasAbusive) {
              const reportRow = {
                id: 'rep_' + Math.random().toString(36).substring(2, 12),
                message_id: newRow.id,
                chat_id: newRow.chat_id,
                reported_by: newRow.sender_id,
                reason: 'ألفاظ مسيئة أو منافية للآداب',
                status: 'pending',
                created_at: new Date().toISOString()
              };
              if (!sandboxData.reported_messages) sandboxData.reported_messages = [];
              sandboxData.reported_messages.push(reportRow);
              
              // Also add to audit logs
              if (!sandboxData.audit_logs) sandboxData.audit_logs = [];
              sandboxData.audit_logs.push({
                id: 'audit_' + Math.random().toString(36).substring(2, 12),
                table_name: 'messages',
                action: 'MESSAGE_REPORTED',
                record_id: newRow.id,
                payload: reportRow,
                created_at: new Date().toISOString()
              });
            }
          }
          else if (tableName === 'delivery_tasks') { if (!sandboxData.delivery_tasks) sandboxData.delivery_tasks = []; sandboxData.delivery_tasks.push(newRow); }
          else if (tableName === 'notifications') { if (!(sandboxData as any).notifications) (sandboxData as any).notifications = []; (sandboxData as any).notifications.push(newRow); }
          else if (tableName === 'notification_reads') { if (!(sandboxData as any).notification_reads) (sandboxData as any).notification_reads = []; (sandboxData as any).notification_reads.push(newRow); }
          else if (tableName === 'notification_campaigns') { if (!(sandboxData as any).notification_campaigns) (sandboxData as any).notification_campaigns = []; (sandboxData as any).notification_campaigns.push(newRow); }
          else if (tableName === 'user_notification_preferences') { if (!(sandboxData as any).user_notification_preferences) (sandboxData as any).user_notification_preferences = []; (sandboxData as any).user_notification_preferences.push(newRow); }
          else if (tableName === 'sponsored_products') { if (!(sandboxData as any).sponsored_products) (sandboxData as any).sponsored_products = []; (sandboxData as any).sponsored_products.push(newRow); }
          else if (tableName === 'products') { if (!(sandboxData as any).products) (sandboxData as any).products = []; (sandboxData as any).products.push(newRow); }
          else if (tableName === 'carts') { if (!(sandboxData as any).carts) (sandboxData as any).carts = []; (sandboxData as any).carts.push(newRow); }
          else if (tableName === 'cart_items') { if (!(sandboxData as any).cart_items) (sandboxData as any).cart_items = []; (sandboxData as any).cart_items.push(newRow); }
          else if (tableName === 'order_items') { if (!(sandboxData as any).order_items) (sandboxData as any).order_items = []; (sandboxData as any).order_items.push(newRow); }
          else if (tableName === 'order_status_history') { if (!(sandboxData as any).order_status_history) (sandboxData as any).order_status_history = []; (sandboxData as any).order_status_history.push(newRow); }
          else if (tableName === 'delivery_status_history') { 
            if (!sandboxData.delivery_status_history) sandboxData.delivery_status_history = []; 
            sandboxData.delivery_status_history.push(newRow);
            // Simulate PostgreSQL trigger: auto-write to public.audit_logs
            const auditRow = {
              id: 'audit_' + Math.random().toString(36).substring(2, 12),
              table_name: 'delivery_tasks',
              action: 'STATUS_CHANGE',
              record_id: newRow.task_id,
              payload: newRow,
              created_at: new Date().toISOString()
            };
            if (!sandboxData.audit_logs) sandboxData.audit_logs = [];
            sandboxData.audit_logs.push(auditRow);
          }
          else if (tableName === 'audit_logs') { if (!sandboxData.audit_logs) sandboxData.audit_logs = []; sandboxData.audit_logs.push(newRow); }
          else if (tableName === 'wallets') { if (!sandboxData.wallets) sandboxData.wallets = []; sandboxData.wallets.push(newRow); }
          else if (tableName === 'wallet_transactions') { if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = []; sandboxData.wallet_transactions.push(newRow); }
          else if (tableName === 'payments') {
            if (!sandboxData.payments) sandboxData.payments = [];
            sandboxData.payments.push(newRow);

            // Emulate Trigger: AFTER INSERT on public.payments
            const { amount, delivery_fee, partner_earning, driver_earning, customer_id, partner_id, payment_method, order_id, id: payment_id } = newRow;

            // 1. If paid by Wallet, deduct balance
            if (payment_method === 'Wallet') {
              const custWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === customer_id);
              if (custWallet) {
                custWallet.balance = Math.max(0, custWallet.balance - Number(amount));
                // Add wallet transaction record
                if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                sandboxData.wallet_transactions.push({
                  id: 'wt_' + Math.random().toString(36).substring(2, 12),
                  wallet_id: custWallet.id,
                  amount: -Number(amount),
                  type: 'payment',
                  description: `دفع قيمة الطلب #${order_id}`,
                  created_at: new Date().toISOString()
                });
              }
            } else {
              // Add a bit of cashback (5%) for marketing purposes
              const custWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === customer_id);
              if (custWallet) {
                const cbAmount = Number(amount) * 0.05;
                custWallet.cashback = Number((custWallet.cashback + cbAmount).toFixed(2));
                if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                sandboxData.wallet_transactions.push({
                  id: 'wt_' + Math.random().toString(36).substring(2, 12),
                  wallet_id: custWallet.id,
                  amount: cbAmount,
                  type: 'cashback',
                  description: `كاش باك 5% للطلب #${order_id}`,
                  created_at: new Date().toISOString()
                });
              }
            }

            // 2. Credit Partner Wallet
            const partWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === partner_id || w.user_id === 'app-seed-1');
            if (partWallet) {
              partWallet.balance = Number((partWallet.balance + Number(partner_earning)).toFixed(2));
              if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
              sandboxData.wallet_transactions.push({
                id: 'wt_' + Math.random().toString(36).substring(2, 12),
                wallet_id: partWallet.id,
                amount: Number(partner_earning),
                type: 'payment',
                description: `مستحقات الطلب المكتمل #${order_id}`,
                created_at: new Date().toISOString()
              });
            }

            // 3. Credit Driver Wallet (Entire delivery fee goes to driver)
            const drivWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === 'drv_usr_1');
            if (drivWallet) {
              drivWallet.balance = Number((drivWallet.balance + Number(driver_earning)).toFixed(2));
              if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
              sandboxData.wallet_transactions.push({
                id: 'wt_' + Math.random().toString(36).substring(2, 12),
                wallet_id: drivWallet.id,
                amount: Number(driver_earning),
                type: 'payment',
                description: `أرباح توصيل الطلب #${order_id}`,
                created_at: new Date().toISOString()
              });
            }

            // 4. Auto-generate Invoices record
            const newInvoice = {
              id: 'inv_' + Math.random().toString(36).substring(2, 12),
              order_id,
              payment_id,
              invoice_number: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
              partner_id,
              customer_id,
              subtotal: Number((Number(amount) - Number(delivery_fee)).toFixed(2)),
              tax_amount: Number(((Number(amount) - Number(delivery_fee)) * 0.15).toFixed(2)), // 15% VAT
              total_amount: Number(amount),
              created_at: new Date().toISOString()
            };
            if (!sandboxData.invoices) sandboxData.invoices = [];
            sandboxData.invoices.push(newInvoice);

            // 5. Create Audit log
            const auditRow = {
              id: 'audit_' + Math.random().toString(36).substring(2, 12),
              table_name: 'payments',
              action: 'PAYMENT_RECEIVED',
              record_id: payment_id,
              payload: newRow,
              created_at: new Date().toISOString()
            };
            if (!sandboxData.audit_logs) sandboxData.audit_logs = [];
            sandboxData.audit_logs.push(auditRow);
          }
          else if (tableName === 'payouts') {
            if (!sandboxData.payouts) sandboxData.payouts = [];
            sandboxData.payouts.push(newRow);

            // If payout is immediately processed/completed: deduct from user wallet
            if (newRow.status === 'completed') {
              const wallet = (sandboxData.wallets || []).find((w: any) => w.user_id === newRow.user_id);
              if (wallet) {
                wallet.balance = Math.max(0, wallet.balance - Number(newRow.amount));
                if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                sandboxData.wallet_transactions.push({
                  id: 'wt_' + Math.random().toString(36).substring(2, 12),
                  wallet_id: wallet.id,
                  amount: -Number(newRow.amount),
                  type: 'payout',
                  description: `سحب أرباح مكتمل إلى ${newRow.payment_method}`,
                  created_at: new Date().toISOString()
                });
              }
            }

            const auditRow = {
              id: 'audit_' + Math.random().toString(36).substring(2, 12),
              table_name: 'payouts',
              action: 'PAYOUT_REQUESTED',
              record_id: newRow.id,
              payload: newRow,
              created_at: new Date().toISOString()
            };
            if (!sandboxData.audit_logs) sandboxData.audit_logs = [];
            sandboxData.audit_logs.push(auditRow);
          }
          else if (tableName === 'refunds') {
            if (!sandboxData.refunds) sandboxData.refunds = [];
            sandboxData.refunds.push(newRow);

            // Trigger emulation: IF refund is processed/approved, credit customer wallet, debit partner wallet
            const targetPay = (sandboxData.payments || []).find((p: any) => p.id === newRow.payment_id || p.order_id === newRow.order_id);
            if (targetPay) {
              targetPay.payment_status = 'refunded';

              // Credit Customer Wallet
              const custWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === newRow.customer_id);
              if (custWallet) {
                custWallet.balance = Number((custWallet.balance + Number(newRow.amount)).toFixed(2));
                custWallet.refunds_total = Number((custWallet.refunds_total + Number(newRow.amount)).toFixed(2));

                if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                sandboxData.wallet_transactions.push({
                  id: 'wt_' + Math.random().toString(36).substring(2, 12),
                  wallet_id: custWallet.id,
                  amount: Number(newRow.amount),
                  type: 'refund',
                  description: `استرداد مستحقات الطلب #${newRow.order_id}`,
                  created_at: new Date().toISOString()
                });
              }

              // Debit Partner Wallet (Partner pays back their share)
              const partWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === targetPay.partner_id || w.user_id === 'app-seed-1');
              if (partWallet) {
                partWallet.balance = Number((partWallet.balance - Number(targetPay.partner_earning)).toFixed(2));
                if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                sandboxData.wallet_transactions.push({
                  id: 'wt_' + Math.random().toString(36).substring(2, 12),
                  wallet_id: partWallet.id,
                  amount: -Number(targetPay.partner_earning),
                  type: 'refund',
                  description: `خصم استرداد الطلب المرتجع #${newRow.order_id}`,
                  created_at: new Date().toISOString()
                });
              }
            }

            const auditRow = {
              id: 'audit_' + Math.random().toString(36).substring(2, 12),
              table_name: 'refunds',
              action: 'REFUND_PROCESSED',
              record_id: newRow.id,
              payload: newRow,
              created_at: new Date().toISOString()
            };
            if (!sandboxData.audit_logs) sandboxData.audit_logs = [];
            sandboxData.audit_logs.push(auditRow);
          }
          else if (tableName === 'invoices') { if (!sandboxData.invoices) sandboxData.invoices = []; sandboxData.invoices.push(newRow); }
          else if (tableName === 'commission_settings') { if (!sandboxData.commission_settings) sandboxData.commission_settings = []; sandboxData.commission_settings.push(newRow); }
          else if (tableName === 'support_tickets') {
            if (!sandboxData.support_tickets) sandboxData.support_tickets = [];
            newRow.id = newRow.id || 'TKT-' + Math.floor(204 + Math.random() * 800);
            sandboxData.support_tickets.push(newRow);

            // Auto-trigger welcome message
            const welcomeMsg = {
              id: 'smsg-welcome-' + Math.random().toString(36).substring(2, 12),
              ticket_id: newRow.id,
              sender_id: 'system',
              sender_role: 'system',
              sender_name: 'النظام الآلي',
              message_text: `👋 مرحباً بك عميلنا العزيز! تم فتح تذكرة دعم فني جديدة بنجاح رقم #${newRow.id} بخصوص "${newRow.issue_type || 'طلب عام'}". جاري تحويلك لأقرب ممثل دعم متاح حالاً لمساعدتك.`,
              message_type: 'text',
              attachment_url: '',
              created_at: new Date().toISOString()
            };
            if (!sandboxData.support_messages) sandboxData.support_messages = [];
            sandboxData.support_messages.push(welcomeMsg);
            
            // Dispatch message insert in real-time as well
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('BX_REALTIME_CHANGE', { detail: { table: 'support_messages', action: 'INSERT', record: welcomeMsg } }));
            }, 100);
          }
          else if (tableName === 'support_messages') {
            if (!sandboxData.support_messages) sandboxData.support_messages = [];
            sandboxData.support_messages.push(newRow);
          }
          else if (tableName === 'disputes') {
            if (!sandboxData.disputes) sandboxData.disputes = [];
            newRow.id = newRow.id || 'DISP-' + Math.floor(302 + Math.random() * 700);
            sandboxData.disputes.push(newRow);
          }
          else if (tableName === 'dispute_evidence') {
            if (!sandboxData.dispute_evidence) sandboxData.dispute_evidence = [];
            sandboxData.dispute_evidence.push(newRow);
          }
          else if (tableName === 'refund_requests') {
            if (!sandboxData.refund_requests) sandboxData.refund_requests = [];
            newRow.id = newRow.id || 'ref-req-' + Math.floor(102 + Math.random() * 900);
            sandboxData.refund_requests.push(newRow);
          }
          else if (tableName === 'admin_actions') {
            if (!sandboxData.admin_actions) sandboxData.admin_actions = [];
            sandboxData.admin_actions.push(newRow);
          }
          else if (tableName === 'ad_campaigns') {
            if (!sandboxData.ad_campaigns) sandboxData.ad_campaigns = [];
            newRow.id = newRow.id || 'ad-camp-' + Math.floor(1000 + Math.random() * 9000);
            sandboxData.ad_campaigns.push(newRow);
            
            // Also initialize analytics for this new campaign
            if (!sandboxData.ad_analytics) sandboxData.ad_analytics = [];
            sandboxData.ad_analytics.push({
              id: 'an-' + Math.floor(1000 + Math.random() * 9000),
              campaign_id: newRow.id,
              impressions: 0,
              clicks: 0,
              conversions: 0
            });
          }
          else if (tableName === 'ad_analytics') {
            if (!sandboxData.ad_analytics) sandboxData.ad_analytics = [];
            sandboxData.ad_analytics.push(newRow);
          }

          // Dispatch realtime event

          window.dispatchEvent(new CustomEvent('BX_REALTIME_CHANGE', { detail: { table: tableName, action: 'INSERT', record: newRow } }));
          return newRow;
        });

        saveSandboxData();
        addLog('success', 'Database Write Success ✅', `تمت كتابة ${insertedRows.length} سجل جديد في جدول ${tableName}.`, rlsRule, true);

        return {
          data: Array.isArray(payload) ? insertedRows : insertedRows[0],
          error: null
        };
      },

      update: (payload: any) => {
        addLog('query', `Database: UPDATE "${tableName}"`, JSON.stringify(payload, null, 2));
        
        let rlsRule = "auth.uid() = owner/id";
        let rlsPassed = !!sandboxSession?.user?.id;

        if (!rlsPassed) {
          addLog('error', 'RLS Violation 🛡️', `تم رفض عملية UPDATE على جدول ${tableName}. لم يتم تمرير سياسة RLS: ${rlsRule}`, rlsRule, false);
          return {
            data: null,
            error: { message: `Row Level Security policy violation for update on table ${tableName}` }
          };
        }

        const chain: any = {
          data: [],
          error: null,
          eq: (column: string, value: any) => {
            // Find rows and update them
            let targetCollection: any[] = [];
            if (tableName === 'users') targetCollection = sandboxData.users;
            else if (tableName === 'user_profiles') targetCollection = sandboxData.profiles;
            else if (tableName === 'partners') targetCollection = sandboxData.partners;
            else if (tableName === 'partner_documents') targetCollection = sandboxData.documents;
            else if (tableName === 'partner_applications') targetCollection = sandboxData.applications;
            else if (tableName === 'driver_applications') targetCollection = sandboxData.driver_applications;
            else if (tableName === 'technician_applications') targetCollection = sandboxData.technician_applications;
            else if (tableName === 'orders') targetCollection = sandboxData.orders || [];
            else if (tableName === 'driver_locations') targetCollection = sandboxData.driver_locations || [];
            else if (tableName === 'chats') targetCollection = sandboxData.chats || [];
            else if (tableName === 'messages') targetCollection = sandboxData.messages || [];
            else if (tableName === 'delivery_tasks') targetCollection = sandboxData.delivery_tasks || [];
            else if (tableName === 'delivery_status_history') targetCollection = sandboxData.delivery_status_history || [];
            else if (tableName === 'audit_logs') targetCollection = sandboxData.audit_logs || [];
            else if (tableName === 'wallets') targetCollection = sandboxData.wallets || [];
            else if (tableName === 'wallet_transactions') targetCollection = sandboxData.wallet_transactions || [];
            else if (tableName === 'payments') targetCollection = sandboxData.payments || [];
            else if (tableName === 'payouts') targetCollection = sandboxData.payouts || [];
            else if (tableName === 'refunds') targetCollection = sandboxData.refunds || [];
            else if (tableName === 'invoices') targetCollection = sandboxData.invoices || [];
            else if (tableName === 'commission_settings') targetCollection = sandboxData.commission_settings || [];
            else if (tableName === 'reported_messages') targetCollection = sandboxData.reported_messages || [];
            else if (tableName === 'support_tickets') targetCollection = sandboxData.support_tickets || [];
            else if (tableName === 'support_messages') targetCollection = sandboxData.support_messages || [];
            else if (tableName === 'disputes') targetCollection = sandboxData.disputes || [];
            else if (tableName === 'dispute_evidence') targetCollection = sandboxData.dispute_evidence || [];
            else if (tableName === 'refund_requests') targetCollection = sandboxData.refund_requests || [];
            else if (tableName === 'admin_actions') targetCollection = sandboxData.admin_actions || [];
            else if (tableName === 'ad_campaigns') targetCollection = sandboxData.ad_campaigns || [];
            else if (tableName === 'ad_analytics') targetCollection = sandboxData.ad_analytics || [];
            else if (tableName === 'user_notification_preferences') targetCollection = (sandboxData as any).user_notification_preferences || [];
            else if (tableName === 'sponsored_products') targetCollection = (sandboxData as any).sponsored_products || [];
            else if (tableName === 'categories') targetCollection = (sandboxData as any).categories || [];
            else if (tableName === 'carts') targetCollection = (sandboxData as any).carts || [];
            else if (tableName === 'cart_items') targetCollection = (sandboxData as any).cart_items || [];
            else if (tableName === 'order_items') targetCollection = (sandboxData as any).order_items || [];
            else if (tableName === 'order_status_history') targetCollection = (sandboxData as any).order_status_history || [];

            const updatedRows = targetCollection.map(item => {
              if (item[column] === value) {
                // Apply update
                const oldStatus = item.status;
                const updated = { ...item, ...payload, updated_at: new Date().toISOString() };
                Object.assign(item, updated);

                // --- Ad Campaign Status Changed Trigger ---
                if (tableName === 'ad_campaigns' && oldStatus !== payload.status && payload.status) {
                  if (!sandboxData.audit_logs) sandboxData.audit_logs = [];
                  sandboxData.audit_logs.push({
                    id: 'audit_' + Math.random().toString(36).substring(2, 12),
                    table_name: 'ad_campaigns',
                    action: payload.status === 'approved' ? 'CAMPAIGN_APPROVED' : payload.status === 'rejected' ? 'CAMPAIGN_REJECTED' : 'CAMPAIGN_STATUS_CHANGED',
                    record_id: item.id,
                    payload: { old_status: oldStatus, new_status: payload.status },
                    created_at: new Date().toISOString()
                  });
                }

                // --- Order Status Changed Trigger ---
                if (tableName === 'orders' && oldStatus !== payload.status && payload.status) {
                  if (!(sandboxData as any).order_status_history) (sandboxData as any).order_status_history = [];
                  const newHistory = {
                    id: 'hist-' + Math.floor(1000 + Math.random() * 9000),
                    order_id: item.id,
                    status: payload.status,
                    notes: `تحديث حالة الطلب إلى: ${payload.status}`,
                    created_at: new Date().toISOString()
                  };
                  (sandboxData as any).order_status_history.push(newHistory);
                  window.dispatchEvent(new CustomEvent('BX_REALTIME_CHANGE', { detail: { table: 'order_status_history', action: 'INSERT', record: newHistory } }));
                }


                // --- Payout Status Changed Trigger ---
                if (tableName === 'payouts' && oldStatus !== 'completed' && payload.status === 'completed') {
                  const wallet = (sandboxData.wallets || []).find((w: any) => w.user_id === item.user_id);
                  if (wallet) {
                    wallet.balance = Math.max(0, Number((wallet.balance - Number(item.amount)).toFixed(2)));
                    if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                    sandboxData.wallet_transactions.push({
                      id: 'wt_' + Math.random().toString(36).substring(2, 12),
                      wallet_id: wallet.id,
                      amount: -Number(item.amount),
                      type: 'payout',
                      description: `سحب أرباح معتمد ومسوى إلى ${item.payment_method}`,
                      created_at: new Date().toISOString()
                    });
                  }
                }

                // --- Refund Status Changed Trigger ---
                if (tableName === 'refunds' && oldStatus !== 'approved' && payload.status === 'approved') {
                  const targetPay = (sandboxData.payments || []).find((p: any) => p.id === item.payment_id || p.order_id === item.order_id);
                  if (targetPay) {
                    targetPay.payment_status = 'refunded';

                    // Credit Customer Wallet
                    const custWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === item.customer_id);
                    if (custWallet) {
                      custWallet.balance = Number((custWallet.balance + Number(item.amount)).toFixed(2));
                      custWallet.refunds_total = Number((custWallet.refunds_total + Number(item.amount)).toFixed(2));

                      if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                      sandboxData.wallet_transactions.push({
                        id: 'wt_' + Math.random().toString(36).substring(2, 12),
                        wallet_id: custWallet.id,
                        amount: Number(item.amount),
                        type: 'refund',
                        description: `استرداد مستحقات الطلب المرجع #${item.order_id}`,
                        created_at: new Date().toISOString()
                      });
                    }

                    // Debit Partner Wallet
                    const partWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === targetPay.partner_id || w.user_id === 'app-seed-1');
                    if (partWallet) {
                      partWallet.balance = Number((partWallet.balance - Number(targetPay.partner_earning)).toFixed(2));
                      if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                      sandboxData.wallet_transactions.push({
                        id: 'wt_' + Math.random().toString(36).substring(2, 12),
                        wallet_id: partWallet.id,
                        amount: -Number(targetPay.partner_earning),
                        type: 'refund',
                        description: `خصم استرداد الطلب المرتجع #${item.order_id}`,
                        created_at: new Date().toISOString()
                      });
                    }
                  }
                }

                // --- Support disputes status updated approved/refunded ---
                if (tableName === 'disputes' && oldStatus !== 'approved' && oldStatus !== 'refunded' && (payload.status === 'approved' || payload.status === 'refunded')) {
                  const targetPay = (sandboxData.payments || []).find((p: any) => p.order_id === item.order_id);
                  if (targetPay) {
                    targetPay.payment_status = 'refunded';

                    // Credit Customer Wallet
                    const custWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === item.customer_id);
                    if (custWallet) {
                      const refundAmt = Number(item.amount || targetPay.amount);
                      custWallet.balance = Number((custWallet.balance + refundAmt).toFixed(2));
                      custWallet.refunds_total = Number((custWallet.refunds_total + refundAmt).toFixed(2));

                      if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                      sandboxData.wallet_transactions.push({
                        id: 'wt_' + Math.random().toString(36).substring(2, 12),
                        wallet_id: custWallet.id,
                        amount: refundAmt,
                        type: 'refund',
                        description: `استرداد تسوية نزاع مالي معتمد للطلب #${item.order_id}`,
                        created_at: new Date().toISOString()
                      });
                    }

                    // Debit Partner Wallet
                    const partWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === targetPay.partner_id || w.user_id === 'app-seed-1');
                    if (partWallet) {
                      const debAmt = Number(targetPay.partner_earning);
                      partWallet.balance = Number((partWallet.balance - debAmt).toFixed(2));
                      if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                      sandboxData.wallet_transactions.push({
                        id: 'wt_' + Math.random().toString(36).substring(2, 12),
                        wallet_id: partWallet.id,
                        amount: -debAmt,
                        type: 'refund',
                        description: `خصم تسوية نزاع للطلب المرتجع #${item.order_id}`,
                        created_at: new Date().toISOString()
                      });
                    }
                  }
                }

                // --- Refund request status updated approved ---
                if (tableName === 'refund_requests' && oldStatus !== 'approved' && payload.status === 'approved') {
                  const targetPay = (sandboxData.payments || []).find((p: any) => p.order_id === item.order_id);
                  if (targetPay) {
                    targetPay.payment_status = 'refunded';

                    // Credit Customer Wallet
                    const custWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === item.customer_id);
                    if (custWallet) {
                      const refundAmt = Number(item.amount || targetPay.amount);
                      custWallet.balance = Number((custWallet.balance + refundAmt).toFixed(2));
                      custWallet.refunds_total = Number((custWallet.refunds_total + refundAmt).toFixed(2));

                      if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                      sandboxData.wallet_transactions.push({
                        id: 'wt_' + Math.random().toString(36).substring(2, 12),
                        wallet_id: custWallet.id,
                        amount: refundAmt,
                        type: 'refund',
                        description: `استرداد طلب استرجاع معتمد للطلب #${item.order_id}`,
                        created_at: new Date().toISOString()
                      });
                    }

                    // Debit Partner Wallet
                    const partWallet = (sandboxData.wallets || []).find((w: any) => w.user_id === targetPay.partner_id || w.user_id === 'app-seed-1');
                    if (partWallet) {
                      const debAmt = Number(targetPay.partner_earning);
                      partWallet.balance = Number((partWallet.balance - debAmt).toFixed(2));
                      if (!sandboxData.wallet_transactions) sandboxData.wallet_transactions = [];
                      sandboxData.wallet_transactions.push({
                        id: 'wt_' + Math.random().toString(36).substring(2, 12),
                        wallet_id: partWallet.id,
                        amount: -debAmt,
                        type: 'refund',
                        description: `خصم تسوية طلب استرجاع للطلب #${item.order_id}`,
                        created_at: new Date().toISOString()
                      });
                    }
                  }
                }

                // Dispatch realtime change event
                window.dispatchEvent(new CustomEvent('BX_REALTIME_CHANGE', { detail: { table: tableName, action: 'UPDATE', record: updated } }));
                return updated;
              }
              return item;
            }).filter(item => item[column] === value);

            saveSandboxData();
            addLog('success', 'Database Update Success ✅', `تم تعديل ${updatedRows.length} سجل في جدول ${tableName}.`, rlsRule, true);
            chain.data = updatedRows;
            return chain;
          },
          then: (resolve: any) => resolve({ data: chain.data, error: chain.error })
        };
        return chain;
      },

      delete: () => {
        addLog('query', `Database: DELETE FROM "${tableName}"`, `Performing delete`);
        const chain: any = {
          data: [],
          error: null,
          eq: (column: string, value: any) => {
            // Find and delete row
            let targetCollection: any[] = [];
            if (tableName === 'users') targetCollection = sandboxData.users;
            else if (tableName === 'user_profiles') targetCollection = sandboxData.profiles;
            else if (tableName === 'partners') targetCollection = sandboxData.partners;
            else if (tableName === 'partner_documents') targetCollection = sandboxData.documents;
            else if (tableName === 'partner_applications') targetCollection = sandboxData.applications;
            else if (tableName === 'driver_applications') targetCollection = sandboxData.driver_applications;
            else if (tableName === 'technician_applications') targetCollection = sandboxData.technician_applications;
            else if (tableName === 'orders') targetCollection = sandboxData.orders || [];
            else if (tableName === 'driver_locations') targetCollection = sandboxData.driver_locations || [];
            else if (tableName === 'chats') targetCollection = sandboxData.chats || [];
            else if (tableName === 'messages') targetCollection = sandboxData.messages || [];
            else if (tableName === 'delivery_tasks') targetCollection = sandboxData.delivery_tasks || [];
            else if (tableName === 'delivery_status_history') targetCollection = sandboxData.delivery_status_history || [];
            else if (tableName === 'wallets') targetCollection = sandboxData.wallets || [];
            else if (tableName === 'wallet_transactions') targetCollection = sandboxData.wallet_transactions || [];
            else if (tableName === 'payments') targetCollection = sandboxData.payments || [];
            else if (tableName === 'payouts') targetCollection = sandboxData.payouts || [];
            else if (tableName === 'refunds') targetCollection = sandboxData.refunds || [];
            else if (tableName === 'invoices') targetCollection = sandboxData.invoices || [];
            else if (tableName === 'commission_settings') targetCollection = sandboxData.commission_settings || [];
            else if (tableName === 'reported_messages') targetCollection = sandboxData.reported_messages || [];
            else if (tableName === 'support_tickets') targetCollection = sandboxData.support_tickets || [];
            else if (tableName === 'support_messages') targetCollection = sandboxData.support_messages || [];
            else if (tableName === 'disputes') targetCollection = sandboxData.disputes || [];
            else if (tableName === 'dispute_evidence') targetCollection = sandboxData.dispute_evidence || [];
            else if (tableName === 'refund_requests') targetCollection = sandboxData.refund_requests || [];
            else if (tableName === 'admin_actions') targetCollection = sandboxData.admin_actions || [];
            else if (tableName === 'ad_campaigns') targetCollection = sandboxData.ad_campaigns || [];
            else if (tableName === 'ad_analytics') targetCollection = sandboxData.ad_analytics || [];
            else if (tableName === 'favorites') targetCollection = (sandboxData as any).favorites || [];
            else if (tableName === 'order_tracking') targetCollection = (sandboxData as any).order_tracking || [];
            else if (tableName === 'technician_locations') targetCollection = (sandboxData as any).technician_locations || [];
            else if (tableName === 'customer_addresses') targetCollection = (sandboxData as any).customer_addresses || [];
            else if (tableName === 'customer_contacts') targetCollection = (sandboxData as any).customer_contacts || [];
            else if (tableName === 'notifications') targetCollection = (sandboxData as any).notifications || [];
            else if (tableName === 'notification_reads') targetCollection = (sandboxData as any).notification_reads || [];
            else if (tableName === 'user_notification_preferences') targetCollection = (sandboxData as any).user_notification_preferences || [];
            else if (tableName === 'carts') targetCollection = (sandboxData as any).carts || [];
            else if (tableName === 'cart_items') targetCollection = (sandboxData as any).cart_items || [];
            else if (tableName === 'order_items') targetCollection = (sandboxData as any).order_items || [];
            else if (tableName === 'order_status_history') targetCollection = (sandboxData as any).order_status_history || [];

            const index = targetCollection.findIndex(item => item[column] === value);
            if (index !== -1) {
              const removed = targetCollection.splice(index, 1)[0];
              saveSandboxData();
              window.dispatchEvent(new CustomEvent('BX_REALTIME_CHANGE', { detail: { table: tableName, action: 'DELETE', record: removed } }));
              addLog('success', 'Database Delete Success 🗑️', `تم حذف السجل بنجاح من جدول ${tableName}.`, 'Owner/Admin policies checked', true);
              chain.data = [removed];
            } else {
              chain.data = [];
            }
            return chain;
          },
          then: (resolve: any) => resolve({ data: chain.data, error: chain.error })
        };
        return chain;
      }
    };
  },

  storage: {
    from: (bucketName: string) => {
      return {
        upload: async (filePath: string, fileBody: File | any) => {
          addLog('query', `Storage: UPLOAD to Bucket "${bucketName}"`, `Path: ${filePath}, Size: ${fileBody.size || 'unknown'} bytes`);

          const currentUserId = sandboxSession?.user?.id;
          let rlsRule = "Authenticated user bucket access";
          let rlsPassed = !!currentUserId;

          if (!rlsPassed) {
            addLog('error', 'Storage RLS Violation 🛡️', `تم رفض الرفع إلى الباكت ${bucketName}. لا يمكن للمستخدمين غير المسجلين رفع ملفات.`, rlsRule, false);
            return {
              data: null,
              error: { message: "Storage policy violation: Access Denied" }
            };
          }

          // Simulate progress delay
          await new Promise(resolve => setTimeout(resolve, 800));

          // Generate simulated link
          // We can use high quality unsplash image mockups or local data paths depending on bucket
          let simulatedUrl = `https://storage.boostx.app/${bucketName}/${filePath}`;
          
          if (bucketName === 'partner-logos') {
            simulatedUrl = 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=200&auto=format&fit=crop&q=60';
          } else if (bucketName === 'partner-covers') {
            simulatedUrl = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80';
          } else {
            // Document
            simulatedUrl = 'https://storage.boostx.app/sandbox-documents/vat_simulated_boostx_ocr_ready.pdf';
          }

          addLog('success', 'Storage Upload Success ☁️', `تم رفع الملف بنجاح إلى "${bucketName}/${filePath}".\nالرابط العام: ${simulatedUrl}`, rlsRule, true);

          return {
            data: { path: filePath, publicUrl: simulatedUrl },
            error: null
          };
        },
        
        getPublicUrl: (filePath: string) => {
          let simulatedUrl = `https://storage.boostx.app/${bucketName}/${filePath}`;
          if (bucketName === 'partner-logos') {
            simulatedUrl = 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=200&auto=format&fit=crop&q=60';
          } else if (bucketName === 'partner-covers') {
            simulatedUrl = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80';
          } else {
            simulatedUrl = 'https://storage.boostx.app/sandbox-documents/vat_simulated_boostx_ocr_ready.pdf';
          }
          return { data: { publicUrl: simulatedUrl } };
        }
      };
    }
  },
  channel: (channelName: string) => {
    addLog('query', `Realtime Channel: Subscribing to "${channelName}"`, `Listening on channel: ${channelName}`);
    const channelInstance = {
      on: (type: string, filter: any, callback: any) => {
        const handler = (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (type === 'postgres_changes') {
            const tableMatch = !filter.table || filter.table === detail.table;
            const eventMatch = filter.event === '*' || filter.event === detail.action;
            if (tableMatch && eventMatch) {
              callback({
                eventType: detail.action,
                new: detail.record,
                old: detail.action === 'UPDATE' ? detail.record : null
              });
            }
          }
        };
        window.addEventListener('BX_REALTIME_CHANGE', handler);
        return channelInstance;
      },
      subscribe: () => {
        addLog('success', `Realtime Subscribed ✅`, `Connected to channel "${channelName}"`);
        return channelInstance;
      },
      unsubscribe: () => {
        addLog('info', `Realtime Unsubscribed 🔌`, `Disconnected from channel "${channelName}"`);
      }
    };
    return channelInstance;
  }
};

// WhatsApp Gateway Configurations & Helpers
export const getWhatsAppConfig = () => {
  return {
    active: localStorage.getItem('BOOSTX_WHATSAPP_ACTIVE') === 'true',
    apiUrl: localStorage.getItem('BOOSTX_WHATSAPP_API_URL') || 'https://api.ultramsg.com',
    instanceId: localStorage.getItem('BOOSTX_WHATSAPP_INSTANCE_ID') || '',
    token: localStorage.getItem('BOOSTX_WHATSAPP_TOKEN') || ''
  };
};

export const saveWhatsAppConfig = (active: boolean, apiUrl: string, instanceId: string, token: string) => {
  localStorage.setItem('BOOSTX_WHATSAPP_ACTIVE', active ? 'true' : 'false');
  localStorage.setItem('BOOSTX_WHATSAPP_API_URL', apiUrl);
  localStorage.setItem('BOOSTX_WHATSAPP_INSTANCE_ID', instanceId);
  localStorage.setItem('BOOSTX_WHATSAPP_TOKEN', token);
  addLog('success', 'إعدادات بوابة واتساب', `تم حفظ إعدادات الواتساب بنجاح. وضع الإرسال: ${active ? 'نشط (Live WhatsApp)' : 'خامل (المحاكاة المحلية)'}`);
};

export const sendWhatsAppMessage = async (to: string, message: string): Promise<boolean> => {
  const config = getWhatsAppConfig();
  
  // Format target phone number cleanly (remove leading +, spaces, ensure country code)
  let formattedPhone = to.trim().replace(/\+/g, '').replace(/\s+/g, '');
  if (formattedPhone.startsWith('05')) {
    formattedPhone = '966' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('5')) {
    formattedPhone = '966' + formattedPhone;
  }
  
  if (!config.active) {
    addLog('info', 'محاكاة إرسال واتساب 💬', `الرسالة الموجهة إلى ${formattedPhone}:\n"${message}"`);
    return true;
  }
  
  if (!config.instanceId || !config.token) {
    addLog('error', 'خطأ في بوابة واتساب ❌', 'بوابة واتساب مفعلة ولكن لم يتم تهيئة الـ Instance ID أو الـ Token.');
    return false;
  }
  
  try {
    addLog('query', 'إرسال رسالة عبر واتساب 💬', `جاري إرسال الرسالة إلى ${formattedPhone} عبر UltraMsg...`);
    const response = await fetch(`${config.apiUrl}/${config.instanceId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: config.token,
        to: formattedPhone,
        body: message
      })
    });
    
    const resData = await response.json();
    if (resData.sent === 'true' || resData.id) {
      addLog('success', 'نجاح إرسال رسالة واتساب ✅', `تم إرسال الرسالة بنجاح إلى الرقم ${formattedPhone}! المعرف: ${resData.id}`);
      return true;
    } else {
      addLog('error', 'فشل إرسال رسالة واتساب ❌', `فشلت البوابة في الإرسال: ${JSON.stringify(resData)}`);
      return false;
    }
  } catch (error: any) {
    console.error('WhatsApp Gateway Send Error:', error);
    addLog('error', 'خطأ في خادم واتساب ❌', `فشل الاتصال بخادم البوابة: ${error.message || error}`);
    return false;
  }
};

// Mode selection state: default is sandbox unless config is successful AND user toggled live mode
let useSandboxMode = true;

// Force sandbox if realSupabase is null
if (!realSupabase) {
  useSandboxMode = true;
} else {
  // Read preference from localStorage
  const pref = localStorage.getItem('BOOSTX_USE_LIVE_SUPABASE');
  useSandboxMode = pref !== 'true';
}

export const getSupabaseMode = () => {
  return {
    isSandbox: useSandboxMode,
    hasRealClient: !!realSupabase,
    url: config.url,
    initError
  };
};

export const setSupabaseMode = (isSandbox: boolean) => {
  if (isSandbox) {
    useSandboxMode = true;
    localStorage.setItem('BOOSTX_USE_LIVE_SUPABASE', 'false');
    addLog('info', 'وضع التشغيل', 'تم التحويل إلى وضع محاكي Supabase الذكي (Interactive Sandbox).');
  } else {
    if (!realSupabase) {
      addLog('error', 'خطأ في تفعيل الاتصال المباشر', 'لا يمكن الانتقال للوضع المباشر لعدم توفر بيانات الاتصال أو فشل تهيئة العميل.');
      return false;
    }
    useSandboxMode = false;
    localStorage.setItem('BOOSTX_USE_LIVE_SUPABASE', 'true');
    addLog('success', 'وضع التشغيل', `تم التحويل بنجاح للربط المباشر بقاعدة بيانات Supabase الحية: ${config.url}`);
  }
  return true;
};

export const saveCustomCredentials = (url: string, anonKey: string) => {
  localStorage.setItem('BOOSTX_SUPABASE_URL', url);
  localStorage.setItem('BOOSTX_SUPABASE_ANON_KEY', anonKey);
  // Reload window to re-instantiate client with new configurations
  addLog('success', 'حفظ الإعدادات', 'تم حفظ بيانات الاتصال بنجاح. سيتم تحديث الصفحة لإعادة التهيئة...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

export const resetCustomCredentials = () => {
  localStorage.removeItem('BOOSTX_SUPABASE_URL');
  localStorage.removeItem('BOOSTX_SUPABASE_ANON_KEY');
  localStorage.removeItem('BOOSTX_USE_LIVE_SUPABASE');
  localStorage.removeItem('BX_SANDBOX_SESSION');
  localStorage.removeItem('BX_SANDBOX_USERS');
  localStorage.removeItem('BX_SANDBOX_PROFILES');
  localStorage.removeItem('BX_SANDBOX_PARTNERS');
  localStorage.removeItem('BX_SANDBOX_DOCUMENTS');
  localStorage.removeItem('BX_SANDBOX_APPLICATIONS');
  localStorage.removeItem('BX_SANDBOX_DRIVER_APPLICATIONS');
  localStorage.removeItem('BX_SANDBOX_TECHNICIAN_APPLICATIONS');
  localStorage.removeItem('BX_SANDBOX_SUPPORT_TICKETS');
  localStorage.removeItem('BX_SANDBOX_SUPPORT_MESSAGES');
  localStorage.removeItem('BX_SANDBOX_DISPUTES');
  localStorage.removeItem('BX_SANDBOX_DISPUTE_EVIDENCE');
  localStorage.removeItem('BX_SANDBOX_REFUND_REQUESTS');
  localStorage.removeItem('BX_SANDBOX_ADMIN_ACTIONS');
  localStorage.removeItem('BX_SANDBOX_CATEGORIES');
  
  addLog('info', 'إعادة تعيين', 'تمت إزالة كافة الإعدادات المخصصة ومسح الذاكرة المحلية.');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Export the client wrapper
export const supabase = new Proxy({} as any, {
  get: (_target, prop) => {
    // Return either real client or sandbox client
    if (useSandboxMode) {
      return (sandboxClient as any)[prop];
    } else {
      return realSupabase ? realSupabase[prop] : (sandboxClient as any)[prop];
    }
  }
});
