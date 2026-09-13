import { Link } from "wouter";
import { Inbox, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/hooks/use-i18n";

type Copy = {
  home: string;
  title: string;
  updated: string;
  sections: { title: string; text: string }[];
};

const copies: Record<string, Copy> = {
  en: {
    home: "Home",
    title: "Terms of Service",
    updated: "Last updated: August 10, 2026",
    sections: [
      {
        title: "1. Using Zephyx Mail",
        text: "You may use Zephyx Mail only in accordance with applicable law, these terms, and the rules of connected services.",
      },
      {
        title: "2. Your account",
        text: "You are responsible for maintaining the security of your account, password, authentication methods, and recovery information.",
      },
      {
        title: "3. Connected services",
        text: "Some Zephyx Mail features depend on third-party services such as Gmail. Your use of those services remains subject to their own terms, policies, availability, and authorization requirements.",
      },
      {
        title: "4. Acceptable use",
        text: "You may not use Zephyx Mail to abuse, disrupt, compromise, or gain unauthorized access to accounts, systems, networks, or other users.",
      },
      {
        title: "5. Service availability",
        text: "We aim to provide a reliable service, but uninterrupted or error-free availability cannot be guaranteed.",
      },
      {
        title: "6. Changes",
        text: "Zephyx Mail may evolve over time, including changes to features, integrations, security controls, and these terms.",
      },
      {
        title: "7. Termination",
        text: "Access may be restricted or terminated when necessary to protect users, the service, or comply with applicable requirements.",
      },
    ],
  },

  ar: {
    home: "الرئيسية",
    title: "شروط الخدمة",
    updated: "آخر تحديث: 10 أغسطس 2026",
    sections: [
      {
        title: "1. استخدام Zephyx Mail",
        text: "يجوز لك استخدام Zephyx Mail فقط وفقًا للقوانين المعمول بها وهذه الشروط وقواعد الخدمات المرتبطة.",
      },
      {
        title: "2. حسابك",
        text: "أنت مسؤول عن الحفاظ على أمان حسابك وكلمة المرور ووسائل المصادقة ومعلومات الاسترداد الخاصة بك.",
      },
      {
        title: "3. الخدمات المرتبطة",
        text: "تعتمد بعض ميزات Zephyx Mail على خدمات تابعة لجهات خارجية مثل Gmail. ويظل استخدامك لهذه الخدمات خاضعًا لشروطها وسياساتها وتوفرها ومتطلبات التفويض الخاصة بها.",
      },
      {
        title: "4. الاستخدام المقبول",
        text: "لا يجوز استخدام Zephyx Mail للإساءة أو التعطيل أو الاختراق أو محاولة الوصول غير المصرح به إلى الحسابات أو الأنظمة أو الشبكات أو المستخدمين الآخرين.",
      },
      {
        title: "5. توفر الخدمة",
        text: "نسعى إلى تقديم خدمة موثوقة، لكن لا يمكن ضمان توفر الخدمة بصورة متواصلة أو خالية تمامًا من الأخطاء.",
      },
      {
        title: "6. التغييرات",
        text: "قد يتطور Zephyx Mail بمرور الوقت، بما في ذلك تغييرات في الميزات والتكاملات وعناصر التحكم الأمنية وهذه الشروط.",
      },
      {
        title: "7. إنهاء الوصول",
        text: "قد يتم تقييد الوصول أو إنهاؤه عند الضرورة لحماية المستخدمين أو الخدمة أو للامتثال للمتطلبات المعمول بها.",
      },
    ],
  },

  fr: {
    home: "Accueil",
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : 10 août 2026",
    sections: [
      {
        title: "1. Utilisation de Zephyx Mail",
        text: "Vous pouvez utiliser Zephyx Mail uniquement conformément aux lois applicables, aux présentes conditions et aux règles des services connectés.",
      },
      {
        title: "2. Votre compte",
        text: "Vous êtes responsable de la sécurité de votre compte, de votre mot de passe, de vos méthodes d'authentification et de vos informations de récupération.",
      },
      {
        title: "3. Services connectés",
        text: "Certaines fonctionnalités de Zephyx Mail dépendent de services tiers tels que Gmail. Votre utilisation de ces services reste soumise à leurs propres conditions, politiques, disponibilité et exigences d'autorisation.",
      },
      {
        title: "4. Utilisation acceptable",
        text: "Vous ne pouvez pas utiliser Zephyx Mail pour abuser, perturber, compromettre ou obtenir un accès non autorisé à des comptes, systèmes, réseaux ou autres utilisateurs.",
      },
      {
        title: "5. Disponibilité du service",
        text: "Nous cherchons à fournir un service fiable, mais une disponibilité continue et totalement exempte d'erreurs ne peut pas être garantie.",
      },
      {
        title: "6. Modifications",
        text: "Zephyx Mail peut évoluer au fil du temps, notamment en ce qui concerne les fonctionnalités, les intégrations, les contrôles de sécurité et les présentes conditions.",
      },
      {
        title: "7. Résiliation",
        text: "L'accès peut être limité ou résilié lorsque cela est nécessaire pour protéger les utilisateurs, le service ou respecter les exigences applicables.",
      },
    ],
  },

  es: {
    home: "Inicio",
    title: "Términos del servicio",
    updated: "Última actualización: 10 de agosto de 2026",
    sections: [
      {
        title: "1. Uso de Zephyx Mail",
        text: "Puedes utilizar Zephyx Mail únicamente de acuerdo con la legislación aplicable, estos términos y las normas de los servicios conectados.",
      },
      {
        title: "2. Tu cuenta",
        text: "Eres responsable de mantener la seguridad de tu cuenta, contraseña, métodos de autenticación e información de recuperación.",
      },
      {
        title: "3. Servicios conectados",
        text: "Algunas funciones de Zephyx Mail dependen de servicios de terceros como Gmail. El uso de dichos servicios continúa sujeto a sus propios términos, políticas, disponibilidad y requisitos de autorización.",
      },
      {
        title: "4. Uso aceptable",
        text: "No puedes utilizar Zephyx Mail para abusar, interrumpir, comprometer u obtener acceso no autorizado a cuentas, sistemas, redes u otros usuarios.",
      },
      {
        title: "5. Disponibilidad del servicio",
        text: "Nuestro objetivo es ofrecer un servicio fiable, pero no podemos garantizar una disponibilidad ininterrumpida o completamente libre de errores.",
      },
      {
        title: "6. Cambios",
        text: "Zephyx Mail puede evolucionar con el tiempo, incluyendo cambios en funciones, integraciones, controles de seguridad y estos términos.",
      },
      {
        title: "7. Terminación",
        text: "El acceso puede restringirse o finalizarse cuando sea necesario para proteger a los usuarios, al servicio o para cumplir con requisitos aplicables.",
      },
    ],
  },

  de: {
    home: "Startseite",
    title: "Nutzungsbedingungen",
    updated: "Letzte Aktualisierung: 10. August 2026",
    sections: [
      {
        title: "1. Nutzung von Zephyx Mail",
        text: "Du darfst Zephyx Mail nur in Übereinstimmung mit geltendem Recht, diesen Bedingungen und den Regeln verbundener Dienste verwenden.",
      },
      {
        title: "2. Dein Konto",
        text: "Du bist für die Sicherheit deines Kontos, deines Passworts, deiner Authentifizierungsmethoden und deiner Wiederherstellungsinformationen verantwortlich.",
      },
      {
        title: "3. Verbundene Dienste",
        text: "Einige Funktionen von Zephyx Mail hängen von Drittanbieterdiensten wie Gmail ab. Deine Nutzung dieser Dienste unterliegt weiterhin deren eigenen Bedingungen, Richtlinien, Verfügbarkeit und Autorisierungsanforderungen.",
      },
      {
        title: "4. Zulässige Nutzung",
        text: "Du darfst Zephyx Mail nicht verwenden, um Konten, Systeme, Netzwerke oder andere Benutzer zu missbrauchen, zu stören, zu kompromittieren oder unbefugt darauf zuzugreifen.",
      },
      {
        title: "5. Verfügbarkeit des Dienstes",
        text: "Wir bemühen uns um einen zuverlässigen Dienst, können jedoch keine ununterbrochene oder vollständig fehlerfreie Verfügbarkeit garantieren.",
      },
      {
        title: "6. Änderungen",
        text: "Zephyx Mail kann sich im Laufe der Zeit weiterentwickeln, einschließlich Änderungen an Funktionen, Integrationen, Sicherheitskontrollen und diesen Bedingungen.",
      },
      {
        title: "7. Beendigung",
        text: "Der Zugriff kann eingeschränkt oder beendet werden, wenn dies zum Schutz der Benutzer, des Dienstes oder zur Einhaltung geltender Anforderungen erforderlich ist.",
      },
    ],
  },

  pt: {
    home: "Início",
    title: "Termos de Serviço",
    updated: "Última atualização: 10 de agosto de 2026",
    sections: [
      {
        title: "1. Uso do Zephyx Mail",
        text: "Você pode utilizar o Zephyx Mail somente de acordo com a legislação aplicável, estes termos e as regras dos serviços conectados.",
      },
      {
        title: "2. Sua conta",
        text: "Você é responsável por manter a segurança da sua conta, senha, métodos de autenticação e informações de recuperação.",
      },
      {
        title: "3. Serviços conectados",
        text: "Alguns recursos do Zephyx Mail dependem de serviços de terceiros, como o Gmail. O uso desses serviços permanece sujeito aos próprios termos, políticas, disponibilidade e requisitos de autorização.",
      },
      {
        title: "4. Uso aceitável",
        text: "Você não pode utilizar o Zephyx Mail para abusar, interromper, comprometer ou obter acesso não autorizado a contas, sistemas, redes ou outros usuários.",
      },
      {
        title: "5. Disponibilidade do serviço",
        text: "Buscamos fornecer um serviço confiável, mas não podemos garantir disponibilidade ininterrupta ou totalmente livre de erros.",
      },
      {
        title: "6. Alterações",
        text: "O Zephyx Mail pode evoluir ao longo do tempo, incluindo alterações em recursos, integrações, controles de segurança e nestes termos.",
      },
      {
        title: "7. Encerramento",
        text: "O acesso pode ser restringido ou encerrado quando necessário para proteger usuários, o serviço ou cumprir requisitos aplicáveis.",
      },
    ],
  },
};

// TERMS_EXTRA_10_LANGUAGES
Object.assign(copies, {
  "tr": {
    "home": "Ana Sayfa",
    "title": "Kullanım Koşulları",
    "updated": "Son güncelleme: 10 Ağustos 2026",
    "sections": [
      {
        "title": "1. Zephyx Mail kullanımı",
        "text": "Zephyx Mail'i yalnızca yürürlükteki yasalara, bu koşullara ve bağlı hizmetlerin kurallarına uygun olarak kullanabilirsiniz."
      },
      {
        "title": "2. Hesabınız",
        "text": "Hesabınızın, parolanızın, kimlik doğrulama yöntemlerinizin ve kurtarma bilgilerinizin güvenliğini korumaktan siz sorumlusunuz."
      },
      {
        "title": "3. Bağlı hizmetler",
        "text": "Bazı Zephyx Mail özellikleri Gmail gibi üçüncü taraf hizmetlere bağlıdır. Bu hizmetleri kullanımınız kendi koşullarına, politikalarına, kullanılabilirliklerine ve yetkilendirme gereksinimlerine tabi olmaya devam eder."
      },
      {
        "title": "4. Kabul edilebilir kullanım",
        "text": "Zephyx Mail'i hesaplara, sistemlere, ağlara veya diğer kullanıcılara zarar vermek, hizmetleri bozmak ya da yetkisiz erişim elde etmek amacıyla kullanamazsınız."
      },
      {
        "title": "5. Hizmet kullanılabilirliği",
        "text": "Güvenilir bir hizmet sunmayı amaçlıyoruz ancak kesintisiz veya tamamen hatasız kullanılabilirlik garanti edilemez."
      },
      {
        "title": "6. Değişiklikler",
        "text": "Zephyx Mail zaman içinde gelişebilir; özelliklerde, entegrasyonlarda, güvenlik kontrollerinde ve bu koşullarda değişiklikler yapılabilir."
      },
      {
        "title": "7. Sonlandırma",
        "text": "Kullanıcıları veya hizmeti korumak ya da geçerli gerekliliklere uymak amacıyla gerektiğinde erişim kısıtlanabilir veya sonlandırılabilir."
      }
    ]
  },
  "zh": {
    "home": "首页",
    "title": "服务条款",
    "updated": "最后更新：2026年8月10日",
    "sections": [
      {
        "title": "1. 使用 Zephyx Mail",
        "text": "您只能按照适用法律、本条款以及已连接服务的相关规则使用 Zephyx Mail。"
      },
      {
        "title": "2. 您的账户",
        "text": "您有责任维护账户、密码、身份验证方式以及恢复信息的安全。"
      },
      {
        "title": "3. 已连接服务",
        "text": "Zephyx Mail 的部分功能依赖 Gmail 等第三方服务。您对这些服务的使用仍受其自身条款、政策、可用性以及授权要求的约束。"
      },
      {
        "title": "4. 可接受使用",
        "text": "您不得利用 Zephyx Mail 滥用、破坏、危害或未经授权访问账户、系统、网络或其他用户。"
      },
      {
        "title": "5. 服务可用性",
        "text": "我们致力于提供可靠的服务，但无法保证服务始终不中断或完全没有错误。"
      },
      {
        "title": "6. 变更",
        "text": "Zephyx Mail 可能会随着时间发展，包括对功能、集成、安全控制以及本条款进行修改。"
      },
      {
        "title": "7. 终止",
        "text": "在保护用户、服务或遵守适用要求所必需的情况下，访问权限可能会受到限制或终止。"
      }
    ]
  },
  "hi": {
    "home": "होम",
    "title": "सेवा की शर्तें",
    "updated": "अंतिम अपडेट: 10 अगस्त 2026",
    "sections": [
      {
        "title": "1. Zephyx Mail का उपयोग",
        "text": "आप Zephyx Mail का उपयोग केवल लागू कानूनों, इन शर्तों और कनेक्टेड सेवाओं के नियमों के अनुसार कर सकते हैं।"
      },
      {
        "title": "2. आपका खाता",
        "text": "अपने खाते, पासवर्ड, प्रमाणीकरण विधियों और रिकवरी जानकारी की सुरक्षा बनाए रखना आपकी जिम्मेदारी है।"
      },
      {
        "title": "3. कनेक्टेड सेवाएं",
        "text": "Zephyx Mail की कुछ सुविधाएं Gmail जैसी तृतीय-पक्ष सेवाओं पर निर्भर करती हैं। उन सेवाओं का आपका उपयोग उनकी अपनी शर्तों, नीतियों, उपलब्धता और अनुमति आवश्यकताओं के अधीन रहता है।"
      },
      {
        "title": "4. स्वीकार्य उपयोग",
        "text": "आप Zephyx Mail का उपयोग खातों, प्रणालियों, नेटवर्क या अन्य उपयोगकर्ताओं के दुरुपयोग, व्यवधान, समझौते या अनधिकृत पहुंच के लिए नहीं कर सकते।"
      },
      {
        "title": "5. सेवा उपलब्धता",
        "text": "हम एक विश्वसनीय सेवा प्रदान करने का प्रयास करते हैं, लेकिन निरंतर या पूरी तरह त्रुटिरहित उपलब्धता की गारंटी नहीं दी जा सकती।"
      },
      {
        "title": "6. बदलाव",
        "text": "Zephyx Mail समय के साथ विकसित हो सकता है, जिसमें सुविधाओं, एकीकरण, सुरक्षा नियंत्रण और इन शर्तों में बदलाव शामिल हैं।"
      },
      {
        "title": "7. समाप्ति",
        "text": "उपयोगकर्ताओं या सेवा की सुरक्षा अथवा लागू आवश्यकताओं के अनुपालन के लिए आवश्यक होने पर पहुंच सीमित या समाप्त की जा सकती है।"
      }
    ]
  },
  "id": {
    "home": "Beranda",
    "title": "Ketentuan Layanan",
    "updated": "Terakhir diperbarui: 10 Agustus 2026",
    "sections": [
      {
        "title": "1. Menggunakan Zephyx Mail",
        "text": "Anda hanya boleh menggunakan Zephyx Mail sesuai dengan hukum yang berlaku, ketentuan ini, dan aturan layanan yang terhubung."
      },
      {
        "title": "2. Akun Anda",
        "text": "Anda bertanggung jawab menjaga keamanan akun, kata sandi, metode autentikasi, dan informasi pemulihan Anda."
      },
      {
        "title": "3. Layanan terhubung",
        "text": "Beberapa fitur Zephyx Mail bergantung pada layanan pihak ketiga seperti Gmail. Penggunaan layanan tersebut tetap tunduk pada ketentuan, kebijakan, ketersediaan, dan persyaratan otorisasi masing-masing."
      },
      {
        "title": "4. Penggunaan yang dapat diterima",
        "text": "Anda tidak boleh menggunakan Zephyx Mail untuk menyalahgunakan, mengganggu, membahayakan, atau memperoleh akses tanpa izin ke akun, sistem, jaringan, atau pengguna lain."
      },
      {
        "title": "5. Ketersediaan layanan",
        "text": "Kami berupaya menyediakan layanan yang andal, tetapi ketersediaan tanpa gangguan atau sepenuhnya bebas kesalahan tidak dapat dijamin."
      },
      {
        "title": "6. Perubahan",
        "text": "Zephyx Mail dapat berkembang dari waktu ke waktu, termasuk perubahan pada fitur, integrasi, kontrol keamanan, dan ketentuan ini."
      },
      {
        "title": "7. Penghentian",
        "text": "Akses dapat dibatasi atau dihentikan bila diperlukan untuk melindungi pengguna, layanan, atau memenuhi persyaratan yang berlaku."
      }
    ]
  }
});

export default function Terms() {
  const { locale } = useI18n();

// TERMS_EXTRA_LANGUAGES_2
Object.assign(copies, {
  "it": {
    "home": "Home",
    "title": "Termini di servizio",
    "updated": "Ultimo aggiornamento: 10 agosto 2026",
    "sections": [
      {
        "title": "1. Uso di Zephyx Mail",
        "text": "Puoi utilizzare Zephyx Mail solo in conformità con le leggi applicabili, questi termini e le regole dei servizi collegati."
      },
      {
        "title": "2. Il tuo account",
        "text": "Sei responsabile del mantenimento della sicurezza del tuo account, password, metodi di autenticazione e informazioni di ripristino."
      },
      {
        "title": "3. Servizi collegati",
        "text": "Alcune funzionalità di Zephyx Mail dipendono da servizi di terze parti come Gmail. Il tuo uso di tali servizi rimane soggetto ai rispettivi termini, politiche, disponibilità e requisiti di autorizzazione."
      },
      {
        "title": "4. Uso accettabile",
        "text": "Non puoi utilizzare Zephyx Mail per abusare, interrompere, compromettere o ottenere accesso non autorizzato ad account, sistemi, reti o altri utenti."
      },
      {
        "title": "5. Disponibilità del servizio",
        "text": "Miriamo a fornire un servizio affidabile, ma non possiamo garantire disponibilità ininterrotta o priva di errori."
      },
      {
        "title": "6. Modifiche",
        "text": "Possiamo aggiornare questi termini man mano che il servizio si sviluppa. Le modifiche significative saranno riflesse aggiornando la data visualizzata su questa pagina."
      },
      {
        "title": "7. Contattaci",
        "text": "Per domande su questi termini, contattaci tramite l'apposita pagina di supporto all'interno dell'applicazione."
      },
      {
        "title": "8. Legge applicabile",
        "text": "Questi termini sono regolati dalle leggi applicabili nella giurisdizione competente, senza riguardo ai conflitti di principi giuridici."
      }
    ]
  },
  "ru": {
    "home": "Главная",
    "title": "Условия использования",
    "updated": "Последнее обновление: 10 августа 2026 г.",
    "sections": [
      {
        "title": "1. Использование Zephyx Mail",
        "text": "Вы можете использовать Zephyx Mail только в соответствии с применимым законодательством, настоящими условиями и правилами подключённых служб."
      },
      {
        "title": "2. Ваш аккаунт",
        "text": "Вы несёте ответственность за обеспечение безопасности своего аккаунта, пароля, методов аутентификации и информации для восстановления."
      },
      {
        "title": "3. Подключённые службы",
        "text": "Некоторые функции Zephyx Mail зависят от сторонних служб, таких как Gmail. Использование этих служб остаётся подчинённым их собственным условиям, политикам, доступности и требованиям авторизации."
      },
      {
        "title": "4. Допустимое использование",
        "text": "Вы не можете использовать Zephyx Mail для злоупотребления, нарушения работы, компрометации или несанкционированного доступа к аккаунтам, системам, сетям или другим пользователям."
      },
      {
        "title": "5. Доступность службы",
        "text": "Мы стремимся предоставлять надёжную службу, но не можем гарантировать бесперебойную или безошибочную доступность."
      },
      {
        "title": "6. Изменения",
        "text": "Мы можем обновлять эти условия по мере развития службы. Существенные изменения будут отражены обновлением даты, отображаемой на этой странице."
      },
      {
        "title": "7. Связаться с нами",
        "text": "По вопросам об этих условиях свяжитесь с нами через соответствующую страницу поддержки в приложении."
      },
      {
        "title": "8. Применимое право",
        "text": "Настоящие условия регулируются применимым законодательством в соответствующей юрисдикции, без учёта коллизий норм права."
      }
    ]
  },
  "ja": {
    "home": "ホーム",
    "title": "利用規約",
    "updated": "最終更新日: 2026年8月10日",
    "sections": [
      {
        "title": "1. Zephyx Mailの使用",
        "text": "Zephyx Mailは、適用法、本規約、および接続されたサービスのルールに従ってのみ使用できます。"
      },
      {
        "title": "2. アカウント",
        "text": "アカウント、パスワード、認証方法、および復元情報のセキュリティ維持の責任を負います。"
      },
      {
        "title": "3. 接続されたサービス",
        "text": "Zephyx Mailの一部の機能はGmailなどのサードパーティサービスに依存しています。それらのサービスの使用は、それぞれの利用規約、ポリシー、可用性、および認証要件に従うものとします。"
      },
      {
        "title": "4. 許容される使用",
        "text": "Zephyx Mailを悪用、妨害、侵害、またはアカウント、システム、ネットワーク、他のユーザーへの不正アクセスに使用することはできません。"
      },
      {
        "title": "5. サービスの可用性",
        "text": "信頼性の高いサービスの提供を目指していますが、中断のないまたはエラーのない可用性は保証できません。"
      },
      {
        "title": "6. 変更",
        "text": "サービスの発展に伴い、本規約を更新する場合があります。重要な変更は、このページに表示される日付を更新することで反映されます。"
      },
      {
        "title": "7. お問い合わせ",
        "text": "本規約に関するご質問は、アプリケーション内の該当するサポートページからお問い合わせください。"
      },
      {
        "title": "8. 準拠法",
        "text": "本規約は、法の抵触原則に関係なく、管轄裁判所の適用法に準拠するものとします。"
      }
    ]
  },
  "ko": {
    "home": "홈",
    "title": "서비스 약관",
    "updated": "최종 업데이트: 2026년 8월 10일",
    "sections": [
      {
        "title": "1. Zephyx Mail 사용",
        "text": "Zephyx Mail은 적용 가능한 법률, 이 약관 및 연결된 서비스의 규칙에 따라서만 사용할 수 있습니다."
      },
      {
        "title": "2. 계정",
        "text": "귀하는 계정, 비밀번호, 인증 방법 및 복구 정보의 보안 유지에 대한 책임이 있습니다."
      },
      {
        "title": "3. 연결된 서비스",
        "text": "일부 Zephyx Mail 기능은 Gmail과 같은 제3자 서비스에 의존합니다. 해당 서비스의 사용은 각각의 약관, 정책, 가용성 및 승인 요구 사항의 적용을 받습니다."
      },
      {
        "title": "4. 허용 가능한 사용",
        "text": "Zephyx Mail을 남용, 방해, 침해 또는 계정, 시스템, 네트워크, 다른 사용자에 대한 무단 액세스를 위해 사용할 수 없습니다."
      },
      {
        "title": "5. 서비스 가용성",
        "text": "신뢰할 수 있는 서비스 제공을 목표로 하지만, 중단 없거나 오류 없는 가용성은 보장할 수 없습니다."
      },
      {
        "title": "6. 변경",
        "text": "서비스가 발전함에 따라 이 약관을 업데이트할 수 있습니다. 중요한 변경 사항은 이 페이지에 표시된 날짜를 업데이트하여 반영됩니다."
      },
      {
        "title": "7. 문의하기",
        "text": "이 약관에 대한 질문은 애플리케이션 내의 해당 지원 페이지를 통해 문의해 주세요."
      },
      {
        "title": "8. 적용 법률",
        "text": "이 약관은 법 충돌 원칙에 관계없이 관할 권역의 적용 법률에 의해 규율됩니다."
      }
    ]
  },
  "ur": {
    "home": "ہوم",
    "title": "سروس کی شرائط",
    "updated": "آخری اپڈیٹ: 10 اگست 2026",
    "sections": [
      {
        "title": "1. Zephyx Mail کا استعمال",
        "text": "آپ Zephyx Mail کو صرف قابل اطلاق قوانین، ان شرائط اور کنیکٹڈ سروسز کے قواعد کے مطابق استعمال کر سکتے ہیں۔"
      },
      {
        "title": "2. آپ کا اکاؤنٹ",
        "text": "آپ اپنے اکاؤنٹ، پاس ورڈ، تصدیقی طریقوں اور ریکوری معلومات کی سیکیورٹی برقرار رکھنے کے ذمہ دار ہیں۔"
      },
      {
        "title": "3. کنیکٹڈ سروسز",
        "text": "Zephyx Mail کی کچھ خصوصیات Gmail جیسی تھرڈ پارٹی سروسز پر منحصر ہیں۔ ان سروسز کا استعمال ان کی اپنی شرائط، پالیسیز، دستیابی اور اجازت کی تقاضوں کے تابع رہتا ہے۔"
      },
      {
        "title": "4. قابل قبول استعمال",
        "text": "آپ Zephyx Mail کو اکاؤنٹس، سسٹمز، نیٹ ورکس یا دیگر صارفین کو نقصان پہنچانے، خراب کرنے یا غیر مجاز رسائی حاصل کرنے کے لیے استعمال نہیں کر سکتے۔"
      },
      {
        "title": "5. سروس کی دستیابی",
        "text": "ہم قابل اعتماد سروس فراہم کرنے کی کوشش کرتے ہیں، لیکن بلا تعطل یا غلطی سے پاک دستیابی کی ضمانت نہیں دی جا سکتی۔"
      },
      {
        "title": "6. تبدیلیاں",
        "text": "ہم سروس کی ترقی کے ساتھ ان شرائط کو اپڈیٹ کر سکتے ہیں۔ اہم تبدیلیاں اس صفحے پر دکھائی گئی تاریخ کو اپڈیٹ کر کے ظاہر کی جائیں گی۔"
      },
      {
        "title": "7. ہم سے رابطہ کریں",
        "text": "ان شرائط کے بارے میں سوالات کے لیے، ایپلیکیشن کے اندر مناسب سپورٹ پیج کے ذریعے ہم سے رابطہ کریں۔"
      },
      {
        "title": "8. قابل اطلاق قانون",
        "text": "یہ شرائط قانونی اصولوں کے تنازعے سے قطع نظر، متعلقہ دائرہ اختیار میں قابل اطلاق قوانین کے تابع ہیں۔"
      }
    ]
  }
});

  // zh-CN alias for zh
  if (locale === "zh-CN" && !copies["zh-CN"] && copies["zh"]) { copies["zh-CN"] = copies["zh"]; }
  const copy = copies[locale] ?? copies.en;
  const rtl = locale === "ar" || locale === "ur";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Inbox className="h-5 w-5" />
            </div>
            <span className="font-bold">Zephyx Mail</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <BackIcon className="h-4 w-4" />
                {copy.home}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main
        className="mx-auto max-w-4xl px-5 py-12"
        dir={rtl ? "rtl" : "ltr"}
      >
        <h1 className="text-4xl font-extrabold tracking-tight">{copy.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{copy.updated}</p>

        <div className="mt-10 space-y-8 leading-7 text-muted-foreground">
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="mt-2">{section.text}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
