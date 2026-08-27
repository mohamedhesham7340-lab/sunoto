import React, { useState } from 'react';
import { Database, Sparkles, CheckCircle2, ShieldCheck, Copy, Check, ExternalLink, Zap, AlertTriangle, HelpCircle, Code, Layers, Server, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const VercelGuideView: React.FC = () => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const envSample = `# في لوحة تحكم Vercel > Settings > Environment Variables:
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-123.eu-central-1.aws.neon.tech/neondb?sslmode=require"
POSTGRES_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-123.eu-central-1.aws.neon.tech/neondb?sslmode=require"
`;

  const sqlSample = `-- ==========================================================
-- مخطط قاعدة بيانات المتجر الفرعوني وعروض الأسعار على Neon
-- تم تصميمه للعمل تلقائياً وبكفاءة مع منصة Vercel و Node.js
-- ==========================================================

-- 1. جدول المنتجات والتحف الفرعونية
CREATE TABLE IF NOT EXISTS pharaoh_products (
  id VARCHAR(100) PRIMARY KEY,
  item_code VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  original_price NUMERIC(12, 2),
  description TEXT,
  short_desc TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  material TEXT,
  dimensions VARCHAR(255),
  weight VARCHAR(100),
  min_quantity INTEGER DEFAULT 1,
  stock_status VARCHAR(50) DEFAULT 'in_stock',
  is_featured BOOLEAN DEFAULT false,
  wholesale_tiers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول عروض الأسعار والطلبات الواردة
CREATE TABLE IF NOT EXISTS pharaoh_quotes (
  id VARCHAR(100) PRIMARY KEY,
  quote_number VARCHAR(100) UNIQUE,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(100) NOT NULL,
  client_email VARCHAR(255),
  company_name VARCHAR(255),
  delivery_city VARCHAR(100),
  items JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(12, 2) DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EGP',
  notes TEXT,
  valid_until VARCHAR(100),
  status VARCHAR(50) DEFAULT 'sent_whatsapp',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول بيانات وسجل العملاء ومسؤولي المشتريات
CREATE TABLE IF NOT EXISTS pharaoh_customers (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  company VARCHAR(255),
  city VARCHAR(100),
  total_quotes INTEGER DEFAULT 1,
  last_inquiry TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول إعدادات الموقع ونسب التحويل
CREATE TABLE IF NOT EXISTS pharaoh_settings (
  key VARCHAR(50) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء فهارس لتحسين سرعة الاستعلامات
CREATE INDEX IF NOT EXISTS idx_products_category ON pharaoh_products(category);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON pharaoh_quotes(created_at DESC);
`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSample);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestDb = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const status = await api.getDbStatus();
      if (status.connected) {
        setTestResult(`✅ متصل بنجاح بقاعدة البيانات (${status.type}) - عدد المنتجات: ${status.productCount || 0}، عدد عروض الأسعار: ${status.quoteCount || 0}`);
      } else {
        setTestResult(`ℹ️ الموقع يعمل حالياً بنظام التخزين المحلي الآمن (Local Storage/Memory Fallback). عند رفع الموقع على Vercel ووضع DATABASE_URL سيتصل تلقائياً بقاعدة Neon.`);
      }
    } catch (e: any) {
      setTestResult(`⚠️ تعذر فحص الاتصال: ${e.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-cairo" dir="rtl">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-[#1A1A1A] p-6 sm:p-8 rounded border-2 border-[#D4AF37] shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#2D241E] border border-[#D4AF37] text-[#D4AF37] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>الدليل الشامل للنشر والربط بقواعد بيانات Neon على Vercel</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-pharaoh text-[#D4AF37]">
          خطوات نشر الموقع على منصة Vercel وربط Neon PostgreSQL
        </h1>

        <p className="text-xs sm:text-sm text-[#C5BBAF] leading-relaxed max-w-3xl">
          تم تزويد الموقع بنظام <strong className="text-[#D4AF37]">التهيئة الذاتية المقاومة للأخطاء (Auto-Healing & Auto-Migrate)</strong>. السيرفر يقوم بإنشاء الجداول وحفظ البيانات تلقائياً، مع دعم التخزين الاحتياطي في حال عدم إدخال رابط قاعدة البيانات.
        </p>

        {/* Live DB Quick Tester */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleTestDb}
            disabled={testingConnection}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1A1A1A] text-xs font-extrabold px-4 py-2 rounded transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>{testingConnection ? 'جاري فحص الاتصال...' : 'فحص حالة الاتصال الحالية بقاعدة البيانات'}</span>
          </button>
          {testResult && (
            <div className="text-xs p-2 rounded bg-[#2D241E] border border-[#D4AF37]/50 text-[#FDFBF7]">
              {testResult}
            </div>
          )}
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1A1A1A] p-5 rounded border border-[#D4AF37]/40 space-y-2">
          <div className="w-10 h-10 rounded bg-[#2D241E] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#D4AF37] font-pharaoh">1. إنشاء الجداول تلقائياً</h3>
          <p className="text-xs text-[#C5BBAF] leading-relaxed">
            بمجرد ربط <code className="text-[#D4AF37] font-mono">DATABASE_URL</code> يقوم السيرفر بإنشاء جداول المنتجات وعروض الأسعار والعملاء والإعدادات وحقن البيانات فوراً.
          </p>
        </div>

        <div className="bg-[#1A1A1A] p-5 rounded border border-[#D4AF37]/40 space-y-2">
          <div className="w-10 h-10 rounded bg-[#2D241E] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#D4AF37] font-pharaoh">2. حماية ضد توقف الموقع</h3>
          <p className="text-xs text-[#C5BBAF] leading-relaxed">
            في حال تأخر اتصال السيرفر بقاعدة البيانات، يتحول المتجر بسلاسة إلى التخزين المحلي لضمان استمرار تصفح العملاء وتقديم عروض الأسعار بدون أخطاء.
          </p>
        </div>

        <div className="bg-[#1A1A1A] p-5 rounded border border-[#D4AF37]/40 space-y-2">
          <div className="w-10 h-10 rounded bg-[#2D241E] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#D4AF37] font-pharaoh">3. ربط بنقرة واحدة (1-Click)</h3>
          <p className="text-xs text-[#C5BBAF] leading-relaxed">
            يمكن ربط Neon مباشرة من لوحة Vercel عبر تبويب <strong className="text-[#D4AF37]">Storage</strong> ليتم تعيين المتغيرات تلقائياً.
          </p>
        </div>
      </div>

      {/* Step by Step Comprehensive Deployment Guide */}
      <div className="bg-[#1A1A1A] p-6 sm:p-8 rounded border-2 border-[#D4AF37] space-y-6">
        <h2 className="text-xl font-black font-pharaoh text-[#D4AF37] border-b border-[#D4AF37]/30 pb-3 flex items-center gap-2">
          <Server className="w-5 h-5 text-[#D4AF37]" />
          <span>خطوات النشر على Vercel بالتفصيل (3 خطوات سهلة):</span>
        </h2>

        {/* Step 1 */}
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-[#D4AF37] text-[#1A1A1A] font-black text-sm flex items-center justify-center shrink-0 border border-[#D4AF37]">
            1
          </div>
          <div className="space-y-2 flex-1 text-xs">
            <h3 className="text-sm font-bold text-[#D4AF37]">تصدير كود المشروع إلى مستودع GitHub:</h3>
            <p className="text-[#C5BBAF] leading-relaxed">
              من القائمة العلوية في هذه المنصة، اضغط على زر <strong>Export to GitHub</strong> لإنشاء مستودع مباشر، أو قم بتنزيل ملف الـ ZIP ورفعه إلى حسابك على <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#D4AF37] underline font-bold">GitHub</a>.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-[#D4AF37] text-[#1A1A1A] font-black text-sm flex items-center justify-center shrink-0 border border-[#D4AF37]">
            2
          </div>
          <div className="space-y-2 flex-1 text-xs">
            <h3 className="text-sm font-bold text-[#D4AF37]">استيراد المشروع على Vercel وربط قاعدة بيانات Neon:</h3>
            <p className="text-[#C5BBAF] leading-relaxed">
              سجّل الدخول في موقع <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#D4AF37] underline font-bold">Vercel.com</a> ثم اتبع الآتي:
            </p>
            <div className="bg-[#2D241E] p-4 rounded border border-[#D4AF37]/30 space-y-2 text-[#FDFBF7]">
              <div className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">أ.</span>
                <span>اضغط على <strong>"Add New Project"</strong> واختر مستودع GitHub الذي قمت بتصديره.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">ب.</span>
                <span>في خيار Framework Preset، سيتم التعرف عليه كـ <strong>Vite / Node.js</strong> تلقائياً.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">ج.</span>
                <span>لربط قاعدة بيانات Neon: انتقل لتبويب <strong>Storage</strong> في Vercel، اضغط <strong>Create Database</strong>، ثم اختر <strong>Neon (Postgres)</strong> واضغط <strong>Connect to Project</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">د.</span>
                <span>(خيار بديل): إذا أنشأت قاعدة البيانات مباشرة من موقع <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-[#D4AF37] underline">Neon.tech</a>، انسخ الـ Connection String وضعها في <strong>Environment Variables</strong> باسم <code className="text-[#D4AF37] font-mono">DATABASE_URL</code>.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-[#D4AF37] text-[#1A1A1A] font-black text-sm flex items-center justify-center shrink-0 border border-[#D4AF37]">
            3
          </div>
          <div className="space-y-2 flex-1 text-xs">
            <h3 className="text-sm font-bold text-[#D4AF37]">الضغط على "Deploy" وبدء التشغيل الفوري:</h3>
            <p className="text-[#C5BBAF] leading-relaxed">
              اضغط على زر <strong>Deploy</strong>. خلال دقيقة واحدة سيكتمل البناء ويظهر رابط موقعك المباشر. عند فتح لوحة التحكم، ستلاحظ علامة الاتصال الخضراء 🟢 وتزامن المنتجات وعروض الأسعار فوراً.
            </p>
          </div>
        </div>

      </div>

      {/* SQL Schema Box */}
      <div className="bg-[#1A1A1A] p-6 rounded border-2 border-[#D4AF37] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4AF37]/30 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-[#D4AF37] font-pharaoh">
              <Code className="w-4 h-4 text-[#D4AF37]" />
              <span>مخطط الجداول الكامل (Neon PostgreSQL Schema)</span>
            </div>
            <p className="text-[11px] text-[#C5BBAF]">
              (ملاحظة: السيرفر ينشئ هذه الجداول تلقائياً، ولكن يمكنك تنفيذها يدوياً في Neon SQL Editor إن أردت)
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 text-xs bg-[#2D241E] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] px-3.5 py-2 rounded border border-[#D4AF37] transition-all font-bold"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'تم نسخ سكربت SQL!' : 'نسخ مخطط SQL'}</span>
          </button>
        </div>

        <pre className="bg-[#0D0D0D] p-4 rounded border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-xs overflow-x-auto max-h-80 leading-relaxed" dir="ltr">
          {sqlSample}
        </pre>
      </div>

      {/* Environment Variables Box */}
      <div className="bg-[#1A1A1A] p-6 rounded border-2 border-[#D4AF37] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#D4AF37]">صيغة متغير البيئة في إعدادات Vercel:</span>
          <button
            onClick={handleCopyEnv}
            className="flex items-center gap-1.5 text-xs bg-[#2D241E] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] px-3 py-1.5 rounded border border-[#D4AF37] transition-all font-bold"
          >
            {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEnv ? 'تم النسخ!' : 'نسخ المتغير'}</span>
          </button>
        </div>

        <pre className="bg-[#0D0D0D] p-3.5 rounded border border-[#D4AF37]/30 text-[#FDFBF7] font-mono text-xs overflow-x-auto" dir="ltr">
          {envSample}
        </pre>
      </div>

      {/* Common Errors & Troubleshooting */}
      <div className="bg-[#1A1A1A] p-6 rounded border-2 border-[#D4AF37] space-y-4">
        <h3 className="text-sm font-bold text-[#D4AF37] font-pharaoh flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
          <span>استكشاف الأخطاء الشائعة وحلها (Troubleshooting):</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#2D241E] p-3.5 rounded border border-[#D4AF37]/30 space-y-1.5">
            <h4 className="font-bold text-[#D4AF37]">1. خطأ رفض شهادة الأمان (SSL / self-signed certificate):</h4>
            <p className="text-[#C5BBAF] leading-relaxed">
              تأكد دائماً من إضافة <code className="text-[#D4AF37] font-mono">?sslmode=require</code> في نهاية رابط اتصال Neon. السيرفر مُهيأ تلقائياً لتخطي فحص الشهادات الذاتية.
            </p>
          </div>

          <div className="bg-[#2D241E] p-3.5 rounded border border-[#D4AF37]/30 space-y-1.5">
            <h4 className="font-bold text-[#D4AF37]">2. خطأ اتصال Vercel Function Timeout:</h4>
            <p className="text-[#C5BBAF] leading-relaxed">
              تستخدم قاعدة بيانات Neon ميزة Serverless Auto-suspend (إيقاف التشغيل التلقائي عند عدم الاستخدام). أول اتصال قد يستغرق ثانية إضافية لإيقاظها، وقد راعينا ذلك بزيادة مهلة الاتصال تلقائياً.
            </p>
          </div>

          <div className="bg-[#2D241E] p-3.5 rounded border border-[#D4AF37]/30 space-y-1.5">
            <h4 className="font-bold text-[#D4AF37]">3. عدم حفظ التعديلات بعد تحديث الصفحة:</h4>
            <p className="text-[#C5BBAF] leading-relaxed">
              تحقق من ظهور الشارة الخضراء "متصل بـ Neon" في أعلى الموقع أو لوحة التحكم للتأكد من أن السيرفر متصل بالقاعدة السحابية وليس بالذاكرة المؤقتة.
            </p>
          </div>

          <div className="bg-[#2D241E] p-3.5 rounded border border-[#D4AF37]/30 space-y-1.5">
            <h4 className="font-bold text-[#D4AF37]">4. عمل زر واتساب على أجهزة الموبايل:</h4>
            <p className="text-[#C5BBAF] leading-relaxed">
              الرابط يستخدم بروتوكول <code className="text-[#D4AF37] font-mono">https://wa.me/PHONE</code> المعتمد دولياً، والذي يفتح تطبيق واتساب المثبت على الهاتف فوراً أو واتساب ويب على الكمبيوتر.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
