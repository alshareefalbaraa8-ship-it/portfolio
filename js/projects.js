/* ==========================================================
   بيانات الأعمال
   لإضافة عمل جديد: انسخ أحد الكائنات بالكامل وألصقه في نهاية القائمة،
   ثم غيّر id (اسم فريد بالإنجليزية بدون مسافات) والنصوص ومسارات الصور.
   • cover  : الصورة التي تظهر على البطاقة
   • images : صور معرض العمل (يفضّل 5 صور مربعة)
   • details: بيانات صغيرة تظهر في صفحة العمل (أضف أو احذف كما تشاء)
   • link   : رابط الموقع الحي (اتركه "" إن لم يوجد)
   ========================================================== */
const PROJECTS = [
  {
    id: "project-1",
    title: "شركة سياحة وسفر",
    short: "شركة يامن تورز للسياحة والسفر طلبوا مني ان اقوم بتصميم موقع لهم يعرض عروضهم وما يقدمون.",
    description:
      "\n  شركة يامن تورز شركة سياحة وسفر طلبوا مني ان اصمم لهم موقع الكتروني يعرضون به خدماتهم المتنوعة وما يقدمون للمسافر وما يحتاجه المسافر . ",
    cover: "assets/images/projects/project-1/cover.png",
    images: [
      "assets/images/projects/project-1/shot-1.png",
      "assets/images/projects/project-1/shot-2.png",
      "assets/images/projects/project-1/shot-3.png",
      "assets/images/projects/project-1/shot-4.png",
      "assets/images/projects/project-1/shot-5.png"
    ],
    details: [
      { label: "السنة", value: "2024" },
      { label: "الدور", value: "تصميم وتطوير" },
      { label: "الأدوات", value: " HTML · CSS · JS" },
      { label: "العميل", value: "شركة يامن تورز للسياحة والسفر " }
    ],
    link: ""
  },
  {
    id: "project-2",
    title: "Smart shop",
    short: "موقع طُلب مني تصميمه لكي يُعرض فيه بعض من المنتجات اليومية ",
    description:
      "\n Smart shop هو موقع بيع منتجات متنوعة يومية لذا طُلب مني ان اقوم بتصميم واجهات ل هذا الموقع يكون يعرض اغلب المنتجات اليومية التي يستهلكها الانسان . ",
    cover: "assets/images/projects/project-2/cover.png",
    images: [
      "assets/images/projects/project-2/shot-1.png",
      "assets/images/projects/project-2/shot-2.png",
      "assets/images/projects/project-2/shot-3.png",
      "assets/images/projects/project-2/shot-4.png",
      "assets/images/projects/project-2/shot-5.png"
    ],
    details: [
      { label: "السنة", value: "2026" },
      { label: "الدور", value: "تصميم واجهات" },
      { label: "الأدوات", value: "Figma · HTML · CSS" },
      { label: "العميل", value: " اصحاب مشروع خاص" }
    ],
    link: ""
  },
  {
    id: "project-3",
    title: "أثر",
    short: " طُلب مني تصميم موقع تفاعلي عن حملة تسمى أثر .",
    description:
      "\nموقع أثر هو موقع يتحدث عن الضمير الانساني، لذالك طُلب مني ان اقوم بتصميم موقع تفاعلي اي ان يتفاعل المستخدم يتفاعل مباشرةً مع الموقع  ولا يكون موقع يعتمد على القراءة فقط . ",
    cover: "assets/images/projects/project-3/cover.png",
    images: [
      "assets/images/projects/project-3/shot-1.png",
      "assets/images/projects/project-3/shot-2.png",
      "assets/images/projects/project-3/shot-3.png",
      "assets/images/projects/project-3/shot-4.png",
      "assets/images/projects/project-3/shot-5.png"
    ],
    details: [
      { label: "السنة", value: "2025" },
      { label: "الدور", value: " تصميم موقع تفاعلي عن الضمير" },
      { label: "الأدوات", value: " html · css · JavaScript" },
      { label: "العميل", value: " اصحاب حملة انسانية " }
    ],
    link: ""
  }
];
