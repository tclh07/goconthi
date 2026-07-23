/* ============================================================
   GócÔnThi — Supabase Config
   Kết nối frontend với Supabase backend
   ============================================================ */

/* ---- CẤU HÌNH: Thay bằng giá trị thật từ Supabase Dashboard ---- */
var SUPABASE_URL  = 'https://vvhcakgwlcknpjqzozii.supabase.co';
var SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aGNha2d3bGNrbnBqcXpvemlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTA3MjQsImV4cCI6MjEwMDM2NjcyNH0.n8QeE5dR0z7haw9JxO9zUtGqNkssII19F21rOBBP8JU';

/* ---- Khởi tạo client ---- */
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   AUTH — Thay thế localStorage auth cũ
   ============================================================ */
var Auth = {
  /* Đăng ký bằng email */
  signUp: async function(email, password, fullName) {
    var result = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: fullName } }
    });
    return result;
  },

  /* Đăng nhập bằng email */
  signIn: async function(email, password) {
    var result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    return result;
  },

  /* Đăng nhập bằng Google */
  signInGoogle: async function() {
    var result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return result;
  },

  /* Đăng xuất */
  signOut: async function() {
    return await supabase.auth.signOut();
  },

  /* Lấy user hiện tại (null nếu chưa đăng nhập) */
  getUser: async function() {
    var result = await supabase.auth.getUser();
    return result.data.user;
  },

  /* Lấy session hiện tại */
  getSession: async function() {
    var result = await supabase.auth.getSession();
    return result.data.session;
  },

  /* Lắng nghe thay đổi auth (đăng nhập/đăng xuất) */
  onAuthChange: function(callback) {
    supabase.auth.onAuthStateChange(function(event, session) {
      callback(event, session);
    });
  }
};

/* ============================================================
   DATABASE — Thay thế fetch JSON tĩnh
   ============================================================ */
var DB = {
  /* ---- SUBJECTS ---- */
  getSubjects: async function() {
    var result = await supabase
      .from('subjects')
      .select('*')
      .order('count', { ascending: false });
    return result.data || [];
  },

  /* ---- DOCUMENTS ---- */
  getDocs: async function(filters) {
    var query = supabase.from('documents').select('*');

    if (filters) {
      if (filters.subject && filters.subject !== 'all')
        query = query.eq('subject', filters.subject);
      if (filters.type && filters.type !== 'all')
        query = query.eq('type', filters.type);
      if (filters.year && filters.year !== 'all')
        query = query.eq('year', parseInt(filters.year));
      if (filters.price === 'free')
        query = query.eq('price', 0);
      if (filters.price === 'premium')
        query = query.gt('price', 0);
      if (filters.search) {
        query = query.or(
          'title.ilike.%' + filters.search + '%,' +
          'source.ilike.%' + filters.search + '%'
        );
      }
    }

    var result = await query.order('downloads', { ascending: false });
    return result.data || [];
  },

  getDocById: async function(id) {
    var result = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    return result.data;
  },

  /* Tăng lượt tải */
  incrementDownload: async function(docId) {
    await supabase.rpc('increment_download', { doc_id: docId });
  },

  /* ---- ORDERS ---- */
  createOrder: async function(order) {
    var result = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    return result.data;
  },

  getOrderByCode: async function(code) {
    var result = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', code)
      .single();
    return result.data;
  },

  isDocApproved: async function(docId, userId) {
    var result = await supabase
      .from('orders')
      .select('id')
      .eq('doc_id', docId)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .limit(1);
    return result.data && result.data.length > 0;
  },

  /* Admin: lấy tất cả đơn hàng */
  getAllOrders: async function(status) {
    var query = supabase.from('orders').select('*');
    if (status && status !== 'all') query = query.eq('status', status);
    var result = await query.order('created_at', { ascending: false });
    return result.data || [];
  },

  /* Admin: duyệt/từ chối đơn */
  updateOrderStatus: async function(orderCode, status, approvedBy) {
    var update = { status: status };
    if (approvedBy) update.approved_by = approvedBy;
    if (status === 'approved') update.approved_at = new Date().toISOString();

    var result = await supabase
      .from('orders')
      .update(update)
      .eq('order_code', orderCode);
    return result;
  },

  getPendingCount: async function() {
    var result = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    return result.count || 0;
  },

  /* ---- POSTS ---- */
  getPosts: async function(category) {
    var query = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published');

    if (category && category !== 'all')
      query = query.eq('category', category);

    var result = await query.order('created_at', { ascending: false });
    return result.data || [];
  },

  getFeaturedPost: async function() {
    var result = await supabase
      .from('posts')
      .select('*')
      .eq('featured', true)
      .eq('status', 'published')
      .limit(1)
      .single();
    return result.data;
  },

  /* ---- FAVORITES ---- */
  getFavorites: async function(userId) {
    var result = await supabase
      .from('favorites')
      .select('*, documents(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return result.data || [];
  },

  toggleFavorite: async function(userId, docId) {
    /* Kiểm tra đã yêu thích chưa */
    var check = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('doc_id', docId)
      .limit(1);

    if (check.data && check.data.length > 0) {
      await supabase.from('favorites').delete().eq('id', check.data[0].id);
      return false; /* đã bỏ yêu thích */
    } else {
      await supabase.from('favorites').insert({ user_id: userId, doc_id: docId });
      return true; /* đã thêm yêu thích */
    }
  },

  isFavorited: async function(userId, docId) {
    var result = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('doc_id', docId)
      .limit(1);
    return result.data && result.data.length > 0;
  },

  /* ---- DOWNLOAD HISTORY ---- */
  addDownloadHistory: async function(userId, docId) {
    await supabase
      .from('download_history')
      .insert({ user_id: userId, doc_id: docId });
  },

  getDownloadHistory: async function(userId) {
    var result = await supabase
      .from('download_history')
      .select('*, documents(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return result.data || [];
  }
};

/* ============================================================
   STORAGE — Upload/Download file
   ============================================================ */
var Storage = {
  /* Upload file đề thi (admin) */
  uploadDocument: async function(file, fileName) {
    var result = await supabase.storage
      .from('documents')
      .upload(fileName, file);
    return result;
  },

  /* Lấy URL tải file (có bảo mật, hết hạn sau 1 giờ) */
  getDocumentUrl: async function(fileName) {
    var result = await supabase.storage
      .from('documents')
      .createSignedUrl(fileName, 3600);
    return result.data ? result.data.signedUrl : null;
  },

  /* Upload thumbnail (public) */
  uploadThumbnail: async function(file, fileName) {
    var result = await supabase.storage
      .from('thumbnails')
      .upload(fileName, file);
    return result;
  },

  /* Lấy URL thumbnail (public, không hết hạn) */
  getThumbnailUrl: function(fileName) {
    var result = supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName);
    return result.data.publicUrl;
  },

  /* Upload ảnh bài viết (public) */
  uploadPostImage: async function(file, fileName) {
    var result = await supabase.storage
      .from('post-images')
      .upload(fileName, file);
    return result;
  },

  getPostImageUrl: function(fileName) {
    var result = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);
    return result.data.publicUrl;
  }
};
