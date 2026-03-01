-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chi_tiet_de_xuat (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  phieu_id uuid,
  mon_hoc_id bigint,
  vat_tu_id bigint,
  so_luong_de_xuat integer NOT NULL CHECK (so_luong_de_xuat > 0),
  so_luong_thuc_xuat integer DEFAULT 0,
  CONSTRAINT chi_tiet_de_xuat_pkey PRIMARY KEY (id),
  CONSTRAINT chi_tiet_de_xuat_phieu_id_fkey FOREIGN KEY (phieu_id) REFERENCES public.phieu_de_xuat(id),
  CONSTRAINT chi_tiet_de_xuat_mon_hoc_id_fkey FOREIGN KEY (mon_hoc_id) REFERENCES public.mon_hoc(id),
  CONSTRAINT chi_tiet_de_xuat_vat_tu_id_fkey FOREIGN KEY (vat_tu_id) REFERENCES public.vat_tu(id)
);
CREATE TABLE public.don_vi (
  ten_don_vi text NOT NULL,
  CONSTRAINT don_vi_pkey PRIMARY KEY (ten_don_vi)
);
CREATE TABLE public.giao_vien (
  id uuid NOT NULL,
  ho_ten text NOT NULL,
  ma_so_gv text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT giao_vien_pkey PRIMARY KEY (id),
  CONSTRAINT giao_vien_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.he_dao_tao (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  ten_he text NOT NULL UNIQUE,
  CONSTRAINT he_dao_tao_pkey PRIMARY KEY (id)
);
CREATE TABLE public.instruments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  CONSTRAINT instruments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.khoa (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  ten_khoa text NOT NULL UNIQUE,
  CONSTRAINT khoa_pkey PRIMARY KEY (id)
);
CREATE TABLE public.khoa_mon_hoc (
  khoa_id bigint NOT NULL,
  mon_hoc_id bigint NOT NULL,
  CONSTRAINT khoa_mon_hoc_pkey PRIMARY KEY (khoa_id, mon_hoc_id)
);
CREATE TABLE public.mon_hoc (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  ten_mon_hoc text NOT NULL,
  ma_mon_hoc text UNIQUE,
  ghi_chu text,
  CONSTRAINT mon_hoc_pkey PRIMARY KEY (id)
);
CREATE TABLE public.nganh (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  ten_nganh text NOT NULL,
  ma_nganh text UNIQUE,
  khoa_id bigint,
  CONSTRAINT nganh_pkey PRIMARY KEY (id),
  CONSTRAINT nganh_khoa_id_fkey FOREIGN KEY (khoa_id) REFERENCES public.khoa(id)
);
CREATE TABLE public.nganh_he_mon (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nganh_id bigint,
  he_id bigint,
  mon_hoc_id bigint,
  CONSTRAINT nganh_he_mon_pkey PRIMARY KEY (id)
);
CREATE TABLE public.nhat_ky_kho (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  vat_tu_id bigint,
  so_luong integer NOT NULL,
  loai_gd USER-DEFINED,
  phieu_lien_quan_id uuid,
  ngay_ghi_so timestamp with time zone DEFAULT now(),
  CONSTRAINT nhat_ky_kho_pkey PRIMARY KEY (id),
  CONSTRAINT nhat_ky_kho_vat_tu_id_fkey FOREIGN KEY (vat_tu_id) REFERENCES public.vat_tu(id)
);
CREATE TABLE public.phieu_de_xuat (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nguoi_de_xuat_id uuid DEFAULT auth.uid(),
  ngay_de_xuat timestamp with time zone DEFAULT now(),
  trang_thai USER-DEFINED DEFAULT 'nhap_thanh'::trang_thai_phieu,
  ly_do_de_xuat text,
  CONSTRAINT phieu_de_xuat_pkey PRIMARY KEY (id),
  CONSTRAINT phieu_de_xuat_nguoi_de_xuat_id_fkey FOREIGN KEY (nguoi_de_xuat_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  ho_ten text NOT NULL,
  ma_so_nv text UNIQUE,
  role text DEFAULT 'giao_vien'::text CHECK (role = ANY (ARRAY['admin'::text, 'truong_khoa'::text, 'nhan_vien_kho'::text, 'giao_vien'::text])),
  khoa_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_khoa_id_fkey FOREIGN KEY (khoa_id) REFERENCES public.khoa(id)
);
CREATE TABLE public.vat_tu (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  ten_vat_tu text NOT NULL,
  don_vi text,
  so_luong_ton_kho integer DEFAULT 0,
  don_gia_tham_khao double precision,
  hinh_anh text,
  yeu_cau_ky_thuat text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vat_tu_pkey PRIMARY KEY (id),
  CONSTRAINT vat_tu_don_vi_fkey FOREIGN KEY (don_vi) REFERENCES public.don_vi(ten_don_vi)
);

SQL Editor Query
-- 0. DỌN DẸP (Xóa theo thứ tự ngược để tránh lỗi Foreign Key)
DROP TRIGGER IF EXISTS trg_cap_nhat_kho ON public.chi_tiet_de_xuat;
DROP FUNCTION IF EXISTS public.update_stock_after_issue();
DROP TABLE IF EXISTS public.nhat_ky_kho, public.chi_tiet_de_xuat, public.phieu_de_xuat, 
                     public.phan_cong_giang_day, public.profiles, public.vat_tu, 
                     public.mon_hoc, public.he_dao_tao, public.nganh, public.khoa, public.don_vi CASCADE;
DROP TYPE IF EXISTS public.trang_thai_phieu;
DROP TYPE IF EXISTS public.loai_giao_dich;

-- 1. TẠO TYPE
CREATE TYPE public.trang_thai_phieu AS ENUM ('nhap_thanh', 'cho_khoa_duyet', 'cho_mua_sam', 'san_sang_cap_phat', 'da_hoan_thanh', 'da_tu_choi');
CREATE TYPE public.loai_giao_dich AS ENUM ('nhap_kho', 'xuat_kho', 'dieu_chinh');

-- 2. CÁC BẢNG DANH MỤC
CREATE TABLE public.don_vi (ten_don_vi text PRIMARY KEY);
CREATE TABLE public.khoa (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ten_khoa text NOT NULL UNIQUE);
CREATE TABLE public.nganh (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ten_nganh text NOT NULL, ma_nganh text UNIQUE, khoa_id bigint REFERENCES public.khoa(id));
CREATE TABLE public.he_dao_tao (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ten_he text NOT NULL UNIQUE);
CREATE TABLE public.mon_hoc (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ten_mon_hoc text NOT NULL, ma_mon_hoc text UNIQUE, ghi_chu text);

-- 3. VẬT TƯ & PROFILE
CREATE TABLE public.vat_tu (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_vat_tu text NOT NULL,
    don_vi text REFERENCES public.don_vi(ten_don_vi),
    so_luong_ton_kho integer DEFAULT 0,
    don_gia_tham_khao double precision,
    hinh_anh text,
    yeu_cau_ky_thuat text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    ho_ten text NOT NULL,
    ma_so_nv text UNIQUE,
    role text DEFAULT 'giao_vien' CHECK (role IN ('admin', 'truong_khoa', 'nhan_vien_kho', 'giao_vien')),
    khoa_id bigint REFERENCES public.khoa(id),
    created_at timestamp with time zone DEFAULT now()
);

-- 4. PHIẾU ĐỀ XUẤT
CREATE TABLE public.phieu_de_xuat (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nguoi_de_xuat_id uuid REFERENCES public.profiles(id) DEFAULT auth.uid(),
    ngay_de_xuat timestamp with time zone DEFAULT now(),
    trang_thai public.trang_thai_phieu DEFAULT 'nhap_thanh',
    ly_do_de_xuat text
);

CREATE TABLE public.chi_tiet_de_xuat (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phieu_id uuid REFERENCES public.phieu_de_xuat(id) ON DELETE CASCADE,
    mon_hoc_id bigint REFERENCES public.mon_hoc(id),
    vat_tu_id bigint REFERENCES public.vat_tu(id),
    so_luong_de_xuat integer NOT NULL CHECK (so_luong_de_xuat > 0),
    so_luong_thuc_xuat integer DEFAULT 0
);

-- 5. NHẬT KÝ KHO (Audit Log)
CREATE TABLE public.nhat_ky_kho (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vat_tu_id bigint REFERENCES public.vat_tu(id),
    so_luong integer NOT NULL,
    loai_gd public.loai_giao_dich,
    phieu_lien_quan_id uuid,
    ngay_ghi_so timestamp with time zone DEFAULT now()
);

-- ======================================================
-- 6. ROW LEVEL SECURITY (RLS) - BẢO MẬT DỮ LIỆU
-- ======================================================

-- Bật RLS cho các bảng quan trọng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phieu_de_xuat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chi_tiet_de_xuat ENABLE ROW LEVEL SECURITY;

-- Policy cho Profiles: Ai cũng xem được profile cơ bản, nhưng chỉ mình sửa của mình
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

-- Policy cho Phieu_de_xuat:
-- 1. Giáo viên chỉ thấy phiếu mình tạo
CREATE POLICY "Giao vien xem phieu cua minh" ON public.phieu_de_xuat
    FOR SELECT USING (auth.uid() = nguoi_de_xuat_id);

-- 2. Trưởng khoa thấy phiếu của giáo viên trong khoa mình
CREATE POLICY "Truong khoa xem phieu trong khoa" ON public.phieu_de_xuat
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'truong_khoa'
            AND profiles.khoa_id = (SELECT khoa_id FROM public.profiles WHERE id = phieu_de_xuat.nguoi_de_xuat_id)
        )
    );

-- 3. Admin & Kho thấy hết
CREATE POLICY "Admin xem tat ca" ON public.phieu_de_xuat
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'nhan_vien_kho'))
    );

-- Policy cho Chi_tiet_de_xuat (Kế thừa từ phieu_de_xuat)
CREATE POLICY "Chi tiet phieu theo quyen truy cap phieu" ON public.chi_tiet_de_xuat
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.phieu_de_xuat WHERE id = chi_tiet_de_xuat.phieu_id)
    );

-- ======================================================
-- 7. TRIGGER TỰ ĐỘNG CẬP NHẬT TỒN KHO (Tư duy Dev Fullstack)
-- ======================================================

CREATE OR REPLACE FUNCTION public.update_stock_after_issue()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu có dữ liệu xuất kho thực tế, trừ tồn kho ở bảng vật tư
    IF (TG_OP = 'UPDATE' AND NEW.so_luong_thuc_xuat > OLD.so_luong_thuc_xuat) THEN
        UPDATE public.vat_tu 
        SET so_luong_ton_kho = so_luong_ton_kho - (NEW.so_luong_thuc_xuat - OLD.so_luong_thuc_xuat)
        WHERE id = NEW.vat_tu_id;
        
        -- Ghi log vào nhật ký kho
        INSERT INTO public.nhat_ky_kho (vat_tu_id, so_luong, loai_gd, phieu_lien_quan_id, nguoi_thuc_hien)
        VALUES (NEW.vat_tu_id, -(NEW.so_luong_thuc_xuat - OLD.so_luong_thuc_xuat), 'xuat_kho', NEW.phieu_id, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cap_nhat_kho
AFTER UPDATE ON public.chi_tiet_de_xuat
FOR EACH ROW EXECUTE FUNCTION public.update_stock_after_issue();